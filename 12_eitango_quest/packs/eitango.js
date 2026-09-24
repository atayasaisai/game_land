/* なんでもラーニングクエスト・エンジン ─ 問題パック「やさしい英単語」
   やさしい英単語をかかげて、いみ（日本語）をこたえる。
   もんだいの絵は、単語を大きな文字で見せるだけのシンプルなSVG。 */
(function(){
"use strict";

function card(word){
  var size = word.length > 6 ? 17 : 21;
  return '<svg viewBox="0 0 90 60" role="img" aria-label="'+word+'">'
       + '<text x="45" y="38" text-anchor="middle" font-size="'+size+'" font-weight="900"'
       + ' font-family="Zen Maru Gothic, sans-serif" fill="#33312A">' + word + '</text>'
       + '</svg>';
}

var W = [
  // やさしい：どうぶつ
  {w:"dog",      a:"いぬ",     lv:1},
  {w:"cat",      a:"ねこ",     lv:1},
  {w:"bird",     a:"とり",     lv:1},
  {w:"fish",     a:"さかな",   lv:1},
  {w:"cow",      a:"うし",     lv:1},
  {w:"pig",      a:"ぶた",     lv:1},
  {w:"horse",    a:"うま",     lv:1},
  {w:"sheep",    a:"ひつじ",   lv:1},
  {w:"lion",     a:"ライオン", lv:1},
  {w:"elephant", a:"ぞう",     lv:1},
  {w:"rabbit",   a:"うさぎ",   lv:1},
  {w:"bear",     a:"くま",     lv:1},
  // ふつう：いろ・おおきさ
  {w:"red",    a:"あか",     lv:2},
  {w:"blue",   a:"あお",     lv:2},
  {w:"yellow", a:"きいろ",   lv:2},
  {w:"green",  a:"みどり",   lv:2},
  {w:"white",  a:"しろ",     lv:2},
  {w:"black",  a:"くろ",     lv:2},
  {w:"pink",   a:"ピンク",   lv:2},
  {w:"orange", a:"オレンジ", lv:2},
  {w:"purple", a:"むらさき", lv:2},
  {w:"brown",  a:"ちゃいろ", lv:2},
  {w:"big",    a:"おおきい", lv:2},
  {w:"small",  a:"ちいさい", lv:2},
  // むずかしい：にちじょう・がっこう
  {w:"book",   a:"ほん",       lv:3},
  {w:"pen",    a:"ペン",       lv:3},
  {w:"desk",   a:"つくえ",     lv:3},
  {w:"chair",  a:"いす",       lv:3},
  {w:"door",   a:"ドア",       lv:3},
  {w:"window", a:"まど",       lv:3},
  {w:"apple",  a:"りんご",     lv:3},
  {w:"banana", a:"バナナ",     lv:3},
  {w:"water",  a:"みず",       lv:3},
  {w:"milk",   a:"ぎゅうにゅう", lv:3},
  {w:"house",  a:"いえ",       lv:3},
  {w:"school", a:"がっこう",   lv:3}
];

var items = W.map(function(x){
  return { key:x.w, q:card(x.w), a:x.a, lv:x.lv, reg:"lv"+x.lv };
});

window.PACKS = window.PACKS || {};
window.PACKS.eitango = {
  id: "eitango", title: "やさしい英単語 ▸ いみ", subject: "えいご",
  ask: "この単語の いみは？", mode: "answer", items: items
};

})();
