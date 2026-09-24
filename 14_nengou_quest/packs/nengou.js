/* なんでもラーニングクエスト・エンジン ─ 問題パック「年号」
   できごとの名前をかかげて、西暦の年をこたえる。有名な語呂合わせは
   note として持たせ、けっか画面の「にがて」一覧にそえて表示する。
   ※ 1192年「いいくに鎌倉幕府」は伝統的な語呂合わせとして有名だが、
     現在の教科書では鎌倉幕府の成立を1185年とする説明が主流になっている。
     ここでは語呂合わせの知名度を優先しつつ、note にその旨をそえている。 */
(function(){
"use strict";

function card(txt){
  var size = txt.length >= 5 ? 17 : 22;
  return '<svg viewBox="0 0 90 60" role="img" aria-label="'+txt+'">'
       + '<text x="45" y="39" text-anchor="middle" font-size="'+size+'" font-weight="900"'
       + ' font-family="Zen Maru Gothic, sans-serif" fill="#33312A">' + txt + '</text>'
       + '</svg>';
}

var N = [
  // やさしい：古代〜鎌倉
  {e:"大化の改新", y:645,  lv:1, note:"むしごろし（645）の 大化の改新"},
  {e:"平城京",     y:710,  lv:1, note:"なんと（710）きれいな 平城京"},
  {e:"平安京",     y:794,  lv:1, note:"なくよ（794）うぐいす 平安京"},
  {e:"鎌倉幕府",   y:1192, lv:1, note:"いいくに（1192）つくろう 鎌倉幕府（今は1185年説もある）"},
  // ふつう：室町〜江戸のはじめ
  {e:"室町幕府",   y:1338, lv:2, note:""},
  {e:"鉄砲伝来",   y:1543, lv:2, note:"いごよさん（1543）がかさむ 鉄砲伝来"},
  {e:"ザビエル来日", y:1549, lv:2, note:""},
  {e:"江戸幕府",   y:1603, lv:2, note:"ヒーローおさめる（1603）江戸幕府"},
  // むずかしい：明治いこう
  {e:"大政奉還",     y:1867, lv:3, note:""},
  {e:"明治維新",     y:1868, lv:3, note:"いろ（1868）あらたに 日本出発"},
  {e:"帝国憲法発布", y:1889, lv:3, note:""},
  {e:"終戦",         y:1945, lv:3, note:""}
];

var items = N.map(function(x){
  return { key:x.e, q:card(x.e), a:x.y+"年", lv:x.lv, reg:"lv"+x.lv, note:x.note };
});

window.PACKS = window.PACKS || {};
window.PACKS.nengou = {
  id: "nengou", title: "年号 ▸ 何年？", subject: "れきし",
  ask: "このできごとは 何年？", mode: "answer", items: items
};

})();
