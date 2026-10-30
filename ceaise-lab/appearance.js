(() => {
 'use strict';
 const key='nexus-appearance-v1';
 const palettes={ntu:{ink:'#1b1c62',accent:'#d71440'},ocean:{ink:'#143c41',accent:'#08776c'},slate:{ink:'#293442',accent:'#8b3047'}};
 const defaults={palette:'ntu',accent:'#d71440',size:100,density:'comfortable'};
 const root=document.documentElement,panel=document.querySelector('#appearance-dialog'),toggle=document.querySelector('#appearance-toggle');
 if(!panel||!toggle)return;
 const picker=document.querySelector('#accent-colour'),range=document.querySelector('#text-size'),density=document.querySelector('#page-density');
 function valid(input){const palette=Object.hasOwn(palettes,input?.palette)?input.palette:'ntu';return {palette,accent:/^#[0-9a-f]{6}$/i.test(input?.accent)?input.accent.toLowerCase():palettes[palette].accent,size:Math.max(90,Math.min(120,Math.round((Number(input?.size)||100)/5)*5)),density:input?.density==='compact'?'compact':'comfortable'};}
 function channels(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
 function luminance(rgb){return rgb.map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0);}
 function readable(hex){let c=channels(hex);while(1.05/(luminance(c)+.05)<4.5)c=c.map(x=>Math.max(0,Math.floor(x*.96)));return '#'+c.map(x=>x.toString(16).padStart(2,'0')).join('');}
 function pale(hex){return '#'+channels(hex).map(c=>Math.round(c*.07+255*.93).toString(16).padStart(2,'0')).join('');}
 let settings={...defaults};try{settings=valid(JSON.parse(localStorage.getItem(key))||defaults);}catch{}
 function apply(save=false){settings=valid(settings);settings.accent=readable(settings.accent);root.style.setProperty('--ink',palettes[settings.palette].ink);root.style.setProperty('--accent',settings.accent);root.style.setProperty('--accent-soft',pale(settings.accent));root.style.setProperty('--text-scale',String(settings.size/100));root.dataset.density=settings.density;root.dataset.palette=settings.palette;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',palettes[settings.palette].ink);document.querySelectorAll('[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===settings.palette)));picker.value=settings.accent;range.value=String(settings.size);density.value=settings.density;document.querySelector('#accent-value').textContent=settings.accent.toUpperCase();document.querySelector('#text-size-value').textContent=settings.size+'%';if(save){try{localStorage.setItem(key,JSON.stringify(settings));}catch{}document.querySelector('#appearance-status').textContent='Appearance updated. Text size '+settings.size+' percent.';}}
 apply();
 toggle.addEventListener('click',()=>{panel.showModal();toggle.setAttribute('aria-expanded','true');document.body.classList.add('modal-open');});
 panel.querySelector('.appearance-close').addEventListener('click',()=>panel.close());
 panel.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');toggle.focus();});
 panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close();}});
 document.querySelectorAll('[data-palette]').forEach(b=>b.addEventListener('click',()=>{settings.palette=b.dataset.palette;settings.accent=palettes[settings.palette].accent;apply(true);}));
 picker.addEventListener('input',()=>{settings.accent=picker.value;apply(true);});range.addEventListener('input',()=>{settings.size=Number(range.value);apply(true);});density.addEventListener('change',()=>{settings.density=density.value;apply(true);});panel.querySelector('.appearance-reset').addEventListener('click',()=>{settings={...defaults};apply(true);});
})();
