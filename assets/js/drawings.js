/* 2D drawings: site plan, floor plan, elevation and cross section.
   Everything is described in metres and converted to SVG units by the Plan helper. */


/* ============================================================
   Small drawing helper — everything is drawn in metres, y up.
   ============================================================ */
function Plan(scale, ox, oy, w, h){
  this.s=scale; this.ox=ox; this.oy=oy; this.w=w; this.h=h; this.o=[];
}
Plan.prototype.X=function(x){
  var xx=(this.flip==null)?x:(this.flip-x);
  return (this.ox+this.s*xx).toFixed(2);
};
Plan.prototype.Y=function(y){return (this.oy-this.s*y).toFixed(2);};
Plan.prototype.add=function(s){this.o.push(s);};
Plan.prototype.rect=function(x,y,w,h,cls,extra){
  var xa=+this.X(x), xb=+this.X(x+w);
  this.add('<rect x="'+Math.min(xa,xb).toFixed(2)+'" y="'+this.Y(y+h)+'" width="'+(this.s*w).toFixed(2)+
  '" height="'+(this.s*h).toFixed(2)+'" class="'+cls+'" '+(extra||'')+'/>');
};
Plan.prototype.line=function(x1,y1,x2,y2,cls){
  this.add('<line x1="'+this.X(x1)+'" y1="'+this.Y(y1)+'" x2="'+this.X(x2)+'" y2="'+this.Y(y2)+'" class="'+cls+'"/>');
};
Plan.prototype.circ=function(x,y,r,cls){
  this.add('<circle cx="'+this.X(x)+'" cy="'+this.Y(y)+'" r="'+(this.s*r).toFixed(2)+'" class="'+cls+'"/>');
};
Plan.prototype.poly=function(pts,cls){
  var d=pts.map(function(p){return this.X(p[0])+','+this.Y(p[1]);},this).join(' ');
  this.add('<polyline points="'+d+'" class="'+cls+'"/>');
};
Plan.prototype.text=function(x,y,s,cls,anchor,rot,dy){
  var px=this.X(x), py=this.Y(y);
  var tr = rot? ' transform="rotate('+rot+','+px+','+py+')"':'';
  this.add('<text x="'+px+'" y="'+py+'" class="'+(cls||'t-lbl')+'" text-anchor="'+(anchor||'middle')+
  '" dy="'+(dy===undefined?'0.35em':dy)+'"'+tr+'>'+s+'</text>');
};
/* horizontal dimension with architectural ticks */
Plan.prototype.dimH=function(x1,x2,y,label,above){
  var t=0.55, up = above===false?-1:1;
  this.line(x1,y,x2,y,'st-dim');
  this.line(x1,y-t,x1,y+t,'st-dim'); this.line(x2,y-t,x2,y+t,'st-dim');
  this.text((x1+x2)/2, y+up*1.15, label||((x2-x1).toFixed(2)), 't-dim');
};
Plan.prototype.dimV=function(y1,y2,x,label,left){
  var t=0.55, dir = left===false?1:-1;
  this.line(x,y1,x,y2,'st-dim');
  this.line(x-t,y1,x+t,y1,'st-dim'); this.line(x-t,y2,x+t,y2,'st-dim');
  this.text(x+dir*1.15,(y1+y2)/2,label||((y2-y1).toFixed(2)),'t-dim','middle',-90);
};
Plan.prototype.html=function(){
  return '<svg viewBox="0 0 '+this.w+' '+this.h+'" width="100%" xmlns="http://www.w3.org/2000/svg" role="img">'+
  this.o.join('')+'</svg>';
};

/* ============================================================
   02 — SITE PLAN
   metres: plot 0..40 (E) x 0..66 (N). Marjane east. Road west+south.
   ============================================================ */
(function(){
  var S=8, p=new Plan(S, 44*S, 76*S, 106*S, 92*S);

  /* --- context: roads --- */
  p.rect(-18,-16,14,92,'fill-asph');                 // north-south public road
  p.rect(-18,-14,80,12,'fill-asph');                 // east-west public road
  for(var y=-14;y<76;y+=6){ p.line(-11,y,-11,y+3.2,'st-mark'); }
  for(var x=-4;x<62;x+=6){ p.line(x,-8,x+3.2,-8,'st-mark'); }
  p.rect(-4,-2,4,78,'fill-pave'); p.rect(-4,-2,4,78,'st-thin');   // sidewalk
  p.text(-11,40,'PUBLIC ROAD','t-ctx','middle',-90);
  p.text(24,-8,'PUBLIC ROAD','t-ctx');

  /* --- context: Afriquia fuel station --- */
  p.rect(-42,2,24,30,'fill-ctx'); p.rect(-42,2,24,30,'st-thin');
  p.rect(-40,10,16,14,'fill-plot'); p.rect(-40,10,16,14,'st');
  [[-36,13],[-36,20],[-28,13],[-28,20]].forEach(function(q){
    p.rect(q[0]-0.8,q[1]-1.2,1.6,2.4,'furn-d');
  });
  p.rect(-40,3,9,5,'fill-bldg'); p.rect(-40,3,9,5,'st');
  p.text(-35.5,5.5,'SHOP','t-small');
  p.text(-30,26.6,'AFRIQUIA','t-ctx');
  p.text(-30,23.3,'FUEL STATION','t-small');

  /* --- context: Marjane --- */
  p.rect(44,2,18,64,'fill-ctx'); p.rect(44,2,18,64,'st');
  for(var i=1;i<25;i++){ p.line(44,2+i*2.6,62,2+i*2.6,'st-thin'); }
  p.text(53,34,'MARJANE','t-ctx','middle',-90);
  p.rect(40,0,4,66,'fill-asph'); p.line(42,0,42,66,'st-dash');
  p.text(42,60,'SERVICE LANE','t-small','middle',-90);

  /* --- plot --- */
  p.rect(0,0,40,66,'fill-plot');

  /* lawn */
  ['0,8,4,50','14,8,3,37','0,58,17,1','0,64.5,40,1.5','0,0,17,1','39,8,1,50','17,59,23,0'].forEach(function(r){
    var a=r.split(',').map(Number); if(a[3]>0) p.rect(a[0],a[1],a[2],a[3],'fill-lawn');
  });

  /* drives + aisles + parking bays surface */
  p.rect(0,1,40,5.5,'fill-asph');     // entry drive (south, one-way in)
  p.rect(0,59,40,5.5,'fill-asph');    // exit drive (north, one-way out)
  p.rect(17,6.5,6,52.5,'fill-asph');  // aisle 1
  p.rect(28,6.5,6,52.5,'fill-asph');  // aisle 2
  p.rect(23,8,5,50,'fill-asph');      // row 1
  p.rect(34,8,5,50,'fill-asph');      // row 2
  p.rect(11,1,6,5.5,'fill-asph');     // two-wheeler
  p.rect(0,6.5,17,1.5,'fill-pave');   // pedestrian link from gate

  /* parking bays */
  function bays(x0,x1,ys,n,w){
    for(var i=0;i<n;i++){ var y=ys+i*w; p.line(x0,y,x1,y,'st-mark'); }
    p.line(x0,ys+n*w,x1,ys+n*w,'st-mark');
    p.line(x0,ys,x0,ys+n*w,'st-mark');
  }
  bays(23,28,8,2,3.3);           // PMR
  bays(23,28,14.6,17,2.5);
  bays(34,39,8,20,2.5);
  p.text(25.5,9.65,'♿','t-dim'); p.text(25.5,12.95,'♿','t-dim');

  /* flow arrows */
  function arrow(x1,y1,x2,y2){
    p.line(x1,y1,x2,y2,'st-dash');
    var a=Math.atan2(y2-y1,x2-x1), L=1.5;
    p.poly([[x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4)],[x2,y2],
            [x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4)]],'st-dash');
  }
  arrow(-2,3.7,16,3.7); arrow(19,3.7,31,3.7); arrow(31,10,31,55);
  arrow(31,61.7,22,61.7); arrow(19,61.7,-2,61.7); arrow(20,55,20,12);

  /* --- building 7 x 50 --- */
  p.rect(4,8,7,37,'fill-gz');    // gaming — south
  p.rect(4,45,7,13,'fill-ff');   // fast food — north
  p.rect(4,8,7,50,'st-wall');
  p.line(4,45,11,45,'st-part');
  /* glazed east facade */
  p.rect(10.75,9.5,0.5,35,'fill-glass'); p.rect(10.75,9.5,0.5,35,'st-thin');
  p.rect(10.75,45.5,0.5,12,'fill-glass'); p.rect(10.75,45.5,0.5,12,'st-thin');
  /* doors */
  p.line(11,49.2,11,50.8,'st-ochre'); p.text(12.4,50,'ENTRY','t-small','start');
  p.line(11,42,11,43.8,'st-blue');    p.text(12.4,42.9,'ENTRY','t-small','start');
  p.line(4,55,4,56.5,'st'); p.text(2.5,55.8,'SERVICE','t-small','middle',-90);
  p.line(4,11,4,12.5,'st'); p.line(4,25,4,26.5,'st');
  p.text(2.5,11.8,'EXIT','t-small','middle',-90); p.text(2.5,25.8,'EXIT','t-small','middle',-90);

  p.text(7.5,51.5,'FAST FOOD','t-zone','middle',-90);
  p.text(7.5,55.4,'91 m²','t-room','middle',-90);
  p.text(7.5,26,'GAMING ZONE','t-zone','middle',-90);
  p.text(7.5,32.5,'259 m²','t-room','middle',-90);

  /* terrace */
  p.rect(11,45,6,13,'fill-pave'); p.rect(11,45,6,13,'st-thin');
  [[12.7,47],[15.2,47],[12.7,51],[15.2,51],[12.7,55],[15.2,55]].forEach(function(q){
    p.circ(q[0],q[1],1.1,'st-thin'); p.circ(q[0],q[1],0.55,'furn');
  });
  p.text(14,45.9,'TERRACE 78 m²','t-small');

  /* walkway + service yards */
  p.rect(11,8,3,37,'fill-pave'); p.rect(11,8,3,37,'st-thin');
  p.text(12.5,26,'PEDESTRIAN WALKWAY','t-small','middle',-90);
  p.rect(1,9,3,4,'fill-pave'); p.rect(1,9,3,4,'st-thin'); p.text(2.5,15,'TECH','t-small');
  p.rect(1,53,3,5,'fill-pave'); p.rect(1,53,3,5,'st-thin'); p.text(2.5,51,'BINS','t-small');

  /* lawn labels */
  p.text(15.5,30,'LAWN','t-small','middle',-90);
  p.text(2,34,'LAWN','t-small','middle',-90);
  p.text(14,3.7,'2-WHEELERS','t-small');
  p.text(25.5,60.5,'39 PARKING SPACES  (37 + 2 PMR)','t-small');

  /* gates */
  p.line(0,1,0,6.5,'st-ochre'); p.text(-1.6,3.7,'VEHICLE IN','t-small','middle',-90);
  p.line(0,59,0,64.5,'st-ochre'); p.text(-1.6,61.7,'VEHICLE OUT','t-small','middle',-90);

  /* plot boundary */
  p.rect(0,0,40,66,'st-lot');

  /* dimensions */
  p.dimH(0,40,-4.6,'40.00 m');
  p.dimH(4,11,70.5,'7.00');
  p.dimV(8,58,-8.5,'50.00 m');
  p.dimV(0,66,-13.5,'66.00 m');

  /* north arrow + scale bar */
  p.line(-38,60,-38,68,'st'); p.poly([[-39.2,66],[-38,68],[-36.8,66]],'st');
  p.text(-38,70.5,'N','t-ctx');
  p.line(-42,-8,-22,-8,'st');
  [-42,-37,-32,-27,-22].forEach(function(x){p.line(x,-8,x,-6.6,'st');});
  p.rect(-42,-8,5,0.9,'fill-bldg'); p.rect(-32,-8,5,0.9,'fill-bldg');
  p.rect(-37,-8,5,0.9,'st'); p.rect(-27,-8,5,0.9,'st');
  p.text(-42,-10.5,'0','t-small'); p.text(-22,-10.5,'20 m','t-small');

  document.getElementById('sitePlan').innerHTML=p.html();
})();

/* ============================================================
   03 — FLOOR PLAN  (length along x 0..50, width along y 0..7)
   ============================================================ */
(function(){
  var S=16, p=new Plan(S, 40, 180, 930, 364);
  p.flip=50;   // fast food now at the north end, drawn on the right

  /* zone fills */
  p.rect(0,0,13,7,'fill-ff');
  p.rect(13,0,37,7,'fill-gz');

  /* ---- fast food ---- */
  // kitchen 0-4
  p.rect(0.15,0.15,1.6,2.0,'furn-d'); p.text(0.95,1.15,'COLD','t-small');
  p.rect(0.15,4.9,1.6,1.95,'furn-d'); p.text(0.95,5.85,'STORE','t-small');
  p.rect(2.0,0.15,1.9,0.75,'furn'); p.rect(2.0,6.1,1.9,0.75,'furn');
  p.rect(2.3,2.6,1.4,1.8,'furn');
  p.text(2.95,5.0,'KITCHEN','t-room');
  p.text(2.95,4.3,'28 m²','t-small');
  p.line(4,0,4,7,'st-part');
  // counter 4-5.5
  p.rect(4.25,0.4,0.9,6.2,'furn-d');
  p.text(4.7,3.5,'COUNTER','t-room','middle',-90);
  // seating 5.5 - 11
  p.line(5.5,0,5.5,7,'st-thin');
  for(var i=0;i<4;i++){ for(var j=0;j<2;j++){
    var cx=6.35+i*1.45, cy=1.8+j*3.4;
    p.circ(cx,cy,0.45,'furn');
    p.rect(cx-0.7,cy-0.22,0.28,0.44,'furn'); p.rect(cx+0.42,cy-0.22,0.28,0.44,'furn');
  }}
  p.text(10.3,3.5,'SEATING 38.5 m²','t-room','middle',-90);
  // sanitary 11-13
  p.line(11,0,11,7,'st-part');
  p.rect(11.2,0.2,1.6,2.1,'furn'); p.text(12,1.25,'WC M','t-small');
  p.rect(11.2,2.45,1.6,2.1,'furn'); p.text(12,3.5,'WC W','t-small');
  p.rect(11.2,4.7,1.6,2.1,'furn'); p.text(12,5.75,'WC PMR','t-small');

  /* ---- gaming zone ---- */
  p.line(13,0,13,7,'st-part');
  // reception 13-16
  p.rect(13.3,0.4,0.85,3.4,'furn-d'); p.text(13.7,2.1,'TOKENS','t-small','middle',-90);
  p.rect(13.3,5.0,2.4,1.8,'furn'); p.text(14.5,5.9,'LOCKERS','t-small');
  p.text(15.2,3.3,'RECEPTION','t-room','middle',-90);
  p.line(16,0,16,7,'st-thin');
  // pc gaming 16-28 : two rows of 12
  p.rect(16.2,0.25,11.6,0.85,'furn-d');
  p.rect(16.2,5.9,11.6,0.85,'furn-d');
  for(var k=0;k<12;k++){
    var x=16.7+k*1.0;
    p.line(x-0.5,0.25,x-0.5,1.1,'st-thin'); p.line(x-0.5,5.9,x-0.5,6.75,'st-thin');
    p.rect(x-0.28,0.85,0.56,0.12,'furn'); p.rect(x-0.28,6.03,0.56,0.12,'furn');
    p.circ(x,1.65,0.28,'furn'); p.circ(x,5.35,0.28,'furn');
  }
  p.text(22,3.5,'PC GAMING — 24 STATIONS  84 m²','t-room');
  p.line(28,0,28,7,'st-thin');
  // consoles 28-37
  for(var c=0;c<4;c++){
    var bx=28.6+c*2.1;
    p.rect(bx,0.3,1.5,0.35,'furn-d');      // screen
    p.rect(bx,1.3,1.5,0.6,'furn');         // sofa
    p.rect(bx,5.1,1.5,0.6,'furn');
    p.rect(bx,6.35,1.5,0.35,'furn-d');
  }
  p.text(32.5,3.5,'CONSOLES &amp; SCREENS  63 m²','t-room');
  p.line(37,0,37,7,'st-thin');
  // arcade 37-45
  for(var a=0;a<6;a++){
    var ax=37.4+a*1.25;
    p.rect(ax,0.25,0.95,1.0,'furn-d');
    p.rect(ax,5.75,0.95,1.0,'furn-d');
  }
  p.rect(38.2,2.7,1.6,1.6,'furn-d'); p.text(39,3.5,'CLAW','t-small');
  p.rect(40.4,2.7,1.6,1.6,'furn-d'); p.text(41.2,3.5,'HOOPS','t-small');
  p.rect(42.6,2.7,1.6,1.6,'furn-d'); p.text(43.4,3.5,'BOXER','t-small');
  p.text(41,1.9,'TOKEN ARCADE  56 m²','t-room');
  p.line(45,0,45,7,'st-part');
  // tournament + staff 45-50
  p.rect(45.3,0.4,0.8,1.0,'furn'); p.rect(46.4,0.4,0.8,1.0,'furn');
  p.rect(45.3,5.6,0.8,1.0,'furn'); p.rect(46.4,5.6,0.8,1.0,'furn');
  p.text(46.6,3.5,'TOURNAMENT','t-room','middle',-90);
  p.line(48,0,48,7,'st-part');
  p.text(49,3.5,'STAFF / STORE','t-room','middle',-90);

  /* walls */
  p.rect(0,0,50,7,'st-wall');
  /* glazed south-east long facade (drawn along y=0 edge) */
  p.rect(0.4,-0.18,12.2,0.36,'fill-glass'); p.rect(0.4,-0.18,12.2,0.36,'st-thin');
  p.rect(13.4,-0.18,36.2,0.36,'fill-glass'); p.rect(13.4,-0.18,36.2,0.36,'st-thin');

  /* doors */
  function door(x,w,cls){
    p.line(x,0,x+w,0,cls);
    p.add('<path d="M '+p.X(x)+' '+p.Y(0)+' A '+(S*w)+' '+(S*w)+' 0 0 0 '+p.X(x)+' '+p.Y(w)+
      '" class="st-thin"/>');
  }
  door(7.2,1.6,'st-ochre'); door(14.2,1.8,'st-blue');
  p.text(8.0,-1.5,'FAST FOOD ENTRANCE','t-small');
  p.text(15.1,-1.5,'GAMING ENTRANCE','t-small');
  p.line(1.4,7,2.6,7,'st'); p.text(2.0,8.0,'SERVICE','t-small');
  p.line(22,7,23.2,7,'st'); p.line(43.5,7,44.7,7,'st');
  p.text(22.6,8.0,'FIRE EXIT','t-small'); p.text(44.1,8.0,'FIRE EXIT','t-small');
  p.text(33,9.0,'WEST FACADE — SANDWICH PANEL, NO OPENINGS','t-small');
  p.text(33,-1.5,'EAST FACADE — FULLY GLAZED, FACING THE CAR PARK AND MARJANE','t-small');

  /* portal frames every 5 m */
  for(var f=0;f<=10;f++){
    p.line(f*5,-0.6,f*5,-0.1,'st-thin');
  }
  p.text(25,-2.6,'STEEL PORTAL FRAMES AT 5.00 m CENTRES — 7.00 m CLEAR SPAN','t-small');

  /* zone titles */
  p.text(6.5,9.9,'FAST FOOD','t-zone');
  p.text(31.5,9.9,'GAMING ZONE','t-zone');
  p.text(6.5,8.9,'91 m² — 13.00 m','t-small');
  p.text(31.5,8.9,'259 m² — 37.00 m','t-small');

  /* dimension chains */
  p.dimH(0,4,-4.2,'4.00'); p.dimH(4,5.5,-4.2,'1.50'); p.dimH(5.5,11,-4.2,'5.50');
  p.dimH(11,13,-4.2,'2.00'); p.dimH(13,16,-4.2,'3.00'); p.dimH(16,28,-4.2,'12.00');
  p.dimH(28,37,-4.2,'9.00'); p.dimH(37,45,-4.2,'8.00'); p.dimH(45,50,-4.2,'5.00');
  p.dimH(0,13,-6.9,'13.00'); p.dimH(13,50,-6.9,'37.00');
  p.dimH(0,50,-9.6,'50.00 m');
  p.dimV(0,7,-2.2,'7.00',false);

  document.getElementById('floorPlan').innerHTML=p.html();
})();

/* ============================================================
   04 — ELEVATION + SECTION
   ============================================================ */
(function(){
  var S=15, p=new Plan(S, 40, 150, 870, 235);
  p.flip=50;
  // ground
  p.line(-1,0,51,0,'st');
  // body
  p.rect(0,0,50,4.7,'fill-bldg'); p.rect(0,0,50,4.7,'st-wall');
  p.rect(0,4.7,50,0.5,'fill-ctx'); p.rect(0,4.7,50,0.5,'st');   // parapet band
  // base blockwork
  p.rect(0,0,50,1.0,'fill-ctx'); p.line(0,1.0,50,1.0,'st-thin');
  // glazing
  p.rect(0.5,1.0,12.0,3.3,'fill-glass'); p.rect(0.5,1.0,12.0,3.3,'st');
  p.rect(13.5,1.0,36.0,3.3,'fill-glass'); p.rect(13.5,1.0,36.0,3.3,'st');
  for(var x=2.5;x<49;x+=2.0){ if(x>12.5&&x<13.5) continue; p.line(x,1.0,x,4.3,'st-thin'); }
  p.line(12.5,0,12.5,5.2,'st-part');
  // doors
  p.rect(7.2,0,1.6,2.6,'fill-plot'); p.rect(7.2,0,1.6,2.6,'st-ochre');
  p.rect(14.2,0,1.8,2.6,'fill-plot'); p.rect(14.2,0,1.8,2.6,'st-blue');
  // sign boxes
  p.rect(5.0,4.85,6.0,1.15,'fill-bldg'); p.rect(5.0,4.85,6.0,1.15,'st-ochre');
  p.text(8.0,5.42,'FAST FOOD','t-lbl');
  p.rect(25.0,4.85,8.0,1.15,'fill-bldg'); p.rect(25.0,4.85,8.0,1.15,'st-blue');
  p.text(29.0,5.42,'GAMING ZONE','t-lbl');
  // labels
  p.text(6.0,-1.6,'sandwich panel + glazed shopfront','t-small');
  p.text(34,-1.6,'aluminium curtain wall, solar-control glazing','t-small');
  p.dimH(0,50,-3.4,'50.00 m');
  p.dimV(0,5.2,-1.6,'5.20',false);
  p.text(25,7.6,'EAST ELEVATION — facing the car park and Marjane','t-room');
  document.getElementById('elevation').innerHTML=p.html();

  var S2=30, q=new Plan(S2, 90, 210, 650, 310);
  q.line(-1.2,0,8.2,0,'st');
  q.rect(-0.6,-0.5,8.2,0.5,'fill-ctx'); q.rect(-0.6,-0.5,8.2,0.5,'st-thin');
  // slab
  q.rect(0,0,7,0.15,'fill-ctx'); q.rect(0,0,7,0.15,'st');
  // posts + rafter
  q.rect(0,0.15,0.18,4.5,'furn-d'); q.rect(6.82,0.15,0.18,4.5,'furn-d');
  q.poly([[0,4.65],[0,4.8],[7,4.95],[7,4.8]],'st');
  q.rect(0,4.8,7,0.16,'fill-ctx'); q.rect(0,4.8,7,0.16,'st');
  q.rect(-0.12,4.96,0.32,0.55,'fill-ctx'); q.rect(-0.12,4.96,0.32,0.55,'st'); // parapet west
  q.rect(6.8,4.96,0.32,0.55,'fill-ctx'); q.rect(6.8,4.96,0.32,0.55,'st');
  // west wall panel, east glazing
  q.rect(-0.06,0.15,0.12,4.5,'fill-ctx'); q.rect(-0.06,0.15,0.12,4.5,'st');
  q.rect(6.94,1.0,0.12,3.3,'fill-glass'); q.rect(6.94,1.0,0.12,3.3,'st');
  q.rect(6.94,0.15,0.12,0.85,'fill-ctx'); q.rect(6.94,0.15,0.12,0.85,'st');
  // interior hint
  q.rect(0.5,0.15,1.0,0.75,'furn-d'); q.rect(5.4,0.15,1.0,0.75,'furn-d');
  q.text(3.5,0.9,'gaming hall — no internal columns','t-small');
  q.dimH(0,7,-1.6,'7.00 m');
  q.dimV(0.15,4.65,-1.2,'4.50');
  q.dimV(0,5.51,8.6,'5.20',false);
  q.text(8.9,5.2,'3% fall to concealed gutter','t-small','start');
  q.text(8.9,4.55,'sandwich panel roof deck','t-small','start');
  q.text(8.9,2.6,'IPE 160 rafter / HEA 140 post','t-small','start');
  q.text(8.9,1.0,'blockwork base, 1.00 m','t-small','start');
  q.text(3.5,-2.9,'CROSS SECTION','t-room');
  document.getElementById('section').innerHTML=q.html();
})();
