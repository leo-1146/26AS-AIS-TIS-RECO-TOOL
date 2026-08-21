/* RECON portable parser bootstrap v1.8.4
   Loads the same-origin parser core, then repairs deterministic metadata handling for 26AS. */
(function(){
  const CORE='https://leo-1146.github.io/26AS-AIS-TIS-RECO-TOOL/app_core.js?v=1.8.4';
  if(!window.AISReco){
    document.write('<script src="'+CORE+'"><\\/script>');
  }
  const wait=()=>{
    if(!window.AISReco) return setTimeout(wait,0);
    const original=window.AISReco.parseMeta;
    if(typeof original!=='function') return;
    if(original.__recon_v184) return;
    const patched=function(text){
      const meta=original(String(text||''))||{};
      const lines=String(text||'').split(/\r?\n/).map(s=>String(s||'').replace(/\s+/g,' ').trim()).filter(Boolean);
      if(!meta.name){
        for(let i=0;i<lines.length;i++){
          if(/^Name\s+of\s+Assessee$/i.test(lines[i])){
            for(let j=i+1;j<Math.min(i+5,lines.length);j++){
              const cand=lines[j];
              if(!cand) continue;
              if(/^(Address|Date\s+of\s+Birth|Date\s+of\s+Incorporation|Mobile|E-?mail|Financial\s+Year|Assessment\s+Year|Permanent\s+Account\s+Number|PAN)\b/i.test(cand)) continue;
              if(/^\d{5,}$/.test(cand)) continue;
              meta.name=cand;
              break;
            }
          }
          if(meta.name) break;
        }
      }
      if(!meta.ay&&meta.fy&&typeof window.AISReco.deriveAY==='function') meta.ay=window.AISReco.deriveAY(meta.fy);
      return meta;
    };
    patched.__recon_v184=true;
    window.AISReco.parseMeta=patched;
  };
  wait();
})();
