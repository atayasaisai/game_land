/* なんでもラーニングクエスト ─ 問題パック「せかいの国旗」
   国旗はすべて 90x60 のSVGとして自前で描いています(外部画像を読みません)。
   emblem:true のものは、中央のもよう(紋章)を簡略化して描いています。 */
(function(){
"use strict";

/* ---- 描画ヘルパー ---------------------------------------------------- */

// n角の星。rot は度、0で真上に頂点。
function star(cx,cy,r,rot,fill,n){
  n=n||5;
  var inner=(n===5)?r*0.382:r*0.5, p="", i, rr, a;
  for(i=0;i<n*2;i++){
    rr=(i%2)?inner:r;
    a=(rot-90+i*(180/n))*Math.PI/180;
    p+=(i?"L":"M")+(cx+rr*Math.cos(a)).toFixed(2)+","+(cy+rr*Math.sin(a)).toFixed(2);
  }
  return '<path d="'+p+'Z" fill="'+fill+'"/>';
}

// 北欧十字。縦棒は旗ざお寄り。
function nordic(bg,cross,inner){
  var s='<rect width="90" height="60" fill="'+bg+'"/>'
       +'<rect x="24" width="13" height="60" fill="'+cross+'"/>'
       +'<rect y="23.5" width="90" height="13" fill="'+cross+'"/>';
  if(inner){
    s+='<rect x="27.5" width="6" height="60" fill="'+inner+'"/>'
      +'<rect y="27" width="90" height="6" fill="'+inner+'"/>';
  }
  return s;
}

// ユニオンジャック(単体でも、他国のカントンとしても使う)
function unionjack(){
  return '<rect width="90" height="60" fill="#012169"/>'
   +'<path d="M0,0 L90,60 M90,0 L0,60" stroke="#fff" stroke-width="12"/>'
   +'<path d="M0,0 L90,60 M90,0 L0,60" stroke="#C8102E" stroke-width="5"/>'
   +'<path d="M45,0 V60 M0,30 H90" stroke="#fff" stroke-width="20"/>'
   +'<path d="M45,0 V60 M0,30 H90" stroke="#C8102E" stroke-width="12"/>';
}
// 入れ子の <svg> はビューポートで切り取られるので、はみ出しを気にせず置ける
function canton(w,h,inner){
  return '<svg x="0" y="0" width="'+w+'" height="'+h+'" viewBox="0 0 90 60">'+inner+'</svg>';
}

// 八卦(ハングルの旗の四隅)。pat は上から 1=つながった棒 0=切れた棒
function trigram(cx,cy,rot,pat){
  var s='<g transform="translate('+cx+','+cy+') rotate('+rot+')">',i,y,
      bw=13, bh=2.3, gap=3.5, half=bw*0.41;
  for(i=0;i<3;i++){
    y=(i-1)*gap-bh/2;
    if(pat[i]) s+='<rect x="'+(-bw/2)+'" y="'+y+'" width="'+bw+'" height="'+bh+'" fill="#000"/>';
    else s+='<rect x="'+(-bw/2)+'" y="'+y+'" width="'+half+'" height="'+bh+'" fill="#000"/>'
          +'<rect x="'+(bw/2-half)+'" y="'+y+'" width="'+half+'" height="'+bh+'" fill="#000"/>';
  }
  return s+'</g>';
}

/* ---- 旗ごとの絵 ------------------------------------------------------ */

function usa(){
  var s='<rect width="90" height="60" fill="#fff"/>',i,r,c,x,y,n;
  for(i=0;i<13;i+=2) s+='<rect y="'+(i*60/13).toFixed(3)+'" width="90" height="'+(60/13).toFixed(3)+'" fill="#B22234"/>';
  s+='<rect width="36" height="'+(7*60/13).toFixed(3)+'" fill="#3C3B6E"/>';
  for(r=0;r<9;r++){                       // 6個の列と5個の列が交互に9段
    n=(r%2)?5:6;
    y=2.2+r*3.35;
    for(c=0;c<n;c++){
      x=(r%2)?5.6+c*5.6:2.8+c*5.6;
      s+=star(x,y,1.5,0,"#fff");
    }
  }
  return s;
}

function china(){
  var s='<rect width="90" height="60" fill="#EE1C25"/>'+star(15,15,9,0,"#FFDE00"),
      pts=[[30,6],[36,12],[36,21],[30,27]],i,a;
  for(i=0;i<4;i++){                       // 小さい星は大きい星のほうを向く
    a=Math.atan2(15-pts[i][1],15-pts[i][0])*180/Math.PI+90;
    s+=star(pts[i][0],pts[i][1],3,a,"#FFDE00");
  }
  return s;
}

function korea(){
  return '<rect width="90" height="60" fill="#fff"/>'
   +'<g transform="translate(45,30) rotate(-123.69)">'
   +'<circle r="12" fill="#0047A0"/>'
   +'<path d="M0,-12 A12,12 0 0,1 0,12 A6,6 0 0,1 0,0 A6,6 0 0,0 0,-12 Z" fill="#CD2E3A"/>'
   +'</g>'
   +trigram(19,12.5,-56.31,[1,1,1])   // 건
   +trigram(71,12.5, 56.31,[0,1,0])   // 감
   +trigram(19,47.5, 56.31,[1,0,1])   // 리
   +trigram(71,47.5,-56.31,[0,0,0]);  // 곤
}

function india(){
  var s='<rect width="90" height="20" fill="#FF9933"/><rect y="20" width="90" height="20" fill="#fff"/>'
       +'<rect y="40" width="90" height="20" fill="#138808"/>'
       +'<circle cx="45" cy="30" r="8.6" fill="none" stroke="#000080" stroke-width="0.9"/>'
       +'<circle cx="45" cy="30" r="1.7" fill="#000080"/>',i,a;
  for(i=0;i<24;i++){                      // 法輪のスポーク24本
    a=i*15*Math.PI/180;
    s+='<line x1="'+(45+1.7*Math.cos(a)).toFixed(2)+'" y1="'+(30+1.7*Math.sin(a)).toFixed(2)
      +'" x2="'+(45+8.2*Math.cos(a)).toFixed(2)+'" y2="'+(30+8.2*Math.sin(a)).toFixed(2)
      +'" stroke="#000080" stroke-width="0.7"/>';
  }
  return s;
}

function brazil(){
  var s='<rect width="90" height="60" fill="#009C3B"/>'
   +'<path d="M45,5 L85,30 L45,55 L5,30 Z" fill="#FFDF00"/>'
   +'<circle cx="45" cy="30" r="15" fill="#002776"/>',
   pts=[[38,20,1.4],[46,16.5,1.1],[53,21,1.3],[41,25,1],[58,27,1.1],[33,26,1],
        [49,26,0.9],[62,33,1],[45,44,1.2]],i;
  for(i=0;i<pts.length;i++) s+=star(pts[i][0],pts[i][1],pts[i][2],0,"#fff");
  // 「ORDEM E PROGRESSO」の白い帯(文字は入れていません)
  return s+'<path d="M31.98,37.46 A25.1,25.1 0 0,0 58.02,37.46 A15,15 0 0,0 60,30.86 '
   +'A21.1,21.1 0 0,1 30,30.86 A15,15 0 0,0 31.98,37.46 Z" fill="#fff"/>';
}

function australia(){
  return '<rect width="90" height="60" fill="#00008B"/>'
   +canton(45,30,unionjack())
   +star(22.5,45,6,0,"#fff",7)                               // 連邦の星
   +star(75,12,3.2,0,"#fff",7)+star(83,30,3.6,0,"#fff",7)
   +star(72,45,3.2,0,"#fff",7)+star(62,36,2.4,0,"#fff",7)
   +star(78,39,1.8,0,"#fff",5);
}

function turkey(){
  return '<rect width="90" height="60" fill="#E30A17"/>'
   +'<circle cx="33" cy="30" r="12" fill="#fff"/><circle cx="37.5" cy="30" r="9.6" fill="#E30A17"/>'
   +star(53,30,6,-15,"#fff");
}

function greece(){
  var s='<rect width="90" height="60" fill="#fff"/>',i,st=60/9;
  for(i=0;i<9;i+=2) s+='<rect y="'+(i*st).toFixed(3)+'" width="90" height="'+st.toFixed(3)+'" fill="#0D5EAF"/>';
  s+='<rect width="'+(5*st).toFixed(3)+'" height="'+(5*st).toFixed(3)+'" fill="#0D5EAF"/>';
  s+='<rect x="'+(2*st).toFixed(3)+'" width="'+st.toFixed(3)+'" height="'+(5*st).toFixed(3)+'" fill="#fff"/>';
  s+='<rect y="'+(2*st).toFixed(3)+'" width="'+(5*st).toFixed(3)+'" height="'+st.toFixed(3)+'" fill="#fff"/>';
  return s;
}

function argentina(){
  var s='<rect width="90" height="60" fill="#74ACDF"/><rect y="20" width="90" height="20" fill="#fff"/>',i,a;
  for(i=0;i<16;i++){
    a=i*22.5;
    s+='<g transform="translate(45,30) rotate('+a+')"><path d="M0,-5 L1.5,-9.5 L0,-11 L-1.5,-9.5 Z" fill="#F6B40E"/></g>';
  }
  return s+'<circle cx="45" cy="30" r="5" fill="#F6B40E" stroke="#C8901A" stroke-width="0.6"/>';
}

function canada(){
  return '<rect width="90" height="60" fill="#FF0000"/><rect x="22.5" width="45" height="60" fill="#fff"/>'
   +'<path transform="translate(45,30)" fill="#FF0000" d="'
   +'M0,-20 L2.4,-12.4 L9.2,-13.8 L7.4,-7.2 L17.6,-8.6 L15.8,-4.4 L21.6,1 L18,2.8 '
   +'L19.4,8 L11.2,6.6 L10,9.2 L3.4,8 L4.6,20 L-4.6,20 L-3.4,8 L-10,9.2 L-11.2,6.6 '
   +'L-19.4,8 L-18,2.8 L-21.6,1 L-15.8,-4.4 L-17.6,-8.6 L-7.4,-7.2 L-9.2,-13.8 L-2.4,-12.4 Z"/>';
}

function switzerland(){                    // 正方形の旗なので、枠の中でも正方形のまま描く(左右は透明)
  return '<rect x="15" width="60" height="60" fill="#DA291C"/>'
   +'<rect x="42" y="13" width="6" height="34" fill="#fff"/><rect x="28" y="27" width="34" height="6" fill="#fff"/>';
}

function spain(){
  return '<rect width="90" height="60" fill="#AA151B"/><rect y="15" width="90" height="30" fill="#F1BF00"/>'
   +'<g transform="translate(24,30)">'                       // 紋章は簡略化
   +'<rect x="-6" y="-8" width="12" height="14" rx="1.5" fill="#AA151B" stroke="#8B6914" stroke-width="0.7"/>'
   +'<rect x="-6" y="-8" width="6" height="7" fill="#F1BF00"/><rect x="0" y="-1" width="6" height="7" fill="#F1BF00"/>'
   +'<path d="M-6,6 q6,5 12,0" fill="#AA151B" stroke="#8B6914" stroke-width="0.7"/>'
   +'<path d="M-3,-8 q3,-4 6,0" fill="none" stroke="#8B6914" stroke-width="1.2"/>'
   +'<rect x="-9.5" y="-9" width="2" height="20" fill="#8B6914"/><rect x="7.5" y="-9" width="2" height="20" fill="#8B6914"/>'
   +'</g>';
}

function portugal(){
  return '<rect width="90" height="60" fill="#DA291C"/><rect width="36" height="60" fill="#046A38"/>'
   +'<g transform="translate(36,30)">'                       // 渾天儀は簡略化
   +'<circle r="10.5" fill="#FFD100" stroke="#8B6914" stroke-width="0.7"/>'
   +'<ellipse rx="10.5" ry="4" fill="none" stroke="#8B6914" stroke-width="0.7"/>'
   +'<ellipse rx="4" ry="10.5" fill="none" stroke="#8B6914" stroke-width="0.7"/>'
   +'<line x1="-10.5" y1="0" x2="10.5" y2="0" stroke="#8B6914" stroke-width="0.7"/>'
   +'<rect x="-3.4" y="-5" width="6.8" height="10" rx="1" fill="#fff" stroke="#8B6914" stroke-width="0.7"/>'
   +'<rect x="-2.6" y="-4.2" width="5.2" height="8.4" rx="0.8" fill="#DA291C"/>'
   +'<circle cx="0" cy="-1.6" r="0.7" fill="#fff"/><circle cx="-1.5" cy="0.6" r="0.7" fill="#fff"/>'
   +'<circle cx="1.5" cy="0.6" r="0.7" fill="#fff"/><circle cx="0" cy="2.4" r="0.7" fill="#fff"/>'
   +'</g>';
}

function mexico(){
  return '<rect width="90" height="60" fill="#006847"/><rect x="30" width="30" height="60" fill="#fff"/>'
   +'<rect x="60" width="30" height="60" fill="#CE1126"/>'
   +'<g transform="translate(45,30)">'                       // わしとサボテンは簡略化
   +'<path d="M-9,5 q-1.5,7 5,10 M9,5 q1.5,7 -5,10" fill="none" stroke="#2E7D32" stroke-width="1.3"/>'
   +'<path d="M0,11 v-7 M-4,11 q-4,0 -4,-4.5 q0,-3 1.6,-3 M4,11 q4,0 4,-4.5 q0,-3 -1.6,-3"'
   +' fill="none" stroke="#2E7D32" stroke-width="1.7" stroke-linecap="round"/>'
   +'<path d="M-1,-8 q-6,-2 -9,1 q4,-0.5 6,2 Z" fill="#7A5230"/>'
   +'<path d="M2,-8 q6,-3 10,0 q-5,0 -7,2.5 Z" fill="#94693E"/>'
   +'<path d="M-1.5,-7 q3.5,-3 5,0 q1,4 -1.5,7 q-2.5,-2 -3.5,-7 Z" fill="#6D4C2E"/>'
   +'<path d="M3,-7.5 q2.5,-2.5 4.5,-1 q-1.5,2.5 -3.5,2.5 Z" fill="#6D4C2E"/>'
   +'<path d="M6,-6 q4,1.5 4.5,-1.5" fill="none" stroke="#2E7D32" stroke-width="1"/>'
   +'</g>';
}

function southafrica(){
  return '<rect width="90" height="60" fill="#E03C31"/>'
   +'<path d="M0,60 L33,30 L90,30 L90,60 Z" fill="#001489"/>'
   +'<path d="M-3,-3 L35,30 L-3,63 M35,30 H93" fill="none" stroke="#fff" stroke-width="14"/>'
   +'<path d="M-3,-3 L35,30 L-3,63 M35,30 H93" fill="none" stroke="#007A4D" stroke-width="9"/>'
   +'<path d="M0,2 L32,30 L0,58 Z" fill="#FFB81C"/>'
   +'<path d="M0,10 L23,30 L0,50 Z" fill="#000"/>';
}

function chile(){
  return '<rect width="90" height="60" fill="#D52B1E"/><rect width="90" height="30" fill="#fff"/>'
   +'<rect width="30" height="30" fill="#0039A6"/>'+star(15,15,9,0,"#fff");
}

function singaporeLike(){ return ""; } // 未使用

/* 単純な帯の旗をまとめて作る */
function bandsH(){ var a=arguments,s="",i,y=0,h=60/a.length;
  for(i=0;i<a.length;i++){ s+='<rect y="'+(i*h).toFixed(3)+'" width="90" height="'+h.toFixed(3)+'" fill="'+a[i]+'"/>'; }
  return s; }
function bandsV(){ var a=arguments,s="",i,w=90/a.length;
  for(i=0;i<a.length;i++){ s+='<rect x="'+(i*w).toFixed(3)+'" width="'+w.toFixed(3)+'" height="60" fill="'+a[i]+'"/>'; }
  return s; }

/* ---- 国のデータ ------------------------------------------------------
   lv 1=やさしい 2=ふつう 3=むずかしい / reg は選択肢を近い地域から選ぶのに使う */

var C = [
 // ── lv1 ──────────────────────────────────────────────────────────────
 {id:"jp",n:"日本",       cap:"東京",         reg:"アジア",     lv:1, f:'<rect width="90" height="60" fill="#fff"/><circle cx="45" cy="30" r="18" fill="#BC002D"/>'},
 {id:"us",n:"アメリカ",   cap:"ワシントンD.C.",reg:"アメリカ",   lv:1, f:usa()},
 {id:"gb",n:"イギリス",   cap:"ロンドン",     reg:"ヨーロッパ", lv:1, f:unionjack()},
 {id:"fr",n:"フランス",   cap:"パリ",         reg:"ヨーロッパ", lv:1, f:bandsV("#002395","#FFFFFF","#ED2939")},
 {id:"it",n:"イタリア",   cap:"ローマ",       reg:"ヨーロッパ", lv:1, f:bandsV("#009246","#FFFFFF","#CE2B37")},
 {id:"de",n:"ドイツ",     cap:"ベルリン",     reg:"ヨーロッパ", lv:1, f:bandsH("#000000","#DD0000","#FFCE00")},
 {id:"ca",n:"カナダ",     cap:"オタワ",       reg:"アメリカ",   lv:1, f:canada()},
 {id:"cn",n:"中国",       cap:"ペキン",       reg:"アジア",     lv:1, f:china()},
 {id:"kr",n:"かんこく",   cap:"ソウル",       reg:"アジア",     lv:1, f:korea()},
 {id:"br",n:"ブラジル",   cap:"ブラジリア",   reg:"アメリカ",   lv:1, f:brazil(), emblem:true},
 {id:"in",n:"インド",     cap:"ニューデリー", reg:"アジア",     lv:1, f:india()},
 {id:"au",n:"オーストラリア",cap:"キャンベラ",reg:"オセアニア", lv:1, f:australia()},
 // ── lv2 ──────────────────────────────────────────────────────────────
 {id:"ru",n:"ロシア",     cap:"モスクワ",     reg:"ヨーロッパ", lv:2, f:bandsH("#FFFFFF","#0039A6","#D52B1E")},
 {id:"nl",n:"オランダ",   cap:"アムステルダム",reg:"ヨーロッパ",lv:2, f:bandsH("#AE1C28","#FFFFFF","#21468B")},
 {id:"ch",n:"スイス",     cap:"ベルン",       reg:"ヨーロッパ", lv:2, f:switzerland()},
 {id:"se",n:"スウェーデン",cap:"ストックホルム",reg:"ヨーロッパ",lv:2, f:nordic("#006AA7","#FECC00")},
 {id:"es",n:"スペイン",   cap:"マドリード",   reg:"ヨーロッパ", lv:2, f:spain(), emblem:true},
 {id:"mx",n:"メキシコ",   cap:"メキシコシティ",reg:"アメリカ",  lv:2, f:mexico(), emblem:true},
 {id:"th",n:"タイ",       cap:"バンコク",     reg:"アジア",     lv:2, f:'<rect width="90" height="60" fill="#A51931"/><rect y="10" width="90" height="40" fill="#F4F5F8"/><rect y="20" width="90" height="20" fill="#2D2A4A"/>'},
 {id:"vn",n:"ベトナム",   cap:"ハノイ",       reg:"アジア",     lv:2, f:'<rect width="90" height="60" fill="#DA251D"/>'+star(45,30,15,0,"#FFFF00")},
 {id:"id",n:"インドネシア",cap:"ジャカルタ",  reg:"アジア",     lv:2, f:bandsH("#FF0000","#FFFFFF")},
 {id:"tr",n:"トルコ",     cap:"アンカラ",     reg:"アジア",     lv:2, f:turkey()},
 {id:"gr",n:"ギリシャ",   cap:"アテネ",       reg:"ヨーロッパ", lv:2, f:greece()},
 {id:"ar",n:"アルゼンチン",cap:"ブエノスアイレス",reg:"アメリカ",lv:2,f:argentina()},
 // ── lv3 ──────────────────────────────────────────────────────────────
 {id:"no",n:"ノルウェー", cap:"オスロ",       reg:"ヨーロッパ", lv:3, f:nordic("#BA0C2F","#FFFFFF","#00205B")},
 {id:"dk",n:"デンマーク", cap:"コペンハーゲン",reg:"ヨーロッパ",lv:3, f:nordic("#C8102E","#FFFFFF")},
 {id:"fi",n:"フィンランド",cap:"ヘルシンキ",  reg:"ヨーロッパ", lv:3, f:nordic("#FFFFFF","#003580")},
 {id:"pt",n:"ポルトガル", cap:"リスボン",     reg:"ヨーロッパ", lv:3, f:portugal(), emblem:true},
 {id:"pl",n:"ポーランド", cap:"ワルシャワ",   reg:"ヨーロッパ", lv:3, f:bandsH("#FFFFFF","#DC143C")},
 {id:"ua",n:"ウクライナ", cap:"キーウ",       reg:"ヨーロッパ", lv:3, f:bandsH("#0057B7","#FFD700")},
 {id:"be",n:"ベルギー",   cap:"ブリュッセル", reg:"ヨーロッパ", lv:3, f:bandsV("#000000","#FAE042","#ED2939")},
 {id:"at",n:"オーストリア",cap:"ウィーン",    reg:"ヨーロッパ", lv:3, f:bandsH("#ED2939","#FFFFFF","#ED2939")},
 {id:"ie",n:"アイルランド",cap:"ダブリン",    reg:"ヨーロッパ", lv:3, f:bandsV("#169B62","#FFFFFF","#FF883E")},
 {id:"pe",n:"ペルー",     cap:"リマ",         reg:"アメリカ",   lv:3, f:bandsV("#D91023","#FFFFFF","#D91023")},
 {id:"cl",n:"チリ",       cap:"サンティアゴ", reg:"アメリカ",   lv:3, f:chile()},
 {id:"za",n:"みなみアフリカ",cap:"プレトリア",reg:"アフリカ",   lv:3, f:southafrica(), emblem:true,
   note:"みなみアフリカには首都が3つあります。行政の首都がプレトリアです。"}
];

/* ---- パックとして公開 ------------------------------------------------ */

function build(kind){
  return C.map(function(c){
    return {
      key:c.id,
      q:'<svg class="flagsvg" viewBox="0 0 90 60" role="img" aria-label="国旗">'+c.f+'</svg>',
      a:(kind==="cap")?c.cap:c.n,
      sub:(kind==="cap")?c.n:"",           // 答えあわせのときに添える情報
      lv:c.lv, reg:c.reg, note:c.note||"", emblem:!!c.emblem
    };
  });
}

window.PACKS = window.PACKS || {};
window.PACKS.flagName = {
  id:"flag-name", title:"せかいの国旗 ▸ 国の名前", subject:"ちり",
  ask:"この国旗の 国の名前は？", mode:"answer", items:build("name")
};
window.PACKS.flagCapital = {
  id:"flag-capital", title:"せかいの国旗 ▸ しゅと", subject:"ちり",
  ask:"この国の しゅとは？", mode:"answer", items:build("cap")
};

})();
