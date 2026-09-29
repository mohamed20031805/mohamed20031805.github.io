/* 3D aerial view, built with three.js r128 (loaded from a CDN in index.html).
   World axes: X = east, Z = south. Site coordinate y maps to z = 66 - y. */

/* ============================================================
   01 — 3D VIEW
   world: X = east, Z = south (north is -Z). y_site = 66 - z
   ============================================================ */
(function(){
  if(!window.THREE){ return; }
  var host=document.getElementById('viewer'), cv=document.getElementById('scene');
  var renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  if(THREE.sRGBEncoding) renderer.outputEncoding=THREE.sRGBEncoding;

  var scene=new THREE.Scene();
  scene.background=new THREE.Color(0xBFD2DC);
  scene.fog=new THREE.Fog(0xBFD2DC, 190, 420);

  var camera=new THREE.PerspectiveCamera(38,16/9,0.5,900);
  var target=new THREE.Vector3(20,0,33);
  var CAM0={az:0.27, pol:0.94, dist:120};
  var cam={az:CAM0.az, pol:CAM0.pol, dist:CAM0.dist};
  function applyCam(){
    var x=target.x+cam.dist*Math.sin(cam.pol)*Math.sin(cam.az);
    var z=target.z+cam.dist*Math.sin(cam.pol)*Math.cos(cam.az);
    var y=target.y+cam.dist*Math.cos(cam.pol);
    camera.position.set(x,y,z); camera.lookAt(target);
  }

  /* lights */
  scene.add(new THREE.HemisphereLight(0xDDEAF2,0xA79274,0.72));
  var sun=new THREE.DirectionalLight(0xFFF3DF,0.95);
  sun.position.set(88,108,104); sun.castShadow=true;
  sun.shadow.mapSize.width=2048; sun.shadow.mapSize.height=2048;
  var sc=sun.shadow.camera; sc.left=-95; sc.right=95; sc.top=95; sc.bottom=-95; sc.near=10; sc.far=340;
  sun.target.position.copy(target); scene.add(sun); scene.add(sun.target);

  function mat(c,o){ o=o||{}; o.color=c; return new THREE.MeshLambertMaterial(o); }
  var M={
    earth:mat(0xC6B497), lawn:mat(0x7F9C55), asphalt:mat(0x585D62), pave:mat(0xC9C3B4),
    panel:mat(0xF2F3F0), panelSide:mat(0xE2E5E1), base:mat(0xB9BCB7), parapet:mat(0xD8DBD6),
    ctx:mat(0xBFC2BD), ctxRoof:mat(0xA9ADA8), road:mat(0x4E5257), trunk:mat(0x6B5640),
    leaf:mat(0x59763F), white:mat(0xFFFFFF), dark:mat(0x2B3136), ochre:mat(0xC98A2E),
    blue:mat(0x2F6E9C), red:mat(0xB4483C), steel:mat(0x8D959B)
  };
  M.glass=new THREE.MeshPhongMaterial({color:0x8FB6CB,transparent:true,opacity:0.42,shininess:90,side:THREE.DoubleSide});
  M.screen=new THREE.MeshBasicMaterial({color:0x6FD0E8});
  M.screen2=new THREE.MeshBasicMaterial({color:0xE8B84B});

  function box(w,h,d,m,x,y,z,shadow){
    var b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
    b.position.set(x,y+h/2,z);
    if(shadow!==false){ b.castShadow=true; b.receiveShadow=true; }
    return b;
  }
  function slab(x0,z0,w,d,m,y){
    var g=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);
    g.rotation.x=-Math.PI/2; g.position.set(x0+w/2,y||0.02,z0+d/2);
    g.receiveShadow=true; return g;
  }
  function label(text,bg,fg,scale){
    var c=document.createElement('canvas'); c.width=512; c.height=128;
    var g=c.getContext('2d');
    g.fillStyle=bg; g.fillRect(0,0,512,128);
    g.fillStyle=fg; g.font='600 62px Archivo, Helvetica, Arial, sans-serif';
    g.textAlign='center'; g.textBaseline='middle';
    g.letterSpacing='6px';
    g.fillText(text,256,70);
    var t=new THREE.CanvasTexture(c);
    var s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:true}));
    s.scale.set(scale||18,(scale||18)/4,1);
    return s;
  }

  /* ---------- ground & context ---------- */
  scene.add(slab(-120,-90,300,300,M.earth,0));
  scene.add(slab(-18,-16,14,110,M.road,0.03));      // north-south road
  scene.add(slab(-18,66,80,12,M.road,0.03));        // east-west road (south)
  scene.add(slab(-4,-10,4,80,M.pave,0.06));         // sidewalk

  /* Marjane */
  var marj=new THREE.Group();
  marj.add(box(18,9,64,M.ctx,53,0,34));
  marj.add(box(19,0.7,65,M.ctxRoof,53,9,34));
  marj.add(box(18.4,2.2,6,M.white,53,9.1,4.2));
  scene.add(marj);
  var ml=label('MARJANE','#E9EBE6','#2B3136',26); ml.position.set(53,15,20); scene.add(ml);
  scene.add(slab(40,0,4,66,M.asphalt,0.05));

  /* Afriquia */
  var afr=new THREE.Group();
  afr.add(slab(-42,34,24,30,M.pave,0.05));
  [[-38,38],[-38,52],[-26,38],[-26,52]].forEach(function(q){
    afr.add(box(0.5,5.6,0.5,M.steel,q[0],0,q[1]));
  });
  afr.add(box(17,0.9,15,M.white,-32,5.6,45));
  afr.add(box(17.3,0.5,15.3,M.ochre,-32,5.4,45));
  [[-35,42],[-35,48],[-29,42],[-29,48]].forEach(function(q){
    afr.add(box(1.3,1.9,0.9,M.white,q[0],0,q[1]));
  });
  afr.add(box(9,3.4,5,M.white,-35.5,0,60.5));
  scene.add(afr);
  var al=label('AFRIQUIA','#E4932B','#FFFFFF',20); al.position.set(-32,10,45); scene.add(al);

  /* ---------- plot surfaces ---------- */
  scene.add(slab(0,0,40,66,M.earth,0.04));
  function lawnAt(x0,y0,w,h){ scene.add(slab(x0,66-(y0+h),w,h,M.lawn,0.07)); }
  lawnAt(0,8,4,50); lawnAt(14,8,3,37); lawnAt(0,0,17,1); lawnAt(39,8,1,50); lawnAt(0,64.5,40,1.5);
  function asphAt(x0,y0,w,h){ scene.add(slab(x0,66-(y0+h),w,h,M.asphalt,0.06)); }
  asphAt(0,1,40,5.5); asphAt(0,59,40,5.5); asphAt(17,6.5,6,52.5); asphAt(28,6.5,6,52.5);
  asphAt(23,8,5,50); asphAt(34,8,5,50); asphAt(11,1,6,5.5);
  function paveAt(x0,y0,w,h){ scene.add(slab(x0,66-(y0+h),w,h,M.pave,0.08)); }
  paveAt(11,45,6,13); paveAt(11,8,3,37); paveAt(0,6.5,17,1.5);

  /* parking markings */
  var mk=new THREE.MeshBasicMaterial({color:0xE9EAE6});
  function stripe(x0,y0,len){
    var g=new THREE.Mesh(new THREE.PlaneGeometry(len,0.14),mk);
    g.rotation.x=-Math.PI/2; g.rotation.z=0;
    g.position.set(x0+len/2,0.1,66-y0); scene.add(g);
  }
  for(var i=0;i<=17;i++){ stripe(23,14.6+i*2.5,5); }
  stripe(23,8,5); stripe(23,11.3,5); stripe(23,14.6,5);
  for(var j=0;j<=20;j++){ stripe(34,8+j*2.5,5); }

  /* trees along the road */
  function tree(x,z,s){
    var g=new THREE.Group();
    g.add(box(0.35,2.2,0.35,M.trunk,x,0,z));
    var c=new THREE.Mesh(new THREE.SphereGeometry(1.6*s,10,8),M.leaf);
    c.position.set(x,3.4*s,z); c.castShadow=true; g.add(c);
    scene.add(g);
  }
  [10,22,34,46,58].forEach(function(y){ tree(-2,66-y,1); });
  [14,30,46].forEach(function(y){ tree(39.5,66-y,0.9); });

  /* ---------- building ---------- */
  var BX0=4, BX1=11, BZ0=8, BZ1=58;       // z: 8 (north end) .. 58 (south end)
  var H=4.7, PAR=0.5;
  var FF_Z0=8, FF_Z1=21, GZ_Z0=21, GZ_Z1=58;   // fast food north, gaming south

  var bldg=new THREE.Group(); scene.add(bldg);
  bldg.add(slab(BX0,BZ0,7,50,M.pave,0.12));

  // west, north, south solid walls (sandwich panel)
  bldg.add(box(0.14,H,50,M.panelSide,BX0+0.07,0,33));
  bldg.add(box(7,H,0.14,M.panelSide,7.5,0,BZ0+0.07));
  bldg.add(box(7,H,0.14,M.panelSide,7.5,0,BZ1-0.07));
  // blockwork base band
  bldg.add(box(7.05,1.0,50.05,M.base,7.5,0,33,false));
  // east glazed facade
  var glass=new THREE.Mesh(new THREE.BoxGeometry(0.1,3.3,49.0),M.glass);
  glass.position.set(BX1-0.05,1.0+1.65,33); bldg.add(glass);
  // mullions
  for(var m=0;m<=24;m++){
    bldg.add(box(0.14,3.4,0.1,M.white,BX1-0.02,1.0,BZ0+0.6+m*2.0,false));
  }
  bldg.add(box(0.22,0.25,50,M.white,BX1-0.05,4.3,33,false));
  bldg.add(box(0.22,0.25,50,M.white,BX1-0.05,0.95,33,false));

  // roof + parapet
  var roof=new THREE.Group(); bldg.add(roof);
  roof.add(box(7.2,0.22,50.2,M.parapet,7.5,H,33));
  roof.add(box(0.25,PAR,50.3,M.parapet,BX0-0.02,H+0.22,33));
  roof.add(box(0.25,PAR,50.3,M.parapet,BX1+0.02,H+0.22,33));
  roof.add(box(7.4,PAR,0.25,M.parapet,7.5,H+0.22,BZ0-0.07));
  roof.add(box(7.4,PAR,0.25,M.parapet,7.5,H+0.22,BZ1+0.07));

  // sign boxes on the parapet, facing east
  var s1=box(0.3,1.15,6.0,M.ochre,BX1+0.2,H+0.15,14.0); roof.add(s1);
  var s2=box(0.3,1.15,8.0,M.blue,BX1+0.2,H+0.15,37.0); roof.add(s2);

  // entrance doors
  bldg.add(box(0.16,2.6,1.6,M.dark,BX1+0.02,0,16.0,false));
  bldg.add(box(0.16,2.6,1.8,M.dark,BX1+0.02,0,23.1,false));
  // canopy over entrances
  bldg.add(box(1.8,0.16,3.2,M.white,BX1+0.9,3.2,16.0));
  bldg.add(box(1.8,0.16,3.4,M.white,BX1+0.9,3.2,23.1));

  /* ---------- interior ---------- */
  var interior=new THREE.Group(); bldg.add(interior);
  // partitions
  interior.add(box(7,3.0,0.1,M.panelSide,7.5,0,21,false));      // fast food / gaming
  interior.add(box(7,3.0,0.1,M.panelSide,7.5,0,19,false));      // sanitary block
  interior.add(box(7,3.0,0.1,M.panelSide,7.5,0,53,false));      // tournament room
  interior.add(box(7,3.0,0.1,M.panelSide,7.5,0,56,false));      // staff / store

  // fast food: kitchen z 54..58, counter 52.5..54, seating 47..52.5
  interior.add(box(6.6,1.0,0.7,M.steel,7.5,0,8.6));
  interior.add(box(0.7,1.0,3.6,M.steel,4.6,0,10.2));
  interior.add(box(6.2,1.15,0.9,M.white,7.5,0,12.8));
  interior.add(box(6.2,0.1,0.95,M.ochre,7.5,1.15,12.8,false));
  for(var a=0;a<4;a++){ for(var b=0;b<2;b++){
    var tx=5.2+b*3.2, tz=17.8-a*1.45;
    var t=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.75,12),M.white);
    t.position.set(tx,0.38,tz); t.castShadow=true; interior.add(t);
    interior.add(box(0.4,0.45,0.4,M.ochre,tx-0.75,0,tz,false));
    interior.add(box(0.4,0.45,0.4,M.ochre,tx+0.75,0,tz,false));
  }}

  // gaming: pc rows z 22..34 (site 32..44), consoles 13..22, arcade 8..13 approx
  // PC desks along both long walls
  interior.add(box(0.85,0.75,11.6,M.dark,5.0,0,30.0));
  interior.add(box(0.85,0.75,11.6,M.dark,10.0,0,30.0));
  for(var k=0;k<12;k++){
    var pz=35.3-k*1.0;
    var scr1=box(0.06,0.42,0.72,M.screen,5.3,0.78,pz,false);
    var scr2=box(0.06,0.42,0.72,M.screen,9.7,0.78,pz,false);
    interior.add(scr1); interior.add(scr2);
    interior.add(box(0.5,0.5,0.5,M.red,6.1,0,pz,false));
    interior.add(box(0.5,0.5,0.5,M.red,8.9,0,pz,false));
    interior.add(box(0.5,0.55,0.12,M.dark,6.1,0.5,pz,false));
    interior.add(box(0.5,0.55,0.12,M.dark,8.9,0.5,pz,false));
  }
  // console lounge
  for(var c2=0;c2<4;c2++){
    var cz=43.4-c2*2.1;
    interior.add(box(0.1,1.2,1.6,M.screen2,4.3,1.6,cz,false));
    interior.add(box(0.1,1.2,1.6,M.screen2,10.7,1.6,cz,false));
    interior.add(box(1.0,0.6,1.5,M.blue,5.6,0,cz,false));
    interior.add(box(1.0,0.6,1.5,M.blue,9.4,0,cz,false));
  }
  // token arcade cabinets
  [[4.9,46.6],[4.9,48.0],[4.9,49.4],[10.1,46.6],[10.1,48.0],[10.1,49.4]].forEach(function(q){
    interior.add(box(0.95,1.9,1.05,M.ochre,q[0],0,q[1]));
    interior.add(box(0.15,0.7,0.8,M.screen,q[0]+(q[0]<7.5?0.55:-0.55),1.0,q[1],false));
  });
  interior.add(box(1.6,2.2,1.6,M.red,6.3,0,50.6));
  interior.add(box(1.6,2.2,1.6,M.blue,8.7,0,48.6));
  // tournament desks
  [55.4,54.4,53.6].forEach(function(tz){
    interior.add(box(0.9,0.75,0.7,M.dark,5.4,0,tz,false));
    interior.add(box(0.9,0.75,0.7,M.dark,9.6,0,tz,false));
  });
  // reception counter + lockers
  interior.add(box(0.9,1.1,3.4,M.white,5.0,0,22.5));
  interior.add(box(0.95,0.1,3.45,M.blue,5.0,1.1,22.5,false));
  interior.add(box(2.2,1.9,0.5,M.panelSide,9.6,0,21.6));

  /* terrace furniture */
  var terr=new THREE.Group(); scene.add(terr);
  [[12.7,47],[15.2,47],[12.7,51],[15.2,51],[12.7,55],[15.2,55]].forEach(function(q){
    var x=q[0], z=66-q[1];
    var t=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.75,14),M.white);
    t.position.set(x,0.38,z); t.castShadow=true; terr.add(t);
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.5,8),M.steel);
    pole.position.set(x,1.25,z); terr.add(pole);
    var can=new THREE.Mesh(new THREE.ConeGeometry(1.45,0.55,10),M.ochre);
    can.position.set(x,2.55,z); can.castShadow=true; terr.add(can);
    [[-0.95,0],[0.95,0],[0,-0.95],[0,0.95]].forEach(function(d){
      terr.add(box(0.38,0.45,0.38,M.white,x+d[0],0,z+d[1],false));
    });
  });

  /* a few cars only */
  function car(x,z,rot,col){
    var g=new THREE.Group();
    var b=box(1.75,0.75,4.3,mat(col),0,0.25,0); g.add(b);
    var c=box(1.55,0.6,2.1,mat(0x2B3136),0,1.0,-0.2,false); g.add(c);
    g.position.set(x,0,z); g.rotation.y=rot; scene.add(g);
  }
  car(25.5,66-16,0,0xD8DAD6); car(25.5,66-30,0,0x3C4E63);
  car(36.5,66-22,0,0xBFC2BD); car(36.5,66-44,0,0x8A3F38);

  /* zone labels */
  var lff=label('FAST FOOD','#C98A2E','#FFFFFF',15);
  lff.position.set(7.5,9.5,14.5); scene.add(lff);
  var lgz=label('GAMING ZONE','#2F6E9C','#FFFFFF',18);
  lgz.position.set(7.5,9.5,40); scene.add(lgz);

  /* ---------- controls ---------- */
  var drag=false, lx=0, ly=0;
  function down(e){ drag=true; var p=pt(e); lx=p.x; ly=p.y; }
  function move(e){
    if(!drag) return;
    var p=pt(e);
    cam.az -= (p.x-lx)*0.006;
    cam.pol = Math.max(0.22, Math.min(1.24, cam.pol - (p.y-ly)*0.005));
    lx=p.x; ly=p.y; applyCam(); render();
    e.preventDefault();
  }
  function up(){ drag=false; }
  function pt(e){ return e.touches? {x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; }
  cv.addEventListener('mousedown',down); window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:true});
  cv.addEventListener('touchmove',move,{passive:false});
  window.addEventListener('touchend',up);
  cv.addEventListener('wheel',function(e){
    cam.dist=Math.max(45,Math.min(260,cam.dist+e.deltaY*0.12));
    applyCam(); render(); e.preventDefault();
  },{passive:false});

  var roofOn=true;
  document.getElementById('btnRoof').addEventListener('click',function(){
    roofOn=!roofOn; roof.visible=roofOn;
    this.textContent = roofOn? 'Lift the roof' : 'Put the roof back';
    render();
  });
  document.getElementById('btnView').addEventListener('click',function(){
    cam.az=CAM0.az; cam.pol=CAM0.pol; cam.dist=CAM0.dist; applyCam(); render();
  });

  function resize(){
    var w=host.clientWidth, h=Math.round(w*9/16);
    renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
    render();
  }
  function render(){ renderer.render(scene,camera); }
  window.addEventListener('resize',resize);

  /* one orchestrated entrance: ease the camera in once */
  applyCam(); resize();
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce){
    var start=null, d0=215, d1=CAM0.dist, dur=1400;
    cam.dist=d0; applyCam();
    requestAnimationFrame(function step(ts){
      if(start===null) start=ts;
      var t=Math.min(1,(ts-start)/dur), e=1-Math.pow(1-t,3);
      cam.dist=d0+(d1-d0)*e; applyCam(); render();
      if(t<1) requestAnimationFrame(step);
    });
  }
})();
