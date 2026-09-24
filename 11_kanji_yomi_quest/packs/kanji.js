/* なんでもラーニングクエスト・エンジン ─ 問題パック「漢字の読み」
   小学校でならう漢字（1〜4年生ていど）の読みがな。
   もんだいの絵は、漢字を大きな文字で見せるだけのシンプルなSVG。 */
(function(){
"use strict";

function card(kanji){
  var size = kanji.length >= 2 ? 24 : 30;
  return '<svg viewBox="0 0 90 60" role="img" aria-label="'+kanji+'">'
       + '<text x="45" y="39" text-anchor="middle" font-size="'+size+'" font-weight="900"'
       + ' font-family="Zen Maru Gothic, sans-serif" fill="#33312A">' + kanji + '</text>'
       + '</svg>';
}

var K = [
  // やさしい：1文字の漢字
  {k:"山", a:"やま", lv:1},
  {k:"川", a:"かわ", lv:1},
  {k:"木", a:"き",   lv:1},
  {k:"水", a:"みず", lv:1},
  {k:"火", a:"ひ",   lv:1},
  {k:"空", a:"そら", lv:1},
  {k:"犬", a:"いぬ", lv:1},
  {k:"花", a:"はな", lv:1},
  {k:"目", a:"め",   lv:1},
  {k:"耳", a:"みみ", lv:1},
  {k:"手", a:"て",   lv:1},
  {k:"足", a:"あし", lv:1},
  // ふつう：時・方角の漢字
  {k:"朝", a:"あさ",   lv:2},
  {k:"昼", a:"ひる",   lv:2},
  {k:"夜", a:"よる",   lv:2},
  {k:"春", a:"はる",   lv:2},
  {k:"夏", a:"なつ",   lv:2},
  {k:"秋", a:"あき",   lv:2},
  {k:"冬", a:"ふゆ",   lv:2},
  {k:"東", a:"ひがし", lv:2},
  {k:"西", a:"にし",   lv:2},
  {k:"南", a:"みなみ", lv:2},
  {k:"北", a:"きた",   lv:2},
  {k:"友", a:"とも",   lv:2},
  // むずかしい：2文字の熟語
  {k:"世界", a:"せかい",     lv:3},
  {k:"太陽", a:"たいよう",   lv:3},
  {k:"動物", a:"どうぶつ",   lv:3},
  {k:"植物", a:"しょくぶつ", lv:3},
  {k:"有名", a:"ゆうめい",   lv:3},
  {k:"特別", a:"とくべつ",   lv:3},
  {k:"中心", a:"ちゅうしん", lv:3},
  {k:"自然", a:"しぜん",     lv:3},
  {k:"天気", a:"てんき",     lv:3},
  {k:"午前", a:"ごぜん",     lv:3},
  {k:"午後", a:"ごご",       lv:3},
  {k:"今週", a:"こんしゅう", lv:3}
];

var items = K.map(function(x){
  return { key:x.k, q:card(x.k), a:x.a, lv:x.lv, reg:"lv"+x.lv };
});

window.PACKS = window.PACKS || {};
window.PACKS.kanjiYomi = {
  id: "kanji-yomi", title: "漢字の読み ▸ よみがな", subject: "こくご",
  ask: "この漢字の 読みがなは？", mode: "answer", items: items
};

})();
