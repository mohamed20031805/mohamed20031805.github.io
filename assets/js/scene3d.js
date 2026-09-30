/* Vue 3D aérienne, three.js r128 (chargé dans index.html).
   Repère : X = est, Z = sud. La coordonnée y du plan masse devient z = 62 - y.
   Le bâtiment est une barre est-ouest : x 36..86, z 4..11.
   Espace gaming x 36..73 (ouest), fast food x 73..86 (côté Marjane). */

(function(){
  var host=document.getElementById('viewer'), cv=document.getElementById('scene');
  if(!host||!cv){ return; }

  /* le cadre ne doit jamais rester un rectangle noir muet */
  function fail(headline, detail){
    var n=document.createElement('div');
    n.className='vnote';
    n.innerHTML='<strong>'+headline+'</strong>'+(detail?'<span>'+detail+'</span>':'');
    host.appendChild(n); host.classList.add('is-down');
    if(window.console) console.error('[vue 3D] '+headline, detail||'');
  }
  if(!window.THREE){
    fail('La vue 3D n\u2019a pas pu se charger.',
         'three.js est introuvable. Vérifiez que le fichier assets/js/vendor/three.min.js a bien été mis en ligne, ou ouvrez la page avec une connexion internet.');
    return;
  }
  var renderer;
  try{
    renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  }catch(err){
    fail('Ce navigateur ne peut pas afficher la vue 3D.',
         'WebGL est indisponible ou désactivé. Les plans ci-dessous s\u2019affichent dans tous les navigateurs.');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  if(THREE.sRGBEncoding) renderer.outputEncoding=THREE.sRGBEncoding;

  var scene=new THREE.Scene();
  scene.background=new THREE.Color(0xBFD2DC);
  scene.fog=new THREE.Fog(0xBFD2DC, 280, 600);

  var camera=new THREE.PerspectiveCamera(38,16/9,0.5,1200);
  var target=new THREE.Vector3(50,0,34);
  var CAM0={az:0.30, pol:0.96, dist:152};
  var cam={az:CAM0.az, pol:CAM0.pol, dist:CAM0.dist};
  function applyCam(){
    var x=target.x+cam.dist*Math.sin(cam.pol)*Math.sin(cam.az);
    var z=target.z+cam.dist*Math.sin(cam.pol)*Math.cos(cam.az);
    var y=target.y+cam.dist*Math.cos(cam.pol);
    camera.position.set(x,y,z); camera.lookAt(target);
  }

  /* éclairage : soleil du sud-est, la façade vitrée est éclairée */
  scene.add(new THREE.HemisphereLight(0xDDEAF2,0xA79274,0.72));
  var sun=new THREE.DirectionalLight(0xFFF3DF,0.95);
  sun.position.set(150,120,130); sun.castShadow=true;
  sun.shadow.mapSize.width=2048; sun.shadow.mapSize.height=2048;
  var sc=sun.shadow.camera; sc.left=-110; sc.right=110; sc.top=110; sc.bottom=-110;
  sc.near=20; sc.far=420;
  sun.target.position.copy(target); scene.add(sun); scene.add(sun.target);

  function mat(c,o){ o=o||{}; o.color=c; return new THREE.MeshLambertMaterial(o); }
  var M={
    earth:mat(0xC6B497), lawn:mat(0x7F9C55), asphalt:mat(0x585D62), pave:mat(0xC9C3B4),
    panelSide:mat(0xE2E5E1), base:mat(0xB9BCB7), parapet:mat(0xD8DBD6),
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
  /* aires données en coordonnées du plan masse (x, y au nord) */
  function at(x0,y0,w,h,m,el){ scene.add(slab(x0,62-(y0+h),w,h,m,el)); }

  function label(text,bg,fg,scale){
    var c=document.createElement('canvas'); c.width=512; c.height=128;
    var g=c.getContext('2d');
    g.fillStyle=bg; g.fillRect(0,0,512,128);
    g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle';
    var size=62;                       // on réduit jusqu'à ce que le mot tienne
    do{ g.font='600 '+size+'px Archivo, Helvetica, Arial, sans-serif'; size-=3; }
    while(g.measureText(text).width>470 && size>26);
    g.fillText(text,256,70);
    var t=new THREE.CanvasTexture(c);
    var s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:true}));
    s.scale.set(scale||18,(scale||18)/4,1);
    return s;
  }

  /* ---------- sol, voirie publique ---------- */
  scene.add(slab(-220,-200,560,520,M.earth,0));
  at(-20,-16,20,96,M.road,0.03);       // route publique, à l'ouest
  at(-20,-16,150,14,M.road,0.03);      // route publique, au sud
  at(-4,-2,4,82,M.pave,0.06);          // trottoir ouest
  at(-4,-2,134,2,M.pave,0.06);         // trottoir sud
  at(0,0,108,62,M.earth,0.04);         // terrain
  /* bandes axiales */
  var axis=new THREE.MeshBasicMaterial({color:0xE2E4DF});
  for(var ax=-14;ax<78;ax+=9){
    var ga=new THREE.Mesh(new THREE.PlaneGeometry(0.2,4.5),axis);
    ga.rotation.x=-Math.PI/2; ga.position.set(-11,0.08,62-ax); scene.add(ga);
  }
  for(var bx=-14;bx<126;bx+=9){
    var gb=new THREE.Mesh(new THREE.PlaneGeometry(4.5,0.2),axis);
    gb.rotation.x=-Math.PI/2; gb.position.set(bx,0.08,62+9); scene.add(gb);
  }

  /* ---------- Marjane ---------- */
  scene.add(box(12,10,54,M.ctx,102,0,31));
  scene.add(box(13,0.7,55,M.ctxRoof,102,10,31));
  scene.add(box(4,2.4,18,M.white,94.5,10.1,31));
  var ml=label('MARJANE','#E9EBE6','#2B3136',26); ml.position.set(102,16,31); scene.add(ml);

  /* ---------- station gaz et lavage, ensemble, en face du bâtiment ---------- */
  at(20,12,37,16,M.pave,0.05);
  // station : auvent sur quatre poteaux
  [[23,15],[23,25],[41,15],[41,25]].forEach(function(q){
    scene.add(box(0.5,5.6,0.5,M.steel,q[0],0,62-q[1]));
  });
  scene.add(box(21,0.9,13,M.white,32,5.6,62-20));
  scene.add(box(21.3,0.5,13.3,M.ochre,32,5.4,62-20));
  [[26,17],[26,23],[38,17],[38,23]].forEach(function(q){
    scene.add(box(2.0,1.9,1.3,M.white,q[0],0,62-q[1]));
  });
  scene.add(box(6,3.4,2.2,M.white,23,0,62-29.2));     // boutique
  var al=label('STATION','#E4932B','#FFFFFF',20); al.position.set(32,11,62-20); scene.add(al);

  // lavage : accolé à la station, côté est
  [[44.4,12.6],[44.4,22.4],[56.6,12.6],[56.6,22.4]].forEach(function(q){
    scene.add(box(0.35,4.2,0.35,M.steel,q[0],0,62-q[1]));
  });
  scene.add(box(13,0.5,11,M.ctxRoof,50.5,4.2,62-17.5));
  for(var lb=1;lb<4;lb++){ scene.add(box(0.2,2.8,10,M.panelSide,44+lb*3.2,0,62-17.5,false)); }
  var wl=label('LAVAGE','#4E5257','#EDEEEA',16); wl.position.set(50.5,7.6,62-17.5); scene.add(wl);

  /* ---------- voies, allées et parking ---------- */
  at(0,0,96,6,M.asphalt,0.06);       // voie d'entrée, au sud
  at(0,34,20,6,M.asphalt,0.06);      // voie de sortie, à l'ouest
  at(0,0,18,62,M.asphalt,0.06);      // dégagement ouest, le long de la route
  at(18,6,78,6,M.asphalt,0.06);      // allée sud
  at(12,28,84,6,M.asphalt,0.06);     // allée nord
  at(28,51,50,5,M.asphalt,0.06);     // allée arrière
  at(79,6,17,44,M.asphalt,0.06);     // parking principal, entre le bâtiment et Marjane
  at(30,56,45,5,M.asphalt,0.06);     // parking arrière, derrière le bâtiment

  /* marquage au sol */
  var mk=new THREE.MeshBasicMaterial({color:0xE9EAE6});
  function sepV(x,y0,depth){
    var g=new THREE.Mesh(new THREE.PlaneGeometry(0.14,depth),mk);
    g.rotation.x=-Math.PI/2; g.position.set(x,0.1,62-(y0+depth/2)); scene.add(g);
  }
  function sepH(y,x0,x1){
    var g=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,0.14),mk);
    g.rotation.x=-Math.PI/2; g.position.set((x0+x1)/2,0.1,62-y); scene.add(g);
  }
  // parking principal : deux rangées face à Marjane
  [[79,84],[90,95]].forEach(function(r){
    for(var i=0;i<=14;i++){ sepH(8+i*2.5,r[0],r[1]); }
    sepV(r[0],8,35); sepV(r[1],8,35);
  });
  // parking arrière, personnel
  for(var j=0;j<=18;j++){ sepV(30+j*2.5,56,5); }
  sepH(56,30,75); sepH(61,30,75);

  /* arbres */
  function tree(x,y,s){
    scene.add(box(0.35,2.2,0.35,M.trunk,x,0,62-y));
    var c=new THREE.Mesh(new THREE.SphereGeometry(1.6*s,10,8),M.leaf);
    c.position.set(x,3.4*s,62-y); c.castShadow=true; scene.add(c);
  }
  [22,34,46,58,70].forEach(function(x){ tree(x,31,0.85); });
  [10,18,26].forEach(function(y){ tree(59,y,0.8); });
  [12,22,32,42].forEach(function(y){ tree(77,y,0.8); });

  /* ---------- bâtiment ---------- */
  var BZ0=4, BZ1=11, H=4.7, PAR=0.5;
  var bldg=new THREE.Group(); bldg.position.set(-8,0,8); scene.add(bldg);
  bldg.add(slab(36,BZ0,50,7,M.pave,0.12));

  // murs pleins : nord (z=4) et les deux pignons
  bldg.add(box(50,H,0.14,M.panelSide,61,0,BZ0+0.07));
  bldg.add(box(0.14,H,7,M.panelSide,36.07,0,7.5));
  bldg.add(box(0.14,H,7,M.panelSide,85.93,0,7.5));
  // bandeau de soubassement
  bldg.add(box(50.05,1.0,7.05,M.base,61,0,7.5,false));
  // façade sud vitrée
  var glass=new THREE.Mesh(new THREE.BoxGeometry(49.0,3.3,0.1),M.glass);
  glass.position.set(61,2.65,BZ1-0.05); bldg.add(glass);
  for(var m=0;m<=24;m++){
    bldg.add(box(0.1,3.4,0.14,M.white,85.4-m*2.0,1.0,BZ1-0.02,false));
  }
  bldg.add(box(50,0.25,0.22,M.white,61,4.3,BZ1-0.05,false));
  bldg.add(box(50,0.25,0.22,M.white,61,0.95,BZ1-0.05,false));

  // toiture + acrotère
  var roof=new THREE.Group(); bldg.add(roof);
  roof.add(box(50.2,0.22,7.2,M.parapet,61,H,7.5));
  roof.add(box(50.3,PAR,0.25,M.parapet,61,H+0.22,BZ0-0.02));
  roof.add(box(50.3,PAR,0.25,M.parapet,61,H+0.22,BZ1+0.02));
  roof.add(box(0.25,PAR,7.4,M.parapet,35.93,H+0.22,7.5));
  roof.add(box(0.25,PAR,7.4,M.parapet,86.07,H+0.22,7.5));
  // caissons d'enseigne sur l'acrotère, tournés vers le sud
  roof.add(box(6.0,1.15,0.3,M.ochre,80,H+0.15,BZ1+0.2));
  roof.add(box(8.0,1.15,0.3,M.blue,57,H+0.15,BZ1+0.2));

  // portes d'entrée + auvents
  bldg.add(box(1.6,2.6,0.16,M.dark,78,0,BZ1+0.02,false));
  bldg.add(box(1.8,2.6,0.16,M.dark,70.9,0,BZ1+0.02,false));
  bldg.add(box(3.2,0.16,1.8,M.white,78,3.2,BZ1+0.9));
  bldg.add(box(3.4,0.16,1.8,M.white,70.9,3.2,BZ1+0.9));

  /* ---------- aménagement intérieur ---------- */
  var interior=new THREE.Group(); bldg.add(interior);
  // cloisons
  interior.add(box(0.1,3.0,7,M.panelSide,73,0,7.5,false));   // gaming / fast food
  interior.add(box(0.1,3.0,7,M.panelSide,75,0,7.5,false));   // bloc sanitaire
  interior.add(box(0.1,3.0,7,M.panelSide,41,0,7.5,false));   // salle de tournois
  interior.add(box(0.1,3.0,7,M.panelSide,38,0,7.5,false));   // personnel / stock

  // fast food : cuisine, comptoir, salle
  interior.add(box(0.7,1.0,6.6,M.steel,85.4,0,7.5));
  interior.add(box(3.6,1.0,0.7,M.steel,83.8,0,4.6));
  interior.add(box(0.9,1.15,6.2,M.white,81.2,0,7.5));
  interior.add(box(0.95,0.1,6.2,M.ochre,81.2,1.15,7.5,false));
  for(var a=0;a<4;a++){ for(var b=0;b<2;b++){
    var tx=76.2+a*1.45, tz=5.2+b*3.2;
    var t=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.75,12),M.white);
    t.position.set(tx,0.38,tz); t.castShadow=true; interior.add(t);
    interior.add(box(0.4,0.45,0.4,M.ochre,tx,0,tz-0.75,false));
    interior.add(box(0.4,0.45,0.4,M.ochre,tx,0,tz+0.75,false));
  }}

  // gaming : deux rangées de PC le long des murs
  interior.add(box(11.6,0.75,0.85,M.dark,64,0,5.0));
  interior.add(box(11.6,0.75,0.85,M.dark,64,0,10.0));
  for(var k=0;k<12;k++){
    var px=58.7+k*1.0;
    interior.add(box(0.72,0.42,0.06,M.screen,px,0.78,5.3,false));
    interior.add(box(0.72,0.42,0.06,M.screen,px,0.78,9.7,false));
    interior.add(box(0.5,0.5,0.5,M.red,px,0,6.1,false));
    interior.add(box(0.5,0.5,0.5,M.red,px,0,8.9,false));
    interior.add(box(0.12,0.55,0.5,M.dark,px,0.5,6.1,false));
    interior.add(box(0.12,0.55,0.5,M.dark,px,0.5,8.9,false));
  }
  // coin consoles
  for(var c2=0;c2<4;c2++){
    var cx=50.6+c2*2.1;
    interior.add(box(1.6,1.2,0.1,M.screen2,cx,1.6,4.3,false));
    interior.add(box(1.6,1.2,0.1,M.screen2,cx,1.6,10.7,false));
    interior.add(box(1.5,0.6,1.0,M.blue,cx,0,5.6,false));
    interior.add(box(1.5,0.6,1.0,M.blue,cx,0,9.4,false));
  }
  // bornes d'arcade à jetons
  [[47.4,4.9],[46.0,4.9],[44.6,4.9],[47.4,10.1],[46.0,10.1],[44.6,10.1]].forEach(function(q){
    interior.add(box(1.05,1.9,0.95,M.ochre,q[0],0,q[1]));
    interior.add(box(0.8,0.7,0.15,M.screen,q[0],1.0,q[1]+(q[1]<7.5?0.55:-0.55),false));
  });
  interior.add(box(1.6,2.2,1.6,M.red,43.4,0,6.3));
  interior.add(box(1.6,2.2,1.6,M.blue,45.4,0,8.7));
  // postes de la salle de tournois
  [38.6,39.6,40.4].forEach(function(tx2){
    interior.add(box(0.7,0.75,0.9,M.dark,tx2,0,5.4,false));
    interior.add(box(0.7,0.75,0.9,M.dark,tx2,0,9.6,false));
  });
  // comptoir d'accueil et casiers
  interior.add(box(3.4,1.1,0.9,M.white,71.5,0,5.0));
  interior.add(box(3.45,0.1,0.95,M.blue,71.5,1.1,5.0,false));
  interior.add(box(0.5,1.9,2.2,M.panelSide,72.4,0,9.6));

  /* ---------- terrasse, cheminement, pelouse ---------- */
  at(28,41,50,2,M.pave,0.08);
  at(65,34,13,7,M.pave,0.08);
  at(28,34,37,7,M.lawn,0.08);
  [[67.2,35.8],[67.2,39.2],[71.5,35.8],[71.5,39.2],[75.8,35.8],[75.8,39.2]].forEach(function(q){
    var x=q[0], z=62-q[1];
    var t=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.75,14),M.white);
    t.position.set(x,0.38,z); t.castShadow=true; scene.add(t);
    var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.5,8),M.steel);
    pole.position.set(x,1.25,z); scene.add(pole);
    var can=new THREE.Mesh(new THREE.ConeGeometry(1.45,0.55,10),M.ochre);
    can.position.set(x,2.55,z); can.castShadow=true; scene.add(can);
    [[-0.95,0],[0.95,0],[0,-0.95],[0,0.95]].forEach(function(d){
      scene.add(box(0.38,0.45,0.38,M.white,x+d[0],0,z+d[1],false));
    });
  });

  /* quelques voitures seulement */
  function car(x,y,col){            // stationnement face nord-sud
    var g=new THREE.Group();
    g.add(box(1.75,0.75,4.3,mat(col),0,0.25,0));
    g.add(box(1.55,0.6,2.1,mat(0x2B3136),0,1.0,0.2,false));
    g.position.set(x,0,62-y); scene.add(g);
  }
  function carE(x,y,col){
    var g=new THREE.Group();
    g.add(box(4.3,0.75,1.75,mat(col),0,0.25,0));
    g.add(box(2.1,0.6,1.55,mat(0x2B3136),0.2,1.0,0,false));
    g.position.set(x,0,62-y); scene.add(g);
  }
  carE(81.5,16.25,0xD8DAD6); carE(81.5,28.75,0x3C4E63);
  carE(92.5,21.25,0x8A3F38); carE(92.5,36.25,0xBFC2BD);

  /* voitures qui passent sur la route publique */
  var traffic=[];
  function roadCar(col,axis,x,y,dir,speed){
    var g=new THREE.Group();
    if(axis==='z'){
      g.add(box(1.75,0.75,4.3,mat(col),0,0.25,0));
      g.add(box(1.55,0.6,2.1,mat(0x2B3136),0,1.0,0.2*dir,false));
    }else{
      g.add(box(4.3,0.75,1.75,mat(col),0,0.25,0));
      g.add(box(2.1,0.6,1.55,mat(0x2B3136),0.2*dir,1.0,0,false));
    }
    g.position.set(x,0,62-y); scene.add(g);
    traffic.push({g:g,axis:axis,dir:dir,speed:speed});
  }
  roadCar(0xD8DAD6,'z',-8,10,1,9);
  roadCar(0x3C4E63,'z',-8,46,1,11);
  roadCar(0xB4483C,'z',-14,58,-1,10);
  roadCar(0xC3C6C1,'x',20,-9,1,12);
  roadCar(0x4A6A80,'x',86,-3,-1,10);
  roadCar(0xD8DAD6,'x',52,-3,-1,13);
  function moveTraffic(dt){
    for(var i=0;i<traffic.length;i++){
      var c=traffic[i], p=c.g.position;
      if(c.axis==='z'){
        p.z -= c.dir*c.speed*dt;            // dir 1 = vers le nord
        if(p.z<-20) p.z=80; if(p.z>80) p.z=-20;
      }else{
        p.x += c.dir*c.speed*dt;            // dir 1 = vers l'est
        if(p.x>122) p.x=-20; if(p.x<-20) p.x=122;
      }
    }
  }

  /* étiquettes des deux zones */
  var lff=label('FAST FOOD','#C98A2E','#FFFFFF',15);
  lff.position.set(71.5,9.5,15.5); scene.add(lff);
  var lgz=label('ESPACE GAMING','#2F6E9C','#FFFFFF',18);
  lgz.position.set(46,9.5,15.5); scene.add(lgz);

  /* ---------- navigation ---------- */
  var drag=false, lx=0, ly=0;
  function pt(e){ return e.touches? {x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; }
  function down(e){ drag=true; var q=pt(e); lx=q.x; ly=q.y; }
  function move(e){
    if(!drag) return;
    var q=pt(e);
    cam.az -= (q.x-lx)*0.006;
    cam.pol = Math.max(0.22, Math.min(1.24, cam.pol - (q.y-ly)*0.005));
    lx=q.x; ly=q.y; applyCam(); render();
    e.preventDefault();
  }
  function up(){ drag=false; }
  cv.addEventListener('mousedown',down); window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:true});
  cv.addEventListener('touchmove',move,{passive:false});
  window.addEventListener('touchend',up);
  cv.addEventListener('wheel',function(e){
    cam.dist=Math.max(50,Math.min(300,cam.dist+e.deltaY*0.14));
    applyCam(); render(); e.preventDefault();
  },{passive:false});

  var roofOn=true;
  document.getElementById('btnRoof').addEventListener('click',function(){
    roofOn=!roofOn; roof.visible=roofOn;
    this.textContent = roofOn? 'Enlever le toit' : 'Remettre le toit';
    render();
  });
  document.getElementById('btnView').addEventListener('click',function(){
    cam.az=CAM0.az; cam.pol=CAM0.pol; cam.dist=CAM0.dist; applyCam(); render();
  });

  function resize(){
    var w=host.clientWidth, h=host.clientHeight;
    renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
    render();
  }
  function render(){ renderer.render(scene,camera); }
  window.addEventListener('resize',resize);

  /* une seule animation : la caméra se rapproche au chargement */
  try{ applyCam(); resize(); }
  catch(err){ fail('La vue 3D s\u2019est interrompue pendant le rendu.', String(err && err.message || err)); return; }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clock=new THREE.Clock(), intro=reduce?1:0, d0=240;
  if(!intro){ cam.dist=d0; applyCam(); }
  (function loop(){
    requestAnimationFrame(loop);
    var dt=Math.min(clock.getDelta(),0.1);
    if(!reduce) moveTraffic(dt);
    if(intro<1){
      intro=Math.min(1,intro+dt/1.4);
      var e=1-Math.pow(1-intro,3);
      cam.dist=d0+(CAM0.dist-d0)*e; applyCam();
    }
    renderer.render(scene,camera);
  })();
})();
