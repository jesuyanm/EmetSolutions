(function(){
  var reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var g=window.gsap,ST=window.ScrollTrigger,T=window.THREE;

  /* ---------- hero: a self-moving 3D wave field you fly over ---------- */
  function hero(){
    var host=document.documentElement,cv=document.getElementById('field');
    if(!host||!cv||!T)return;
    var mobile=matchMedia('(max-width:760px)').matches;
    var renderer;try{renderer=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:false})}catch(e){return}
    var pr=Math.min(devicePixelRatio||1,1.5);renderer.setPixelRatio(pr);
    var scene=new T.Scene(),cam=new T.PerspectiveCamera(55,1,1,4000);
    var NX=mobile?100:190,NZ=mobile?90:160,SX=3400,SZ=4000,n=NX*NZ;
    var P=new Float32Array(n*3),R=new Float32Array(n);
    for(var i=0,z=0;z<NZ;z++)for(var x=0;x<NX;x++,i++){
      P[i*3]=(x/(NX-1)-.5)*SX;P[i*3+1]=0;P[i*3+2]=1400-(z/(NZ-1))*SZ;R[i]=Math.random();
    }
    var geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(P,3));geo.setAttribute('r',new T.BufferAttribute(R,1));
    var mat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
      uniforms:{t:{value:0},amp:{value:1},fly:{value:0},px:{value:1},dim:{value:1},rev:{value:1},pt:{value:-99},pk:{value:1}},
      vertexShader:[
        'attribute float r;uniform float t,amp,fly,px,dim,rev,pt,pk;varying float h;varying float f;varying float rr;varying float rv;varying float rg;',
        'void main(){vec3 p=position;float zf=p.z-fly;float rd=length(vec2(position.x,position.z+500.));float age=t-pt;float rp=exp(-pow((rd-age*1700.)/260.,2.))*exp(-age*.9)*pk;',
        'float w=sin(p.x*.0042+t*.55+zf*.0021)*70.+sin(p.x*.0091-t*.8+zf*.0058)*34.+sin(zf*.0049+t*.65)*60.+sin((p.x+zf)*.0155+t*1.1)*14.;',
        'p.y=w*amp+rp*170.;h=w/150.+rp;vec4 mv=modelViewMatrix*vec4(p,1.);',
        'f=clamp(1.-(-mv.z-200.)/2800.,0.,1.);rr=r;float dd=length(vec2(position.x,position.z+800.));float e=rev*3600.;rv=1.-smoothstep(e-700.,e,dd);rg=exp(-pow((dd-(e-330.))/200.,2.))*step(rev,.999)+rp;',
        'gl_PointSize=min((2.2+r*2.4)*px*(900./-mv.z)*(.8+h*.25),14.);gl_Position=projectionMatrix*mv;}'].join(''),
      fragmentShader:[
        'varying float h;varying float f;varying float rr;varying float rv;varying float rg;uniform float dim;',
        'void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;',
        'vec3 lime=vec3(.83,1.,.23),paper=vec3(.93,.91,.86);',
        'vec3 c=mix(lime*.55,lime,smoothstep(-.5,.9,h));c=mix(c,paper,step(.93,rr)*.9);',
        'float a=f*f*(.35+.65*smoothstep(-.6,1.,h))*smoothstep(.5,.15,d);',
        'c+=rg*vec3(.5,.5,.3);gl_FragColor=vec4(c,(a+rg*.5*f)*dim*rv);}'].join('')});
    var pts=new T.Points(geo,mat);pts.frustumCulled=false;scene.add(pts);
    function resize(){if(window.__wm)window.__wm.uniforms.hp.value=innerHeight*pr;
      var w=Math.max(innerWidth,10),h=Math.max(innerHeight,10);
      renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();mat.uniforms.px.value=Math.max(h/900,.6);
    }
    resize();addEventListener('resize',resize);
    var mx=0,my=0,cmx=0,cmy=0,sc=0;
    addEventListener('pointermove',function(e){mx=e.clientX/innerWidth*2-1;my=e.clientY/innerHeight*2-1},{passive:true});
    addEventListener('scroll',function(){sc=scrollY/innerHeight},{passive:true});
    var showEl=document.getElementById('show'),dimC=1,t0=performance.now();
    /* ---- intro: the name stands in the landscape and you fly through it ---- */
    var glow=document.querySelector('.intro-glow'),bar=document.querySelector('.intro-bar'),boost=1,H=document.documentElement,intro=H.classList.contains('introing')&&!reduced,skipAt=null,word=null,say=document.querySelector('.intro-say'),syl=say?[].slice.call(say.children):[],beats=[.8,1.5,2.2,2.9],bi=0,burst=false;
    var WZ=900,WY=330,CZ0=2340;
    function endIntro(){if(!intro)return;intro=false;H.classList.remove('introing');try{sessionStorage.setItem('intro2','1')}catch(e){}if(word){scene.remove(word.pts);word.pts.geometry.dispose()}mat.uniforms.rev.value=1;cam.fov=55;cam.updateProjectionMatrix()}
    if(intro){
      mat.uniforms.rev.value=0;
      var WC=1100,HC=300,oc=document.createElement('canvas');oc.width=WC;oc.height=HC;var cx=oc.getContext('2d');
      cx.font='400 250px "Instrument Serif","Times New Roman",serif';cx.textBaseline='alphabetic';cx.fillStyle='#fff';
      var wmain=cx.measureText('yanmiAde').width,wdot=cx.measureText('.').width,tw=wmain+wdot,x0=(WC-tw)/2;
      cx.fillText('yanmiAde.',x0,215);
      var d=cx.getImageData(0,0,WC,HC).data,ps=[],stp=mobile?6:4;
      for(var y=0;y<HC;y+=stp)for(var x=0;x<WC;x+=stp)if(d[(y*WC+x)*4+3]>140)ps.push([x-WC/2,-(y-HC/2+8),x>x0+wmain]);
      var M=ps.length,sc2=(mobile?1300:2300)/tw;
      var wp=new Float32Array(M*3),wt=new Float32Array(M*3),wv=new Float32Array(M*3),wc=new Float32Array(M*3),wz=new Float32Array(M);
      var li=new T.Color('#d4ff3a'),pa=new T.Color('#ece7dc');
      for(var i2=0;i2<M;i2++){var j=i2*3;wt[j]=ps[i2][0]*sc2;wt[j+1]=WY+ps[i2][1]*sc2;wt[j+2]=WZ+(Math.random()-.5)*60;
        var a1=Math.random()*6.283,rr2=600+Math.random()*1800;wp[j]=Math.cos(a1)*rr2;wp[j+1]=WY+Math.sin(a1)*rr2*.5;wp[j+2]=WZ-400-Math.random()*1600;
        var cc=ps[i2][2]||Math.random()<.2?li:pa;wc[j]=cc.r*1.5;wc[j+1]=cc.g*1.5;wc[j+2]=cc.b*1.5;wz[i2]=7+Math.random()*6}
      var wg=new T.BufferGeometry();wg.setAttribute('position',new T.BufferAttribute(wp,3));wg.setAttribute('color',new T.BufferAttribute(wc,3));wg.setAttribute('size',new T.BufferAttribute(wz,1));
      var wm=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{hp:{value:innerHeight*pr},a:{value:0}},
        vertexShader:'attribute float size;attribute vec3 color;varying vec3 vc;uniform float hp;void main(){vc=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=min(size*projectionMatrix[1][1]*hp*.5/-mv.z,46.);gl_Position=projectionMatrix*mv;}',
        fragmentShader:'varying vec3 vc;uniform float a;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vc,a*smoothstep(.5,.0,d));}'});
      window.__wm=wm;window.__ping=function(k){mat.uniforms.pt.value=mat.uniforms.t.value;mat.uniforms.pk.value=k};var wpts=new T.Points(wg,wm);wpts.frustumCulled=false;scene.add(wpts);word={pts:wpts,mat:wm};
      var skip=function(){if(skipAt===null)skipAt=performance.now()};
      document.addEventListener('click',skip);document.addEventListener('keydown',skip);
    }
    function stepWord(ti,dt){
      var conv=ti>3.4?Math.min((ti-3.4)/1.3,1):0,diss=Math.max(0,Math.min((ti-7.32)/.8,1)),kk=.014+.07*conv*conv,dm=Math.pow(.84,dt);
      word.mat.uniforms.a.value=Math.max(0,Math.min((ti-3.4)/.5,1))*(1-Math.pow(diss,1.6));
      for(var i3=0;i3<M;i3++){var j=i3*3,tx=wt[j],ty=wt[j+1],tz=wt[j+2];
        if(diss===0&&ti>4.4){tx+=Math.sin(ti*2.4+i3)*2.2;ty+=Math.cos(ti*2+i3*.7)*2.2}
        if(diss>0){var q=diss*diss;tx*=1+q*3.2;ty=WY+(ty-WY)*(1+q*3.2);tz+=q*900}
        wv[j]=(wv[j]+(tx-wp[j])*kk*dt)*dm;wv[j+1]=(wv[j+1]+(ty-wp[j+1])*kk*dt)*dm;wv[j+2]=(wv[j+2]+(tz-wp[j+2])*kk*dt)*dm;
        wp[j]+=wv[j]*dt;wp[j+1]+=wv[j+1]*dt;wp[j+2]+=wv[j+2]*dt}
      wg.attributes.position.needsUpdate=true;
    }
    var lastT=performance.now(),ema=1,fc=0,amp2=0;
    function frame(now){
      var dtf=Math.min(Math.max((now-lastT)/16.667,.3),3);lastT=now;ema+=(dtf-ema)*.08;
      if(++fc%45===0&&ema>1.5&&pr>1){pr=Math.max(1,pr-.25);renderer.setPixelRatio(pr);resize()}
      var t=(now-t0)/1000,ti=t,dolly=0,ie=1,roll=0;
      if(intro){
        if(skipAt!==null){var sk0=Math.min((now-skipAt)/450,1);ti=t+sk0*(Math.max(8.8-t,0));if(sk0>=1)ti=9}
        var rv0=Math.min(ti/1.7,1);mat.uniforms.rev.value=1-Math.pow(1-rv0,2.2);
        var u=Math.max(0,Math.min((ti-5.4)/3.2,1));ie=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
        dolly=(1-ie)*CZ0;roll=Math.sin(ti*1.7)*.012*(1-ie)+Math.sin(ti*9)*.0025*Math.sin(ie*Math.PI);
        var fv=55+Math.sin(ie*Math.PI)*38;if(Math.abs(cam.fov-fv)>.05){cam.fov=fv;cam.updateProjectionMatrix()}
        while(bi<4&&ti>=beats[bi]){mat.uniforms.pt.value=t;mat.uniforms.pk.value=1;if(syl[bi]){syl.forEach(function(x){x.classList.remove('cur')});syl[bi].classList.add('on','cur')}bi++}
        if(!burst&&ti>=7.45){burst=true;mat.uniforms.pt.value=t;mat.uniforms.pk.value=2.2}
        if(say)say.classList.toggle("out",ti>3.5);
        stepWord(ti,dtf);
        if(bar)bar.style.transform='scaleX('+Math.min(ti/8.8,1).toFixed(4)+')';
        boost=1+1.8*Math.sin(Math.min(ti/1.7,1)*Math.PI/2)*(1-Math.max(0,Math.min((ti-7.8)/1,1)));
        if(glow){var g1=Math.exp(-Math.pow((ti-7.55)/.4,2))*.95+Math.exp(-Math.pow((ti-.5)/.3,2))*.35+Math.max(0,Math.min((ie-.15)/.5,1))*.25*(1-Math.max(0,Math.min((ti-7.8)/.9,1)));glow.style.opacity=Math.min(g1,1).toFixed(3)}
        if(ti>=7.8&&H.classList.contains('introing')){H.classList.remove('introing');try{sessionStorage.setItem('intro2','1')}catch(e){}}
        if(ti>=8.8){endIntro();if(glow)glow.style.opacity=0;boost=1}
      }
      var ea=1-Math.pow(.97,dtf);cmx+=(mx-cmx)*ea;cmy+=(my-cmy)*ea;
      mat.uniforms.t.value=t;
      mat.uniforms.fly.value=-t*70-sc*700;           /* constant forward flight + scroll boost */
      mat.uniforms.amp.value=1+Math.min(sc,1.5)*.8;
      var dt=Math.max(.55,1-sc*.6);
      if(showEl){var sr=showEl.getBoundingClientRect();if(sr.top<innerHeight*.8&&sr.bottom>innerHeight*.2)dt=.28}
      dimC+=(dt-dimC)*.06;mat.uniforms.dim.value=dimC*boost;
      /* camera drifts on its own, cursor only nudges it */
      var vel=Math.min(Math.abs(window.__sv||0),40);amp2+=(vel*.025-amp2)*.08;mat.uniforms.amp.value+=amp2;var sk=Math.min(sc,1.5);cam.position.set(Math.sin(t*.13)*160+cmx*90+Math.sin(sc*1.3)*180,175+Math.sin(t*.21)*22+sk*70-cmy*30-(1-ie)*60,260+dolly);
      var lk=ie<1?Math.pow(ie,1.5):1;
      cam.lookAt((Math.sin(t*.1)*60+Math.sin(sc*1.3)*120)*lk,WY*(1-lk)+(-30-sk*40)*lk,WZ*(1-lk)-760*lk);
      if(roll)cam.rotation.z+=roll;
      cam.rotation.z+=Math.sin(t*.17)*.012;
      renderer.render(scene,cam);
    }
    function loop(now){requestAnimationFrame(loop);if(!document.hidden)frame(now)}
    if(reduced){frame(2*1000+t0);return}
    requestAnimationFrame(loop);
  }
  var fontsOk=document.fonts&&document.fonts.load?Promise.race([document.fonts.load('400 100px "Instrument Serif"'),new Promise(function(r){setTimeout(r,1500)})]).catch(function(){}):Promise.resolve();
  fontsOk.then(function(){if(window.THREE)hero();else addEventListener('load',hero)});

  /* ---------- showcase: the real Degner site, scrolled by the visitor ---------- */
  var stage=document.getElementById('showStage');
  if(stage){
    var frames=stage.querySelectorAll('.sh-frame'),holders=stage.querySelectorAll('.sh-screen,.sh-pscr');
    function fit(){holders.forEach(function(h){var f=h.querySelector('.sh-frame'),w=+h.getAttribute('data-w'),k=h.clientWidth/w;f.style.width=w+'px';f.style.height=(h.clientHeight/k)+'px';f.style.transform='scale('+k+')'})}
    fit();addEventListener('resize',fit);
    var loaded=false;function load(){if(loaded)return;loaded=true;frames.forEach(function(f){f.src=f.getAttribute('data-src')})}
    if('IntersectionObserver' in window)new IntersectionObserver(function(e){if(e[0].isIntersecting){load()}},{rootMargin:'500px'}).observe(stage);else load();
    var chap=[].slice.call(document.querySelectorAll('.sh-chap button')),base='https://jesuyanm.github.io/Degner/',curP='index.html',swapT=0;
    function show(btn){
      var pg=btn.getAttribute('data-p');btn.parentNode.style.setProperty('--ci',chap.indexOf(btn));chap.forEach(function(b){var on=b===btn;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
      if(pg===curP)return;curP=pg;stage.classList.add('swap');clearTimeout(swapT);
      swapT=setTimeout(function(){var n=0;frames.forEach(function(f){f.addEventListener('load',function(){if(++n>=frames.length)stage.classList.remove('swap')},{once:true});f.src=base+pg+(f.closest('.sh-pscr')?'?preview':'')});setTimeout(function(){stage.classList.remove('swap')},2500)},330);
    }
    chap.forEach(function(b){b.addEventListener('click',function(){show(b)});b.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')show(b)})});
    if(g&&!reduced&&ST){g.registerPlugin(ST);
      var mon=stage.querySelector('.sh-mon'),ph=stage.querySelector('.sh-phone');
      g.fromTo(mon,{scale:.6,borderRadius:40,opacity:.4},{scale:1,borderRadius:14,opacity:1,ease:'none',scrollTrigger:{trigger:stage,start:'top 95%',end:'top 38%',scrub:.4}});
      g.fromTo(ph,{y:90,opacity:0},{y:0,opacity:1,ease:'power2.out',scrollTrigger:{trigger:stage,start:'top 60%',end:'top 25%',scrub:.4}});
      /* as you scroll the section up, the mockup grows toward the right and the text slides aside */
      if(matchMedia('(min-width:1000px)').matches){
        var sec=document.getElementById('show'),wrapEl=sec.querySelector('.wrap'),head=sec.querySelector('.sh-side'),pad=22;
        function off(el,root,prop){var v=0;while(el&&el!==root){v+=el[prop];el=el.offsetParent}return v}
        function geo(){
          var sw=stage.offsetWidth,sh=stage.offsetHeight,top=off(stage,sec,'offsetTop'),
              cell=wrapEl.clientWidth-head.offsetWidth-(parseFloat(getComputedStyle(wrapEl).columnGap)||0),
              k=Math.min(cell/(sw*1.17),(sec.offsetHeight-pad*2)/(sh*1.16));
          return {k:Math.max(1,k),y:pad-top,x:0}
        }
        g.set(stage,{transformOrigin:'50% 0'});
        var tl=g.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:sec,start:'top 34%',end:'top 4%',scrub:.7,invalidateOnRefresh:true}});
        tl.to(stage,{scale:function(){return geo().k},y:function(){return geo().y},x:function(){return geo().x},duration:.7},.3)
          ;
      }
    }
  }
  /* cards: light follows cursor; buttons: gentle magnet */
  document.querySelectorAll('.pick').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')})});
  if(g&&!reduced&&matchMedia('(hover:hover)').matches)document.querySelectorAll('.btn').forEach(function(b){
    var qx=g.quickTo(b,'x',{duration:.5,ease:'power3.out'}),qy=g.quickTo(b,'y',{duration:.5,ease:'power3.out'});
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();qx((e.clientX-r.left-r.width/2)*.18);qy((e.clientY-r.top-r.height/2)*.28)});
    b.addEventListener('pointerleave',function(){qx(0);qy(0)});
  });
  /* smooth scroll */
  if(g&&ST&&window.Lenis&&!reduced){
    var lenis=new window.Lenis({lerp:.1,smoothWheel:true});window.__lenis=lenis;if(document.documentElement.classList.contains('introing'))lenis.stop();
    lenis.on('scroll',function(e){window.__sv=e.velocity;ST.update()});g.ticker.add(function(t){lenis.raf(t*1000)});g.ticker.lagSmoothing(0);
  }

  /* ---------- lime band opens up like a window as you reach it ---------- */
  var band=document.querySelector('.band');
  if(band&&g&&ST&&!reduced){
    g.fromTo(band,{clipPath:'inset(0 7% round 44px)'},{clipPath:'inset(0 0% round 0px)',ease:'none',scrollTrigger:{trigger:band,start:'top 98%',end:'top 45%',scrub:.4}});
  }

  /* ---------- problem -> fix: pick what is in your way, the answer swaps in ---------- */
  var pf=document.querySelector('.pf');
  if(pf){
    var qs=[].slice.call(pf.querySelectorAll('.pf-q')),as=[].slice.call(pf.querySelectorAll('.pf-a'));
    function pick(i){qs.forEach(function(q,k){q.classList.toggle('on',k===i);q.setAttribute('aria-selected',k===i)});as.forEach(function(a,k){a.classList.toggle('on',k===i)});if(window.__ping)window.__ping(.6)}
    qs.forEach(function(q,i){q.addEventListener('click',function(){pick(i)});q.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')pick(i)});
      q.addEventListener('keydown',function(e){var d=e.key==='ArrowDown'||e.key==='ArrowRight'?1:e.key==='ArrowUp'||e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();var n=(i+d+qs.length)%qs.length;qs[n].focus();pick(n)}})});
    if(!reduced&&matchMedia('(hover:hover) and (min-width:861px)').matches){
      pf.addEventListener('pointermove',function(e){var r=pf.getBoundingClientRect();pf.style.setProperty('--px',((e.clientX-r.left)/r.width-.5)*2);pf.style.setProperty('--py',((e.clientY-r.top)/r.height-.5)*2)});
      pf.addEventListener('pointerleave',function(){pf.style.setProperty('--px',0);pf.style.setProperty('--py',0)});
    }
    if(g&&ST&&!reduced)g.from(pf.children,{y:40,opacity:0,duration:.9,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:pf,start:'top 85%'}});
  }
  /* ---------- statement scene ---------- */
  var say=document.getElementById('say');
  if(say&&g&&ST&&!reduced){
    var ws=[].slice.call(say.querySelectorAll('.say-line .w')),stg=say.querySelector('.say-stage'),cut=say.querySelector('.cut'),lis=[].slice.call(say.querySelectorAll('.cut li')),flash=document.createElement('i');
    say.classList.add('fx');flash.className='cut-flash';stg.appendChild(flash);
    g.set(ws,{opacity:0,z:-900,rotationY:55,transformOrigin:'50% 50%'});
    g.fromTo(say,{clipPath:'circle(0% at 50% 62%)'},{clipPath:'circle(150% at 50% 62%)',ease:'none',scrollTrigger:{trigger:say,start:'top 96%',end:'top 8%',scrub:.5}});
    var tl=g.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:stg,start:'top top',end:'+=250%',pin:true,scrub:.6}});
    tl.from(cut,{opacity:0,y:40,duration:.6},0);
    lis.forEach(function(li,i){
      var at=.7+i*.8;
      tl.to(li,{'--s':1,duration:.01},at);
      tl.fromTo(li,{x:0},{x:0,duration:.01},at);
      tl.to(li,{z:-1400,rotationX:42,rotationZ:i%2?-4:4,opacity:0,duration:.7,ease:'power3.in'},at+.55);
      tl.fromTo(li,{scaleX:1},{scaleX:1,duration:.01},at);
      tl.set(li,{className:'+=struck'},at+.3);
    });
    g.set(lis,{});
    /* sweep each strike bar with the timeline using inline transforms on the pseudo via a child element */
    lis.forEach(function(li,i){var bar=document.createElement('b');bar.className='bar';li.appendChild(bar);
      var at=.7+i*.8;
      tl.fromTo(bar,{scaleX:0},{scaleX:1,duration:.45,ease:'expo.out'},at);
      tl.to(li.querySelector('span'),{opacity:.38,duration:.3,ease:'power2.out'},at+.3);
    });
    var end=.7+lis.length*.8+.7;
    
    tl.to(cut,{opacity:0,duration:.01},end+.12);
    
    tl.to(ws,{opacity:1,z:0,rotationY:0,stagger:.1,duration:.9,ease:'expo.out'},end+.3);
    say.querySelectorAll('.rl i').forEach(function(n,k){g.fromTo(n,{y:70},{y:-30,ease:'none',scrollTrigger:{trigger:n,start:'top bottom',end:'bottom top',scrub:.6}})});
    g.from(say.querySelectorAll('.rl h3,.rl span'),{y:30,opacity:0,duration:.8,stagger:.08,ease:'power3.out',scrollTrigger:{trigger:'.say-rail',start:'top 78%'}});
  }
  /* no scrolling while the intro plays */
  (function(){
    var H=document.documentElement,stop=function(e){if(H.classList.contains('introing')){e.preventDefault()}};
    addEventListener('wheel',stop,{passive:false,capture:true});
    addEventListener('touchmove',stop,{passive:false,capture:true});
    addEventListener('keydown',function(e){if(H.classList.contains('introing')&&/^(Space| |ArrowDown|ArrowUp|PageDown|PageUp|Home|End)$/.test(e.key===' '?' ':e.key))e.preventDefault()},{capture:true});
    if(window.__lenis||true){new MutationObserver(function(){var l=window.__lenis;if(!l)return;if(H.classList.contains('introing'))l.stop();else{l.start();}}).observe(H,{attributes:true,attributeFilter:['class']})}
  })();
})();
