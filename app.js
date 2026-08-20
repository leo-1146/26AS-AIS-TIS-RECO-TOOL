/* AIS / TIS / 26AS Reconciliation - deterministic browser engine */

const HEAD_MAP = {
  '194A': '94A - Interest Receipts',
  '194C': '94C - Contract Receipts',
  '194H': '94H - Commission Receipts',
  '194Q': '94Q - Purchases',
  '194R': '94R - Benefits / Perquisites',
  '206CL': '206CL - TCS Purchases'
};
const TIS_MAP = {
  '94A - Interest Receipts': ['Interest from deposit'],
  '94C - Contract Receipts': ['Business receipts'],
  '94H - Commission Receipts': ['Business receipts'],
  '94Q - Purchases': ['Business receipts'],
  '94R - Benefits / Perquisites': ['Business receipts'],
  'GST Sales': ['GST turnover'],
  'GST Purchases': ['GST purchases'],
  '206CL - TCS Purchases': ['Purchase of vehicle']
};
const TEMPLATE_ROWS = 54;
const TIS_GROUPS = {
  'Interest from deposit': ['94A - Interest Receipts'],
  'Business receipts': ['94C - Contract Receipts','94H - Commission Receipts','94Q - Purchases','94R - Benefits / Perquisites'],
  'GST turnover': ['GST Sales'],
  'GST purchases': ['GST Purchases'],
  'Purchase of vehicle': ['206CL - TCS Purchases']
};

const SUMMARY_HEADS = [
  '92B - Salaries Receipts','94C - Contract Receipts','94JA - Technical Receipts',
  '94JB - Professional Receipts','94IA - Rent Receipts (P & M) ','94IB - Rent Receipts (L & B) ',
  '94A - Interest Receipts','94Q - Purchases','94H - Commission Receipts','94R - Benefits / Perquisites','94L - Property Transactions',
  'Purchase of Securities','Sale of Securities','GST Sales','GST Purchases','Advance Tax','Cash Deposits',
  'Cash Withdrawals','SAT','206CJ - TCS Purchases','206CE - TCS Purchases','206CL - TCS Purchases',
  '206CR-TCS Purchases','94N - Cash Withdrawals'
];

const normSpace = s => String(s || '').replace(/\s+/g,' ').trim();
const num = s => Number(String(s).replace(/,/g,''));
const moneyTokens = s => String(s || '').match(/-?[\d,]+(?:\.\d+)?/g) || [];
const normalizeParty = s => normSpace(s).toUpperCase().replace(/^M\/?S\s+/,'').replace(/\([^)]*\)/g,'').replace(/&/g,' AND ').replace(/[^A-Z0-9]+/g,'');

function deriveAY(fy){
  if(!fy || !/^\d{4}-\d{2}$/.test(fy)) return '';
  const y=Number(fy.slice(0,4))+1; return `${y}-${String(y+1).slice(-2)}`;
}
function parseMeta(text){
  text=String(text||'').replace(/\s*\|\|\s*/g,' ');
  let pan='',name='';
  let m=text.match(/Permanent Account Number \(PAN\).*?\b([A-Z0-9]{10})\b/s);
  if(m) pan=m[1];
  m=text.match(/Name of Assessee\s*\n?\s*([A-Z][^\n]+?)(?=\s*(?:Address of Assessee|Date of Incorporation|$))/i);
  if(m){ name=normSpace(m[1]).replace(/^[A-Z0-9]{10}\s+NA\s+/,'').trim(); }
  if(!name){
    m=text.match(/General Information.*?\b[A-Z0-9]{10}\b\s+(?:NA\s+)?([^\n]+)/s);
    if(m){ name=normSpace(m[1]).replace(/^[A-Z0-9]{10}\s+NA\s+/,'').trim(); }
  }
  let fy=(text.match(/Financial Year\s+([0-9]{4}-[0-9]{2})/)||[])[1]||'';
  let ay=(text.match(/Assessment Year\s+([0-9]{4}-[0-9]{2})/)||[])[1]||deriveAY(fy);
  return {pan,name,fy,ay};
}

async function extractPdfLines(file){
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  const pages=[];
  for(let pno=1;pno<=pdf.numPages;pno++){
    const page=await pdf.getPage(pno);
    const tc=await page.getTextContent();
    const rows=[];
    for(const it of tc.items){
      const str=(it.str||'').replace(/\u00a0/g,' ').trim();
      if(!str) continue;
      const x=it.transform[4], y=it.transform[5], w=it.width||0;
      let row=rows.find(r=>Math.abs(r.y-y)<=2.5);
      if(!row){row={y,items:[]};rows.push(row)}
      row.items.push({x,w,str});
    }
    rows.sort((a,b)=>b.y-a.y);
    pages.push(rows.map(r=>{
      r.items.sort((a,b)=>a.x-b.x);
      let out='', lastEnd=null;
      for(const it of r.items){
        const gap=lastEnd==null?0:it.x-lastEnd;
        if(out && (gap>25 || (it.x>=460 && lastEnd<460) || (it.x>=790 && lastEnd<790) || (it.x>=885 && lastEnd<885))){ if(!out.endsWith(' ')) out+=' || '; }
        else if(out && gap>2.5 && !out.endsWith(' ')) out+=' ';
        out+=it.str; lastEnd=it.x+it.w;
      }
      return out.trim();
    }).filter(Boolean));
  }
  return pages;
}
const allText = pages => pages.map(p=>p.join('\n')).join('\n');

function findAisSummary(lines,idx){
  const cm=lines[idx].match(/\b(?:TDS|TCS)-([A-Z0-9]+)\b/i);
  if(!cm) throw new Error('AIS information code not found');
  const sec=cm[1].toUpperCase();
  const upto=Math.min(idx+6,lines.length);

  // PDF.js extraction now preserves large column gaps as "||". This gives us a stable
  // source/count/amount boundary across different AIS layouts.
  for(let i=idx;i<upto;i++){
    const parts=lines[i].split(/\s*\|\|\s*/).map(normSpace).filter(Boolean);
    for(let j=0;j<parts.length;j++){
      const m=parts[j].match(/^(.+?)\s*\(([A-Z0-9]{10})\)\s*$/);
      if(!m) continue;
      const countPart=parts[j+1]||'';
      const amountPart=parts[j+2]||'';
      const cmatch=countPart.match(/^(\d+)$/);
      const amatch=amountPart.match(/^(-?[\d,]+(?:\.\d+)?)$/);
      if(cmatch&&amatch){
        return {source:normSpace(m[1]),section:sec,gross:num(amatch[1]),identifier:m[2]};
      }
      // Fallback if count and amount stayed in the same column.
      const inline=parts[j].match(/^(.+?)\s*\(([A-Z0-9]{10})\)\s+(\d+)\s+(-?[\d,]+(?:\.\d+)?)$/);
      if(inline) return {source:normSpace(inline[1]),section:sec,gross:num(inline[4]),identifier:inline[2]};
    }
  }

  // Final fallback for older cached pages without gap delimiters.
  const block=lines.slice(idx,upto).join(' ');
  const fm=block.match(/(?:\(Section\s+[^)]+\)\s+)?(.+?)\s*\(([A-Z0-9]{10})\)\s+(\d+)\s+(-?[\d,]+(?:\.\d+)?)\s*/i);
  if(fm){
    let src=normSpace(fm[1]).replace(/^.*TDS-[A-Z0-9]+\s+/i,'').trim();
    return {source:src,section:sec,gross:num(fm[4]),identifier:fm[2]};
  }
  throw new Error(`Could not parse AIS source row around ${sec}`);
}
function parseAIS(pages){
  const text=allText(pages), meta=parseMeta(text), lines=pages.flat(), rows=[], exceptions=[];
  const positions=[]; lines.forEach((l,i)=>{if(/\b(?:TDS|TCS)-\w+\b/.test(l)) positions.push(i)});
  for(let n=0;n<positions.length;n++){
    const idx=positions[n], end=positions[n+1]||lines.length;
    try{
      const {source,section,gross:summaryGross,identifier}=findAisSummary(lines,idx);
      let detailGross=0, detailTds=0, status='';
      for(const dlRaw of lines.slice(idx+1,end)){
        const dl=dlRaw.replace(/\s*\|\|\s*/g,' ');
        if(/\bQ[1-4]\([^)]*\)\s+\d{2}\/\d{2}\/\d{4}/.test(dl)){
          const toks=moneyTokens(dl); if(toks.length>=3){detailGross+=num(toks[toks.length-3]); detailTds+=num(toks[toks.length-2]); if(/\bInactive\b/i.test(dl)) status='Inactive';}
        }
      }
      let gross=summaryGross, note='';
      // AIS gross is taken strictly from the reporting-entity summary row, as specified.
      // Underlying transaction detail is used only for TDS/TCS support and audit context.
      const head=HEAD_MAP[section]; if(!head){exceptions.push({type:'AIS_UNMAPPED_SECTION',severity:'HIGH',details:`Unmapped AIS section ${section} for ${source}`});continue;}
      rows.push({head,section,source,gross:Math.round(gross*100)/100,tds:Math.round(detailTds*100)/100,summary_gross:summaryGross,detail_gross:detailGross,note,identifier,status});
    }catch(e){exceptions.push({type:'AIS_PARSE',severity:'HIGH',details:String(e.message||e)})}
  }
  let gstSales=0,gstPurchases=0;
  for(const l of lines){
    if(l.includes('EXC-GSTR3B')){const t=moneyTokens(l);if(t.length)gstSales+=num(t[t.length-1]);}
    if(l.includes('EXC-GSTR1(P)')){const t=moneyTokens(l);if(t.length)gstPurchases+=num(t[t.length-1]);}
  }
  if(gstSales) rows.push({head:'GST Sales',section:'GST',source:meta.name,gross:gstSales,tds:'NA',summary_gross:gstSales,detail_gross:gstSales,note:'',identifier:''});
  if(gstPurchases) rows.push({head:'GST Purchases',section:'GSTP',source:'Aggregate - AIS GSTR-1 seller reports',gross:gstPurchases,tds:'NA',summary_gross:gstPurchases,detail_gross:gstPurchases,note:'',identifier:''});
  return [{meta,rows},exceptions];
}

function parseTIS(pages){
  const cleanPages=pages.map(p=>p.map(l=>l.replace(/\s*\|\|\s*/g,' ')));
  const text=allText(cleanPages),meta=parseMeta(text),lines=cleanPages.flat(),cats={};
  const names=['Interest from deposit','Business receipts','GST turnover','GST purchases','Purchase of vehicle'];
  for(const l of lines.slice(0,120)){
    const m=l.match(/^\s*\d+\s+(Interest from deposit|Business receipts|GST turnover|GST purchases|Purchase of vehicle)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s*$/);
    if(m) cats[m[1]]={processed:num(m[2]),accepted:num(m[3]),reported:0,source_rows:0};
  }
  const annex=lines.findIndex(l=>/Annexure to Taxpayer Information Summary/i.test(l));
  const startAt=annex>=0?annex:0;
  function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function headingIndex(name){const re=new RegExp('^\\s*\\d+\\s+'+esc(name)+'\\s+');for(let i=startAt;i<lines.length;i++)if(re.test(lines[i]))return i;return -1;}
  function seg(name){const s=headingIndex(name);if(s<0)return[];let e=lines.length;for(let i=s+1;i<lines.length;i++){if(names.some(n=>n!==name&&new RegExp('^\\s*\\d+\\s+'+esc(n)+'\\s+').test(lines[i]))){e=i;break;}}return lines.slice(s,e);}
  for(const n of names) if(!cats[n]) cats[n]={processed:0,accepted:0,reported:0,source_rows:0};
  // TDS/TCS source amounts: the reported value is the first number in the three-number amount row.
  for(const name of ['Interest from deposit','Business receipts']){
    const s=seg(name).join(' ');
    const re=/Amount paid\/\s*(?:credited\s*)?(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)/gi;
    let m; while((m=re.exec(s))){cats[name].reported+=num(m[1]);cats[name].source_rows++;}
  }
  // GST turnover: the detail row carries Total Turnover three times; first of the trailing three is Reported by Source.
  for(const l of seg('GST turnover')){
    if(/Total Turnover/i.test(l)){const t=moneyTokens(l);if(t.length>=3){cats['GST turnover'].reported+=num(t[t.length-3]);cats['GST turnover'].source_rows++;}}
  }
  // GST purchases: each Purchase from supplier row ends with reported / processed / accepted amounts.
  for(const l of seg('GST purchases')){
    if(/Purchase from/i.test(l)){const t=moneyTokens(l);if(t.length>=3){cats['GST purchases'].reported+=num(t[t.length-3]);cats['GST purchases'].source_rows++;}}
  }
  // Vehicle purchase carries the three values on the same row as Amount received/debited.
  for(const l of seg('Purchase of vehicle')){
    if(/Amount received\//i.test(l)){const t=moneyTokens(l);if(t.length>=3){cats['Purchase of vehicle'].reported+=num(t[t.length-3]);cats['Purchase of vehicle'].source_rows++;break;}}
  }
  return [{meta,categories:cats},[]];
}

function parse26AS(pages){
  const cleanPages=pages.map(p=>p.map(l=>l.replace(/\s*\|\|\s*/g,' ')));
  const text=allText(cleanPages),meta=parseMeta(text),lines=cleanPages.flat(),map={},mapTan={},exceptions=[];let party=null,tan=null;
  for(const line of lines){
    const s=line.trim();
    const sm=s.match(/^\d+\s+(.+?)\s+([A-Z]{4}[A-Z0-9]{6})\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*$/);
    if(sm && !/\d{2}-[A-Za-z]{3}-\d{4}/.test(s)){party=sm[1].trim();tan=sm[2];continue;}
    const tm=s.match(/^\d+\s+(\d{3}[A-Z0-9]+)\s+\d{2}-[A-Za-z]{3}-\d{4}\s+[A-Z]\s+\d{2}-[A-Za-z]{3}-\d{4}\s+\S+\s+(.+)$/);
    if(tm && party){const sec=tm[1], toks=moneyTokens(tm[2]);if(toks.length>=3){const gross=num(toks[toks.length-3]), tax=num(toks[toks.length-2]), dep=num(toks[toks.length-1]), key=normalizeParty(party)+'|'+sec;
      if(!map[key])map[key]={party,section:sec,tan:null,gross:0,tds:0,deposit:0,reversal:false};
      map[key].gross+=gross;map[key].tds+=tax;map[key].deposit+=dep;if(gross<0||tax<0)map[key].reversal=true;
      if(tan){const tk=normalizeParty(party)+'|'+sec+'|'+tan;if(!mapTan[tk])mapTan[tk]={party,section:sec,tan,gross:0,tds:0,deposit:0,reversal:false};mapTan[tk].gross+=gross;mapTan[tk].tds+=tax;mapTan[tk].deposit+=dep;if(gross<0||tax<0)mapTan[tk].reversal=true;}
    }}
  }
  return [{meta,map,mapTan},exceptions];
}

function reconcile(ais,tis,as26,exceptions){
  const rows=[];
  const aisTotals={};
  for(const r of ais.rows){
    if(typeof r.gross==='number') aisTotals[r.head]=(aisTotals[r.head]||0)+r.gross;
  }

  // Determine whether each TIS category can safely be allocated to AIS party rows.
  // For Business receipts, 194C + 194H + 194Q + 194R are one TIS category.
  const categoryAllowed={};
  const categoryChecks=[];
  for(const [category,heads] of Object.entries(TIS_GROUPS)){
    const tisTotal = tis.categories[category]?.reported ?? null;
    const aisTotal = heads.reduce((sum,h)=>sum+(aisTotals[h]||0),0);
    if(tisTotal===null){
      categoryAllowed[category]=null;
      continue;
    }
    const ok=Math.abs(tisTotal-aisTotal)<=0.01;
    categoryAllowed[category]=ok;
    categoryChecks.push({category,tisTotal,aisTotal,ok});
    if((tisTotal||aisTotal) && !ok){
      exceptions.push({type:'TIS_TOTAL_MISMATCH',severity:'HIGH',details:`${category}: TIS Reported by Source ${tisTotal.toFixed(2)} vs AIS ${aisTotal.toFixed(2)}`});
    }
  }

  const dup={};
  for(const r of ais.rows){
    if(!['GST Sales','GST Purchases'].includes(r.head)){
      const k=normalizeParty(r.source)+'|'+r.section;
      dup[k]=(dup[k]||0)+1;
    }
  }

  for(const r of ais.rows){
    const head=r.head, sec=r.section, party=r.source, id=r.identifier||'';
    let display=party;
    // Keep Name of Party clean; TAN/PAN stays in the source identifier and remarks if needed.

    let c26='NA', d26='NA', a26=null;
    if(!['GST Sales','GST Purchases'].includes(head)){
      if(id) a26=as26.mapTan[normalizeParty(party)+'|'+sec+'|'+id];
      if(!a26) a26=as26.map[normalizeParty(party)+'|'+sec];
      if(a26){
        c26=Math.round(a26.gross*100)/100;
        d26=Math.round(a26.tds*100)/100;
      }else{
        c26=null; d26=null;
      }
    }

    const category=(TIS_MAP[head]||[])[0] || null;
    let gTis='NA';
    // Allocation rule already agreed: when category totals reconcile, each AIS party receives its AIS amount.
    if(category){
      gTis = categoryAllowed[category]===true ? Math.round(r.gross*100)/100 : null;
    }

    const row={
      head, party:display,
      c26,d26,
      eAis:Math.round(r.gross*100)/100,
      fAis:r.tds==='NA'?'NA':Math.round(r.tds*100)/100,
      gTis,
      hTis:'NA',
      action:'No Action',
      remarks:r.note||''
    };

    if(a26?.reversal){
      row.remarks+=(row.remarks?' ':'')+'26AS reversal/cancellation entries netted at section level.';
    }
    if(c26===null && !['GST Sales','GST Purchases'].includes(head)){
      row.action='Review';
      row.remarks=row.remarks||'AIS party/section not found in 26AS.';
    }
    if(category && categoryAllowed[category]===false){
      row.action='Review';
      row.remarks+=(row.remarks?' ':'')+'TIS category total does not reconcile to AIS; TIS party allocation withheld.';
    }

    if(!['GST Sales','GST Purchases'].includes(head)){
      const gd=(typeof c26==='number'&&typeof row.eAis==='number')?Math.abs(c26-row.eAis):0;
      const td=(typeof d26==='number'&&typeof row.fAis==='number')?Math.abs(d26-row.fAis):0;
      if(gd>=1 || td>=1){
        row.action='Review';
        if(td>=1) row.remarks+=(row.remarks?' ':'')+`26AS TDS/TCS differs from AIS by ₹${(d26-row.fAis).toFixed(2)}.`;
        else row.remarks+=(row.remarks?' ':'')+`26AS gross differs from AIS by ₹${(c26-row.eAis).toFixed(2)}.`;
      }else if(gd>0.01 || td>0.01){
        row.remarks+=(row.remarks?' ':'')+'Minor source difference; within ₹1.';
      }
    }
    rows.push(row);
  }

  // Add a concise validation trail for the UI / diagnostics.
  for(const x of categoryChecks){
    if(x.ok) exceptions.push({type:'TIS_VALIDATION',severity:'INFO',details:`${x.category}: TIS Reported by Source ${x.tisTotal.toFixed(2)} reconciles to AIS ${x.aisTotal.toFixed(2)}.`});
  }

  return {meta:ais.meta,rows,exceptions};
}

function xmlEscape(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
function cellInner(v){if(v===null||v===undefined||v==='')return '';if(typeof v==='number'&&Number.isFinite(v))return `<x:v>${v}</x:v>`;return `<x:is><x:t xml:space="preserve">${xmlEscape(v)}</x:t></x:is>`;}
function patchCell(xml,ref,value){
  const re=new RegExp(`<x:c\\s+([^>]*\\br="${ref}"[^>]*)(?:/>|>[\\s\\S]*?</x:c>)`);
  const m=xml.match(re);if(!m)return xml;
  let tag=m[0];let attrs=m[1].replace(/\s+t="[^"]*"/g,'');attrs=attrs.replace(/\s+$/,'');
  const newTag=`<x:c ${attrs}>${cellInner(value)}</x:c>`;
  return xml.replace(m[0],newTag);
}
function patchMetadata(sheet,meta,prepared){sheet=patchCell(sheet,'B5',meta.name||'');sheet=patchCell(sheet,'B6',meta.ay||'');sheet=patchCell(sheet,'B7',meta.fy||'');sheet=patchCell(sheet,'B8',prepared||'');return sheet;}

async function generateWorkbook(result, preparedBy){
  const buf=await (await fetch('template.xlsx')).arrayBuffer();
  const zip=await JSZip.loadAsync(buf);
  let s1=await zip.file('xl/worksheets/sheet1.xml').async('string');
  let s2=await zip.file('xl/worksheets/sheet2.xml').async('string');
  let wbxml=await zip.file('xl/workbook.xml').async('string');
  s1=patchMetadata(s1,result.meta,preparedBy);s2=patchMetadata(s2,result.meta,preparedBy);
  for(let r=12;r<=65;r++) for(const c of ['A','B','C','D','E','F','G','H','I','J','S','T','U']) s1=patchCell(s1,`${c}${r}`,null);
  if(result.rows.length>TEMPLATE_ROWS)throw new Error(`The supplied template supports ${TEMPLATE_ROWS} Reco rows; ${result.rows.length} AIS rows were detected. The tool stopped rather than truncating data.`);
  result.rows.forEach((r,i)=>{const rr=12+i;const vals={A:r.head,B:r.party,C:r.c26,D:r.d26,E:r.eAis,F:r.fAis,G:r.gTis,H:r.hTis,I:null,J:null,S:null,T:r.action,U:r.remarks};for(const [c,v] of Object.entries(vals))s1=patchCell(s1,`${c}${rr}`,v);});
  if(/<x:calcPr\b[^>]*\/>/.test(wbxml)) wbxml=wbxml.replace(/<x:calcPr\b[^>]*\/>/,'<x:calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>'); else wbxml=wbxml.replace('</x:workbook>','<x:calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></x:workbook>');
  zip.file('xl/worksheets/sheet1.xml',s1);zip.file('xl/worksheets/sheet2.xml',s2);zip.file('xl/workbook.xml',wbxml);
  return zip.generateAsync({type:'blob',compression:'DEFLATE'});
}

window.AISReco={extractPdfLines,parseAIS,parseTIS,parse26AS,reconcile,generateWorkbook,parseMeta};
