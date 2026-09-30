/* Plan du bâtiment 8,00 x 30,00 m = 240 m².
   Espace gaming 160 m² (x 0..20), fast food 80 m² (x 20..30).
   Tout est décrit en mètres ; l'axe y part de la façade sud vitrée (y=0)
   vers le mur nord (y=8). */

function Plan(scale, ox, oy, w, h){ this.s=scale; this.ox=ox; this.oy=oy; this.w=w; this.h=h; this.o=[]; }
Plan.prototype.X=function(x){ return (this.ox+this.s*x).toFixed(2); };
Plan.prototype.Y=function(y){ return (this.oy-this.s*y).toFixed(2); };
Plan.prototype.add=function(t){ this.o.push(t); };
Plan.prototype.rect=function(x,y,w,h,cls,extra){
  this.add('<rect x="'+this.X(x)+'" y="'+this.Y(y+h)+'" width="'+(this.s*w).toFixed(2)+
  '" height="'+(this.s*h).toFixed(2)+'" class="'+cls+'" '+(extra||'')+'/>');
};
Plan.prototype.line=function(x1,y1,x2,y2,cls){
  this.add('<line x1="'+this.X(x1)+'" y1="'+this.Y(y1)+'" x2="'+this.X(x2)+'" y2="'+this.Y(y2)+'" class="'+cls+'"/>');
};
Plan.prototype.circ=function(x,y,r,cls){
  this.add('<circle cx="'+this.X(x)+'" cy="'+this.Y(y)+'" r="'+(this.s*r).toFixed(2)+'" class="'+cls+'"/>');
};
Plan.prototype.arc=function(x,y,r,cls){
  this.add('<path d="M '+this.X(x)+' '+this.Y(y)+' A '+(this.s*r)+' '+(this.s*r)+
  ' 0 0 1 '+this.X(x+r)+' '+this.Y(y+r)+'" class="'+cls+'"/>');
};
Plan.prototype.text=function(x,y,t,cls,anchor,rot){
  var px=this.X(x), py=this.Y(y);
  var tr = rot? ' transform="rotate('+rot+','+px+','+py+')"':'';
  this.add('<text x="'+px+'" y="'+py+'" class="'+(cls||'t-lbl')+'" text-anchor="'+(anchor||'middle')+
  '" dy="0.35em"'+tr+'>'+t+'</text>');
};
Plan.prototype.dimH=function(x1,x2,y,label){
  var t=0.22;
  this.line(x1,y,x2,y,'st-dim');
  this.line(x1,y-t,x1,y+t,'st-dim'); this.line(x2,y-t,x2,y+t,'st-dim');
  this.text((x1+x2)/2, y+0.42, label,'t-dim');
};
Plan.prototype.dimV=function(y1,y2,x,label){
  var t=0.22;
  this.line(x,y1,x,y2,'st-dim');
  this.line(x-t,y1,x+t,y1,'st-dim'); this.line(x-t,y2,x+t,y2,'st-dim');
  this.text(x-0.42,(y1+y2)/2,label,'t-dim','middle',-90);
};
Plan.prototype.html=function(){
  return '<svg viewBox="0 0 '+this.w+' '+this.h+'" width="100%" xmlns="http://www.w3.org/2000/svg" role="img">'+
  this.o.join('')+'</svg>';
};

(function(){
  var host=document.getElementById('planSheet');
  if(!host) return;
  var S=26, p=new Plan(S, 104, 320, 936, 528);
  var D=8;                                  // profondeur du bâtiment

  /* aplats des deux zones */
  p.rect(0,0,20,D,'fill-gz');
  p.rect(20,0,10,D,'fill-ff');

  /* ---------- espace gaming : le jeu à jetons domine ---------- */
  // réserve et local technique 0..2
  p.rect(0.2,0.25,1.6,0.6,'furn'); p.rect(0.2,7.15,1.6,0.6,'furn');
  p.rect(1.2,2.4,0.6,3.2,'furn');
  p.text(0.95,4.0,'RÉSERVE','t-room','middle',-90);
  p.text(1.6,4.0,'16 m²','t-small','middle',-90);
  // pc gaming 2..5 : 8 postes seulement
  p.rect(2.25,6.95,2.5,0.8,'furn-d');
  p.rect(2.25,0.25,2.5,0.8,'furn-d');
  for(var k=0;k<4;k++){
    var px=2.4+k*0.6;
    p.rect(px,7.1,0.35,0.1,'furn'); p.circ(px+0.17,6.5,0.22,'furn');
    p.rect(px,0.95,0.35,0.1,'furn'); p.circ(px+0.17,1.55,0.22,'furn');
  }
  p.text(3.5,4.3,'PC GAMING','t-room');
  p.text(3.5,3.6,'8 POSTES — 24 m²','t-small');
  // consoles 5..8
  for(var c=0;c<3;c++){
    var cx=5.4+c*0.85;
    p.rect(cx,0.2,0.6,0.22,'furn-d'); p.rect(cx,0.85,0.6,0.5,'furn');
    p.rect(cx,6.65,0.6,0.5,'furn');   p.rect(cx,7.58,0.6,0.22,'furn-d');
  }
  p.text(6.5,4.3,'CONSOLES','t-room');
  p.text(6.5,3.6,'24 m²','t-small');
  // jeux à jetons grand format 8..12
  p.rect(8.4,0.6,2.2,1.3,'furn-d');  p.text(9.5,1.25,'BILLARD','t-tiny');
  p.rect(8.4,3.35,2.2,1.3,'furn-d'); p.text(9.5,4.0,'AIR HOCKEY','t-tiny');
  p.rect(8.4,6.1,2.2,1.3,'furn-d');  p.text(9.5,6.75,'BABY-FOOT','t-tiny');
  p.rect(11.0,0.4,0.8,1.5,'furn-d'); p.text(11.4,1.15,'BOXE','t-tiny','middle',-90);
  p.rect(11.0,2.2,0.8,1.5,'furn-d'); p.text(11.4,2.95,'PINCE','t-tiny','middle',-90);
  p.rect(11.0,4.0,0.8,1.5,'furn-d'); p.text(11.4,4.75,'BASKET','t-tiny','middle',-90);
  p.rect(11.0,5.8,0.8,1.5,'furn-d'); p.text(11.4,6.55,'COURSE','t-tiny','middle',-90);
  p.text(10.0,-0.75,'JEUX GRAND FORMAT  32 m²','t-small');
  // arcade à jetons 12..18 : deux murs de bornes + un îlot
  for(var n=0;n<8;n++){
    p.rect(12.25+n*0.72,0.25,0.56,0.95,'furn-d');
    p.rect(12.25+n*0.72,6.8,0.56,0.95,'furn-d');
  }
  for(var m2=0;m2<7;m2++){
    p.rect(12.5+m2*0.72,3.05,0.56,0.9,'furn-d');
    p.rect(12.5+m2*0.72,4.05,0.56,0.9,'furn-d');
  }
  p.text(15.0,2.35,'ARCADE À JETONS — 30 BORNES','t-room');
  p.text(15.0,1.65,'48 m²','t-small');
  // accueil, monnayeur et casiers 18..20
  p.rect(18.25,0.4,0.55,2.6,'furn-d'); p.text(18.5,1.7,'MONNAYEUR','t-tiny','middle',-90);
  p.rect(18.25,5.4,1.5,2.35,'furn');   p.text(19.0,6.55,'CASIERS','t-tiny');
  p.text(19.3,3.5,'ACCUEIL','t-room','middle',-90);
  p.text(19.3,1.9,'16 m²','t-small','middle',-90);

  /* ---------- fast food ---------- */
  // wc unique et réserve 20..22
  p.rect(20.2,0.25,1.6,2.3,'furn'); p.text(21.0,1.4,'WC','t-tiny');
  p.rect(20.2,2.85,1.6,4.9,'furn'); p.text(21.0,5.3,'RÉSERVE','t-tiny');
  // commande et attente 22..24.5
  p.rect(22.3,0.3,2.0,0.45,'furn');  p.text(23.3,0.52,'TABLETTE','t-tiny');
  p.rect(22.3,7.25,2.0,0.45,'furn'); p.text(23.3,7.47,'TABLETTE','t-tiny');
  for(var q=0;q<3;q++){ p.circ(22.7+q*0.7,2.2,0.2,'furn'); }
  p.text(23.25,4.6,'COMMANDE','t-room');
  p.text(23.25,3.9,'ET ATTENTE','t-room');
  p.text(23.25,3.2,'20 m²','t-small');
  // comptoir et caisse 24.5..26
  p.rect(24.7,0.5,0.9,7.0,'furn-d');
  p.rect(25.7,3.2,0.3,1.6,'furn'); p.text(25.85,4.0,'CAISSE','t-tiny','middle',-90);
  p.text(25.15,4.0,'COMPTOIR','t-room','middle',-90);
  p.text(26.4,4.0,'12 m²','t-small','middle',-90);
  // cuisine 26..29
  p.rect(26.2,0.25,2.6,0.75,'furn-d'); p.rect(26.2,7.0,2.6,0.75,'furn-d');
  p.rect(27.1,3.2,1.0,1.6,'furn');
  p.text(27.5,5.6,'CUISINE','t-room');
  p.text(27.5,4.9,'24 m²','t-small');
  // chambre froide et stock 29..30
  p.rect(29.15,0.3,0.7,3.4,'furn-d'); p.text(29.5,2.0,'FROID','t-tiny','middle',-90);
  p.rect(29.15,4.3,0.7,3.4,'furn-d'); p.text(29.5,6.0,'STOCK','t-tiny','middle',-90);

  /* cloisons */
  [2,5,8,12,18,20,22,24.5,26,29].forEach(function(x){
    p.line(x,0,x,D,'st-part');
  });

  /* murs et façade vitrée */
  p.rect(0,0,30,D,'st-wall');
  p.line(20,0,20,D,'st-zone');
  p.rect(0.4,-0.16,19.2,0.32,'fill-glass'); p.rect(0.4,-0.16,19.2,0.32,'st-thin');
  p.rect(20.4,-0.16,9.2,0.32,'fill-glass'); p.rect(20.4,-0.16,9.2,0.32,'st-thin');

  /* portes */
  function door(x,w,cls){
    p.line(x,0,x+w,0,cls);
    p.add('<path d="M '+p.X(x+w)+' '+p.Y(0)+' A '+(S*w)+' '+(S*w)+' 0 0 1 '+
      p.X(x+w)+' '+p.Y(w)+'" class="st-thin"/>');
  }
  door(18.4,1.3,'st-blue');   p.text(19.05,-0.75,'ENTRÉE GAMING','t-small');
  door(22.5,1.3,'st-ochre');  p.text(23.15,-1.55,'ENTRÉE FAST FOOD','t-small');
  p.line(30,3.8,30,5.2,'st'); p.text(30.6,4.5,'LIVRAISONS','t-small','start');
  p.text(24,-3.55,'PAS DE SALLE INTÉRIEURE — ON CONSOMME EN TERRASSE OU À EMPORTER','t-small');
  p.line(6.2,D,7.4,D,'st');   p.text(6.8,8.55,'ISSUE DE SECOURS','t-small');
  p.line(14.6,D,15.8,D,'st'); p.text(15.2,8.55,'ISSUE DE SECOURS','t-small');

  /* portiques tous les 5,00 m */
  for(var f=0;f<=6;f++){ p.line(f*5,-0.45,f*5,-0.12,'st-thin'); }
  p.text(15,9.9,'PORTIQUES MÉTALLIQUES TOUS LES 5,00 m — PORTÉE LIBRE 8,00 m','t-small');

  /* titres des deux zones */
  p.text(10,11.6,'ESPACE GAMING','t-zone');
  p.text(10,10.7,'160 m² — 20,00 m','t-small');
  p.text(25,11.6,'FAST FOOD','t-zone');
  p.text(25,10.7,'80 m² — 10,00 m','t-small');

  /* chaînes de cotes */
  p.dimH(0,2,-2.6,'2,00');      p.dimH(2,5,-2.6,'3,00');
  p.dimH(5,8,-2.6,'3,00');      p.dimH(8,12,-2.6,'4,00');
  p.dimH(12,18,-2.6,'6,00');    p.dimH(18,20,-2.6,'2,00');
  p.dimH(20,22,-2.6,'2,00');    p.dimH(22,24.5,-2.6,'2,50');
  p.dimH(24.5,26,-2.6,'1,50');  p.dimH(26,29,-2.6,'3,00');
  p.dimH(29,30,-2.6,'1,00');
  p.dimH(0,20,-4.1,'20,00');    p.dimH(20,30,-4.1,'10,00');
  p.dimH(0,30,-5.6,'30,00 m');
  p.dimV(0,D,-1.6,'8,00');
  p.text(-2.6,4.0,'240 m²','t-zone','middle',-90);

  host.innerHTML=p.html();
})();
