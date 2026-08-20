/* AIS / TIS / 26AS Reconciliation - deterministic browser engine */

const HEAD_MAP = {
  '192': '92B - Salaries Receipts',
  '193': '94A - Interest Receipts',
  '194': 'Dividend Receipts',
  '194A': '94A - Interest Receipts',
  '194C': '94C - Contract Receipts',
  '194D': '94H - Commission Receipts',
  '194G': '94H - Commission Receipts',
  '194H': '94H - Commission Receipts',
  '194IA': '94L - Property Transactions',
  '194IB': '94L - Property Transactions',
  '194I(A)': '94IA - Rent Receipts (P & M) ',
  '194I(B)': '94IB - Rent Receipts (L & B) ',
  '194J': '94JB - Professional Receipts',
  '194J(A)': '94JA - Technical Receipts',
  '194J(B)': '94JB - Professional Receipts',
  '194JA': '94JA - Technical Receipts',
  '194JB': '94JB - Professional Receipts',
  '194K': 'Dividend Receipts',
  '194LD': '94A - Interest Receipts',
  '194LA': '94L - Property Transactions',
  '194LB': 'Other TDS/TCS',
  '194LBA': 'Other TDS/TCS',
  '194LBB': 'Other TDS/TCS',
  '194LBC': 'Other TDS/TCS',
  '194P': 'Other TDS/TCS',
  '194N': '94N - Cash Withdrawals',
  '194M': 'Other TDS/TCS',
  '194O': 'Other TDS/TCS',
  '194Q': '94Q - Purchases',
  '194R': '94R - Benefits / Perquisites',
  '194S': 'Other TDS/TCS',
  '194T': 'Other TDS/TCS',
  '206CA': '206CJ - TCS Purchases',
  '206CB': '206CJ - TCS Purchases',
  '206CC': '206CJ - TCS Purchases',
  '206CE': '206CE - TCS Purchases',
  '206CL': '206CL - TCS Purchases',
  '206CM': '206CJ - TCS Purchases',
  '206CN': 'Other TDS/TCS',
  '206CO': 'Other TDS/TCS',
  '206CP': 'Other TDS/TCS',
  '206CQ': 'Other TDS/TCS',
  '206CR': '206CR-TCS Purchases',
  '206CT': 'Other TDS/TCS'
};
const SFT_RULES = {
  'SFT-015': {head:'Dividend Receipts', tis:'Dividend', matchSections:['194']},
  'SFT-016': {head:'94A - Interest Receipts', tis:'Interest from deposit', matchSections:['194A']},
  'SFT-016(SB)': {head:'94A - Interest Receipts', tis:'Interest from savings bank', matchSections:['194A']},
  'SFT-016(TD)': {head:'94A - Interest Receipts', tis:'Interest from deposit', matchSections:['194A']},
  'SFT-016(OD)': {head:'94A - Interest Receipts', tis:'Interest from others', matchSections:['194A']},
  'SFT-010': {head:'Purchase of Securities', tis:'Purchase of securities and units of mutual funds', matchSections:[]},
  'SFT-17(PUR)': {head:'Purchase of Securities', tis:'Purchase of securities and units of mutual funds', matchSections:[]},
  'SFT-18(PUR)': {head:'Purchase of Securities', tis:'Purchase of securities and units of mutual funds', matchSections:[]},
  'SFT-017(PUR)': {head:'Purchase of Securities', tis:'Purchase of securities and units of mutual funds', matchSections:[]},
  'SFT-018(PUR)': {head:'Purchase of Securities', tis:'Purchase of securities and units of mutual funds', matchSections:[]},
  '_SALE_SFT': {head:'Sale of Securities', tis:'Sale of securities and units of mutual fund', matchSections:[]}
};
const TIS_MAP = {
  '92B - Salaries Receipts': ['Salary'],
  '94A - Interest Receipts': ['Interest from deposit','Interest from savings bank','Interest from others'],
  'Dividend Receipts': ['Dividend'],
  '94C - Contract Receipts': ['Business receipts'],
  '94JA - Technical Receipts': ['Business receipts'],
  '94JB - Professional Receipts': ['Business receipts'],
  '94IA - Rent Receipts (P & M) ': ['Business receipts'],
  '94IB - Rent Receipts (L & B) ': ['Business receipts'],
  '94IA - Rent Receipts (P & M)': ['Business receipts'],
  '94IB - Rent Receipts (L & B)': ['Business receipts'],
  '94H - Commission Receipts': ['Business receipts'],
  '94Q - Purchases': ['Business receipts'],
  '94R - Benefits / Perquisites': ['Business receipts'],
  '94L - Property Transactions': ['Property transactions'],
  'Purchase of Securities': ['Purchase of securities and units of mutual funds'],
  'Sale of Securities': ['Sale of securities and units of mutual fund'],
  'GST Sales': ['GST turnover'],
  'GST Purchases': ['GST purchases'],
  '206CL - TCS Purchases': ['Purchase of vehicle'],
  'Other TDS/TCS': ['Business receipts']
};
const TEMPLATE_ROWS = 150;
const TIS_GROUPS = {
  'Salary': ['92B - Salaries Receipts'],
  'Dividend': ['Dividend Receipts'],
  'Interest from deposit': ['94A - Interest Receipts'],
  'Interest from savings bank': ['94A - Interest Receipts'],
  'Interest from others': ['94A - Interest Receipts'],
  'Business receipts': ['94C - Contract Receipts','94JA - Technical Receipts','94JB - Professional Receipts','94IA - Rent Receipts (P & M) ','94IB - Rent Receipts (L & B) ','94H - Commission Receipts','94Q - Purchases','94R - Benefits / Perquisites','Other TDS/TCS'],
  'Property transactions': ['94L - Property Transactions'],
  'Purchase of securities and units of mutual funds': ['Purchase of Securities'],
  'Sale of securities and units of mutual fund': ['Sale of Securities'],
  'GST turnover': ['GST Sales'],
  'GST purchases': ['GST Purchases'],
  'Purchase of vehicle': ['206CL - TCS Purchases']
};

const SUMMARY_HEADS = [
  '92B - Salaries Receipts','94C - Contract Receipts','94JA - Technical Receipts','94JB - Professional Receipts','94IA - Rent Receipts (P & M) ','94IB - Rent Receipts (L & B) ',
  '94A - Interest Receipts','94Q - Purchases','94H - Commission Receipts','94R - Benefits / Perquisites','94L - Property Transactions','Purchase of Securities','Sale of Securities','GST Sales','GST Purchases','Advance Tax','Cash Deposits','Cash Withdrawals','SAT','206CJ - TCS Purchases','206CE - TCS Purchases','206CL - TCS Purchases','206CR-TCS Purchases','94N - Cash Withdrawals','Dividend Receipts','Other TDS/TCS'
];

const normSpace = s => String(s || '').replace(/\s+/g,' ').trim();
const num = s => Number(String(s ?? '').replace(/,/g,''));
const moneyTokens = s => String(s || '').match(/-?[\d,]+(?:\.\d+)?/g) || [];
const normalizeParty = s => normSpace(s).toUpperCase().replace(/^M\/?S\s+/,'').replace(/\([^)]*\)/g,'').replace(/&/g,' AND ').replace(/[^A-Z0-9]+/g,'');

function deriveAY(fy){
  if(!fy || !/^\d{4}-\d{2}$/.test(fy)) return '';
  const y=Number(fy.slice(0,4))+1; return `${y}-${String(y+1).slice(-2)}`;
}
function parseMeta(text){
  const rawText=String(text||'');
  const flat=rawText.replace(/\s*\|\|\s*/g,' ').replace(/\s+/g,' ').trim();
  const lines=rawText.split(/\r?\n/).map(normSpace).filter(Boolean);
  const panRe=/\b[A-Z]{5}\d{4}[A-Z]\b/;
  let pan=(flat.match(panRe)||[''])[0].toUpperCase();
  let name='';
  // Label/value parsing is more reliable than column-order assumptions.
  const nameLabel=/Name\s*of\s*Assessee\s+(.+?)(?=\s+(?:Address|Date\s+of\s+Birth|Date\s+of\s+Incorporation|Mobile\s+Number|E-?mail|Financial\s*Year|Assessment\s*Year)\b|$)/i.exec(flat);
  if(nameLabel) name=normSpace(nameLabel[1]);
  if(!name){
    for(let i=0;i<lines.length;i++){
      const parts=lines[i].split(/\s*\|\|\s*/).map(normSpace).filter(Boolean);
      if(parts.some(x=>panRe.test(x)) && parts.length>=2){
        const pi=parts.findIndex(x=>panRe.test(x));
        const candidates=parts.slice(pi+1).filter(x=>x && !/^(NA|XXXX|Active|Operative|Current Status|Financial Year|Assessment Year)$/i.test(x));
        if(candidates.length) { name=normSpace(candidates[candidates.length-1]); break; }
      }
    }
  }
  if(!name){
    for(let i=0;i<lines.length;i++){
      const m=lines[i].match(/^Name\s*of\s*Assessee\s*(.+)$/i);
      if(m){name=normSpace(m[1]);break;}
      if(/Name\s*of\s*Assessee/i.test(lines[i]) && i+1<lines.length){name=normSpace(lines[i+1]);break;}
    }
  }
  name=name.replace(/\s+(?:Current\s+Status|Permanent\s+Account\s+Number|PAN)\b.*$/i,'').trim();
  if(/^(?:Part\s*A|General\s+Information|Annual\s+Information\s+Statement|Taxpayer\s+Information\s+Summary)\b/i.test(name)) name='';
  if(!name){
    for(const line of lines){
      const parts=line.split(/\s*\|\|\s*/).map(normSpace).filter(Boolean);
      const pi=parts.findIndex(x=>panRe.test(x));
      if(pi>=0){ const candidates=parts.slice(pi+1).filter(x=>x && !/^(NA|XXXX|Active|Operative|Current Status|Financial Year|Assessment Year)$/i.test(x)); if(candidates.length){name=normSpace(candidates[candidates.length-1]);break;} }
    }
  }
  let fy=(flat.match(/Financial\s*Year\s*(?:[:\-]?\s*)?(\d{4}-\d{2})/i)||[])[1]||'';
  let ay=(flat.match(/Assessment\s*Year\s*(?:[:\-]?\s*)?(\d{4}-\d{2})/i)||[])[1]||'';
  if(!fy){const m=flat.match(/FinancialYear[^0-9]*(\d{4}-\d{2})/i);if(m)fy=m[1];}
  if(!ay){const m=flat.match(/AssessmentYear[^0-9]*(\d{4}-\d{2})/i);if(m)ay=m[1];}
  if(!ay)ay=deriveAY(fy);
  return {pan,name:normSpace(name),fy,ay};
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
  const codeMatch=lines[idx].match(/\b(?:TDS|TCS|SFT)-([A-Z0-9()_-]+?)(?=\s|$)/i);
  if(!codeMatch) throw new Error('AIS information code not found');
  const code=codeMatch[1].toUpperCase();
  const upto=Math.min(idx+12,lines.length);
  const idPattern='[A-Z0-9._-]{6,}';
  const parseParts=(line)=>String(line||'').split(/\s*\|\|\s*/).map(normSpace).filter(Boolean);
  const tryLine=(line)=>{
    const parts=parseParts(line);
    for(let j=0;j<parts.length;j++){
      // Normal layout: Source (ID) || count || amount
      let m=parts[j].match(new RegExp('^(.+?)\\s*\\(('+idPattern+')\\)\\s*$'));
      if(m){
        const countPart=parts[j+1]||'', amountPart=parts[j+2]||'';
        if(/^\d+$/.test(countPart)&&/^-?[\d,]+(?:\.\d+)?$/.test(amountPart))
          return {source:normSpace(m[1]),section:code,gross:num(amountPart),identifier:m[2]};
      }
      const countPart2=parts[j+1]||'', amountPart2=parts[j+2]||'';
      if(!m && /^\d+$/.test(countPart2) && /^-?[\d,]+(?:\.\d+)?$/.test(amountPart2)){
        const candidate=normSpace(parts[j]);
        if(candidate && !/^(SR\.?NO|INFORMATION|DESCRIPTION|SECTION|TDS|TCS|SFT|BUSINESS|SALARY|DIVIDEND|INTEREST|PURCHASE|SALE|BENEFITS|PAYMENT|COMMISSION|CONTRACT|RECEIPTS|PROPERTY|GST)/i.test(candidate))
          return {source:candidate,section:code,gross:num(amountPart2),identifier:''};
      }
      // Compact single-cell layout: Source (ID) count amount
      m=parts[j].match(new RegExp('^(.+?)\\s*\\(('+idPattern+')\\)\s+(\\d+)\s+(-?[\\d,]+(?:\\.\\d+)?)$'));
      if(m) return {source:normSpace(m[1]),section:code,gross:num(m[4]),identifier:m[2]};
      // Rare layout: source text on one line and identifier/count/amount on next line.
      if(j===0 && parts.length>=3 && /^\\d+$/.test(parts[1])&&/^-?[\\d,]+(?:\\.\\d+)?$/.test(parts[2])){
        const prevId=(String(parts[0]).match(new RegExp('\\((%ID%)\\)'.replace('%ID%',idPattern)))||[])[1];
        if(prevId) return {source:normSpace(parts[0].replace(/\\s*\\([A-Z0-9._-]{6,}\\)\\s*$/i,'')),section:code,gross:num(parts[2]),identifier:prevId};
      }
    }
    return null;
  };
  // Scan the current line and nearby lines first, including one line before the code.
  for(const i of [idx-1,idx,idx+1,idx+2,idx+3,idx+4,idx+5,idx+6,idx+7,idx+8,idx+9,idx+10,idx+11].filter(i=>i>=0&&i<lines.length)){
    const hit=tryLine(lines[i]); if(hit) return hit;
  }
  // Cross-line fallback for layouts where the source/identifier and count/amount are split.
  const block=lines.slice(Math.max(0,idx-2),upto).join(' || ');
  const fm=block.match(new RegExp('(.+?)\\s*\\(('+idPattern+')\\)\s+(\\d+)\s+(-?[\\d,]+(?:\\.\\d+)?)'));
  if(fm){
    let src=normSpace(fm[1]);
    src=src.replace(/^.*?(?:TDS|TCS|SFT)-[A-Z0-9()_-]+/i,'').replace(/\|\|/g,' ');
    return {source:normSpace(src),section:code,gross:num(fm[4]),identifier:fm[2]};
  }
  throw new Error(`Could not parse AIS source row around ${code}`);
}
function getSftRule(section){
  let c=String(section||'').toUpperCase().replace(/\s+/g,'');
  if(!c.startsWith('SFT-')) c='SFT-'+c;
  if(SFT_RULES[c]) return SFT_RULES[c];
  if(c==='SFT-017(PUR)') return SFT_RULES['SFT-17(PUR)'];
  if(c==='SFT-018(PUR)') return SFT_RULES['SFT-18(PUR)'];
  if(/SFT-17\(PUR\)|SFT-18\(PUR\)|SFT-017\(PUR\)|SFT-018\(PUR\)/.test(c)) return {head:'Purchase of Securities',tis:'Purchase of securities and units of mutual funds',matchSections:[]};
  if(/^SFT-17-(?:LES|EMF)/.test(c) || /^SFT-18-(?:LES|EMF)/.test(c)) return SFT_RULES._SALE_SFT;
  if(/SFT-17|SFT-18/.test(c)) return SFT_RULES._SALE_SFT;
  return null;
}
function headForSection(section,sftRule){
  const sec=String(section||'').toUpperCase().replace(/\s+/g,'');
  if(HEAD_MAP[sec]) return HEAD_MAP[sec];
  if(sec==='194I(A)'||sec==='194I') return '94IA - Rent Receipts (P & M) ';
  if(sec==='194I(B)') return '94IB - Rent Receipts (L & B) ';
  if(sec==='194J(A)') return '94JA - Technical Receipts';
  if(sec==='194J(B)') return '94JB - Professional Receipts';
  if(/^206C[A-Z0-9]/.test(sec)) {
    const specific={
      '206CE':'206CE - TCS Purchases','206CL':'206CL - TCS Purchases','206CR':'206CR-TCS Purchases','206CJ':'206CJ - TCS Purchases'
    };
    return specific[sec]||'Other TDS/TCS';
  }
  return sftRule?.head||'Other TDS/TCS';
}

function parseAIS(pages){
  const text=allText(pages), meta=parseMeta(text), lines=pages.flat(), rows=[], exceptions=[];
  const positions=[]; lines.forEach((l,i)=>{if(/\bTDS-Ann\.II-SAL\b/i.test(l)) return; if(/\b(?:TDS|TCS|SFT)-[A-Za-z0-9()._-]+/i.test(l)) positions.push(i)});
  for(let n=0;n<positions.length;n++){
    const idx=positions[n], end=positions[n+1]||lines.length;
    try{
      const {source,section,gross:summaryGross,identifier}=findAisSummary(lines,idx);
      const sftRule=getSftRule(section); const head=headForSection(section,sftRule); let tisCategory=sftRule?.tis || TIS_MAP[head]?.[0] || null; if(section==='193') tisCategory='Interest from others'; else if(section==='194A' && !sftRule) tisCategory='Interest from deposit';
      let detailGross=0, detailTds=0, activeDetail=0, inactiveDetail=0;
      const isTdsLike=/^\d{3}[A-Z0-9]*$/i.test(section);
      if(isTdsLike){
        for(const dlRaw of lines.slice(idx+1,end)){
          const dl=dlRaw.replace(/\s*\|\|\s*/g,' ');
          if(/\bQ[1-4]\([^)]*\)\s+\d{2}\/\d{2}\/\d{4}/.test(dl)){
            const toks=moneyTokens(dl); if(toks.length>=3){
              const isInactive=/\bInactive\b/i.test(dl), isActive=/\bActive\b/i.test(dl); const gross=num(toks[toks.length-3]), tax=num(toks[toks.length-2]);
              if(isActive && !isInactive){detailGross+=gross;detailTds+=tax;activeDetail++;}
              else if(isInactive) inactiveDetail++;
            }
          }
        }
      }
      const note=inactiveDetail?`Excluded ${inactiveDetail} inactive AIS transaction row(s) from TDS/TCS.`:'';
      const unmapped=!sftRule && !HEAD_MAP[String(section||'').toUpperCase()]; const unmappedNote=unmapped?`Unmapped AIS information code ${section}; retained under Other TDS/TCS for review.`:''; rows.push({head,section,source,gross:Math.round(summaryGross*100)/100,tds:Math.round(detailTds*100)/100,summary_gross:summaryGross,detail_gross:detailGross,note:[note,unmappedNote].filter(Boolean).join(' '),identifier,activeDetail,inactiveDetail,matchSections:sftRule?.matchSections||[],isSft:!!sftRule,tisCategory,unmapped}); if(unmapped) exceptions.push({type:'AIS_UNMAPPED_CODE',severity:'MEDIUM',details:`AIS code ${section} for ${source} retained under Other TDS/TCS.`});
    }catch(e){exceptions.push({type:'AIS_PARSE',severity:'HIGH',details:String(e.message||e),section:lines[idx].match(/\b(?:TDS|TCS|SFT)-[A-Z0-9()_-]+/i)?.[0]||''})}
  }
  let gstSales=0,gstPurchases=0;
  for(const l of lines){
    if(l.includes('EXC-GSTR3B')){const t=moneyTokens(l);if(t.length)gstSales+=num(t[t.length-1]);}
    if(l.includes('EXC-GSTR1(P)')){const t=moneyTokens(l);if(t.length)gstPurchases+=num(t[t.length-1]);}
  }
  if(gstSales) rows.push({head:'GST Sales',section:'GST',source:meta.name,gross:gstSales,tds:'NA',identifier:'',matchSections:[],isSft:false});
  if(gstPurchases) rows.push({head:'GST Purchases',section:'GSTP',source:'Aggregate - AIS GSTR-1 seller reports',gross:gstPurchases,tds:'NA',identifier:'',matchSections:[],isSft:false});
  return [{meta,rows},exceptions];
}

function parseTIS(pages){
  const cleanPages=pages.map(p=>p.map(l=>l.replace(/\s*\|\|\s*/g,' ')));
  const text=allText(cleanPages),meta=parseMeta(text),lines=cleanPages.flat(),cats={}, sourceRecords=[];
  const names=['Salary','Dividend','Interest from savings bank','Interest from deposit','Interest from others','Business receipts','Property transactions','Sale of securities and units of mutual fund','Purchase of securities and units of mutual funds','GST turnover','GST purchases','Purchase of vehicle'];
  const fuzzy=s=>String(s).split(/\s+/).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s*');
  const topRes=new Map();
  // Discover additional top-level categories from PAGE 1 only. Annexure rows must never become categories.
  const headerLines=(cleanPages[0]||[]).slice();
  const canonicalKey=x=>normSpace(x).replace(/\s+/g,'').toUpperCase();
  const knownKeys=new Set(names.map(canonicalKey));
  for(const l of headerLines) {
    const m=l.match(/^\s*\d+\s+(.+?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s*$/);
    if(m){ const n=normSpace(m[1]); const k=canonicalKey(n); if(n && !/^(SR\.? NO\.?|PART|INFORMATION|DESCRIPTION|AMOUNT)$/i.test(n) && !knownKeys.has(k)){ names.push(n); knownKeys.add(k); } }
  }
  for(const name of names){
    const re=new RegExp(String.raw`^\s*\d+\s+${fuzzy(name)}\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s*$`,'i');
    for(const l of lines.slice(0,260)){const m=l.match(re);if(m){topRes.set(name,{processed:num(m[1]),accepted:num(m[2]),reported:0,source_rows:0});break;}}
  }
  for(const n of names) cats[n]=topRes.get(n)||{processed:0,accepted:0,reported:0,source_rows:0};
  const annex=lines.findIndex(l=>/Annexure\s*to\s*Taxpayer\s*Information\s*Summary/i.test(l)); const startAt=annex>=0?annex:0;
  function headingIndex(name){const re=new RegExp(String.raw`^\s*\d+\s+${fuzzy(name)}(?:\s|$)`,'i');for(let i=startAt;i<lines.length;i++)if(re.test(lines[i]))return i;return -1;}
  function seg(name){const ss=headingIndex(name);if(ss<0)return[];let e=lines.length;for(let i=ss+1;i<lines.length;i++){if(names.some(n=>n!==name&&new RegExp('^\\s*\\d+\s+'+fuzzy(n)+'(?:\\s|$)','i').test(lines[i]))){e=i;break;}}return lines.slice(ss,e);}
  function extractTriples(name,predicate){
    const raw=seg(name).join(' '); const recs=[]; const re=/(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)/g; let m;
    while((m=re.exec(raw))){const ctx=raw.slice(Math.max(0,m.index-650),m.index), compact=ctx.replace(/\s+/g,'');if(!predicate(ctx,compact,m[0]))continue;const ids=[...ctx.matchAll(/([A-Z][A-Z0-9 &.'()\/-]{2,})\s*\(([A-Z0-9._-]{6,})\)/gi)],last=ids.length?ids[ids.length-1]:null;const source=last?normSpace(last[1]):'';recs.push({source,identifier:last?.[2]||'',reported:num(m[1]),processed:num(m[2]),accepted:num(m[3]),isSft:/\bSFT\b/i.test(ctx)||/SFT-/.test(compact),isTds:/\bTDS\s*\/\s*TCS\b/i.test(ctx)||/TDSTCS/i.test(compact),ctx});}
    return recs;
  }
  function dedupeEquivalent(recs){
    const sft=recs.filter(r=>r.isSft&&r.source), kept=[];
    for(const r of recs){if(r.isTds&&r.source){const dup=sft.some(x=>Math.abs(x.reported-r.reported)<=2.00 && (normalizeParty(x.source)===normalizeParty(r.source) || Math.abs(x.reported-r.reported)<=2.00));if(dup)continue;}kept.push(r);}return kept;
  }
  function addPartyHints(name){
    const raw=seg(name).join(' '); const re=/([A-Z][A-Z0-9 &.'()\/-]{2,})\s*\(([A-Z0-9._-]{6,})\)/gi; let m;
    while((m=re.exec(raw))){const source=normSpace(m[1]); if(!source||/^SECTION|^TDS|^SFT|^SR\.NO|^PAN|^NAME|^FINANCIAL|^INFORMATION/i.test(source)) continue; sourceRecords.push({category:name,source,identifier:m[2],reported:null,processed:null,accepted:null,isSft:/\bSFT\b/i.test(raw.slice(Math.max(0,m.index-100),m.index)),isTds:/TDS\s*\/\s*TCS/i.test(raw.slice(Math.max(0,m.index-100),m.index)),hintOnly:true});}
  }
  function assign(name,recs){const kept=dedupeEquivalent(recs);cats[name].reported=Math.round(kept.reduce((s,r)=>s+r.reported,0)*100)/100;cats[name].source_rows=kept.length;kept.forEach(r=>sourceRecords.push({category:name,...r}));}
  assign('Salary',extractTriples('Salary',(ctx,c)=>/Gross\s*Salary\s*Received|Salary\s*received\s*\(Section\s*192\)|GrossSalaryReceived|Salaryreceived\(Section192\)/i.test(ctx)||/GrossSalaryReceived|Salaryreceived\(Section192\)/i.test(c)));
  assign('Dividend',extractTriples('Dividend',(ctx,c)=>/Total\s*Dividend\s*amount|Dividend\s*received\s*\(Section\s*194\)|SFT-015/i.test(ctx)||/TotalDividendamount|Dividendreceived\(Section194\)|SFT-015/i.test(c)));
  assign('Interest from savings bank',extractTriples('Interest from savings bank',(ctx,c)=>/SFT-016[^.]{0,120}Savings|Savings[^.]{0,120}SFT-016/i.test(ctx)||/SFT-016[^.]{0,120}Savings|Savings[^.]{0,120}SFT-016/i.test(c)));
  assign('Interest from deposit',extractTriples('Interest from deposit',(ctx,c)=>/SFT-016[^.]{0,150}Term\s*Deposit|Interest\s*other\s*than.*Section\s*194A/i.test(ctx)||/SFT-016[^.]{0,150}TermDeposit|Interestotherthan.*Section194A/i.test(c)));
  assign('Interest from others',extractTriples('Interest from others',(ctx,c)=>/SFT-016[^.]{0,150}Others|Interest\s*received\s*on\s*securities|Section\s*193/i.test(ctx)||/SFT-016[^.]{0,150}Others|Interestreceivedonsecurities|Section193/i.test(c)));
  assign('Business receipts',extractTriples('Business receipts',(ctx,c)=>/Amount\s*paid\/\s*credited/i.test(ctx)||/Amountpaid\/credited/i.test(c)));
  assign('Property transactions',extractTriples('Property transactions',(ctx,c)=>/Property|Transaction\s*amount|Consideration/i.test(ctx)||/Property|Transactionamount|Consideration/i.test(c)));
  assign('Sale of securities and units of mutual fund',extractTriples('Sale of securities and units of mutual fund',(ctx,c)=>/(?:SFT|Sales)\s*(?:-| )?[^.]{0,120}Sale|Sale\s*of\s*listed|Sale\s*of\s*unit|Sale\s*of\s*other/i.test(ctx)||/SFT.*Sale|Saleoflisted|Saleofunit|Saleofother/i.test(c)));
  assign('Purchase of securities and units of mutual funds',extractTriples('Purchase of securities and units of mutual funds',(ctx,c)=>/SFT[^.]{0,160}Purchase|Purchase\s*of\s*securities|Purchase\s*of\s*mutual\s*fund|Total\s*purchase\s*amount|Gross\s*purchase\s*amount/i.test(ctx)||/SFT.*Purchase|Purchaseofsecurities|Purchaseofmutualfund|Totalpurchaseamount|Grosspurchaseamount/i.test(c)));
  assign('GST turnover',extractTriples('GST turnover',(ctx,c)=>/Total\s*Turnover/i.test(ctx)||/TotalTurnover/i.test(c)));
  assign('GST purchases',extractTriples('GST purchases',(ctx,c)=>/Purchase\s*from\s*supplier/i.test(ctx)||/Purchasefromsupplier/i.test(c)));
  assign('Purchase of vehicle',extractTriples('Purchase of vehicle',(ctx,c)=>/Amount\s*received\//i.test(ctx)||/Amountreceived\//i.test(c)));
  for(const n of names) addPartyHints(n);
  const partyCategory={};for(const r of sourceRecords){const key=normalizeParty(r.source);if(!key)continue;(partyCategory[key] ||= []).push({category:r.category,amount:r.reported,isSft:r.isSft,isTds:r.isTds});}
  for(const c of Object.values(cats)){if(c.processed!==0&&c.processed===c.accepted&&(c.reported===0||Math.abs(c.reported-c.processed)>0.01)){c.reported=c.processed;c.source_rows=0;c.reportedFallback=true;}}
  const tisExceptions=[];
  for(const n of names){ if(!TIS_GROUPS[n] && !TIS_MAP[n] && Math.abs(cats[n]?.reported||0)>0.01) tisExceptions.push({type:'TIS_UNMAPPED_CATEGORY',severity:'MEDIUM',details:`TIS category ${n} detected at ₹${(cats[n].reported||0).toFixed(2)} but no template mapping exists; retained for review.`}); }
  return [{meta,categories:cats,sourceRecords,partyCategory},tisExceptions];
}

function parse26AS(pages){
  const cleanPages=pages.map(p=>p.map(l=>l.replace(/\s*\|\|\s*/g,' ')));
  const text=allText(cleanPages),meta=parseMeta(text),lines=cleanPages.flat(),map={},mapTan={},exceptions=[];
  const headers=[]; const txs=[];
  const headerRe=/^\s*(\d+)\s+(.+?)\s+([A-Z]{4}[A-Z0-9]{6})\s+(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s*$/i;
  const txRe=/^\s*\d+\s+(\d{3}[A-Z0-9]*)\s+\d{2}-[A-Za-z]{3}-\d{4}\s+[A-Z]\s+\S+\s+\S+\s+(.+)$/i;
  for(let i=0;i<lines.length;i++){
    const s=lines[i].trim(); const hm=s.match(headerRe);
    if(hm && !/\d{2}-[A-Za-z]{3}-\d{4}/.test(s)) headers.push({idx:i,seq:Number(hm[1]),party:hm[2].trim(),tan:hm[3].toUpperCase(),gross:num(hm[4]),tds:num(hm[5]),deposit:num(hm[6])});
    const tm=s.match(txRe); if(tm){const toks=moneyTokens(tm[2]);if(toks.length>=3)txs.push({idx:i,section:tm[1].toUpperCase(),gross:num(toks[toks.length-3]),tax:num(toks[toks.length-2]),dep:num(toks[toks.length-1])});}
  }
  function addRowsForParty(h,rows){for(const tx of rows){const key=normalizeParty(h.party)+'|'+tx.section;if(!map[key])map[key]={party:h.party,section:tx.section,tan:null,gross:0,tds:0,deposit:0,reversal:false};map[key].gross+=tx.gross;map[key].tds+=tx.tax;map[key].deposit+=tx.dep;if(tx.gross<0||tx.tax<0)map[key].reversal=true;const tk=normalizeParty(h.party)+'|'+tx.section+'|'+h.tan;if(!mapTan[tk])mapTan[tk]={party:h.party,section:tx.section,tan:h.tan,gross:0,tds:0,deposit:0,reversal:false};mapTan[tk].gross+=tx.gross;mapTan[tk].tds+=tx.tax;mapTan[tk].deposit+=tx.dep;if(tx.gross<0||tx.tax<0)mapTan[tk].reversal=true;}}
  const assigned=new Set();
  // Find an exact contiguous transaction window matching the summary totals. This is robust to PDF text order where a summary row can appear before or after its detail block and across page breaks.
  function exactWindows(h){
    const out=[];
    const maxDist=220; const eligible=[];
    for(let i=0;i<txs.length;i++) if(Math.abs(txs[i].idx-h.idx)<=maxDist && !assigned.has(txs[i].idx)) eligible.push(i);
    for(let a=0;a<eligible.length;a++){
      const start=eligible[a]; let g=0,t=0,d=0;
      for(let b=a;b<eligible.length && b< a+80;b++){
        const row=txs[eligible[b]]; if(assigned.has(row.idx)) break;
        g+=row.gross;t+=row.tax;d+=row.dep;
        if(Math.abs(g-h.gross)<=0.01 && Math.abs(t-h.tds)<=0.01 && Math.abs(d-h.deposit)<=0.01){
          const first=txs[start],last=txs[eligible[b]],distance=Math.min(Math.abs(first.idx-h.idx),Math.abs(last.idx-h.idx));
          out.push({rows:txs.slice(start,eligible[b]+1).filter(r=>!assigned.has(r.idx)),distance});
        }
        if(Math.abs(g)>Math.abs(h.gross)*1.25+100000 || Math.abs(t)>Math.abs(h.tds)*1.25+100000) break;
      }
    }
    out.sort((a,b)=>a.distance-b.distance); return out;
  }
  function fallbackWindows(h){
    const prev=headers[headers.indexOf(h)-1],next=headers[headers.indexOf(h)+1];
    const before=txs.filter(t=>t.idx>(prev?prev.idx:-1)&&t.idx<h.idx&&!assigned.has(t.idx));
    const after=txs.filter(t=>t.idx>h.idx&&t.idx<(next?next.idx:lines.length)&&!assigned.has(t.idx));
    const score=(rows)=>{if(!rows.length)return 1e18;const g=rows.reduce((s,r)=>s+r.gross,0),t=rows.reduce((s,r)=>s+r.tax,0),d=rows.reduce((s,r)=>s+r.dep,0);return Math.abs(g-h.gross)*1000+Math.abs(t-h.tds)*10+Math.abs(d-h.deposit);};
    return [before,after].filter(x=>x.length).sort((a,b)=>score(a)-score(b));
  }
  headers.sort((a,b)=>a.idx-b.idx);
  // Process headers with the smallest exact-window distance first to reduce duplicate-window collisions.
  const order=[...headers].sort((a,b)=>{const ad=exactWindows(a)[0]?.distance??1e9,bd=exactWindows(b)[0]?.distance??1e9;return ad-bd;});
  for(const h of order){
    const exact=exactWindows(h)[0];
    let chosen=exact?.rows||null;
    if(!chosen){
      const fb=fallbackWindows(h); if(fb.length) chosen=fb[0];
    }
    if(chosen&&chosen.length){
      addRowsForParty(h,chosen); chosen.forEach(r=>assigned.add(r.idx));
      const g=chosen.reduce((s,r)=>s+r.gross,0),t=chosen.reduce((s,r)=>s+r.tax,0),d=chosen.reduce((s,r)=>s+r.dep,0);
      if(Math.abs(g-h.gross)>0.01||Math.abs(t-h.tds)>0.01||Math.abs(d-h.deposit)>0.01) exceptions.push({type:'26AS_SUMMARY_DETAIL_VARIANCE',severity:'MEDIUM',details:`${h.party} ${h.tan}: summary totals do not exactly tie to the selected transaction block; review grouping.`});
    } else exceptions.push({type:'26AS_HEADER_NO_DETAIL',severity:'MEDIUM',details:`${h.party} ${h.tan}: no transaction block could be associated with the summary row.`});
  }
  const unassigned=txs.filter(t=>!assigned.has(t.idx)); if(unassigned.length)exceptions.push({type:'26AS_ORPHAN_TRANSACTIONS',severity:'MEDIUM',details:`${unassigned.length} 26AS transaction row(s) could not be tied to a deductor/collector summary row.`});
  return [{meta,map,mapTan},exceptions];
}
function reconcile(ais,tis,as26,exceptions){
  const rows=[];
  const deriveTisCategory=(r)=>{
    if(r.isSft && r.tisCategory) return r.tisCategory;
    const matches=tis.partyCategory?.[normalizeParty(r.source)]||[];
    const head=r.head;
    const allowedByHead=new Set(TIS_MAP[head]||[]);
    const exact=matches.find(m=>allowedByHead.has(m.category));
    if(exact) return exact.category;
    if(matches.length===1) return matches[0].category;
    return r.tisCategory || TIS_MAP[head]?.[0] || null;
  };
  for(const r of ais.rows){r.summaryEligible=r.summaryEligible!==false;r._tisCategory=deriveTisCategory(r);}

  const categoryAllowed={};const categoryChecks=[];
  for(const [category,heads] of Object.entries(TIS_GROUPS)){
    const tisTotal=tis.categories[category]?.reported ?? null;
    if(tisTotal===null){categoryAllowed[category]=null;continue;}
    const catRows=ais.rows.filter(r=>r._tisCategory===category&&r.summaryEligible!==false&&typeof r.gross==='number');
    let aisTotal=catRows.reduce((sum,r)=>sum+r.gross,0);
    // If AIS appears to contain the same source twice through SFT and TDS/TCS representations,
    // remove the non-SFT copy from Summary/category totals when the amounts explain the TIS total.
    if(aisTotal>tisTotal+0.01){
      const sfts=catRows.filter(r=>r.isSft); const candidates=catRows.filter(r=>!r.isSft);
      for(const r of candidates){
        const dup=sfts.find(s=>Math.abs(s.gross-r.gross)<=2.00);
        if(dup && aisTotal-r.gross>=tisTotal-0.01){
          r.summaryEligible=false;
          r.note=(r.note?r.note+' ':'')+'Duplicate SFT/TDS representation; retained in Reco but excluded from category total/Summary.';
          aisTotal-=r.gross;
        }
        if(Math.abs(aisTotal-tisTotal)<=0.01) break;
      }
    }
    // Recompute after duplicate filtering.
    aisTotal=ais.rows.filter(r=>r._tisCategory===category&&r.summaryEligible!==false&&typeof r.gross==='number').reduce((sum,r)=>sum+r.gross,0);
    const ok=Math.abs(tisTotal-aisTotal)<=0.01;categoryAllowed[category]=ok;categoryChecks.push({category,tisTotal,aisTotal,ok});
    if(!ok && (Math.abs(tisTotal)>0.01||Math.abs(aisTotal)>0.01))exceptions.push({type:'TIS_TOTAL_MISMATCH',severity:'HIGH',details:`${category}: TIS Reported by Source ${tisTotal.toFixed(2)} vs AIS ${aisTotal.toFixed(2)}`});
    if(tis.categories[category]?.reportedFallback)exceptions.push({type:'TIS_REPORTED_FALLBACK',severity:'MEDIUM',details:`${category}: detailed Reported by Source rows could not be isolated reliably; category-level value retained only because Processed by System equals Accepted by Taxpayer/Confirmed by Source.`});
  }

  for(const r of ais.rows){
    const head=r.head,sec=r.section,party=r.source,id=r.identifier||'';let c26='NA',d26='NA',a26=null;
    const canMatch26=!['GST Sales','GST Purchases'].includes(head)&&(!r.isSft||(r.matchSections||[]).length>0);
    if(canMatch26){
      const candidates=[...(r.matchSections||[]),sec].filter(Boolean);
      if(id){for(const s of candidates){a26=as26.mapTan[normalizeParty(party)+'|'+s+'|'+id];if(a26)break;}}
      if(!a26){for(const s of candidates){a26=as26.map[normalizeParty(party)+'|'+s];if(a26)break;}}
      if(a26){c26=Math.round(a26.gross*100)/100;d26=Math.round(a26.tds*100)/100;}else{c26=null;d26=null;}
    }
    const category=r._tisCategory;let gTis='NA';
    if(category&&categoryAllowed[category]===true)gTis=Math.round(r.gross*100)/100;else if(category&&categoryAllowed[category]===false)gTis=null;
    const row={head,party,c26,d26,eAis:Math.round(r.gross*100)/100,fAis:r.tds==='NA'?'NA':Math.round(r.tds*100)/100,gTis,hTis:'NA',action:'No Action',remarks:r.note||'',summaryEligible:r.summaryEligible!==false};
    if(a26?.reversal)row.remarks+=(row.remarks?' ':'')+'26AS reversal/cancellation entries netted at section level.';
    if(c26===null&&canMatch26){row.action='Review';row.remarks=row.remarks||'AIS party/section not found in 26AS.';}
    if(r.unmapped){row.action='Review';row.remarks+=(row.remarks?' ':'')+'Information code is outside the explicit section map; verify classification before relying on the Summary.';}
    if(category===null && head!=='GST Sales' && head!=='GST Purchases'){row.action='Review';row.remarks+=(row.remarks?' ':'')+'TIS category could not be mapped to this row; TIS value withheld.';}
    if(category&&categoryAllowed[category]===false){row.action='Review';row.remarks+=(row.remarks?' ':'')+'TIS category total does not reconcile to AIS; TIS allocation withheld.';}
    if(!['GST Sales','GST Purchases'].includes(head)){
      const gd=typeof c26==='number'?Math.abs(c26-row.eAis):0,td=typeof d26==='number'&&typeof row.fAis==='number'?Math.abs(d26-row.fAis):0;
      if(gd>=1||td>=1){row.action='Review';if(td>=1)row.remarks+=(row.remarks?' ':'')+`26AS TDS/TCS differs from AIS by ₹${(d26-row.fAis).toFixed(2)}.`;else if(typeof c26==='number')row.remarks+=(row.remarks?' ':'')+`26AS gross differs from AIS by ₹${(c26-row.eAis).toFixed(2)}.`;}
      else if(gd>0.01||td>0.01)row.remarks+=(row.remarks?' ':'')+'Minor source difference; within ₹1.';
    }
    rows.push(row);
  }
  for(const x of categoryChecks)if(x.ok)exceptions.push({type:'TIS_VALIDATION',severity:'INFO',details:`${x.category}: TIS Reported by Source ${x.tisTotal.toFixed(2)} reconciles to effective AIS ${x.aisTotal.toFixed(2)}.`});
  return {meta:ais.meta,rows,exceptions};
}

function xmlEscape(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
function cellInner(v){if(v===null||v===undefined||v==='')return '';if(typeof v==='number'&&Number.isFinite(v))return `<x:v>${v}</x:v>`;return `<x:is><x:t xml:space="preserve">${xmlEscape(v)}</x:t></x:is>`;}
function patchCell(xml,ref,value){
  const re=new RegExp(`<x:c\s+([^>]*\\br="${ref}"[^>]*)(?:/>|>[\\s\\S]*?</x:c>)`);
  const m=xml.match(re);if(!m)return xml;
  let tag=m[0];let attrs=m[1].replace(/\s+t="[^"]*"/g,'');attrs=attrs.replace(/\s+$/,'');
  const newTag=`<x:c ${attrs}>${cellInner(value)}</x:c>`;
  return xml.replace(m[0],newTag);
}
function patchMetadata(sheet,meta,prepared){sheet=patchCell(sheet,'B5',meta.name||'');sheet=patchCell(sheet,'B6',meta.ay||'');sheet=patchCell(sheet,'B7',meta.fy||'');sheet=patchCell(sheet,'B8',prepared||'');return sheet;}

async function generateWorkbook(result, preparedBy){
  const buf=await (await fetch('template.xlsx?ts='+Date.now(),{cache:'no-store'})).arrayBuffer();
  const zip=await JSZip.loadAsync(buf);
  let s1=await zip.file('xl/worksheets/sheet1.xml').async('string');
  let s2=await zip.file('xl/worksheets/sheet2.xml').async('string');
  let wbxml=await zip.file('xl/workbook.xml').async('string');
  s1=patchMetadata(s1,result.meta,preparedBy);s2=patchMetadata(s2,result.meta,preparedBy);
  for(let r=12;r<=161;r++) for(const c of ['A','B','C','D','E','F','G','H','I','J','S','T','U','V']) s1=patchCell(s1,`${c}${r}`,null);
  if(result.rows.length>TEMPLATE_ROWS)throw new Error(`The supplied template supports ${TEMPLATE_ROWS} Reco rows; ${result.rows.length} rows were detected. The tool stopped rather than truncating data.`);
  result.rows.forEach((r,i)=>{const rr=12+i;const vals={A:r.head,B:r.party,C:r.c26,D:r.d26,E:r.eAis,F:r.fAis,G:r.gTis,H:r.hTis,I:null,J:null,S:null,T:r.action,U:r.remarks,V:r.summaryEligible===false?'N':'Y'};for(const [c,v] of Object.entries(vals))s1=patchCell(s1,`${c}${rr}`,v);});
  if(/<x:calcPr\b[^>]*\/>/.test(wbxml)) wbxml=wbxml.replace(/<x:calcPr\b[^>]*\/>/,'<x:calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>'); else wbxml=wbxml.replace('</x:workbook>','<x:calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></x:workbook>');
  zip.file('xl/worksheets/sheet1.xml',s1);zip.file('xl/worksheets/sheet2.xml',s2);zip.file('xl/workbook.xml',wbxml);
  return zip.generateAsync({type:'blob',compression:'DEFLATE'});
}

window.AISReco={extractPdfLines,parseAIS,parseTIS,parse26AS,reconcile,generateWorkbook,parseMeta,TEMPLATE_ROWS};
