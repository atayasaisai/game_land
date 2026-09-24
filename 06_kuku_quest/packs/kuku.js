/* なんでもラーニングクエスト・エンジン ─ 問題パック「九九」
   もんだいの絵は、九九の式を大きな文字で見せるだけのシンプルなSVG。
   こたえの選択肢は、まぎらわしくなるよう「おなじ段」からえらぶ。 */
(function(){
"use strict";

function card(txt){
  return '<svg viewBox="0 0 90 60" role="img" aria-label="'+txt+'">'
       + '<text x="45" y="39" text-anchor="middle" font-size="26" font-weight="900"'
       + ' font-family="Zen Maru Gothic, sans-serif" fill="#33312A">' + txt + '</text>'
       + '</svg>';
}

var items = [], a, b;
for(a = 1; a <= 9; a++){
  for(b = 1; b <= 9; b++){
    items.push({
      key: a + "x" + b,
      q: card(a + "×" + b),
      a: String(a * b),
      sub: "",
      lv: a <= 3 ? 1 : (a <= 6 ? 2 : 3),   // やさしい=1〜3のだん ふつう=4〜6 むずかしい=7〜9
      reg: "dan" + a,                       // まぎらわしい選択肢は おなじ段からえらぶ
      note: ""
    });
  }
}

window.PACKS = window.PACKS || {};
window.PACKS.kuku = {
  id: "kuku", title: "九九 ▸ かけ算", subject: "さんすう",
  ask: "こたえは いくつ？", mode: "answer", items: items
};

})();
