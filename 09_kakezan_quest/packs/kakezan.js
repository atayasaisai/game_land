/* なんでもラーニングクエスト・エンジン ─ 問題パック「かけざん」
   九九（1の段〜9の段）は「くくクエスト」の担当。こちらは、九九より大きい
   かけ算（2けた×1けたなど）を練習するパック。
   もんだいの絵は、しきを大きな文字で見せるだけのシンプルなSVG。 */
(function(){
"use strict";

function card(txt){
  return '<svg viewBox="0 0 90 60" role="img" aria-label="' + txt + '">'
       + '<text x="45" y="39" text-anchor="middle" font-size="22" font-weight="900"'
       + ' font-family="Zen Maru Gothic, sans-serif" fill="#33312A">' + txt + '</text>'
       + '</svg>';
}

var items = [], t, u, b;

// やさしい：何十×1けた（10,20,30…×2〜9）
for(t = 1; t <= 9; t++){
  for(b = 2; b <= 9; b++){
    items.push({ key:"y"+t+"_"+b, q:card((t*10)+"×"+b), a:String(t*10*b), lv:1, reg:"lv1" });
  }
}

// ふつう：2けた（1の位が小さめ）×1けた
[11,12,13,21,22,23,31,32,41,42,51,52].forEach(function(a){
  [2,3,4].forEach(function(b2){
    items.push({ key:"f"+a+"_"+b2, q:card(a+"×"+b2), a:String(a*b2), lv:2, reg:"lv2" });
  });
});

// むずかしい：2けた×1けた（くり上がりあり）
[13,14,16,17,18,19,23,24,26,27,28,29,34,36,37,38,45,46,47].forEach(function(a){
  [3,4,6,7,8].forEach(function(b3){
    if((a*b3) <= 300) items.push({ key:"m"+a+"_"+b3, q:card(a+"×"+b3), a:String(a*b3), lv:3, reg:"lv3" });
  });
});

window.PACKS = window.PACKS || {};
window.PACKS.kakezan = {
  id: "kakezan", title: "かけざん ▸ 大きいかけ算", subject: "さんすう",
  ask: "こたえは いくつ？", mode: "answer", items: items
};

})();
