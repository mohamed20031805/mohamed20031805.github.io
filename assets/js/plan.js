/* ============================================================
   PLANS COTÉS — Fqih Ben Saleh
   A-01  plan de masse ................ 1:400
   A-02  piste de lavage camionnette .. 1:50
   A-03  élévation du poste de lavage . 1:50
   Tout est décrit en mètres, repère : x vers l'est, y vers le nord.
   ============================================================ */

var FS = { 't-dim':11,'t-room':12,'t-small':10,'t-tiny':8.6,'t-ctx':11,
           't-zone':16,'t-ttl':15,'t-cart':9.5,'t-cartb':11,'t-lbl':11 };

/* uid : identifiant unique (motifs de hachure), s : pixels par mètre,
   puis les limites de la feuille en mètres. */
function Plan(uid, s, xmin, xmax, ymin, ymax){
  this.uid = uid; this.s = s;
  this.ox = -xmin * s; this.oy = ymax * s;
  this.w = (xmax - xmin) * s; this.h = (ymax - ymin) * s;
  this.o = [];
}
Plan.prototype.X = function(x){ return (this.ox + this.s * x).toFixed(2); };
Plan.prototype.Y = function(y){ return (this.oy - this.s * y).toFixed(2); };
Plan.prototype.add = function(t){ this.o.push(t); };
Plan.prototype.pat = function(n){ return 'url(#' + n + '-' + this.uid + ')'; };

/* --- primitives ------------------------------------------------ */
Plan.prototype.rect = function(x, y, w, h, cls, extra){
  this.add('<rect x="' + this.X(x) + '" y="' + this.Y(y + h) +
    '" width="' + (this.s * w).toFixed(2) + '" height="' + (this.s * h).toFixed(2) +
    '" class="' + cls + '" ' + (extra || '') + '/>');
};
/* surface hachurée : motif + contour */
Plan.prototype.area = function(x, y, w, h, pat, cls){
  this.rect(x, y, w, h, '', 'fill="' + this.pat(pat) + '" stroke="none"');
  if(cls) this.rect(x, y, w, h, cls);
};
Plan.prototype.line = function(x1, y1, x2, y2, cls){
  this.add('<line x1="' + this.X(x1) + '" y1="' + this.Y(y1) + '" x2="' + this.X(x2) +
    '" y2="' + this.Y(y2) + '" class="' + cls + '"/>');
};
Plan.prototype.circ = function(x, y, r, cls){
  this.add('<circle cx="' + this.X(x) + '" cy="' + this.Y(y) + '" r="' +
    (this.s * r).toFixed(2) + '" class="' + cls + '"/>');
};
Plan.prototype.poly = function(pts, cls){
  var d = pts.map(function(p){ return this.X(p[0]) + ',' + this.Y(p[1]); }, this).join(' ');
  this.add('<polyline points="' + d + '" class="' + cls + '" fill="none"/>');
};
Plan.prototype.tri = function(pts, cls){
  var d = pts.map(function(p){ return this.X(p[0]) + ',' + this.Y(p[1]); }, this).join(' ');
  this.add('<polygon points="' + d + '" class="' + cls + '"/>');
};
/* texte avec réserve blanche : il reste lisible par-dessus les hachures */
Plan.prototype.text = function(x, y, t, cls, anchor, rot, noHalo){
  cls = cls || 't-lbl';
  var px = +this.X(x), py = +this.Y(y), fs = FS[cls] || 11;
  var plain = String(t).replace(/&[a-z]+;/g, 'x');
  if(!noHalo){
    var w = plain.length * fs * 0.60 + 7, hh = fs * 1.35;
    var ax = anchor === 'start' ? -3 : anchor === 'end' ? -w + 3 : -w / 2;
    var r = '<rect x="' + (px + ax).toFixed(2) + '" y="' + (py - hh / 2).toFixed(2) +
      '" width="' + w.toFixed(2) + '" height="' + hh.toFixed(2) + '" fill="#FFFFFF" stroke="none"';
    if(rot) r += ' transform="rotate(' + rot + ',' + px + ',' + py + ')"';
    this.add(r + '/>');
  }
  var tr = rot ? ' transform="rotate(' + rot + ',' + px + ',' + py + ')"' : '';
  this.add('<text x="' + px + '" y="' + py + '" class="' + cls + '" text-anchor="' +
    (anchor || 'middle') + '" dy="0.35em"' + tr + '>' + t + '</text>');
};

/* --- cotation : ligne, bâtonnets à 45°, lignes d'attache -------- */
Plan.prototype.dimH = function(x1, x2, y, label, from){
  var e = 4 / this.s, g = 8 / this.s;
  this.line(x1, y, x2, y, 'dim');
  this.line(x1 - e, y - e, x1 + e, y + e, 'dim');
  this.line(x2 - e, y - e, x2 + e, y + e, 'dim');
  if(from !== undefined && from !== null){
    var d = y > from ? e : -e;
    this.line(x1, from, x1, y + d, 'ext'); this.line(x2, from, x2, y + d, 'ext');
  }
  this.text((x1 + x2) / 2, y + g, label, 't-dim');
};
Plan.prototype.dimV = function(y1, y2, x, label, from){
  var e = 4 / this.s, g = 8 / this.s;
  this.line(x, y1, x, y2, 'dim');
  this.line(x - e, y1 - e, x + e, y1 + e, 'dim');
  this.line(x - e, y2 - e, x + e, y2 + e, 'dim');
  if(from !== undefined && from !== null){
    var d = x > from ? e : -e;
    this.line(from, y1, x + d, y1, 'ext'); this.line(from, y2, x + d, y2, 'ext');
  }
  this.text(x - g, (y1 + y2) / 2, label, 't-dim', 'middle', -90);
};
/* flèche de sens */
Plan.prototype.arrow = function(x1, y1, x2, y2, cls, head){
  var hd = head || 6 / this.s;
  this.line(x1, y1, x2, y2, cls);
  var a = Math.atan2(y2 - y1, x2 - x1);
  this.tri([[x2, y2],
            [x2 - hd * Math.cos(a - 0.4), y2 - hd * Math.sin(a - 0.4)],
            [x2 - hd * Math.cos(a + 0.4), y2 - hd * Math.sin(a + 0.4)]], 'solid');
};
/* renvoi de détail */
Plan.prototype.bubble = function(x, y, n, r){
  r = r || 10 / this.s;
  this.circ(x, y, r, 'white');
  this.text(x, y, n, 't-small', 'middle', 0, true);
};
/* nord */
Plan.prototype.north = function(x, y, r){
  this.circ(x, y, r, 'box');
  this.tri([[x, y + r * 0.82], [x - r * 0.4, y - r * 0.5], [x, y - r * 0.18]], 'solid');
  this.poly([[x, y + r * 0.82], [x + r * 0.4, y - r * 0.5], [x, y - r * 0.18]], 'ink-fine');
  this.text(x, y - r * 1.55, 'N', 't-cartb');
};
/* échelle graphique, longueur L mètres, pas p */
Plan.prototype.scaleBar = function(x, y, L, p, h){
  h = h || 1.0;
  var n = L / p, i;
  for(i = 0; i < n; i++) this.rect(x + i * p, y, p, h, i % 2 ? 'box' : 'solid');
  this.rect(x, y, L, h, 'ink-fine');
  for(i = 0; i <= n; i += 2) this.text(x + i * p, y - h * 1.6, String(i * p), 't-tiny');
  this.text(x + L + p * 0.5, y + h * 0.5, 'm', 't-tiny', 'start');
};
Plan.prototype.html = function(){
  var u = this.uid;
  var defs =
    '<defs>' +
    '<pattern id="asph-' + u + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="8" height="8" fill="#F4F4F3"/><line x1="0" y1="0" x2="0" y2="8" stroke="#C3C5C2" stroke-width="1"/></pattern>' +
    '<pattern id="ctx-' + u + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="6" height="6" fill="#ECEDEA"/><line x1="0" y1="0" x2="0" y2="6" stroke="#8E8E8E" stroke-width="1"/></pattern>' +
    '<pattern id="lawn-' + u + '" width="9" height="9" patternUnits="userSpaceOnUse">' +
      '<rect width="9" height="9" fill="#FAFBF8"/>' +
      '<path d="M2 7 L2 3.4 M0.6 5 L2 3.4 L3.4 5" stroke="#A8B0A4" stroke-width=".9" fill="none"/>' +
      '<path d="M6.5 8.5 L6.5 5.4" stroke="#A8B0A4" stroke-width=".9" fill="none"/></pattern>' +
    '<pattern id="bet-' + u + '" width="10" height="10" patternUnits="userSpaceOnUse">' +
      '<rect width="10" height="10" fill="#F0F1EE"/>' +
      '<circle cx="2.5" cy="2.5" r=".7" fill="#B6B8B4"/><circle cx="7.5" cy="7" r=".55" fill="#B6B8B4"/>' +
      '<circle cx="8" cy="2" r=".45" fill="#B6B8B4"/></pattern>' +
    '<pattern id="terre-' + u + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="7" height="7" fill="#FFFFFF"/><line x1="0" y1="0" x2="0" y2="7" stroke="#0E0E0E" stroke-width=".8"/></pattern>' +
    '</defs>';
  return '<svg viewBox="0 0 ' + this.w.toFixed(0) + ' ' + this.h.toFixed(0) +
    '" width="100%" xmlns="http://www.w3.org/2000/svg" role="img">' + defs +
    '<rect width="100%" height="100%" fill="#FFFFFF"/>' + this.o.join('') + '</svg>';
};

/* cartouche normalisé, coin inférieur droit */
function cartouche(p, x, y, w, h, planche, echelle, titre){
  p.rect(x, y, w, h, 'box');
  var r = h / 5;
  for(var i = 1; i < 5; i++) p.line(x, y + i * r, x + w, y + i * r, 'ink-fine');
  p.line(x + w * 0.345, y + h * 0.2, x + w * 0.345, y + h, 'ink-fine');
  var rows = [
    ['PROJET', 'Station Afriquia + lavage + parking'],
    ['SITE', 'Fqih Ben Saleh — 130,00 × 62,00 m'],
    ['MAÎTRE D’OUVRAGE', 'M. Mohamed EL ARCHAOUI'],
    ['PHASE', 'Avant-projet — présentation']
  ];
  rows.forEach(function(rw, k){
    var yy = y + h - (k + 0.5) * r;
    p.text(x + w * 0.02, yy, rw[0], 't-cart', 'start', 0, true);
    p.text(x + w * 0.365, yy, rw[1], 't-cart', 'start', 0, true);
  });
  p.text(x + w * 0.02, y + r * 0.52, planche + '   ·   ' + echelle + '   ·   13.11.2026   ·   A3',
    't-cartb', 'start', 0, true);
  if(titre) p.text(x + w * 0.98, y + h + 1.1, titre, 't-cart', 'end', 0, true);
}

/* légende */
function legende(p, x, y, w, h, items, cols){
  p.rect(x, y, w, h, 'box');
  p.line(x, y + h - 2.6 * (p.s < 20 ? 1 : 0.18), x + w, y + h - 2.6 * (p.s < 20 ? 1 : 0.18), 'ink-fine');
  var hdr = 2.6 * (p.s < 20 ? 1 : 0.18);
  p.text(x + w * 0.015, y + h - hdr * 0.5, 'LÉGENDE', 't-cartb', 'start', 0, true);
  var perCol = Math.ceil(items.length / cols), cw = w / cols;
  items.forEach(function(it, k){
    var c = Math.floor(k / perCol), r = k % perCol;
    var ix = x + c * cw + w * 0.015;
    var iy = y + h - hdr - (r + 0.55) * ((h - hdr) / perCol);
    var sw = cw * 0.11, sh = (h - hdr) / perCol * 0.42;
    if(it[0] === null)      p.text(ix + sw / 2, iy, it[2] || '', 't-small', 'middle', 0, true);
    else if(it[0] === 'lot'){ p.line(ix, iy, ix + sw, iy, 'lot'); }
    else                    p.area(ix, iy - sh / 2, sw, sh, it[0], 'ink-fine');
    p.text(ix + sw + cw * 0.03, iy, it[1], 't-small', 'start', 0, true);
  });
}

/* ============================================================
   A-01 — PLAN DE MASSE 1:400
   ============================================================ */
(function(){
  var host = document.getElementById('planSite');
  if(!host) return;
  var S = 6, p = new Plan('A', S, -44, 154, -46, 80);

  /* cadre de la feuille */
  p.rect(-42, -44, 194, 122, 'frame');
  p.text(-39.5, 74.5, 'PLAN DE MASSE', 't-ttl', 'start', 0, true);
  p.text(-39.5, 70.6, 'Échelle 1:400 — cotes en mètres', 't-small', 'start', 0, true);

  /* ---- voirie publique ---- */
  p.area(-20, -14, 20, 82, 'asph', 'hair');     // route ouest
  p.area(-20, -14, 172, 14, 'asph', 'hair');    // route sud
  p.area(-20, 52, 172, 10, 'asph', 'hair');     // route arrière
  p.line(-10, -14, -10, 68, 'axis');
  p.line(-20, -7, 152, -7, 'axis');
  p.line(-20, 57, 152, 57, 'axis');
  p.text(-10, 34, 'ROUTE PUBLIQUE', 't-ctx', 'middle', -90);
  p.text(22, -7, 'ROUTE PUBLIQUE', 't-ctx');
  p.text(80, 57, 'ROUTE ARRIÈRE (ALLER / RETOUR)', 't-ctx');

  /* ---- maisons voisines, de l'autre côté de la route ---- */
  [8, 26, 44].forEach(function(y){ p.area(-36, y, 14, 12, 'ctx', 'ink'); });
  p.text(-29, 40.5, 'MAISONS VOISINES', 't-ctx', 'middle', -90);

  /* ---- voies internes ---- */
  p.area(0, 0, 115, 4, 'asph', 'hair');         // voie sud
  p.area(40, 0, 6, 52, 'asph', 'hair');         // allée de circulation du parking
  p.area(0, 26, 46, 4, 'bet', 'hair');          // desserte du lavage, au sud
  p.area(0, 42, 46, 4, 'bet', 'hair');          // desserte du lavage, au nord
  p.area(46, 4, 69, 45, 'asph', 'hair');        // nappe du parking
  p.area(46, 49, 69, 3, 'asph', 'hair');        // allée nord

  /* ---- station Afriquia ---- */
  p.area(2, 4, 38, 22, 'bet', 'ink');
  p.rect(4, 6.5, 21, 17, 'white');
  [[8, 11], [8, 19], [20, 11], [20, 19]].forEach(function(q){
    p.rect(q[0] - 1, q[1] - 0.65, 2, 1.3, 'dark');
  });
  [[4, 6.5], [4, 23], [24.5, 6.5], [24.5, 23]].forEach(function(q){
    p.rect(q[0], q[1], 0.5, 0.5, 'solid');
  });
  p.rect(34, 7, 4, 3, 'white'); p.text(36, 8.5, 'BOUTIQUE', 't-tiny');
  p.text(14.5, 16.4, 'STATION AFRIQUIA', 't-room');
  p.text(14.5, 14.0, 'auvent 21,00 × 17,00 m', 't-small');

  /* ---- lavage auto, dans l'angle de la parcelle station ---- */
  p.rect(26, 14, 10, 12, 'white');
  [[26.4, 14.4], [26.4, 25.2], [35.2, 14.4], [35.2, 25.2]].forEach(function(q){
    p.rect(q[0], q[1], 0.4, 0.4, 'solid');
  });
  p.text(31, 21.4, 'LAVAGE', 't-room');
  p.text(31, 19.2, 'AUTO', 't-room');

  /* ---- piste camionnette et local technique ---- */
  p.area(36, 14, 4, 12, 'bet', 'ink-md');
  p.rect(36.3, 15, 3.4, 5, 'dash');             // poste sous le portique
  p.bubble(38, 22.4, '2', 1.25);
  p.rect(39, 12.9, 1, 1, 'dark');               // local technique 1,00 x 1,00 m
  p.line(39, 12.9, 37.6, 11.6, 'ink-fine');
  p.bubble(36.4, 11.6, '3', 1.25);

  /* ---- bureau avec WC intégré, donnant sur l'allée ---- */
  p.rect(24, 30, 8, 8, 'white');
  p.rect(29.5, 30, 2.5, 2.5, 'white');          // WC dans le même compartiment
  p.line(29.5, 30, 29.5, 32.5, 'ink');
  p.line(29.5, 32.5, 32, 32.5, 'ink');
  p.text(30.75, 31.25, 'WC', 't-tiny');
  p.text(27.4, 35.8, 'BUREAU', 't-room');
  p.text(27.4, 33.9, '8,00 × 8,00', 't-small');
  p.text(28, 29.0, 'dont WC 2,50 × 2,50 m', 't-tiny');

  /* ---- jardin ---- */
  p.area(2, 46, 38, 6, 'lawn', 'ink-fine');
  p.area(2, 30, 20, 12, 'bet', 'hair');
  p.text(12, 36.6, 'AIRE LIBRE', 't-small');
  p.text(12, 34.8, '20,00 × 12,00 m', 't-tiny');
  p.area(2, 48.4, 38, 1.2, 'bet', 'hair');
  p.text(21, 50.6, 'JARDIN  38,00 × 6,00 m', 't-small');

  /* ---- parking ---- */
  [[46, 56], [62, 72], [78, 88], [94, 104], [110, 115]].forEach(function(r){
    for(var i = 0; i <= 18; i++) p.line(r[0], 4 + i * 2.5, r[1], 4 + i * 2.5, 'mark');
    p.rect(r[0], 4, r[1] - r[0], 45, 'ink-fine');
    if(r[1] - r[0] > 6) p.line((r[0] + r[1]) / 2, 4, (r[0] + r[1]) / 2, 49, 'ink-fine');
  });
  p.text(107, 27, 'PARKING — 162 PLACES', 't-room', 'middle', -90);
  p.text(108.9, 27, 'places 2,50 × 5,00 m — allées 6,00 m', 't-small', 'middle', -90);
  p.text(75, 30, 'ALLÉE 6,00 m', 't-small', 'middle', -90);
  p.text(43, 20, 'ALLÉE 6,00 m', 't-small', 'middle', -90);

  /* ---- Marjane existant ---- */
  p.area(115.5, 2, 12, 48, 'ctx', 'ink-md');
  p.text(121.5, 26, 'MARJANE (EXISTANT)', 't-ctx', 'middle', -90);

  /* ---- accès depuis la route publique ---- */
  [[59, 'ENTRÉE'], [91, 'ENTRÉE'], [43, 'SORTIE']].forEach(function(e){
    p.area(e[0] - 5, -2, 10, 6, 'asph', 'hair');
    p.arrow(e[0], -9.0, e[0], 0.8, 'dash');
    p.text(e[0], -11.0, e[1], 't-small');
  });

  /* ---- poteau électrique ---- */
  p.circ(43.5, 54, 0.6, 'solid'); p.circ(43.5, 54, 1.3, 'ink-fine');
  p.text(43.5, 56.2, 'POTEAU ÉLECTRIQUE', 't-tiny');

  /* ---- limite de propriété ---- */
  p.rect(0, 0, 130, 62, 'lot');
  p.text(108, 60.4, 'LIMITE DE PROPRIÉTÉ', 't-tiny');

  /* ---- cotation ---- */
  p.dimH(0, 40, -18, '40,00', 0);
  p.dimH(40, 115, -18, '75,00', 0);
  p.dimH(115, 130, -18, '15,00', 0);
  p.dimH(0, 130, -24, '130,00', -18);
  p.dimV(0, 26, 134, '26,00', 130);
  p.dimV(26, 42, 134, '16,00', 130);
  p.dimV(42, 52, 134, '10,00', 130);
  p.dimV(52, 62, 134, '10,00', 130);
  p.dimV(0, 62, 140, '62,00', 134);
  p.dimV(4, 26, -1.4, '22,00', 2);              // bande ouest
  p.dimV(30, 42, -1.4, '12,00', 2);
  p.dimV(46, 52, -1.4, '6,00', 2);
  p.dimH(2, 40, 52.8, '38,00', 52);
  p.dimH(26, 36, 12.4, '10,00', 14);            // lavage
  p.dimH(36, 40, 12.4, '4,00', 14);             // piste
  p.dimV(14, 26, 41.6, '12,00', 40);
  p.dimH(46, 51, 53.2, '5,00', 49);             // une place et une allée
  p.dimH(51, 56, 53.2, '5,00', 49);
  p.dimH(56, 62, 53.2, '6,00', 49);
  p.dimV(46.5, 49, 44.8, '2,50', 46);
  p.dimH(46, 115, 50.6, '69,00', 49);           // parking

  /* ---- nord, échelle, légende, cartouche ---- */
  p.north(145, 66, 3.4);
  p.scaleBar(-40, -34.5, 20, 5, 1.1);
  p.text(-40, -37.6, 'ÉCHELLE GRAPHIQUE 1:400', 't-tiny', 'start', 0, true);
  legende(p, -12, -42, 98, 14, [
    ['asph', 'Enrobé — voirie, allées, parking'],
    ['bet',  'Béton / pavé — station, lavage, dessertes'],
    ['lawn', 'Pelouse — jardin'],
    ['ctx',  'Bâti existant / mitoyen'],
    ['lot',  'Limite de propriété'],
    [null,   'Piste camionnette — voir A-02', '2'],
    [null,   'Local technique 1,00 × 1,00 m', '3']
  ], 2);
  cartouche(p, 90, -42, 60, 14, 'A-01', '1:400', 'PLAN DE MASSE');

  host.innerHTML = p.html();
})();

/* ============================================================
   A-02 — PISTE DE LAVAGE CAMIONNETTE 4,00 x 12,00 m — 1:50
   repère local : x = longueur (0..12, vers le nord),
                  y = largeur  (0..4, 0 à l'est, 4 à l'ouest côté mât)
   ============================================================ */
(function(){
  var host = document.getElementById('planWash');
  if(!host) return;
  var S = 46, p = new Plan('B', S, -2.6, 18.6, -5.6, 7.0);

  p.rect(-2.3, -5.3, 20.6, 12.0, 'frame');
  p.text(-2.1, 6.25, 'PISTE DE LAVAGE CAMIONNETTE — PLAN', 't-ttl', 'start', 0, true);
  p.text(-2.1, 5.65, 'Échelle 1:50 — cotes en mètres', 't-small', 'start', 0, true);

  /* dalle béton et bordure peinte, alignée sur le lavage auto */
  p.area(0, 0, 12, 4, 'bet', 'ink-th');
  [[0, 0, 12, 0.22], [0, 3.78, 12, 0.22], [0, 0, 0.22, 4], [11.78, 0, 0.22, 4]].forEach(function(r){
    p.rect(r[0], r[1], r[2], r[3], 'dark');
  });
  p.rect(1, 0.22, 5, 3.56, 'dash');                  // poste sous le portique
  p.text(3.5, 4.35, 'POSTE SOUS PORTIQUE — 4,00 × 5,00 m', 't-tiny');
  p.text(9.0, 2.15, 'ZONE D’ATTENTE ET DE MANŒUVRE', 't-tiny');
  p.text(9.0, 1.80, '4,00 × 6,00 m', 't-tiny');

  /* gabarit de la camionnette */
  p.rect(1.10, 0.425, 4.80, 1.95, 'dash');
  p.rect(4.50, 0.70, 1.20, 1.40, 'white');
  p.text(5.10, 1.40, 'CABINE', 't-tiny');
  p.text(2.90, 1.40, 'GABARIT 1,95 × 4,80', 't-tiny');

  /* mât, platine et bras pivotant */
  p.rect(5.20, 3.20, 0.60, 0.60, 'white');
  p.rect(5.32, 3.32, 0.36, 0.36, 'solid');
  p.circ(5.50, 3.50, 0.46, 'ink-fine');
  var arc = [];
  for(var a = -90; a >= -180; a -= 5){
    arc.push([5.50 + 3.40 * Math.cos(a * Math.PI / 180),
              3.50 + 3.40 * Math.sin(a * Math.PI / 180)]);
  }
  p.poly(arc, 'dash-f');
  p.line(5.50, 3.50, 2.10, 3.50, 'ink-md');
  p.circ(2.10, 3.50, 0.16, 'white');
  p.text(4.00, 3.00, 'R 3,40', 't-tiny');

  /* opérateur et lance */
  p.circ(2.42, 2.95, 0.26, 'white');
  p.line(2.20, 3.35, 2.42, 2.95, 'ink-fine');
  p.text(1.40, 3.05, 'OPÉRATEUR', 't-tiny', 'end');

  /* équipements */
  p.rect(1.40, 0.25, 0.70, 0.80, 'dark'); p.text(1.75, 0.65, 'BORNE', 't-tiny');
  p.circ(3.50, 2.00, 0.22, 'white'); p.text(3.50, 2.00, 'S', 't-tiny', 'middle', 0, true);
  p.text(3.50, 2.58, 'SIPHON', 't-tiny');

  /* local technique 1,00 x 1,00 m, accolé à l'entrée */
  p.rect(-1.10, 0, 1.00, 1.00, 'grey');
  p.text(-0.60, 0.50, 'LT', 't-tiny', 'middle', 0, true);
  p.text(-0.60, -0.35, 'LOCAL TECHNIQUE 1,00 × 1,00', 't-tiny');

  /* sens de circulation */
  p.arrow(-1.60, 2.00, -0.40, 2.00, 'dash', 0.22);
  p.text(-1.25, 3.30, 'ACCÈS', 't-small');
  p.arrow(14.10, 2.00, 15.60, 2.00, 'dash', 0.22);
  p.text(14.85, 1.40, 'SORTIE', 't-small');

  /* cotation */
  p.dimH(1, 6, -0.85, '5,00', 0);
  p.dimH(0, 12, -1.75, '12,00', 0);
  p.dimV(0, 4, -2.30, '4,00', 0);
  p.dimV(0.425, 2.375, 12.95, '1,95', 12);
  p.dimV(2.375, 3.78, 12.95, '1,40', 12);
  p.dimV(3.20, 3.80, 7.00, '0,60', 5.80);

  /* nord et échelle */
  p.arrow(15.40, 5.50, 16.60, 5.50, 'ink', 0.3); p.text(17.05, 5.50, 'N', 't-cartb');
  p.scaleBar(-2.1, 4.75, 2, 0.5, 0.16);
  p.text(-2.1, 4.14, 'ÉCHELLE GRAPHIQUE 1:50', 't-tiny', 'start', 0, true);

  /* nomenclature sur deux colonnes */
  p.rect(-2.1, -5.1, 11.1, 2.6, 'box');
  p.line(-2.1, -3.0, 9.0, -3.0, 'ink-fine');
  p.text(-1.9, -2.73, 'NOMENCLATURE', 't-cartb', 'start', 0, true);
  [
    'Dalle béton armé 4,00 × 12,00 m, ép. 0,20 m',
    'Pente 2 % vers siphon central',
    'Bordure peinte de rive : 0,22 m',
    'Poste sous portique : 4,00 × 5,00 m',
    'Zone d’attente et de manœuvre : 4,00 × 6,00 m',
    'Mât acier 0,36 × 0,36, platine 0,60 × 0,60 m',
    'Hauteur de l’axe du bras : 5,30 m',
    'Bras pivotant 3,40 m, rotation 360°',
    'Flexible Ø 50 mm + lance haute pression',
    'Passage opérateur libre : 1,40 m',
    'Local technique 1,00 × 1,00 m à l’entrée'
  ].forEach(function(t, i){
    var c = i < 6 ? 0 : 1, r = i % 6;
    p.text(-1.9 + c * 5.5, -3.30 - r * 0.33, '· ' + t, 't-tiny', 'start', 0, true);
  });

  cartouche(p, 9.4, -5.1, 8.8, 3.1, 'A-02', '1:50', 'PISTE DE LAVAGE — PLAN');

  host.innerHTML = p.html();
})();

/* ============================================================
   A-03 — ÉLÉVATION DU POSTE DE LAVAGE 1:50
   repère local : x = largeur de la dalle 0..4, y = hauteur
   ============================================================ */
(function(){
  var host = document.getElementById('planElev');
  if(!host) return;
  var S = 46, p = new Plan('C', S, -3.4, 13.0, -3.7, 9.2);

  p.rect(-3.1, -3.4, 15.8, 12.2, 'frame');
  p.text(-2.9, 8.2, 'POSTE DE LAVAGE — ÉLÉVATION', 't-ttl', 'start', 0, true);
  p.text(-2.9, 7.6, 'Échelle 1:50 — cotes en mètres', 't-small', 'start', 0, true);

  /* sol et dalle */
  p.area(-0.6, -0.65, 5.2, 0.65, 'terre', null);
  p.line(-0.8, 0, 4.8, 0, 'ink-th');
  p.rect(0, 0, 4, 0.20, 'dark');
  p.line(0.90, -1.00, 0.90, 0.10, 'ext');
  p.text(1.90, -1.25, 'DALLE BÉTON ARMÉ ép. 0,20 m', 't-tiny');

  /* camionnette vue de face */
  p.rect(1.625, 0.20, 1.95, 1.60, 'white');
  p.rect(1.80, 1.80, 1.60, 0.80, 'white');
  p.rect(2.00, 1.95, 1.20, 0.50, 'grey');
  p.circ(1.95, 0.52, 0.32, 'dark'); p.circ(3.25, 0.52, 0.32, 'dark');
  p.text(2.60, 1.25, 'CAMIONNETTE', 't-tiny');
  p.text(2.60, 0.95, '1,95 × 2,60 m', 't-tiny');

  /* mât, bras, flexible */
  p.rect(0.20, 0.20, 0.60, 0.15, 'dark');
  p.rect(0.32, 0.20, 0.36, 5.10, 'grey');
  p.rect(0.32, 5.30, 3.58, 0.22, 'grey');
  p.poly([[0.68, 5.00], [1.05, 5.30]], 'ink-fine');
  p.poly([[3.90, 5.30], [3.95, 4.20], [3.60, 3.30], [3.72, 2.40], [3.40, 1.80]], 'ink-md');
  p.rect(3.26, 1.42, 0.12, 0.42, 'solid');
  p.text(4.95, 5.41, 'BRAS PIVOTANT 3,40 m (rotation 360°)', 't-tiny', 'start');
  p.text(4.95, 3.10, 'FLEXIBLE Ø 50 mm', 't-tiny', 'start');
  p.text(4.95, 1.55, 'LANCE HAUTE PRESSION', 't-tiny', 'start');
  p.text(0.50, 3.20, 'MÂT 0,36 × 0,36', 't-tiny', 'middle', -90);
  p.line(3.95, 5.41, 4.90, 5.41, 'ext');
  p.line(3.62, 3.10, 4.90, 3.10, 'ext');
  p.line(3.38, 1.55, 4.90, 1.55, 'ext');

  /* cotation */
  p.dimV(0, 5.30, -1.10, '5,30  (axe du bras)', 0.32);
  p.dimV(0, 2.60, 1.35, '2,60', 1.625);
  p.dimH(0.50, 3.90, 6.20, '3,40', 5.52);
  p.dimH(1.625, 3.575, 6.95, '1,95', 2.60);
  p.dimH(0, 4, -2.45, '4,00', 0);

  cartouche(p, 5.6, -3.3, 6.9, 3.4, 'A-03', '1:50', 'POSTE DE LAVAGE — ÉLÉVATION');
  p.scaleBar(-3.0, -2.65, 2, 0.5, 0.16);
  p.text(-3.0, -3.22, 'ÉCHELLE GRAPHIQUE 1:50', 't-tiny', 'start', 0, true);

  host.innerHTML = p.html();
})();
