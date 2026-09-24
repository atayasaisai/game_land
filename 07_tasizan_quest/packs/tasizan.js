/* なんでもラーニングクエスト・エンジン ─ 問題パック「たしざん」
   もんだいの絵は、しきを大きな文字で見せるだけのシンプルなSVG。
   こたえの選択肢は、まぎらわしくなるよう「おなじむずかしさ」からえらぶ。 */
(function(){
"use strict";

function card(txt){
  return '<svg viewBox="0 0 90 60" role="img" aria-label="' + txt + '">'
       + '<text x="45" y="39" text-anchor="middle" font-size="24" font-weight="900"'
       + ' font-family="Zen Maru Gothic, sans-serif" fill="#33312A">' + txt + '</text>'
       + '</svg>';
}

var items = [], a, b, i, j;

// やさしい：1けた＋1けた、くり上がりなし（こたえ10まで）
for(a = 1; a <= 9; a++){
  for(b = 1; b <= 9; b++){
    if(a + b <= 10){
      items.push({ key:"y"+a+"_"+b, q:card(a+"+"+b), a:String(a+b), lv:1, reg:"lv1" });
    }
  }
}

// ふつう：1けた＋1けた、くり上がりあり（こたえ11〜18）
for(a = 1; a <= 9; a++){
  for(b = 1; b <= 9; b++){
    if(a + b > 10){
      items.push({ key:"f"+a+"_"+b, q:card(a+"+"+b), a:String(a+b), lv:2, reg:"lv2" });
    }
  }
}

// むずかしい：2けた＋1けた（こたえ99まで）
[1,2,3,4,5,6,7,8].forEach(function(t){
  [2,5,8].forEach(function(u){
    a = t * 10 + u;
    [3,6,9].forEach(function(bb){
      items.push({ key:"m"+a+"_"+bb, q:card(a+"+"+bb), a:String(a+bb), lv:3, reg:"lv3" });
    });
  });
});

window.PACKS = window.PACKS || {};
window.PACKS.tasizan = {
  id: "tasizan", title: "たしざん ▸ たし算", subject: "さんすう",
  ask: "こたえは いくつ？", mode: "answer", items: items
};

})();
