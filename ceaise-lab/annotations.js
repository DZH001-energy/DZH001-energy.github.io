(() => {
  'use strict';
  const data=window.CEAISE_DATA;
  if(!data)return;
  const colours={H1:'#087f5b',F1:'#1b1c62',B1:'#a54b00',O1:'#136da4'};
  // Component centres and external label positions, normalised to the unmodified reference image.
  const positions={
    cutaway:{H1:[.468,.603,.42,.91],F1:[.643,.530,.61,.88],B1:[.727,.478,.76,.77],O1:[.840,.412,.92,.65]},
    exploded:{H1:[.421,.556,.42,.95],F1:[.577,.505,.60,.90],B1:[.663,.463,.73,.84],O1:[.800,.397,.90,.74]},
    top:{H1:[.310,.644,.30,.94],F1:[.530,.644,.51,.95],B1:[.630,.650,.65,.85],O1:[.780,.632,.79,.94]}
  };
  const ns='http://www.w3.org/2000/svg';
  function node(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text)n.textContent=text;return n;}
  function attach(image,host,id){
    const svg=node('svg',{'class':'module-annotations','aria-hidden':'true','focusable':'false'});host.append(svg);
    let queued=false;
    function draw(){
      queued=false;
      const view=data.images.find(item=>image.src.endsWith(item.src));
      const points=positions[view?.id];
      svg.replaceChildren();svg.hidden=!points;
      if(!points||!image.complete||!image.naturalWidth)return;
      const r=image.getBoundingClientRect(),h=host.getBoundingClientRect();
      const scale=Math.min(r.width/image.naturalWidth,r.height/image.naturalHeight);
      const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
      if(!width||!height)return;
      Object.assign(svg.style,{left:(r.left-h.left+(r.width-width)/2)+'px',top:(r.top-h.top+(r.height-height)/2)+'px',width:width+'px',height:height+'px'});
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      const font=width<400?10:12,boxW=font*2.55,boxH=font*1.85;
      const defs=node('defs',{});svg.append(defs);
      for(const [code,[tx,ty,lx,ly]] of Object.entries(points)){
        const colour=colours[code],markerId=id+'-arrow-'+code;
        const marker=node('marker',{id:markerId,viewBox:'0 0 8 8',refX:7,refY:4,markerWidth:6,markerHeight:6,orient:'auto',markerUnits:'userSpaceOnUse'});
        marker.append(node('path',{d:'M0 0 L8 4 L0 8 Z',fill:colour}));defs.append(marker);
        const x=tx*width,y=ty*height,labelX=lx*width,labelY=ly*height;
        const path=`M ${labelX} ${labelY-boxH/2} L ${labelX} ${labelY-boxH/2-8} L ${x} ${y}`;
        svg.append(node('path',{d:path,fill:'none',stroke:'#fff','stroke-width':4,'stroke-linejoin':'round'}));
        svg.append(node('path',{d:path,fill:'none',stroke:colour,'stroke-width':1.5,'stroke-linejoin':'round','marker-end':`url(#${markerId})`}));
        svg.append(node('rect',{x:labelX-boxW/2,y:labelY-boxH/2,width:boxW,height:boxH,rx:3,fill:'#fff',stroke:colour,'stroke-width':1.4}));
        svg.append(node('text',{x:labelX,y:labelY+font*.35,'text-anchor':'middle','font-family':'Arial, sans-serif','font-size':font,'font-weight':700,fill:colour},code));
      }
    }
    function schedule(){if(!queued){queued=true;requestAnimationFrame(draw);}}
    image.addEventListener('load',schedule);
    new MutationObserver(schedule).observe(image,{attributes:true,attributeFilter:['src']});
    new ResizeObserver(schedule).observe(host);
    schedule();
  }
  attach(document.querySelector('#device-view-image'),document.querySelector('#device-image-open'),'main');
  attach(document.querySelector('#dialog-image'),document.querySelector('.dialog-image-stage'),'dialog');
})();
