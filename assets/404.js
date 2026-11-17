(function(){
var T=window.THREE,cv=document.getElementById('lost');if(!T||!cv)return;
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
var ren=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});ren.setPixelRatio(Math.min(devicePixelRatio,2));
var scene=new T.Scene(),cam=new T.PerspectiveCamera(45,1,.1,200);
var key=new T.DirectionalLight(0xffffff,2.2);key.position.set(6,10,8);scene.add(key);
scene.add(new T.AmbientLight(0x8a8f70,.9));
var lime=new T.PointLight(0xd4ff3a,60,40);lime.position.set(-6,2,6);scene.add(lime);
// 5x7 pixel digits
var F={'4':['10010','10010','10010','11111','00010','00010','00010'],'0':['01110','10001','10011','10101','11001','10001','01110']};
var word='404',cells=[],gap=1.3;
word.split('').forEach(function(ch,wi){F[ch].forEach(function(row,y){row.split('').forEach(function(b,x){
 if(b==='1')for(var z=0;z<2;z++)cells.push({x:(wi*6+x-8.5)*gap,y:(3-y)*gap,z:(z-.5)*gap})})})});
var N=cells.length,geo=new T.BoxGeometry(1,1,1),mat=new T.MeshStandardMaterial({color:0xd4ff3a,roughness:.35,metalness:.25});
var mesh=new T.InstancedMesh(geo,mat,N);scene.add(mesh);
var pos=[],vel=[],rot=[],ph=[];
cells.forEach(function(c,i){pos.push(new T.Vector3(c.x,c.y,c.z));vel.push(new T.Vector3());rot.push(new T.Euler(0,0,0));ph.push(Math.random()*6.28)});
// dust field
var P=1400,pp=new Float32Array(P*3);for(var i=0;i<P;i++){pp[i*3]=(Math.random()-.5)*90;pp[i*3+1]=(Math.random()-.5)*50;pp[i*3+2]=-Math.random()*60+10}
var pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pp,3));
var dust=new T.Points(pg,new T.PointsMaterial({color:0xece7dc,size:.12,transparent:true,opacity:.7}));scene.add(dust);
// rings
var rings=[];for(var r=0;r<3;r++){var rg=new T.Mesh(new T.TorusGeometry(11+r*3.2,.04,8,160),new T.MeshBasicMaterial({color:r===1?0xd4ff3a:0xece7dc,transparent:true,opacity:.35}));rg.rotation.x=1.2+r*.35;rg.rotation.y=r*.6;scene.add(rg);rings.push(rg)}
var mx=0,my=0,tx=0,ty=0,ray=new T.Raycaster(),mv=new T.Vector2(9,9),hit=new T.Vector3(1e3,1e3,0),burst=0;
function size(){var w=innerWidth,h=Math.max(innerHeight*.62,380);ren.setSize(w,h,false);cv.style.height=h+'px';cam.aspect=w/h;cam.position.z=w<700?40:25;cam.updateProjectionMatrix()}
size();addEventListener('resize',size);
addEventListener('pointermove',function(e){tx=e.clientX/innerWidth*2-1;ty=e.clientY/innerHeight*2-1;mv.set(tx,-(e.clientY/cv.clientHeight*2-1)+ (innerHeight*.0))});
cv.addEventListener('pointerdown',function(){burst=1;cells.forEach(function(c,i){vel[i].set((Math.random()-.5)*1.4,(Math.random()-.2)*1.4,Math.random()*1.6)})});
var dm=new T.Object3D(),clock=new T.Clock(),plane=new T.Plane(new T.Vector3(0,0,1),0);
function frame(){var t=clock.getElapsedTime();
 mx+=(tx-mx)*.05;my+=(ty-my)*.05;
 cam.position.x=Math.sin(t*.2)*1.8+mx*4;cam.position.y=2.5-my*3+Math.sin(t*.3);cam.lookAt(0,3.2,0);
 // pointer ray hits the digit plane
 var rect=cv.getBoundingClientRect(),px=((event_x||0)-rect.left)/rect.width*2-1;
 ray.setFromCamera(new T.Vector2(tx,-((ey||0)-rect.top)/rect.height*2+1),cam);ray.ray.intersectPlane(plane,hit);
 for(var i=0;i<N;i++){var p=pos[i],v=vel[i],c=cells[i];
  var hx=c.x,hy=c.y+Math.sin(t*1.3+ph[i])*.18,hz=c.z+Math.cos(t*1.1+ph[i])*.25;
  var dx=p.x-hit.x,dy=p.y-hit.y,d=Math.hypot(dx,dy);
  if(d<5){var f=(5-d)/5;v.x+=dx/(d+.1)*f*.11;v.y+=dy/(d+.1)*f*.11;v.z+=f*.09}
  v.x+=(hx-p.x)*.035;v.y+=(hy-p.y)*.035;v.z+=(hz-p.z)*.035;v.multiplyScalar(.9);p.add(v);
  rot[i].x+=v.y*.2+.004;rot[i].y+=v.x*.2+.006;rot[i].z+=v.z*.1;
  rot[i].x*=.985;rot[i].y*=.985;
  dm.position.copy(p);dm.rotation.copy(rot[i]);var s=.9+Math.min(.5,v.length()*.3);dm.scale.setScalar(s);dm.updateMatrix();mesh.setMatrixAt(i,dm.matrix)}
 mesh.instanceMatrix.needsUpdate=true;
 dust.rotation.y=t*.02;dust.position.z=Math.sin(t*.3)*2;
 rings.forEach(function(rg,k){rg.rotation.z=t*(.12+k*.07)*(k%2?-1:1)});
 lime.position.x=Math.sin(t*.8)*9;lime.position.y=Math.cos(t*.6)*5+3;
 ren.render(scene,cam);if(!reduce)requestAnimationFrame(frame)}
var event_x=0,ey=0;addEventListener('pointermove',function(e){event_x=e.clientX;ey=e.clientY});
frame();
})();
