/* RECON portable parser bootstrap v1.8.5
   Loads the same-origin parser core and exposes an explicit readiness promise so
   the UI never races metadata validation. */
(function(){
  const CORE='https://leo-1146.github.io/26AS-AIS-TIS-RECO-TOOL/app_core.js?v=1.8.5';
  window.__RECON_META_PATCH_READY__ = new Promise((resolve)=>{
    const patch=()=>{
      if(!window.AISReco || typeof window.AISReco.parseMeta!=='function') return setTimeout(patch,0);
      const original=window.AISReco.parseMeta;
      if(original.__recon_v185){ resolve(true); return; }
      const patched=function(text){
        const raw=String(text||'');
        const meta=original(raw)||{};
        const lines=raw.split(/\r?\n/).map(s=>String(s||'').replace(/\s+/g,' ').trim()).filter(Boolean);
        if(!meta.name){
          for(let i=0;i<lines.length;i++){
            const line=lines[i];
            let m=line.match(/^Name\s+of\s+Assessee\s*(?:\|\||:)\s*(.+)$/i);
            if(m&&m[1]){ meta.name=m[1].trim(); break; }
            m=line.match(/^NameofAssessee\s*(?:\|\||:)\s*(.+)$/i);
            if(m&&m[1]){ meta.name=m[1].trim(); break; }
            if(/^Name\s+of\s+Assessee$/i.test(line)){
              for(let j=i+1;j<Math.min(i+9,lines.length);j++){
                const cand=lines[j];
                if(!cand || cand===meta.pan) continue;
                if(/^(NA|X{2,}(?:\s+X{2,})?(?:\s+\d{4})?|XXXX(?:\s+XXXX)?(?:\s+\d{4})?)$/i.test(cand)) continue;
                if(/^(Address|Date\s+of\s+Birth|Date\s+of\s+Incorporation|Mobile|E-?mail|Financial\s+Year|Assessment\s+Year|Permanent\s+Account\s+Number|PAN|Aadhaar\s+Number)\b/i.test(cand)) continue;
                if(/\b[A-Z]{5}\d{4}[A-Z]\b/.test(cand)){
                  const pos=cand.search(/\b[A-Z]{5}\d{4}[A-Z]\b/);
                  let tail=cand.slice(pos).replace(/^\S+\s*/,'').trim();
                  tail=tail.replace(/^(?:NA|XXXX(?:\s+XXXX)?(?:\s+\d{4})?|X{2,}(?:\s+X{2,})?(?:\s+\d{4})?)\s+/i,'').trim();
                  if(tail){ meta.name=tail; break; }
                } else { meta.name=cand; break; }
              }
              if(meta.name) break;
            }
          }
        }
        if(!meta.ay&&meta.fy&&typeof window.AISReco.deriveAY==='function') meta.ay=window.AISReco.deriveAY(meta.fy);
        return meta;
      };
      patched.__recon_v185=true;
      window.AISReco.parseMeta=patched;
      resolve(true);
    };
    if(!window.AISReco){
      document.write('<script src="'+CORE+'"><\\/script>');
    }
    patch();
  });
  window.__RECON_ENGINE_READY__ = window.__RECON_META_PATCH_READY__;
})();
