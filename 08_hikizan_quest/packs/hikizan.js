/* なんでもラーニングクエスト・エンジン ─ 問題パック「ひきざん」
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

var items = [], a, b, t, u;

// やさしい：1けたどうし、くり下がりなし（a>=b、どちらも1けた）
for(a = 1; a <= 9; a++){
  for(b = 1; b <= a; b++){
    items.push({ key:"y"+a+"_"+b, q:card(a+"−"+b), a:String(a-b), lv:1, reg:"lv1" });
  }
}

// ふつう：10いくつ－1けた、くり下がりあり（こたえ1けた）
for(a = 11; a <= 18; a++){
  for(b = 2; b <= 9; b++){
    if(b < a - 9){
      items.push({ key:"f"+a+"_"+b, q:card(a+"−"+b), a:String(a-b), lv:2, reg:"lv2" });
    }
  }
}

// むずかしい：2けた－1けた（くり下がりあり・なし混ぜて）
[1,2,3,4,5,6,7,8,9].forEach(function(tt){
  [3,6,9].forEach(function(uu){
    a = tt * 10 + uu;
    [1,4,7].forEach(function(bb){
      items.push({ key:"m"+a+"_"+bb, q:card(a+"−"+bb), a:String(a-bb), lv:3, reg:"lv3" });
    });
  });
});

window.PACKS = window.PACKS || {};
window.PACKS.hikizan = {
  id: "hikizan", title: "ひきざん ▸ ひき算", subject: "さんすう",
  ask: "こたえは いくつ？", mode: "answer", items: items
};

})();
