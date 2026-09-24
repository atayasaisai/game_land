/* なんでもラーニングクエスト・エンジン ─ 問題パック「元素記号」
   水素(1)からアルゴン(18)まで。「せかいのレシピ／げんしのへや」で
   つくれる原子とおなじ18こ。もんだいの絵は、周期表のマスふうのSVG。 */
(function(){
"use strict";

function card(num, sym){
  return '<svg viewBox="0 0 90 60" role="img" aria-label="'+sym+'">'
       + '<rect x="6" y="4" width="78" height="52" rx="8" fill="#fff" stroke="#33312A" stroke-width="2.4"/>'
       + '<text x="14" y="20" font-size="12" font-weight="900" font-family="Zen Maru Gothic, sans-serif" fill="#5C574A">'+num+'</text>'
       + '<text x="45" y="42" text-anchor="middle" font-size="26" font-weight="900" font-family="Zen Maru Gothic, sans-serif" fill="#33312A">'+sym+'</text>'
       + '</svg>';
}

var E = [
  {n:1,  s:"H",  a:"すいそ"},
  {n:2,  s:"He", a:"ヘリウム"},
  {n:3,  s:"Li", a:"リチウム"},
  {n:4,  s:"Be", a:"ベリリウム"},
  {n:5,  s:"B",  a:"ホウそ"},
  {n:6,  s:"C",  a:"たんそ"},
  {n:7,  s:"N",  a:"ちっそ"},
  {n:8,  s:"O",  a:"さんそ"},
  {n:9,  s:"F",  a:"フッそ"},
  {n:10, s:"Ne", a:"ネオン"},
  {n:11, s:"Na", a:"ナトリウム"},
  {n:12, s:"Mg", a:"マグネシウム"},
  {n:13, s:"Al", a:"アルミニウム"},
  {n:14, s:"Si", a:"ケイそ"},
  {n:15, s:"P",  a:"リン"},
  {n:16, s:"S",  a:"いおう"},
  {n:17, s:"Cl", a:"えんそ"},
  {n:18, s:"Ar", a:"アルゴン"}
];

var items = E.map(function(x){
  return {
    key: "e" + x.n,
    q: card(x.n, x.s),
    a: x.a,
    lv: x.n <= 6 ? 1 : (x.n <= 12 ? 2 : 3),
    reg: "lv" + (x.n <= 6 ? 1 : (x.n <= 12 ? 2 : 3))
  };
});

window.PACKS = window.PACKS || {};
window.PACKS.gensoKigou = {
  id: "genso-kigou", title: "元素記号 ▸ 名前", subject: "りか",
  ask: "この元素記号の 名前は？", mode: "answer", items: items
};

})();
