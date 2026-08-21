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
  'SFT-006': {head:'Other TDS/TCS', tis:'Miscellaneous payment', matchSections:[]},
  'SFT-004(P)': {head:'Cash Deposits', tis:'Cash deposits', matchSections:[]},
  'SFT-004(R)': {head:'94N - Cash Withdrawals', tis:'Cash withdrawals', matchSections:[]},
  'SFT-011': {head:'Other TDS/TCS', tis:'Outward foreign remittance/purchase of foreign currency', matchSections:[]},
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
  '94IA - Rent Receipts (P & M) ': ['Rent received'],
  '94IB - Rent Receipts (L & B) ': ['Rent received'],
  '94IA - Rent Receipts (P & M)': ['Rent received'],
  '94IB - Rent Receipts (L & B)': ['Rent received'],
  '94H - Commission Receipts': ['Business receipts'],
  '94Q - Purchases': ['Business receipts'],
  '94R - Benefits / Perquisites': ['Business receipts'],
  '94L - Property Transactions': ['Property transactions','Sale of land or building','Receipts from transfer of immovable property'],
  'Cash Deposits': ['Cash deposits'],
  'Purchase of Securities': ['Purchase of securities and units of mutual funds'],
  'Sale of Securities': ['Sale of securities and units of mutual fund'],
  'GST Sales': ['GST turnover'],
  'GST Purchases': ['GST purchases'],
  '206CL - TCS Purchases': ['Purchase of vehicle'],
  '94N - Cash Withdrawals': ['Cash withdrawals'],
  'Other TDS/TCS': ['Business receipts'],
  'Other TDS/TCS:MISC': ['Miscellaneous payment'],
  'Other TDS/TCS:FOREX': ['Outward foreign remittance/purchase of foreign currency'],
  'Other TDS/TCS:TRAVEL': ['Foreign travel']
};
const TEMPLATE_ROWS = 150;
const TIS_GROUPS = {
  'Salary': ['92B - Salaries Receipts'],
  'Dividend': ['Dividend Receipts'],
  'Interest from deposit': ['94A - Interest Receipts'],
  'Interest from savings bank': ['94A - Interest Receipts'],
  'Interest from others': ['94A - Interest Receipts'],
  'Business receipts': ['94C - Contract Receipts','94JA - Technical Receipts','94JB - Professional Receipts','94H - Commission Receipts','94Q - Purchases','94R - Benefits / Perquisites','Other TDS/TCS'],
  'Rent received': ['94IA - Rent Receipts (P & M) ','94IB - Rent Receipts (L & B) '],
  'Property transactions': ['94L - Property Transactions'],
  'Sale of land or building': ['94L - Property Transactions'],
  'Receipts from transfer of immovable property': ['94L - Property Transactions'],
  'Purchase of securities and units of mutual funds': ['Purchase of Securities'],
  'Sale of securities and units of mutual fund': ['Sale of Securities'],
  'GST turnover': ['GST Sales'],
  'GST purchases': ['GST Purchases'],
  'Purchase of vehicle': ['206CL - TCS Purchases'],
  'Miscellaneous payment': ['Other TDS/TCS'],
  'Cash deposits': ['Cash Deposits'],
  'Cash withdrawals': ['94N - Cash Withdrawals'],
  'Outward foreign remittance/purchase of foreign currency': ['Other TDS/TCS'],
  'Foreign travel': ['Other TDS/TCS']
};

const SUMMARY_HEADS = [
  '92B - Salaries Receipts','94C - Contract Receipts','94JA - Technical Receipts','94JB - Professional Receipts','94IA - Rent Receipts (P & M) ','94IB - Rent Receipts (L & B) ',
  '94A - Interest Receipts','94Q - Purchases','94H - Commission Receipts','94R - Benefits / Perquisites','94L - Property Transactions','Purchase of Securities','Sale of Securities','GST Sales','GST Purchases','Advance Tax','Cash Deposits','Cash Withdrawals','SAT','206CJ - TCS Purchases','206CE - TCS Purchases','206CL - TCS Purchases','206CR-TCS Purchases','94N - Cash Withdrawals','Dividend Receipts','Other TDS/TCS'
];

const normSpace = s => String(s || '').replace(/\s+/g,' ').trim();
const num = s => Number(String(s ?? '').replace(/,/g,''));
const moneyTokens = s => String(s || '').match(/-?[\d,]+(?:\.\d+)?/g) || [];
const normalizeParty = s => normSpace(s).toUpperCase().replace(/^M\/?S\s+/,'').replace(/\([^)]*\)/g,'').replace(/&/g,' AND ').replace(/[^A-Z0-9]+/g,'');


function namesCompatible(a,b){
  const x=normalizeParty(a), y=normalizeParty(b);
  if(!x||!y) return false;
  if(x===y) return true;
  const shorter=x.length<=y.length?x:y, longer=x.length<=y.length?y:x;
  // PDF text extraction can split/omit a trailing name token in TIS/26AS headers.
  return shorter.length>=Math.ceil(longer.length*0.65) && (longer.startsWith(shorter)||longer.endsWith(shorter));
}
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

  // Prefer explicit 26AS labels; repeated detail headers can contain shorter names,
  // so keep the longest plausible AssesseeName encountered.
  const explicitNames=[];
  for(const line of lines){
    let m=line.match(/AssesseeName\s*:\s*(.+?)(?=\s*\|\||\s+AssessmentYear\b|$)/i);
    if(m && m[1]) explicitNames.push(normSpace(m[1]));
    m=line.match(/^Name\s*of\s*Assessee\s*\|\|\s*(.+)$/i);
    if(m && m[1]) explicitNames.push(normSpace(m[1]));
    m=line.match(/^NameofAssessee\s*\|\|\s*(.+)$/i);
    if(m && m[1]) explicitNames.push(normSpace(m[1]));
  }
  if(explicitNames.length) name=explicitNames.sort((a,b)=>b.length-a.length)[0];

  // AIS/TIS layouts commonly put PAN, Aadhaar and name on the same logical row.
  if(!name){
    for(const line of lines){
      const parts=line.split(/\s*\|\|\s*/).map(normSpace).filter(Boolean);
      const pi=parts.findIndex(x=>panRe.test(x));
      if(pi>=0){
        const candidates=parts.slice(pi+1).filter(x=>x && !/^(NA|XXXX|XX+|Active|Operative|Current Status|Financial Year|Assessment Year)$/i.test(x));
        if(candidates.length){ name=normSpace(candidates[candidates.length-1]); break; }
      }
    }
  }

  // Label/value fallback for layouts without the delimiter row.
  if(!name){
    // Common PDF text extraction form: a header row names PAN/Aadhaar/Name and
    // the very next line contains: PAN + masked Aadhaar + actual assessee name.
    for(let i=0;i<lines.length-1;i++){
      if(/Permanent\s+Account\s+Number\s*\(PAN\).*Name\s+of\s+Assessee/i.test(lines[i])){
        const v=lines[i+1];
        const mm=v.match(/^(?:[A-Z]{5}\d{4}[A-Z])\s+(?:(?:X{2,}\s*)+|NA)\s*(?:\d{4})?\s+(.+)$/i);
        if(mm&&mm[1]){name=normSpace(mm[1]);break;}
      }
    }
  }
  if(!name){
    const nameLabel=/Name\s*of\s*Assessee\s+(.+?)(?=\s+(?:Address|Date\s+of\s+Birth|Date\s+of\s+Incorporation|Mobile\s+Number|E-?mail|Financial\s*Year|Assessment\s*Year)\b|$)/i.exec(flat);
    if(nameLabel) name=normSpace(nameLabel[1]);
  }
  if(!name){
    for(let i=0;i<lines.length;i++){
      const m=lines[i].match(/^Name\s*of\s*Assessee\s*(.+)$/i);
      if(m){name=normSpace(m[1]);break;}
      if(/Name\s*of\s*Assessee/i.test(lines[i]) && i+1<lines.length){name=normSpace(lines[i+1]);break;}
    }
  }
  name=name.replace(/\s+(?:Current\s+Status|Permanent\s+Account\s+Number|PAN)\b.*$/i,'').trim();
  if(/^(?:Part\s*A|General\s+Information|GeneralInformation|Annual\s+Information\s+Statement|Taxpayer\s+Information\s+Summary|TaxpayerInformationSummary(?:\(TIS\))?)\b/i.test(name)) name='';

  // Prefer explicit document metadata. Pair the Financial Year / Assessment Year labels
  // before any generic year scanning; otherwise the first FY can be mistakenly assigned
  // to the AY field in text-only PDF extraction.
  const yearVal=s=>Number(String(s).slice(0,4));
  let fy='', ay='';
  for(let i=0;i<lines.length;i++){
    if(/^Financial\s*Year\s*$/i.test(lines[i]) && /^Assessment\s*Year\s*$/i.test(lines[i+1]||'')){
      const vals=[];
      for(let j=i+2;j<Math.min(i+8,lines.length);j++){
        const m=lines[j].match(/^(\d{4}-\d{2})$/);
        if(m) vals.push(m[1]);
        if(vals.length>=2) break;
      }
      if(vals.length>=1) fy=vals[0];
      if(vals.length>=2) ay=vals[1];
      if(fy && ay) break;
    }
    const paired=lines[i].match(/Financial\s*Year\s*(\d{4}-\d{2}).*Assessment\s*Year\s*(\d{4}-\d{2})/i);
    if(paired){fy=paired[1];ay=paired[2];break;}
  }
  if(!fy || !ay){
    const fyCandidates=[], ayCandidates=[];
    for(const line of lines){
      let m=line.match(/Financial\s*Year\s*(?:[:\-]?\s*)?(\d{4}-\d{2})(?!\s+and\s+earlier)/i);
      if(m) fyCandidates.push(m[1]);
      m=line.match(/Assessment\s*Year\s*(?:[:\-]?\s*)?(\d{4}-\d{2})(?!\s+and\s+earlier)/i);
      if(m) ayCandidates.push(m[1]);
    }
    if(!fy) fy=fyCandidates.sort((a,b)=>yearVal(b)-yearVal(a))[0]||'';
    if(!ay) ay=ayCandidates.sort((a,b)=>yearVal(b)-yearVal(a))[0]||'';
  }
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
  const line=String(lines[idx]||'');
  const codeMatch=line.match(/\b(?:TDS|TCS|SFT)-([A-Z0-9()_-]+?)(?=\s|$)/i);
  if(!codeMatch) throw new Error('AIS information code not found');
  const code=codeMatch[1].toUpperCase();
  const idPattern='[A-Z0-9._-]{6,}';
  const amountPattern='-?[\d,]+(?:\.\d+)?';
  const cleanAisSource=(value)=>{
    let v=normSpace(value);
    // Remove known AIS information-description prefixes while preserving the actual source name.
    v=v.replace(/^Salary received\s*\(Section\s*192\)\s*/i,'');
    v=v.replace(/^Dividend received\s*\(Section\s*194\)\s*/i,'');
    v=v.replace(/^Interest other than\s*[\"“”]?Interest on Securities[\"“”]?\s*received(?:\s*\(Section\s*194A\))?\s*/i,'');
    v=v.replace(/^Interest received on securities\s*\(Section\s*193\)\s*/i,'');
    v=v.replace(/^Payment of certain sums by buyer against sale of goods\s*\(Section\s*194Q\)\s*/i,'');
    v=v.replace(/^Benefits or perquisites received in respect of business\s+or profession\s*\(Section\s*194R\)\s*/i,'');
    v=v.replace(/^Commission or brokerage received\s*\(Section\s*194H\)\s*/i,'');
    v=v.replace(/^Receipts from contract\s*\(Section\s*194C\)\s*/i,'');
    v=v.replace(/^Rent received\s*\(Section\s*194I[^)]*\)\s*/i,'');
    v=v.replace(/^Transfer of immovable property\s*\(Section\s*194IA\)\s*/i,'');
    v=v.replace(/^Receipts from transfer of immovable property\s*\(Section\s*194IA\)\s*/i,'');
    v=v.replace(/^Remittance under LRS\s*\(u\/s\s*206C\(1G\(a\)\)\)\s*/i,'');
    v=v.replace(/^Sale of listed equity share\s*\(Depository\)\s*/i,'');
    v=v.replace(/^Sale of unit of equity oriented mutual fund\s*\((?:Depository|RTA)\)\s*/i,'');
    v=v.replace(/^Sale of other unit\s*\(Depository\)\s*/i,'');
    // SFT descriptions may contain `(SFT - 017)` / `(SFT-018)` markers.
    v=v.replace(/^.*?\(SFT\s*-\s*\d+\)\s*/i,'');
    v=v.replace(/^\d+\s+/,'').trim();
    return v||'Unknown source';
  };
  const parseLine=(ln)=>{
    const text=String(ln||'');
    const tail=new RegExp('\\((' + idPattern + ')\\)\\s+(\\d+)\\s+(' + amountPattern + ')\\s*$','i').exec(text);
    if(!tail) return null;
    let prefix=text.slice(0,tail.index);
    const cp=prefix.toUpperCase().lastIndexOf(codeMatch[0].toUpperCase());
    if(cp>=0) prefix=prefix.slice(cp+codeMatch[0].length);
    prefix=normSpace(prefix);
    let source='';
    const pipeParts=prefix.split(/\s*\|\|\s*/).map(normSpace).filter(Boolean);
    const idRe=new RegExp('\\(' + idPattern + '\\)\s*$','i');
    const idPart=pipeParts.find(p=>idRe.test(p));
    if(idPart) source=normSpace(idPart.replace(new RegExp('\\(' + idPattern + '\\)\s*$','i'),'')).trim();
    if(!source){
      const idIdx=prefix.toUpperCase().lastIndexOf('(' + tail[1].toUpperCase() + ')');
      if(idIdx>=0) source=normSpace(prefix.slice(0,idIdx)).trim();
    }
    if(!source){
      source=prefix;
      const cut=source.lastIndexOf(') ');
      if(cut>=0){
        const candidate=normSpace(source.slice(cut+2));
        if(candidate && !/^[-–]|^\(/.test(candidate)) source=candidate;
      }
    }
    // If PDF extraction glued the information description to the party name,
    // remove everything through the explicit `(Section XYZ)` marker for this code.
    const sectionMarker=String(code||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    if(sectionMarker) source=source.replace(new RegExp('^.*?\\(Section\\s*'+sectionMarker+'\\)\\s*','i'),'');
    source=cleanAisSource(source);
    return {source,section:code,gross:num(tail[3]),identifier:tail[1]};
  };
  const direct=parseLine(line);if(direct)return direct;
  // Wrapped summary layout: the count/amount remain on the code line while the
  // source identifier (TAN/PAN-like value) is wrapped onto the next line.
  {
    const terminalPair=line.match(/(?:^|\s)(\d{1,4})\s+(-?[\d,]+(?:\.\d+)?)\s*$/);
    if(terminalPair){
      for(let j=idx+1;j<Math.min(idx+4,lines.length);j++){
        const idm=String(lines[j]||'').match(/\(([A-Z0-9._-]{6,})\)\s*$/i);
        if(idm){
          const base=line.replace(/(?:^|\s)(\d{1,4})\s+(-?[\d,]+(?:\.\d+)?)\s*$/,'').trim();
          let combined=normSpace(base+' '+String(lines[j]||''));
          const cp=combined.toUpperCase().lastIndexOf(codeMatch[0].toUpperCase());
          if(cp>=0) combined=normSpace(combined.slice(cp+codeMatch[0].length));
          const idPos=combined.lastIndexOf('('+idm[1]+')');
          let source=idPos>=0?normSpace(combined.slice(0,idPos)):combined;
          const sectionMarker=String(code||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
          if(sectionMarker) source=source.replace(new RegExp('^.*?\\(Section\\s*'+sectionMarker+'\\)\\s*','i'),'');
          source=cleanAisSource(source);
          return {source,section:code,gross:num(terminalPair[2]),identifier:idm[1]};
        }
      }
    }
  }
  // Split summary layout: source can continue on the next line, identifier may be
  // on that same line, and count/amount may be on the following line.
  for(let j=idx+1;j<Math.min(idx+5,lines.length);j++){
    const idLine=String(lines[j]||'').match(new RegExp('\\((' + idPattern + ')\\)\s*$','i'));
    if(idLine){
      for(let k=j+1;k<Math.min(j+3,lines.length);k++){
        const ca=String(lines[k]||'').match(new RegExp('^\\s*(\\d+)\\s+(' + amountPattern + ')\\s*$','i'));
        if(ca){
          let combined=normSpace(String(lines[idx]||'')+' '+String(lines[j]||''));
          const cp=combined.toUpperCase().lastIndexOf(codeMatch[0].toUpperCase());
          if(cp>=0) combined=normSpace(combined.slice(cp+codeMatch[0].length));
          let source=combined; const cut=combined.lastIndexOf(') '); if(cut>=0) source=normSpace(combined.slice(cut+2));
          if(/^[-–]|^\(/.test(source)){const cut2=combined.lastIndexOf(') ',cut-1);if(cut2>=0)source=normSpace(combined.slice(cut2+2));}
          return {source:source||'Unknown source',section:code,gross:num(ca[2]),identifier:idLine[1]};
        }
      }
    }
  }
  const parts=line.split(/\s*\|\|\s*/).map(normSpace).filter(Boolean);
  for(let j=0;j<parts.length;j++){
    // Delimited layout without TAN/PAN: ... || Source || count || amount.
    // Use the segment immediately preceding count/amount as the source rather
    // than trying to infer it from the description text.
    if(j+2<parts.length && /^\d+$/.test(parts[j+1]) && /^-?[\d,]+(?:\.\d+)?$/.test(parts[j+2])){
      const candidate=normSpace(parts[j]);
      if(candidate && !/^(?:SR\.?NO|INFORMATION|DESCRIPTION|SECTION|TDS|TCS|SFT|BUSINESS|SALARY|DIVIDEND|INTEREST|PURCHASE|SALE|BENEFITS|PAYMENT|COMMISSION|CONTRACT|RECEIPTS|PROPERTY|GST)$/i.test(candidate)){
        const cm=candidate.match(/\(([A-Z0-9._-]{6,})\)\s*$/i);
        const source=normSpace(cm?candidate.slice(0,cm.index):candidate).replace(/^[-–]\s*(?:Savings|Term\s*Deposit|Others)\s+/i,'');
        return {source,section:code,gross:num(parts[j+2]),identifier:cm?cm[1]:''};
      }
    }
    const m=parts[j].match(new RegExp('^(.+?)\\s*\\((' + idPattern + ')\\)\\s*$','i'));
    if(m){const c=parts[j+1]||'',a=parts[j+2]||'';if(/^\d+$/.test(c)&&new RegExp('^'+amountPattern+'$').test(a))return {source:normSpace(m[1]),section:code,gross:num(a),identifier:m[2]};}
  }
  // Same-line compact layout without PDF column delimiters:
  // `1 TDS-192 Description SOURCE (TAN) 20 10800000`.
  const compactLine=(idxLine)=>{
    const text=String(idxLine||'');
    if(!text.toUpperCase().includes(codeMatch[0].toUpperCase())) return null;
    const m=text.match(/^\s*\d+\s+.*?\s+(.+?)\s*\(([A-Z0-9._-]{6,})\)\s+(\d+)\s+(-?[\d,]+(?:\.\d+)?)\s*$/i);
    if(!m) return null;
    let source=normSpace(m[1]);
    const cut=source.lastIndexOf(') ');
    if(cut>=0) source=normSpace(source.slice(cut+2));
    return {source:source.replace(/^[-–]\s*(?:Savings|Term\s*Deposit|Others)\s+/i,'').trim(),section:code,gross:num(m[4]),identifier:m[2]};
  };
  const compact=compactLine(line); if(compact) return compact;
  for(let j=idx+1;j<Math.min(idx+12,lines.length);j++){const hit=parseLine(lines[j]);if(hit)return hit;}
  throw new Error(`Could not parse AIS source row around ${code}`);
}
function canonicalSection(section){
  const sec=String(section||'').toUpperCase().replace(/\s+/g,'');
  if(sec==='194I(A)') return '194IA';
  if(sec==='194I(B)'||sec==='194IB') return '194IB';
  if(sec==='194J(A)') return '194JA';
  if(sec==='194J(B)') return '194JB';
  if(/^194IA\((?:RV|R)\)$/.test(sec)) return '194IA';
  return sec;
}
function getSftRule(section){
  let c=String(section||'').toUpperCase().replace(/\s+/g,'');
  if(!c.startsWith('SFT-')) c='SFT-'+c;
  if(SFT_RULES[c]) return SFT_RULES[c];
  if(c==='SFT-017(PUR)') return SFT_RULES['SFT-17(PUR)'];
  if(c==='SFT-018(PUR)') return SFT_RULES['SFT-18(PUR)'];
  if(/SFT-17\(PUR\)|SFT-18\(PUR\)|SFT-017\(PUR\)|SFT-018\(PUR\)/.test(c)) return {head:'Purchase of Securities',tis:'Purchase of securities and units of mutual funds',matchSections:[]};
  if(/^SFT-17-(?:LES|EMF)/.test(c)||/^SFT-18-(?:LES|EMF)/.test(c)) return SFT_RULES._SALE_SFT;
  if(/SFT-17|SFT-18/.test(c)) return SFT_RULES._SALE_SFT;
  return null;
}
function headForSection(section,sftRule){
  const raw=String(section||'').toUpperCase().replace(/\s+/g,'');
  if(raw==='194I(A)') return '94IA - Rent Receipts (P & M) ';
  if(raw==='194I(B)'||raw==='194IB') return '94IB - Rent Receipts (L & B) ';
  if(raw==='194J(A)') return '94JA - Technical Receipts';
  if(raw==='194J(B)') return '94JB - Professional Receipts';
  const sec=canonicalSection(raw);
  if(HEAD_MAP[sec]) return HEAD_MAP[sec];
  if(/^206C[A-Z0-9]/.test(sec)){const specific={'206CE':'206CE - TCS Purchases','206CL':'206CL - TCS Purchases','206CR':'206CR-TCS Purchases','206CJ':'206CJ - TCS Purchases'};return specific[sec]||'Other TDS/TCS';}
  return sftRule?.head||'Other TDS/TCS';
}

function parseAIS(pages){
  const text=allText(pages), meta=parseMeta(text), lines=pages.flat(), rows=[], exceptions=[];
  const positions=[]; lines.forEach((l,i)=>{if(/\bTDS-Ann\.II-SAL\b/i.test(l)) return; if(/^\s*\d+\s*(?:\|\|\s*)?\b(?:TDS|TCS|SFT)-[A-Za-z0-9()._-]+/i.test(l)) positions.push(i)});
  for(let n=0;n<positions.length;n++){
    const idx=positions[n], end=positions[n+1]||lines.length;
    try{
      const found=findAisSummary(lines,idx);
      const rawSection=String(found.section||'').toUpperCase().replace(/\s+/g,'');
      const sourceKind=((String(lines[idx]||'').match(/^\s*\d+\s+(TDS|TCS|SFT)-/i)||[])[1]||'').toUpperCase();
      const section=canonicalSection(rawSection);
      let source=String(found.source||'');
      // Final defensive source cleanup after PDF-layout extraction. Some AIS layouts
      // omit `(Section XYZ)` and leave only the human-readable description before the party.
      source=source.replace(/^Payment of certain sums by buyer against sale of goods\s*/i,'')
        .replace(/^Benefits or perquisites received in respect of business(?:\s+or profession)?\s*/i,'')
        .replace(/^Commission or brokerage received\s*/i,'')
        .replace(/^Interest other than\s*[\"“”]?Interest on Securities[\"“”]?\s*received\s*/i,'')
        .replace(/^Interest received on securities\s*/i,'')
        .replace(/^Salary received\s*/i,'')
        .replace(/^Dividend received\s*/i,'')
        .replace(/^Rent received\s*/i,'')
        .replace(/^Receipts from contract\s*/i,'')
        .replace(/^Transfer of immovable property\s*/i,'')
        .replace(/^Receipts from transfer of immovable property\s*/i,'')
        .replace(/^Purchase of overseas tour package\s*/i,'')
        .trim();
      const summaryGross=found.gross, identifier=found.identifier;
      const sftRule=getSftRule(rawSection); const head=headForSection(rawSection,sftRule);
      let tisCategory=sftRule?.tis || TIS_MAP[head]?.[0] || null;
      if(rawSection==='193') tisCategory='Interest from others';
      else if(rawSection==='194A' && !sftRule) tisCategory='Interest from deposit';
      else if(rawSection==='194N') tisCategory='Cash withdrawals';
      else if(rawSection==='206CQ') tisCategory='Outward foreign remittance/purchase of foreign currency';
      else if(rawSection==='206CO') tisCategory='Foreign travel';
      else if(rawSection==='SFT-006') tisCategory='Miscellaneous payment';
      else if(rawSection==='SFT-011') tisCategory='Outward foreign remittance/purchase of foreign currency';
      else if(/^SFT-004\(P\)$/i.test(rawSection)) tisCategory='Cash deposits';
      else if(/^SFT-004\(R\)$/i.test(rawSection)) tisCategory='Cash withdrawals';
      else if(/^194IA\(RV\)$/i.test(rawSection)) tisCategory='Sale of land or building';
      else if(/^194IA\(R\)$/i.test(rawSection)) tisCategory='Receipts from transfer of immovable property';
      else if(rawSection==='194IB'||rawSection==='194I(B)'||rawSection==='194I(A)') tisCategory='Rent received';
      let detailGross=0, detailTds=0, activeDetail=0, inactiveDetail=0;
      const propertyVariant=/^194IA\((?:RV|R)\)$/i.test(rawSection);
      if(propertyVariant){
        for(const dlRaw of lines.slice(idx+1,end)){
          const dl=dlRaw.replace(/\s*\|\|\s*/g,' ').trim();
          if(!/\bActive\b/i.test(dl) || /\bInactive\b/i.test(dl)) continue;
          const noDate=dl.replace(/\b\d{2}[\/-]\d{2}[\/-]\d{4}\b/g,' ');
          const toks=moneyTokens(noDate);
          if(toks.length>=2){ detailGross=num(toks[toks.length-2]); detailTds=num(toks[toks.length-1]); activeDetail++; }
        }
      }
      const isTdsLike=sourceKind!=='SFT' && /^\d{3}[A-Z0-9]*(?:\([^)]*\))?$/i.test(rawSection);
      if(isTdsLike && !propertyVariant){
        for(const dlRaw of lines.slice(idx+1,end)){
          const dl=dlRaw.replace(/\s*\|\|\s*/g,' ');
          if(/\b\d{2}\/\d{2}\/\d{4}\b/.test(dl)){
            const toks=moneyTokens(dl); if(toks.length>=3){
              const isInactive=/\bInactive\b/i.test(dl), isActive=/\bActive\b/i.test(dl); const gross=num(toks[toks.length-3]), tax=num(toks[toks.length-2]);
              if(isActive && !isInactive){detailGross+=gross;detailTds+=tax;activeDetail++;}
              else if(isInactive) inactiveDetail++;
            }
          }
        }
      }
      const note=inactiveDetail?`Excluded ${inactiveDetail} inactive AIS transaction row(s) from TDS/TCS.`:'';
      if(isTdsLike && activeDetail===0 && inactiveDetail>0){
        // Preserve the AIS summary gross, but do not present a misleading TDS value or
        // attempt a 26AS reconciliation when every underlying TDS/TCS transaction is inactive.
        detailTds=0;
      }
      const unmapped=!sftRule && !HEAD_MAP[String(section||'').toUpperCase()]; const unmappedNote=unmapped?`Unmapped AIS information code ${section}; retained under Other TDS/TCS for review.`:''; rows.push({head,section,rawSection,source,gross:Math.round(summaryGross*100)/100,tds:Math.round(detailTds*100)/100,summary_gross:summaryGross,detail_gross:detailGross,note:[note,unmappedNote].filter(Boolean).join(' '),identifier,activeDetail,inactiveDetail,matchSections:sftRule?.matchSections||[],isSft:!!sftRule,tisCategory,unmapped}); if(unmapped) exceptions.push({type:'AIS_UNMAPPED_CODE',severity:'MEDIUM',details:`AIS code ${section} for ${source} retained under Other TDS/TCS.`});
    }catch(e){exceptions.push({type:'AIS_PARSE',severity:'HIGH',details:String(e.message||e),section:lines[idx].match(/\b(?:TDS|TCS|SFT)-[A-Z0-9()_-]+/i)?.[0]||''})}
  }
  function sumGstSummary(code){
    let total=0;
    const codeRe=new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');
    const infoHeader=/^\s*SR\.?\s*NO\.?\s+INFORMATION\s+CODE\b/i;
    for(let i=0;i<lines.length;i++){
      const raw=String(lines[i]||'');
      if(!codeRe.test(raw)) continue;
      // Prefer a same-line terminal count/amount pair, but ignore digits that are
      // part of the GST information code itself (e.g. GSTR1/GSTR3B).
      const same=raw.match(/(?:^|\s)(\d{1,4})\s+(-?[\d,]+(?:\.\d+)?)\s*$/);
      if(same){ total+=num(same[2]); continue; }
      // PDF extraction can wrap the source and move the summary count/amount to
      // the next line. Only search the short summary window before the next
      // information-code header, never the transaction-detail block.
      for(let j=i+1;j<Math.min(i+10,lines.length);j++){
        const nxt=String(lines[j]||'');
        if(infoHeader.test(nxt) && j>i+1) break;
        const pair=nxt.match(/^\s*(\d{1,4})\s+(-?[\d,]+(?:\.\d+)?)\s*$/);
        if(pair){ total+=num(pair[2]); break; }
      }
    }
    return Math.round(total*100)/100;
  }
  const gstSales=sumGstSummary('EXC-GSTR3B');
  const gstPurchases=sumGstSummary('EXC-GSTR1\(P\)');
  if(gstSales) rows.push({head:'GST Sales',section:'GST',source:meta.name,gross:gstSales,tds:'NA',identifier:'',matchSections:[],isSft:false});
  if(gstPurchases) rows.push({head:'GST Purchases',section:'GSTP',source:'Aggregate - AIS GSTR-1 seller reports',gross:gstPurchases,tds:'NA',identifier:'',matchSections:[],isSft:false});
  return [{meta,rows},exceptions];
}

function parseTIS(pages){
  const cleanPages=pages.map(p=>p.map(l=>l.replace(/\s*\|\|\s*/g,' ')));
  const meta=parseMeta(allText(pages)),lines=cleanPages.flat(),cats={},sourceRecords=[];
  const names=['Salary','Dividend','Interest from savings bank','Interest from deposit','Interest from others','Business receipts','Property transactions','Sale of securities and units of mutual fund','Purchase of securities and units of mutual funds','GST turnover','GST purchases','Purchase of vehicle'];
  const fuzzy=s=>String(s).split(/\s+/).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s*');
  const canonicalKey=x=>normSpace(x).replace(/\s+/g,'').toUpperCase();
  const knownKeys=new Set(names.map(canonicalKey));

  // Discover additional top-level categories from PAGE 1 only. Annexure/detail rows
  // must never become new categories.
  for(const l of (cleanPages[0]||[])){
    const m=l.match(/^\s*\d+\s+(.+?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s*$/);
    if(m){
      const n=normSpace(m[1]),k=canonicalKey(n);
      if(n && !/^(?:SR\.?\s*NO\.?|PART|INFORMATION|DESCRIPTION|AMOUNT)$/i.test(n) && !knownKeys.has(k)){
        names.push(n);knownKeys.add(k);
      }
    }
  }

  // Build exact top-level category boundaries from rows that contain the category's
  // processed/accepted totals. This prevents a long annexure from leaking one
  // category's detail rows into the previous category.
  const annex=lines.findIndex(l=>/Annexure\s*to\s*Taxpayer\s*Information\s*Summary/i.test(l));
  const startAt=annex>=0?annex:0;
  const categoryStarts=[];
  for(const name of names){
    const re=new RegExp(String.raw`^\s*\d+\s+${fuzzy(name)}\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s*$`,'i');
    let found=-1;
    for(let i=startAt;i<lines.length;i++){ if(re.test(lines[i])){found=i;break;} }
    if(found>=0) categoryStarts.push({name,index:found});
  }
  categoryStarts.sort((a,b)=>a.index-b.index);
  const startMap=new Map(categoryStarts.map(x=>[x.name,x.index]));
  const topRes=new Map();
  for(const c of categoryStarts){
    const m=lines[c.index].match(/^\s*\d+\s+.+?\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s*$/i);
    if(m) topRes.set(c.name,{processed:num(m[1]),accepted:num(m[2]),reported:0,source_rows:0});
  }
  for(const n of names) cats[n]=topRes.get(n)||{processed:0,accepted:0,reported:0,source_rows:0};

  function seg(name){
    const ss=startMap.get(name); if(ss===undefined) return [];
    const next=categoryStarts.find(x=>x.index>ss); const e=next?next.index:lines.length;
    return lines.slice(ss,e);
  }
  function extractTriples(name,predicate){
    const raw=seg(name).join(' '),re=/(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)/g,recs=[]; let m;
    while((m=re.exec(raw))){
      const ctx=raw.slice(Math.max(0,m.index-1600),m.index),compact=ctx.replace(/\s+/g,'');
      if(!predicate(ctx,compact,m[0])) continue;
      const ids=[...ctx.matchAll(/([A-Z][A-Z0-9 &.'()\/-]{2,})\s*\(([A-Z0-9._-]{6,})\)/gi)],last=ids.length?ids[ids.length-1]:null;
      const source=last?normSpace(last[1]):'';
      recs.push({source,identifier:last?.[2]||'',reported:num(m[1]),processed:num(m[2]),accepted:num(m[3]),isSft:/\bSFT\b/i.test(ctx)||/SFT-/.test(compact),isTds:/\bTDS\s*\/\s*TCS\b/i.test(ctx)||/TDSTCS/i.test(compact),ctx});
    }
    return recs;
  }
  function dedupeEquivalent(recs){
    const sft=recs.filter(r=>r.isSft&&r.source),kept=[];
    for(const r of recs){
      if(r.isTds&&r.source){
        const dup=sft.some(x=>Math.abs(x.reported-r.reported)<=2.00 && (normalizeParty(x.source)===normalizeParty(r.source) || Math.abs(x.reported-r.reported)<=2.00));
        if(dup) continue;
      }
      kept.push(r);
    }
    return kept;
  }
  function addPartyHints(name){
    const raw=seg(name).join(' '),re=/([A-Z][A-Z0-9 &.'()\/-]{2,})\s*\(([A-Z0-9._-]{6,})\)/gi; let m;
    while((m=re.exec(raw))){
      const source=normSpace(m[1]);
      if(!source||/^SECTION|^TDS|^SFT|^SR\.NO|^PAN|^NAME|^FINANCIAL|^INFORMATION/i.test(source)) continue;
      sourceRecords.push({category:name,source,identifier:m[2],reported:null,processed:null,accepted:null,isSft:/\bSFT\b/i.test(raw.slice(Math.max(0,m.index-100),m.index)),isTds:/TDS\s*\/\s*TCS/i.test(raw.slice(Math.max(0,m.index-100),m.index)),hintOnly:true});
    }
  }
  function assign(name,recs){
    const kept=dedupeEquivalent(recs);
    cats[name].reported=Math.round(kept.reduce((s,r)=>s+r.reported,0)*100)/100;
    cats[name].source_rows=kept.length;
    kept.forEach(r=>sourceRecords.push({category:name,...r}));
  }

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
  const partyCategory={};
  for(const r of sourceRecords){const key=normalizeParty(r.source);if(!key)continue;(partyCategory[key] ||= []).push({category:r.category,amount:r.reported,isSft:r.isSft,isTds:r.isTds});}
  for(const c of Object.values(cats)){
    if(c.processed!==0 && c.processed===c.accepted && (c.reported===0 || Math.abs(c.reported-c.processed)>0.01)){
      c.reported=c.processed;c.source_rows=0;c.reportedFallback=true;
    }
  }
  const tisExceptions=[];
  for(const n of names){
    if(!TIS_GROUPS[n] && !TIS_MAP[n] && Math.abs(cats[n]?.reported||0)>0.01) tisExceptions.push({type:'TIS_UNMAPPED_CATEGORY',severity:'MEDIUM',details:`TIS category ${n} detected at ₹${(cats[n].reported||0).toFixed(2)} but no template mapping exists; retained for review.`});
  }
  return [{meta,categories:cats,sourceRecords,partyCategory},tisExceptions];
}

function parse26AS(pages){
  const cleanPages=pages.map(p=>p.map(l=>l.replace(/\s*\|\|\s*/g,' ')));
  const text=allText(cleanPages),meta=parseMeta(allText(pages)),lines=cleanPages.flat(),map={},mapTan={},partyTanSummary={},partySummary={},partyTanSectionSummary={},propertyRows={},exceptions=[];
  const headers=[]; const txs=[];
  let inPartIV=false;
  // 26AS PDFs commonly render a summary row immediately BEFORE the transaction block
  // that visually belongs to the NEXT summary row. Therefore we capture both summary rows
  // and transaction rows first, then resolve blocks using exact total matching with a
  // strong preference for the transactions between adjacent summary rows.
  const headerRe=/^\s*(\d+)\s+(.+?)\s+([A-Z]{4}[A-Z0-9]{6})\s+(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s*$/i;
  const txRe=/^\s*\d+\s+(\d{3}[A-Z0-9]*(?:\([^)]*\))?)\s+\d{2}-[A-Za-z]{3}-\d{4}\s+[A-Z]\s+\S+\s+\S+\s+(.+)$/i;
  for(let i=0;i<lines.length;i++){
    const s=lines[i].trim();
    if(/^PART-IV\b/i.test(s)) inPartIV=true;
    if(/^PART-V\b/i.test(s)) inPartIV=false;
    if(inPartIV){
      const pm=s.match(/^\s*\d+\s+([A-Z0-9]+)\s+(.+?)\s+([A-Z]{5}\d{4}[A-Z])\s+\d{2}-[A-Za-z]{3}-\d{4}\s+(-?[\d,]+(?:\.\d+)?)\s+(-?[\d,]+(?:\.\d+)?)\s*$/i);
      if(pm){
        propertyRows[pm[3].toUpperCase()]={party:pm[2].trim(),tan:pm[3].toUpperCase(),gross:num(pm[4]),tds:num(pm[5]),deposit:num(pm[5]),section:'194IA'};
      }
    }
    const hm=s.match(headerRe);
    if(hm && !/\d{2}-[A-Za-z]{3}-\d{4}/.test(s)) headers.push({idx:i,seq:Number(hm[1]),party:hm[2].trim(),tan:hm[3].toUpperCase(),gross:num(hm[4]),tds:num(hm[5]),deposit:num(hm[6])});
    const tm=s.match(txRe);
    if(tm){
      const toks=moneyTokens(tm[2]);
      if(toks.length>=3){
        let section=canonicalSection(tm[1]);
        if(!HEAD_MAP[section]){const base=section.replace(/[FGO]$/,''); if(HEAD_MAP[base]) section=base;}
        txs.push({idx:i,section,gross:num(toks[toks.length-3]),tax:num(toks[toks.length-2]),dep:num(toks[toks.length-1])});
      }
    }
  }
  headers.sort((a,b)=>a.idx-b.idx);
  for(const h of headers){
    const pk=normalizeParty(h.party), tk=pk+'|'+h.tan;
    (partyTanSummary[tk] ||= []).push({party:h.party,tan:h.tan,gross:h.gross,tds:h.tds,deposit:h.deposit});
    (partySummary[pk] ||= []).push({party:h.party,tan:h.tan,gross:h.gross,tds:h.tds,deposit:h.deposit});
    // The 26AS summary header itself does not carry the section code. Capture the
    // section from the transaction block immediately following this header so the
    // authoritative summary total can still be used when transaction-detail rows
    // net differently because of reversal/cancellation entries.
    const next=headers[headers.indexOf(h)+1];
    const nearby=txs.filter(t=>t.idx>h.idx&&t.idx<(next?next.idx:lines.length));
    const secSet=[...new Set(nearby.map(t=>t.section))];
    if(secSet.length===1){
      (partyTanSectionSummary[tk+'|'+secSet[0]] ||= []).push({party:h.party,tan:h.tan,section:secSet[0],gross:h.gross,tds:h.tds,deposit:h.deposit});
    }
  }
  function sums(rows){return rows.reduce((o,r)=>({g:o.g+r.gross,t:o.t+r.tax,d:o.d+r.dep}),{g:0,t:0,d:0});}
  function exact(rows,h){
    const s=sums(rows); return rows.length>0 && Math.abs(s.g-h.gross)<=0.05 && Math.abs(s.t-h.tds)<=0.05 && Math.abs(s.d-h.deposit)<=0.05;
  }
  function addRowsForParty(h,rows){
    for(const tx of rows){
      const key=normalizeParty(h.party)+'|'+tx.section;
      if(!map[key])map[key]={party:h.party,section:tx.section,tan:null,gross:0,tds:0,deposit:0,reversal:false};
      map[key].gross+=tx.gross; map[key].tds+=tx.tax; map[key].deposit+=tx.dep;
      if(tx.gross<0||tx.tax<0)map[key].reversal=true;
      const tk=normalizeParty(h.party)+'|'+tx.section+'|'+h.tan;
      if(!mapTan[tk])mapTan[tk]={party:h.party,section:tx.section,tan:h.tan,gross:0,tds:0,deposit:0,reversal:false};
      mapTan[tk].gross+=tx.gross; mapTan[tk].tds+=tx.tax; mapTan[tk].deposit+=tx.dep;
      if(tx.gross<0||tx.tax<0)mapTan[tk].reversal=true;
    }
  }
  const assigned=new Set();
  // Primary rule: the transaction rows between the PREVIOUS summary header and the
  // CURRENT summary header belong to the CURRENT summary row. This matches the actual
  // 26AS PDF layout seen in the regression files and fixes the systematic one-row offset.
  for(let hi=0;hi<headers.length;hi++){
    const h=headers[hi], prev=headers[hi-1];
    const between=txs.filter(t=>t.idx>(prev?prev.idx:-1)&&t.idx<h.idx&&!assigned.has(t.idx));
    if(exact(between,h)){
      addRowsForParty(h,between); between.forEach(t=>assigned.add(t.idx));
      continue;
    }
    // Secondary rule: some layouts place detail AFTER the summary. Try the next header boundary.
    const next=headers[hi+1];
    const after=txs.filter(t=>t.idx>h.idx&&t.idx<(next?next.idx:lines.length)&&!assigned.has(t.idx));
    if(exact(after,h)){
      addRowsForParty(h,after); after.forEach(t=>assigned.add(t.idx));
      continue;
    }
    // Tertiary rule: exact contiguous window near the summary, useful for page-break variants.
    const nearby=txs.filter(t=>Math.abs(t.idx-h.idx)<=260&&!assigned.has(t.idx));
    let chosen=null;
    for(let a=0;a<nearby.length&&!chosen;a++){
      let g=0,t=0,d=0;
      for(let b=a;b<nearby.length && b<a+120;b++){
        const row=nearby[b]; g+=row.gross;t+=row.tax;d+=row.dep;
        if(Math.abs(g-h.gross)<=0.05&&Math.abs(t-h.tds)<=0.05&&Math.abs(d-h.deposit)<=0.05){chosen=nearby.slice(a,b+1);break;}
        if(Math.abs(g)>Math.abs(h.gross)*1.25+100000||Math.abs(t)>Math.abs(h.tds)*1.25+100000)break;
      }
    }
    if(chosen){
      addRowsForParty(h,chosen); chosen.forEach(t=>assigned.add(t.idx));
      exceptions.push({type:'26AS_NONSTANDARD_BLOCK_MATCH',severity:'INFO',details:`${h.party} ${h.tan}: transaction block matched by exact totals using a non-standard PDF layout.`});
    }else{
      exceptions.push({type:'26AS_HEADER_NO_DETAIL',severity:'INFO',details:`${h.party} ${h.tan}: transaction detail block did not exactly tie to the 26AS summary; summary totals retained as authoritative.`});
    }
  }
  const unassigned=txs.filter(t=>!assigned.has(t.idx));
  if(unassigned.length)exceptions.push({type:'26AS_ORPHAN_TRANSACTIONS',severity:'INFO',details:`${unassigned.length} 26AS transaction detail row(s) were not required for summary reconciliation and were left unassigned.`});
  return [{meta,map,mapTan,partyTanSummary,partySummary,partyTanSectionSummary,propertyRows},exceptions];
}
function reconcile(ais,tis,as26,exceptions){
  const rows=[];
  const deriveTisCategory=(r)=>{
    if(r.tisCategory && ['Cash withdrawals','Outward foreign remittance/purchase of foreign currency','Foreign travel','Miscellaneous payment'].includes(r.tisCategory)) return r.tisCategory;
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
      const sftTotal=sfts.reduce((sum,r)=>sum+r.gross,0);
      // When TIS is exactly explained by SFT rows, exclude supplemental TDS/TCS rows
      // in the same TIS category from the summary/category total. This is required for
      // cases such as SFT-011 forex purchase plus a separate 206C(1G)(a) LRS row.
      if(sfts.length && Math.abs(sftTotal-tisTotal)<=0.01){
        for(const r of candidates){
          r.summaryEligible=false;
          r.note=(r.note?r.note+' ':'')+'Supplemental TDS/TCS representation; TIS category is fully supported by SFT data, so this row is retained in Reco but excluded from category total/Summary.';
        }
        aisTotal=sftTotal;
      } else {
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
    }
    // Recompute after duplicate filtering.
    aisTotal=ais.rows.filter(r=>r._tisCategory===category&&r.summaryEligible!==false&&typeof r.gross==='number').reduce((sum,r)=>sum+r.gross,0);
    const ok=Math.abs(tisTotal-aisTotal)<=0.01;
    // GST Purchases can legitimately be more complete in TIS than the AIS extract
    // because the AIS may expose only a subset of seller-reported GSTR-1 sources.
    // Do not manufacture a HIGH parser error from that coverage difference. Retain
    // the TIS amount, mark the category as source-complete but AIS-partial, and keep
    // the row in Review so the reviewer sees the variance.
    if(category==='GST purchases' && !ok && aisTotal>0 && tisTotal>aisTotal+0.01){
      categoryAllowed[category]=true;
      categoryChecks.push({category,tisTotal,aisTotal,ok:false,partialSource:true});
      exceptions.push({type:'TIS_AIS_PARTIAL_CATEGORY',severity:'INFO',details:`GST purchases: TIS ${tisTotal.toFixed(2)} exceeds AIS ${aisTotal.toFixed(2)}; AIS appears partial, so TIS is retained as the category authority and the variance remains visible for review.`});
    } else {
      categoryAllowed[category]=ok;categoryChecks.push({category,tisTotal,aisTotal,ok});
      if(!ok && (Math.abs(tisTotal)>0.01||Math.abs(aisTotal)>0.01))exceptions.push({type:'TIS_TOTAL_MISMATCH',severity:'HIGH',details:`${category}: TIS Reported by Source ${tisTotal.toFixed(2)} vs AIS ${aisTotal.toFixed(2)}`});
    }
    if(tis.categories[category]?.reportedFallback)exceptions.push({type:'TIS_REPORTED_FALLBACK',severity:'INFO',details:`${category}: category-level Reported by Source value used because Processed by System equals Accepted by Taxpayer/Confirmed by Source.`});
  }

  for(const r of ais.rows){
    const head=r.head,sec=r.section;let party=r.source,id=r.identifier||'';let c26='NA',d26='NA',a26=null;
    const canMatch26=!['GST Sales','GST Purchases'].includes(head)&&(!r.isSft || (r.matchSections||[]).length>0 && typeof r.tds==='number' && r.tds>0);
    if(canMatch26){
      const candidates=[...(r.matchSections||[]),sec].filter(Boolean);
      // Part IV of 26AS reports seller/property transactions without the normal
      // Part-I deductor summary block. Match these directly by seller PAN.
      if(sec==='194IA' && id){
        const prop=as26.propertyRows?.[id.toUpperCase()];
        if(prop) a26=prop;
      }
      if(id){for(const s of candidates){
        const auth=as26.partyTanSectionSummary?.[normalizeParty(party)+'|'+id+'|'+s];
        if(auth?.length===1){a26=auth[0];break;}
      }}
      if(id&&!a26){for(const s of candidates){a26=as26.mapTan[normalizeParty(party)+'|'+s+'|'+id];if(a26)break;}}
      // Fuzzy party-name fallback for PDF layouts that omit a trailing or middle
      // word (e.g. `... BANGALORE SOUTH` vs `... BANGALORE SOUTH COMMISSIONERATE`).
      if(!a26 && id){
        for(const key of Object.keys(as26.mapTan||{})){
          const parts=key.split('|');
          if(parts.length!==3 || parts[1]===undefined || parts[2]!==id) continue;
          if(!candidates.includes(parts[1])) continue;
          const val=as26.mapTan[key];
          if(val?.party && namesCompatible(party,val.party)){a26=val;break;}
        }
      }
      if(!a26){for(const s of candidates){a26=as26.map[normalizeParty(party)+'|'+s];if(a26)break;}}
      if(!a26){
        const keys=Object.keys(as26.map||{});
        outer: for(const s of candidates){
          for(const key of keys){
            const parts=key.split('|');
            if(parts.length===2 && parts[1]===s && namesCompatible(party, parts[0])){
              a26=as26.map[key];break outer;
            }
          }
        }
      }
      // 26AS summary rows are authoritative for a deductor/collector total. If a
      // transaction-detail block is net of reversals/cancellations, prefer the summary
      // row whose gross is closest to the AIS row rather than retaining a partial detail sum.
      if(!a26){
        const pk=normalizeParty(party);
        const summaryList=(id&&as26.partyTanSummary?.[pk+'|'+id]) || [];
        if(summaryList.length){
          a26=summaryList.slice().sort((x,y)=>Math.abs(x.gross-r.gross)-Math.abs(y.gross-r.gross))[0];
        } else {
          const partySummaries=as26.partySummary?.[pk]||[];
          if(partySummaries.length){
            a26=partySummaries.slice().sort((x,y)=>Math.abs(x.gross-r.gross)-Math.abs(y.gross-r.gross))[0];
          }
        }
      }
      // If a mapped detail block exists but materially differs from the authoritative
      // summary, use the summary closest to the AIS gross. This preserves the original
      // 26AS headline amount while the reversal note remains visible from the detail map.
      if(a26 && id){
        const pk=normalizeParty(party);
        const summaryList=as26.partyTanSummary?.[pk+'|'+id]||[];
        if(summaryList.length>1){
          const best=summaryList.slice().sort((x,y)=>Math.abs(x.gross-r.gross)-Math.abs(y.gross-r.gross))[0];
          if(Math.abs(best.gross-r.gross) < Math.abs(a26.gross-r.gross)) a26=best;
        }
      }
      if(a26){c26=Math.round(a26.gross*100)/100;d26=Math.round(a26.tds*100)/100;}else{c26=null;d26=null;}
    }
    const category=r._tisCategory;
    if(sec==='194IA' && id && as26.propertyRows?.[id.toUpperCase()]) party=String(as26.propertyRows[id.toUpperCase()].party||'').toUpperCase();
    else if(a26?.party && namesCompatible(party,a26.party)) party=a26.party;
    let gTis='NA';
    if(category&&categoryAllowed[category]===true)gTis=Math.round(r.gross*100)/100;else if(category&&categoryAllowed[category]===false)gTis=null;
    const row={head,party,c26,d26,eAis:Math.round(r.gross*100)/100,fAis:r.tds==='NA'?'NA':Math.round(r.tds*100)/100,gTis,hTis:'NA',action:'No Action',remarks:r.note||'',summaryEligible:r.summaryEligible!==false};
    if(a26?.reversal)row.remarks+=(row.remarks?' ':'')+'26AS reversal/cancellation entries netted at section level.';
    if(c26===null&&canMatch26){row.action='Review';row.remarks=row.remarks||'AIS party/section not found in 26AS.';}
    if(r.unmapped){row.action='Review';row.remarks+=(row.remarks?' ':'')+'Information code is outside the explicit section map; verify classification before relying on the Summary.';}
    if(category===null && head!=='GST Sales' && head!=='GST Purchases'){row.action='Review';row.remarks+=(row.remarks?' ':'')+'TIS category could not be mapped to this row; TIS value withheld.';}
    if(category&&categoryAllowed[category]===false){row.action='Review';row.remarks+=(row.remarks?' ':'')+'TIS category total does not reconcile to AIS; TIS allocation withheld.';}
    if(category==='GST purchases' && categoryAllowed[category]===true && typeof r.gross==='number'){
      const tisCat=tis.categories[category]?.reported;
      if(typeof tisCat==='number' && Math.abs(tisCat-r.gross)>0.01){
        row.gTis=Math.round(tisCat*100)/100;
        row.action='Review';
        row.remarks+=(row.remarks?' ':'')+`TIS GST purchases ₹${tisCat.toFixed(2)} exceeds AIS-extracted ₹${r.gross.toFixed(2)}; AIS seller coverage appears partial.`;
      }
    }
    if(!['GST Sales','GST Purchases'].includes(head)){
      const gd=typeof c26==='number'?Math.abs(c26-row.eAis):0,td=typeof d26==='number'&&typeof row.fAis==='number'?Math.abs(d26-row.fAis):0;
      if(gd>2||td>2){row.action='Review';if(td>2)row.remarks+=(row.remarks?' ':'')+`26AS TDS/TCS differs from AIS by ₹${(d26-row.fAis).toFixed(2)}.`;else if(typeof c26==='number')row.remarks+=(row.remarks?' ':'')+`26AS gross differs from AIS by ₹${(c26-row.eAis).toFixed(2)}.`;}
      else if(gd>0.01||td>0.01)row.remarks+=(row.remarks?' ':'')+'Minor source difference; within ₹2.';
    }
    // The TIS can represent the same 194IA sale twice: once as Sale of land/building
    // and once as Receipts from transfer of immovable property. Keep both in Reco for
    // traceability, but include only one physical property transaction in Summary.
    if(row.summaryEligible && head==='94L - Property Transactions' && id){
      const prior=rows.find(x=>x.summaryEligible && x.head===head && String(x.party||'')===String(row.party||'') && Math.abs(Number(x.eAis)-Number(row.eAis))<=0.01);
      if(prior){ row.summaryEligible=false; row.remarks=(row.remarks?row.remarks+' ':'')+'Duplicate 194IA representation of the same property transaction; retained in Reco but excluded from Summary.'; }
    }
    rows.push(row);
  }
  for(const x of categoryChecks)if(x.ok)exceptions.push({type:'TIS_VALIDATION',severity:'INFO',details:`${x.category}: TIS Reported by Source ${x.tisTotal.toFixed(2)} reconciles to effective AIS ${x.aisTotal.toFixed(2)}.`});
  return {meta:ais.meta,rows,exceptions};
}

function xmlEscape(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
function cellInner(v){if(v===null||v===undefined||v==='')return '';if(typeof v==='number'&&Number.isFinite(v))return `<v>${v}</v>`;return `<is><t xml:space="preserve">${xmlEscape(v)}</t></is>`;}
function patchCell(xml,ref,value){
  const re=new RegExp(`\<c\\s+([^>]*\\br="${ref}"[^>]*)(?:/>|>[\\s\\S]*?</c>)`);
  const m=xml.match(re);if(!m)return xml;
  let tag=m[0];let attrs=m[1].replace(/\s+t="[^"]*"/g,'');attrs=attrs.replace(/\s+$/,'');
  const typeAttr=(typeof value==='string' && value!=='')?' t="inlineStr"':''; const newTag=`<c ${attrs}${typeAttr}>${cellInner(value)}</c>`;
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
  if(/<calcPr\b[^>]*\/>/.test(wbxml)) wbxml=wbxml.replace(/<calcPr\b[^>]*\/>/,'<calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>'); else wbxml=wbxml.replace('</workbook>','<calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>');
  zip.file('xl/worksheets/sheet1.xml',s1);zip.file('xl/worksheets/sheet2.xml',s2);zip.file('xl/workbook.xml',wbxml);
  return zip.generateAsync({type:'blob',compression:'DEFLATE'});
}

window.AISReco={extractPdfLines,parseAIS,parseTIS,parse26AS,reconcile,generateWorkbook,parseMeta,deriveAY,normalizeParty,namesCompatible,TEMPLATE_ROWS};
