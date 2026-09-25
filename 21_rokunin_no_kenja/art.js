// ============================================================
// 絵の置き場。地図 map.jpg（1536×1024）の上に、素材を おく。
//   ART.sage(id) / ART.king()   … 立ち絵（chara/N.png）
//   ART.field()                 … 地図と、重ねる層の入れもの
//   ART.layer(elem, lv)         … 6つの「もの」の lv だんかい目の絵。国土のあちこちに 広がる
//   ART.people(score)           … はってん度で ふえる 人の すみか（12か所）。マイナスなら 遺跡
//   ART.monster(i)              … あれ地の モンスターの巣と 巨大モンスター
//   ART.volcano() / fireworks() … 噴火（はってん度が マイナス）と 花火（にぎわい 3・100%）
// 素材：obj/NN.png（シート1）と obj2/NN.png（シート2）。大きさは obj/sizes.js。
// 置き場所は [シート, 番号, 足もとの x, 足もとの y, 横はば]。
// ============================================================

const ART = (() => {
  // 5人は DYNATELEIA の賢者（sage/<色>/ に stand・open・raise・point_right・back の5ポーズ）。
  // いちの賢者は 絵が とどくまで 素材シートの 商人（chara/4.png）で 仮置き。
  const POSES = ["stand", "open", "raise", "point_right", "back"];
  function sage(id) {
    const sg = RULES.SAGE[id];
    if (!sg.pic) return `<img class="sage" src="chara/4.png" alt="" draggable="false">`;
    if (sg.onepose) return `<img class="sage" src="sage/${sg.pic}/stand.png" alt="" draggable="false">`; // ポーズが 1まい → 姿勢を カクカク 動かす
    return `<img class="sage" src="sage/${sg.pic}/stand.png" data-base="sage/${sg.pic}" alt="" draggable="false">`;
  }
  function preload() { RULES.SAGES.forEach((s) => { if (s.pic && !s.onepose) POSES.forEach((p) => { const im = new Image(); im.src = `sage/${s.pic}/${p}.png`; }); }); }
  function king() { return `<img class="sage" src="chara/7.png" alt="" draggable="false">`; }

  // シート3・4から 切り出した 動きのある もの（fx/<名前>.png）
  function fimg(name, cx, cy, w, cls = "", style = "") {
    const [W, H] = FX_SIZE[name]; const h = w * H / W;
    return `<image class="${cls}" style="${style}" href="fx/${name}.png" x="${cx - w / 2}" y="${cy - h}" width="${w}" height="${h}"/>`;
  }
  // 人は 少し ゆれて にぎやかに（ゆれの タイミングは 場所ごとに ずらす）
  function person(name, cx, cy, w) { return fimg(name, cx, cy, w, "bob", `animation-delay:-${((cx * 7 + cy * 3) % 12) / 10}s`); }
  const O = 1, O2 = 2, O3 = 3; // シート（O3 = 発展記の素材２。番号の かわりに 名前）
  function img(sheet, n, cx, cy, w, cls = "") {
    if (sheet === O3) { const [W, H] = OBJ3_SIZE[n]; const h = w * H / W; return `<image class="${cls}" href="obj3/${n}.png" x="${cx - w / 2}" y="${cy - h}" width="${w}" height="${h}"/>`; }
    const [W, H] = (sheet === O ? OBJ_SIZE : OBJ2_SIZE)[n]; const h = w * H / W;
    return `<image class="${cls}" href="${sheet === O ? "obj" : "obj2"}/${String(n).padStart(2, "0")}.png" x="${cx - w / 2}" y="${cy - h}" width="${w}" height="${h}"/>`;
  }

  // ---- 6つの「もの」：だんかいが 上がるほど、国土の いろいろな 場所に ふえる ----
  // シート1: 1小道 2村道 3石畳 4大街道 5橋 7畑 8大農地 10牧場 13村 14町 15都市 16店 17市場 18商店街 19港 20見張り台 22城壁 23要塞 24公園 25学校 26図書館 27劇場 28神殿 29巣 30巨大モンスター
  // シート2: 1旗 2お知らせ板 3噴水 7橋小 8橋大 9兵士のキャンプ 11商人の旅団 12家 13住宅地 14城 15農場 16風車 23火山 24遺跡 25花の庭
  // ---- 道：素材の タイルを 端と端で つなぐ ----
  // タイルの 道は どれも「左下 → 右上」（NE）。左右反転した m 版で「左上 → 右下」（SE）。
  // sx,sy = 道の 左下の端、ex,ey = 右上の端（タイルの中の 座標）。1タイルで x が STEP、y が STEPY すすむ
  const STEP = 105, STEPY = 83;
  const TILE = {
    dirt:   { f: "obj/01", W: 174, H: 130, sx: 15, sy: 118, ex: 150, ey: 12 },
    stone:  { f: "obj/03", W: 173, H: 135, sx: 20, sy: 120, ex: 160, ey: 20 },
    grand:  { f: "obj/04", W: 180, H: 143, sx: 20, sy: 125, ex: 165, ey: 20 },
    bridge: { f: "obj/05", W: 174, H: 138, sx: 18, sy: 120, ex: 155, ey: 18 },
    bridge2:{ f: "obj2/08", W: 232, H: 132, sx: 20, sy: 118, ex: 210, ey: 20 },
  };
  // 1本の 道 = 始点(左端) から dir（"NE" か "SE"）へ n タイル。kinds は タイルごとの 種類（1つなら 全部 同じ）
  function chain(x0, y0, dir, n, kinds) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const k = Array.isArray(kinds) ? kinds[i] || kinds[kinds.length - 1] : kinds;
      const t = TILE[k]; const sc = STEP / (t.ex - t.sx);
      const px = x0 + i * STEP, py = y0 + (dir === "NE" ? -i * STEPY : i * STEPY);
      const x = dir === "NE" ? px - t.sx * sc : px - (t.W - t.ex) * sc;
      const y = dir === "NE" ? py - t.sy * sc : py - t.ey * sc;
      out.push({ y: y + t.H * sc, html: `<image href="${t.f}${dir === "NE" ? "" : "m"}.png" x="${x}" y="${y}" width="${t.W * sc}" height="${t.H * sc}"/>` });
    }
    return out;
  }
  function cross(cx, cy) { const sc = 0.78; return { y: cy + 65 * sc, html: `<image href="obj/06.png" x="${cx - 92 * sc}" y="${cy - 75 * sc}" width="${183 * sc}" height="${140 * sc}"/>` }; }
  function drawTiles(list) { return list.sort((a, b) => a.y - b.y).map((t) => t.html).join(""); }
  // 道すじ：R1 南西の村→北（NE）、R2 北西→まん中→南の海（SE）、R3 北東の町→東（SE）、R4 まん中の南→学校→北東（NE）
  const ROADS = {
    1: () => chain(605, 466, "SE", 2, "dirt"),
    2: () => [...chain(500, 383, "SE", 6, "stone"), ...chain(330, 640, "NE", 6, "dirt"), cross(578, 444)],
    3: () => [...chain(500, 383, "SE", 6, ["grand", "grand", "grand", "grand", "bridge2", "grand"]), ...chain(330, 640, "NE", 6, "stone"),
              ...chain(960, 220, "SE", 4, "stone"), ...chain(803, 620, "NE", 5, ["stone", "bridge", "stone", "stone", "stone"]), cross(578, 444), cross(1135, 358)],
  };
  function roadLayer(lv) { const f = ROADS[Math.max(0, Math.min(3, lv))]; return f ? `<g class="body">${drawTiles(f())}</g>` : ""; }
  const L = {
    farm: [[],
      [[O, 7, 520, 410, 220]],
      [[O, 8, 520, 410, 240], [O, 7, 1230, 560, 200]],
      [[O, 8, 520, 410, 240], [O, 7, 1230, 560, 200], [O2, 15, 250, 560, 200], [O, 10, 1150, 700, 200], [O2, 16, 620, 620, 110]]],
    guard: [[],
      [[O, 20, 1180, 330, 110]],
      [[O, 22, 1180, 335, 200], [O, 20, 250, 420, 100], [O, 20, 1000, 690, 100]],
      [[O, 23, 1180, 340, 240], [O, 20, 250, 420, 100], [O, 20, 1000, 690, 100], [O, 22, 1290, 560, 190], [O2, 9, 560, 720, 170]]],
    market: [[],
      [[O, 16, 780, 560, 180]],
      [[O, 17, 780, 560, 230], [O, 16, 1020, 250, 160]],
      [[O, 18, 780, 565, 240], [O, 16, 1020, 250, 160], [O2, 11, 640, 500, 150], [O, 19, 1230, 800, 220], [O, 16, 660, 870, 160]]],
    school: [[],
      [[O, 25, 1010, 400, 190]],
      [[O, 26, 1010, 400, 200], [O, 25, 150, 420, 170]],
      [[O, 28, 1010, 405, 210], [O, 25, 150, 420, 170], [O, 26, 330, 640, 180], [O2, 2, 760, 470, 90]]],
    fun: [[],
      [[O, 24, 700, 280, 200]],
      [[O, 27, 700, 280, 210], [O2, 3, 880, 470, 90]],
      [[O, 15, 700, 285, 240], [O2, 3, 880, 470, 90], [O2, 25, 900, 640, 170], [O2, 25, 400, 760, 170], [O2, 1, 600, 470, 120], [O2, 1, 1100, 500, 120]]],
  };
  const PEOPLE_AT = { // [名前, 足もとの x, y, 横はば]
    road: [["walkers", 730, 600, 90]], farm: [["farmer", 470, 500, 46], ["harvest", 1230, 350, 90]], guard: [["soldier", 1000, 590, 44]],
    market: [["merchant", 900, 500, 44], ["fishing", 1270, 830, 70]], school: [["lesson", 1090, 430, 90], ["student", 930, 430, 44]], fun: [["kids", 800, 360, 90]],
  };
  function layer(elem, lv) {
    if (elem === "road") return roadLayer(lv) + (lv >= 2 ? `<g class="body">${PEOPLE_AT.road.slice(0, lv - 1).map((a) => person(...a)).join("")}</g>` : "");
    const items = L[elem][Math.max(0, Math.min(3, lv))] || [];
    if (!items.length) return "";
    const people = lv >= 2 ? PEOPLE_AT[elem].slice(0, lv - 1).map((a) => person(...a)) : [];
    return `<g class="body">${items.map((a) => img(...a)).join("")}${people.join("")}</g>`;
  }

  // ---- 組み合わせで ふえる もの：2つの 要素が そろうと、大陸の べつの 場所に 関係する 施設が できる ----
  // need = それぞれの だんかいが この数 以上。say = そのとき 出る ひとこと
  const COMBOS = [
    { id: "farm_road",    need: { farm: 1, road: 1 },   say: "山の ほうへ 道が のびた！",   items: [["tiles", 330, 330, "SE", 2, "dirt"]] },
    { id: "road_guard",   need: { road: 1, guard: 1 },  say: "北の 見はり台が たった！",     items: [[O, 20, 900, 150, 90]] },
    { id: "farm_market",  need: { farm: 2, market: 1 }, say: "東に 農場が ひらけ、旅団が 出た！", items: [[O2, 15, 1350, 560, 180], [O2, 11, 760, 600, 130]] },
    { id: "market_road",  need: { market: 1, road: 2 }, say: "南の 海べに みなとが できた！", items: [["tiles", 1025, 798, "SE", 1, "dirt"], [O, 19, 1160, 880, 200]] },
    { id: "market_road3", need: { market: 2, road: 3 }, say: "北にも 商店街が できた！",     items: [[O, 18, 660, 170, 190]] },
    { id: "guard_farm",   need: { guard: 2, farm: 1 },  say: "西の 海べに かべが できた！",   items: [[O, 22, 140, 560, 170]] },
    { id: "school_market",need: { school: 1, market: 1 }, say: "山のふもとに 図書館が たった！", items: [[O, 26, 500, 200, 170]] },
    { id: "school_fun",   need: { school: 2, fun: 1 },  say: "南の島に 劇場が できた！",     items: [[O, 27, 460, 850, 180]] },
    { id: "fun_road",     need: { fun: 1, road: 1 },    say: "東に 公園が ふえた！",         items: [[O, 24, 1300, 700, 170]] },
    { id: "fun_market",   need: { fun: 2, market: 2 },  say: "東の はずれに 市が たった！",  items: [[O, 17, 1380, 470, 170]] },
    { id: "farm_school",  need: { farm: 1, school: 1 }, say: "風車が まわりだした！",         items: [[O2, 16, 300, 700, 100]] },
    { id: "guard_market", need: { guard: 2, market: 2 }, say: "東に 警備所が できた！",     items: [[O, 21, 1250, 660, 150]] },
    // ---- 近代の 建物・乗りもの（obj3/）。site = 人の すみか（SITES の 番号）を この建物に おきかえる ----
    //  地図が こんでいるので、建物は 町の 1つを 建てかえる（時代が すすむ）。乗りものは 空・海・道を うごく
    { id: "m_kokkai",    need: { school: 2, guard: 2 },  say: "北の 町に 国会議事堂が できた！", site: [6, "kokkai", 200] },
    { id: "m_saiban",    need: { guard: 3, school: 1 },  say: "裁判所が できた！",           site: [2, "saiban", 170] },
    { id: "m_super",     need: { market: 2, farm: 2 },   say: "スーパーマーケットが できた！", site: [9, "super", 170] },
    { id: "m_depart",    need: { market: 3, road: 2 },   say: "東の 町に デパートが できた！", site: [5, "depart", 170] },
    { id: "m_mall",      need: { market: 3, fun: 2 },    say: "大きな ショッピングモールが できた！", site: [3, "mall", 230] },
    { id: "m_tower",     need: { fun: 2, school: 2 },    say: "高い 電波塔が たった！",       site: [11, "tower", 140] },
    { id: "m_airport",   need: { road: 2, market: 3, school: 2 }, say: "南に 空港が できた！",  site: [10, "airport", 230], sky: ["plane", 200, 120, 150, "fly"] },
    { id: "m_car",       need: { road: 2, school: 2 },   say: "自動車が 走りだした！",         move: ["car", 600, 560, 70, "drive"] },
    { id: "m_ferry",     need: { market: 2, fun: 1 },    say: "大きな フェリーが 来た！",       move: ["ferry", 330, 1000, 190, "sail"] },
    { id: "m_heli",      need: { guard: 3, school: 2 },  say: "ヘリコプターが 飛んできた！",   sky: ["heli", 1250, 170, 110, "hover"] },
    { id: "m_telescope", need: { school: 3, fun: 1 },    say: "山の 上に 天文台が できた！",   items: [[O3, "telescope", 600, 150, 120]] },
    { id: "m_parabola",  need: { school: 3, market: 2 }, say: "西の 町に 大きな アンテナが できた！", site: [4, "parabola", 130] },
  ];
  function activeCombos(lv) { return COMBOS.filter((c) => Object.entries(c.need).every(([k, v]) => lv[k] >= v)); }
  // 近代の 乗りもの（空と 海と 道を うごく）
  function vehicle([name, x, y, w, anim], cls) { return `<g class="${anim}">${img(O3, name, x, y, w, cls)}</g>`; }
  function comboMarkup(c, cls) {
    if (!c.items) return `<g class="body" data-id="${c.id}">${c.move ? vehicle(c.move, cls) : ""}${c.sky ? vehicle(c.sky, cls) : ""}</g>`; // site は L-people で 描く
    return `<g class="body" data-id="${c.id}">${c.items.map((a) => a[0] === "tiles" ? drawTiles(chain(a[1], a[2], a[3], a[4], a[5])) : img(...a, cls)).join("")}</g>`; }

  // ---- 人の すみか：国土の 12か所。はってん度が 上がるほど 遠くまで ふえ、家→住宅地→村→町 と 育つ。100% で まん中に 城 ----
  const SITES = [[880, 380], [430, 300], [1000, 130], [960, 640], [200, 330], [1300, 420], [760, 155], [230, 600], [1120, 800], [480, 640], [500, 880], [1320, 250]];
  const STAGE = [null, [O2, 12, 150], [O2, 13, 180], [O, 13, 200], [O, 14, 210]];
  function siteStages(score) {
    return SITES.map((p, k) => {
      if (score >= 100) return 4;
      if (score < 0) return k < Math.min(SITES.length, Math.ceil(-score / 8)) ? -1 : 0; // -1 = 遺跡
      const t = k * 8; if (score <= t) return 0;
      return Math.min(4, 1 + Math.floor((score - t) / 28));
    });
  }
  // ov = このすみかを 建てかえた 近代の 建物 [番号, 名前, 横はば]
  function siteMarkup(k, stage, cls, ov) {
    const [x, y] = SITES[k];
    if (ov) return img(O3, ov[1], x, y + 10, ov[2], cls);
    if (stage === -1) return img(O2, 24, x, y, 160, cls);
    if (stage <= 0) return "";
    if (stage === 4 && k === 0) return img(O2, 14, x, y + 10, 230, cls); // 王さまの 城
    const [sh, n, w] = STAGE[stage]; return img(sh, n, x, y, w, cls);
  }
  // 100% の しるし：旗
  const FLAGS = [[700, 250], [1000, 500], [350, 500], [1200, 600]];
  function flags() {
    return FLAGS.map(([x, y]) => img(O2, 1, x, y, 110)).join("") + fimg("rainbow", 330, 200, 360)
      + `<g class="launch">${img(O3, "rocket", 1420, 810, 150)}</g>` // 100% だけ：右下の 島から ロケットが 打ち上がる
      + [[560, 330], [1120, 250], [980, 660], [260, 620]].map(([x, y]) => person("walkers", x, y + 40, 90)).join("");
  }
  // 国土の 人・鳥・動物：はってん度が 上がるほど 数が ふえる
  const CROWD = [ // [絵, 足もとの x, y, 横はば] はってん度 8% ごとに 1つ ふえる
    ["walkers", 760, 600, 90], ["farmer", 620, 590, 44], ["kids", 900, 545, 90], ["merchant", 1000, 525, 44], ["walkers", 560, 380, 90],
    ["student", 1120, 300, 44], ["walkers", 980, 700, 90], ["harvest", 260, 660, 90], ["soldier", 830, 340, 44], ["walkers", 1200, 690, 90],
    ["kids", 330, 470, 90], ["fishing", 700, 900, 70], ["walkers", 1300, 490, 90], ["farmer", 480, 660, 44],
    ["walkers", 820, 240, 90], ["merchant", 1250, 420, 44], ["kids", 600, 760, 90], ["student", 200, 380, 44], ["walkers", 1080, 840, 90], ["soldier", 1320, 620, 44],
  ];
  // サブ指標で ふえる 小さな かざり：幸福度→花、商業→小さな お店、文化→モニュメント（噴水・花の庭）
  const FLOWERS = [[500, 250], [700, 240], [1150, 180], [320, 420], [800, 760], [1250, 300], [400, 720], [1000, 860]];
  const SHOPS = [[660, 640], [1000, 470], [430, 560], [1180, 400], [300, 500], [1120, 760]];
  const MONUMENTS = [[640, 440], [1060, 650], [380, 380], [1300, 540], [760, 880], [900, 180]];
  function decor(S) {
    const nf = Math.min(FLOWERS.length, Math.floor(S.happy / 12));
    const ns = Math.min(SHOPS.length, Math.floor(S.trade / 15));
    const nm = Math.min(MONUMENTS.length, Math.floor(S.culture / 17));
    return FLOWERS.slice(0, nf).map(([x, y]) => fimg("flowers", x, y, 60)).join("")
      + SHOPS.slice(0, ns).map(([x, y]) => img(O, 16, x, y, 100)).join("")
      + MONUMENTS.slice(0, nm).map(([x, y], i) => img(O2, i % 2 ? 25 : 3, x, y, i % 2 ? 110 : 80)).join("");
  }
  const ANIMALS = [ // [絵, x, y, 横はば, 出てくる はってん度]
    ["deer", 250, 260, 60, 0], ["rabbit", 850, 200, 40, 0], ["bear", 1330, 330, 70, 0],
    ["horse", 1180, 560, 70, 20], ["deer", 1350, 180, 55, 30], ["rabbit", 380, 700, 36, 40], ["horse", 600, 420, 65, 50],
    ["deer", 1020, 780, 55, 60], ["rabbit", 1250, 850, 36, 70], ["bear", 120, 500, 65, 80], ["horse", 900, 250, 60, 90],
  ];
  // 国土の いきもの・うごき：はってん度に おうじて ふえる
  // score = はってん度、S = サブ指標（人口で 人の数、幸福度で 鳥の群れ、食料で 動物）
  function life(score, S) {
    let out = ANIMALS.filter((a) => S.food >= a[4] || score >= a[4]).map((a) => fimg(a[0], a[1], a[2], a[3], "bob", `animation-delay:-${(a[1] % 10) / 8}s`)).join("");
    const n = score >= 100 ? CROWD.length : Math.min(CROWD.length, Math.floor(S.pop / 70));
    out += CROWD.slice(0, n).map((a) => person(...a)).join("");
    const flocks = score >= 100 ? 4 : S.happy >= 75 ? 3 : S.happy >= 50 ? 2 : S.happy >= 25 ? 1 : 0;
    for (let i = 0; i < flocks; i++) out += `<g class="fly" style="animation-duration:${22 + i * 5}s;animation-delay:-${i * 7}s">${fimg("birds", 400, 110 + i * 90, 150 - i * 15)}</g>`;
    if (score >= 50) out += `<g class="soar">${fimg("eagle", 1250, 120, 110)}</g>`;
    if (score >= 80) out += `<g class="soar" style="animation-delay:-8s">${fimg("eagle", 350, 560, 95)}</g>`;
    // 船：商業が さかんなほど ふえる（25 ごとに 1せき）
    const SHIPS = [[1200, 900, 120], [1420, 640, 100], [150, 720, 100], [700, 980, 110]];
    SHIPS.slice(0, Math.min(4, Math.floor(S.trade / 25))).forEach(([x, y, w], i) => { out += `<g class="sail" style="animation-duration:${26 + i * 6}s;animation-delay:-${i * 9}s">${fimg("ship", x, y, w)}</g>`; });
    return out;
  }
  // ---- 悪いもの：数が わるくなるほど ふえる ----
  //  治安が 70 を 切ると モンスターが うろつき（10 ごとに 1ぴき）、30 を 切ると 山賊、10 以下で 魔王の城と ドラゴン
  //  食料が 25 を 切ると 川が あふれる（洪水）、幸福度が 20 を 切ると 雨雲、はってん度が マイナスなら 遺跡と 噴火
  const MONSTER_SPOTS = [["goblin", 650, 700, 48], ["orc", 800, 725, 52], ["wolf", 560, 765, 55], ["skeleton", 900, 765, 50], ["slime", 730, 790, 45], ["spider", 1000, 745, 58], ["ogre", 480, 725, 55]];
  function trouble(S, score, turn) {
    if (turn < 1) return "";
    let out = "";
    const nm = Math.max(0, Math.min(MONSTER_SPOTS.length, Math.floor((70 - S.safety) / 10)));
    out += MONSTER_SPOTS.slice(0, nm).map((a) => fimg(a[0], a[1], a[2], a[3], "bob", `animation-delay:-${(a[1] % 7) / 6}s`)).join("");
    if (S.safety < 30) out += fimg("bandits", 350, 700, 90);
    if (S.safety <= 10) out += fimg("darkcastle", 1400, 200, 130) + `<g class="soar" style="animation-duration:10s">${fimg("dragon", 1250, 260, 130)}</g>`;
    if (S.food < 25 && turn >= 2) out += [[935, 470], [955, 560], [640, 370]].map(([x, y]) => fimg("wave", x, y, 90, "bob")).join("");
    if (S.happy < 20 && turn >= 2) out += raincloud(880, 250) + raincloud(540, 190);
    if (score < 0) out += raincloud(1100, 150);
    return out;
  }

  function field() {
    return `<svg viewBox="0 0 1536 1024" class="land" preserveAspectRatio="xMidYMid slice" style="background:#1d5fa6">
      <defs><radialGradient id="glow"><stop offset="0" stop-color="#ff6a00" stop-opacity=".9"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/></radialGradient></defs>
      <image href="map.jpg" x="0" y="0" width="1536" height="1024"/>
      <rect id="tint" width="1536" height="1024" fill="#000" opacity="0" style="transition:opacity .8s"/>
      <g id="L-volcano" class="layer"></g>
      <g id="L-life"></g>
      <g id="L-trouble"></g>
      <g id="mon-slots">${[0, 1, 2].map((i) => `<g class="mon" data-i="${i}"></g>`).join("")}</g>
      <g id="L-road" class="layer"></g>
      <g id="L-combo" class="layer"></g>
      <g id="L-people" class="layer"></g>
      <g id="L-decor"></g>
      <g id="L-fun" class="layer"></g>
      <g id="L-school" class="layer"></g>
      <g id="L-farm" class="layer"></g>
      <g id="L-market" class="layer"></g>
      <g id="L-guard" class="layer"></g>
      <g id="L-flags" class="layer"></g>
      <g id="fx-sky"></g>
      <g id="fx-land"></g>
    </svg>`;
  }

  // ---- モンスター（草原の 南の あれ地）----
  const MON = [[O, 29, 720, 690, 200], [O, 30, 600, 725, 170], [O, 30, 870, 735, 170]];
  function monster(i) { const m = MON[i]; return `<g class="monbody">${img(...m)}</g>`; }

  // ---- 火山（右下の 島）。はってん度が マイナスに なると 噴火 ----
  function volcano() {
    return `<g class="erupt">
      <circle cx="1420" cy="720" r="120" fill="url(#glow)" class="lava"/>
      ${img(O2, 23, 1420, 805, 230)}
      ${[0, 1, 2].map((i) => `<circle class="smoke" style="animation-delay:${i * 0.6}s" cx="${1415 + i * 8}" cy="690" r="${22 + i * 6}" fill="#555" opacity=".7"/>`).join("")}
    </g>`;
  }
  // ---- 雨雲（あれた国）：灰色の雲から 雨すじが 落ちる ----
  function raincloud(x, y) {
    return `<g class="rainy" transform="translate(${x} ${y})">
      <g class="drops">${[-40, -20, 0, 20, 40].map((dx, i) => `<line x1="${dx}" y1="14" x2="${dx - 6}" y2="44" stroke="#5b8fc9" stroke-width="4" stroke-linecap="round" style="animation-delay:-${i * .15}s"/>`).join("")}</g>
      <ellipse cx="0" cy="0" rx="62" ry="24" fill="#6b6f7a"/><ellipse cx="-30" cy="-10" rx="30" ry="22" fill="#7a7f8a"/><ellipse cx="26" cy="-14" rx="34" ry="26" fill="#7a7f8a"/><ellipse cx="0" cy="-4" rx="40" ry="24" fill="#858a95"/>
    </g>`;
  }
  // ---- 花火：国土の あちこちの 空 ----
  function fireworks(all) {
    const P = all ? [[700, 230], [1150, 200], [300, 420], [1250, 560], [600, 800]] : [[700, 230]];
    return P.map(([x, y], i) => fimg("fireworks", x, y, 230, "fw") .replace('class="fw"', `class="fw" style="animation-delay:${i * 0.45}s"`)).join("");
  }

  return { sage, king, preload, POSES, field, life, trouble, decor, activeCombos, comboMarkup, layer, siteStages, siteMarkup, flags, monster, volcano, fireworks, SITES };
})();
