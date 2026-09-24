/* なんでもラーニングクエスト・エンジン ─ 問題パック「わりざん」
   あまりが出ない わり算だけをあつめたパック（九九の逆）。
   もんだいの絵は、しきを大きな文字で見せるだけのシンプルなSVG。 */
(function(){
"use strict";

function card(txt){
  return '<svg viewBox="0 0 90 60" role="img" aria-label="' + txt + '">'
       + '<text x="45" y="39" text-anchor="middle" font-size="22" font-weight="900"'
       + ' font-family="Zen Maru Gothic, sans-serif" fill="#33312A">' + txt + '</text>'
       + '</svg>';
}

var items = [], d, q, a;

// わる数(d)の大きさで むずかしさを分ける（九九の逆なので、かならず わりきれる）
for(d = 1; d <= 9; d++){
  for(q = 1; q <= 9; q++){
    a = d * q;
    items.push({
      key: d + "d" + q,
      q: card(a + "÷" + d),
      a: String(q),
      lv: d <= 3 ? 1 : (d <= 6 ? 2 : 3),
      reg: "wa" + d
    });
  }
}

window.PACKS = window.PACKS || {};
window.PACKS.warizan = {
  id: "warizan", title: "わりざん ▸ わり算", subject: "さんすう",
  ask: "こたえは いくつ？", mode: "answer", items: items
};

})();
