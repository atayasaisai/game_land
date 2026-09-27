// ============================================================
// 6人の賢者 〜あたやさいさい国発展記〜  ルール 第2版（画面の処理は入れない）
//
// ★ 第1版（rules.js）に「パターン」を かさねたもの。index.html が どちらを 読むかで 切りかわる。
//   もとに もどすときは index.html の <script src="rules2.js"> を rules.js に かえるだけ。
//
// パターン（PATTERNS）：えらんだ 順番に かくれた しかけ。そろうと 国の「だんかい」が うごく（＝いまの 絵で 発展が 見える）。
//   サブ指標は だんかいから 計算するので いっしょに うごく。はってん度は pts で こまかく うごく。
//   adj … つづけて えらぶ（2つ・3つ）      ord … その順番で えらぶ（あいだに ほかの 賢者が 入って よい。ぜんぶ つづけた ときは adj の ほう）
//   good 良くなる（up＝この回の のびが ふえる → 2だんかい・3だんかいが 出やすい、also＝ほかの ものも のびる）
//   bad 悪くなる（down＝この回の のびが へる、lose＝ほかの ものが さがる）/ none その回の のびが なくなる
//   big 大きく 悪くなる（世界が 暗くなる）
//   プレイヤーには 文では 知らせない。地図の 変化で 気づく。1回に いくつ そろっても ぜんぶ 入れる
//   大きく 悪くなった あとも そこから 国は そだつ。はってん度が 50% まで もどれば 世界は 明るくなる（→ よみがえった国）
//
// 国は 6つの「もの」でできている。それぞれ 0〜3 だんかい。
//   road   みち     farm   はたけ    guard  まもり
//   market いち     school まなび    fun    にぎわい
// 6人のけんじゃは それぞれ 1つを のばす。
// 「いま 国に なにが あるか」で、1回に すすむ だんかいが 1・2・3 と かわる。
// これが 順番で 結果が かわる しくみ。
//
// モンスター（threat 0〜3）は 毎ターン 1ぴき ふえる。
// 3びきに なると、まもりが 3 でなければ はたけ か いち を あらす。
// まもりの けんじゃを よぶと 0びきに もどる。
// ============================================================

const RULES = (() => {
  const ELEMS = ["road", "farm", "guard", "market", "school", "fun"];
  const MAX_LV = 3;

  // 札の ならび順は、正解の順番と ちがえてある。名前は 色だけにして、役目は そうだんして はじめて わかる
  // 名前だけ。役目は 言わない（答えに なるので）。札の ならびは 正解の順と ちがう
  const SAGES = [
    { id: "guard",  name: "力の賢者",   color: "#F0603F", pic: "aka" },
    { id: "school", name: "知恵の賢者", color: "#e8e0d0", pic: "shiro" },
    { id: "farm",   name: "豊穣の賢者", color: "#4CB86B", pic: "midori" },
    { id: "fun",    name: "祈りの賢者", color: "#F5B70A", pic: "hotoke" },
    { id: "road",   name: "創造の賢者", color: "#4A6BC0", pic: "ao" },
    { id: "market", name: "繁栄の賢者", color: "#9b72b0", pic: "murasaki", onepose: true }, // 絵は 立ちポーズ 1まいだけ（ほかの ポーズが 届いたら onepose を 消す）
  ];
  const SAGE = Object.fromEntries(SAGES.map((s) => [s.id, s]));

  function newState() {
    const lv = {};
    ELEMS.forEach((e) => (lv[e] = 0));
    return { lv, threat: 0, damage: 0, picks: [], turn: 0, foresight: false,
      bonus: 0, fired: [], calamity: [], gloom: 0 };
  }

  const has = (st, e) => st.lv[e] >= 1;
  const nothingYet = (st) => ELEMS.every((e) => st.lv[e] === 0);

  // ---- パターン（意味は 先方に 見てもらう 一覧と おなじ。多少 意味から はずれても よい）----
  //  pts = はってん度（%）、st = サブ指標、mark = 地図に 出す しるし（art.js の MARKS）
  const R_ = "road", F_ = "farm", G_ = "guard", M_ = "market", S_ = "school", P_ = "fun";
  const PATTERNS = [
    // 良くなる
    { id: "g_fresh",   kind: "good", type: "adj", seq: [F_, M_],     up: 1, pts: 2, memo: "とれたて市場：とれた ものが すぐ 市に ならぶ" },
    { id: "g_ichifes", kind: "good", type: "adj", seq: [M_, P_],     up: 1, pts: 2, memo: "市の おまつり：もうかった お金で にぎやかに" },
    { id: "g_tsugaku", kind: "good", type: "adj", seq: [R_, S_],     up: 1, pts: 2, memo: "通学路：道が できて 子どもが 学校へ" },
    { id: "g_mimawari",kind: "good", type: "adj", seq: [G_, F_],     up: 1, pts: 2, memo: "見まわりの 畑：兵が いるので 安心して たがやせる" },
    { id: "g_uta",     kind: "good", type: "adj", seq: [P_, S_],     up: 1, pts: 2, memo: "うたで おぼえる：おまつりの うたが 勉強に" },
    { id: "g_hana",    kind: "good", type: "adj", seq: [R_, P_],     up: 1, pts: 1, memo: "道ばたの 花：道に そって 花を うえた" },
    { id: "g_hakobu",  kind: "good", type: "adj", seq: [R_, F_, M_], up: 1, also: { road: 1 }, pts: 3, memo: "はこんで 売る：道 → 畑 → 市 が 1本に つながる" },
    { id: "g_shukaku", kind: "good", type: "adj", seq: [F_, S_, P_], up: 1, also: { farm: 1 }, pts: 3, memo: "しゅうかく祭：みのりを 学んで いわう" },
    { id: "g_keibi",   kind: "good", type: "ord", seq: [P_, G_],     up: 1, pts: 2, memo: "おまつりの 見はり：人が あつまるので 見はりを おいた" },
    { id: "g_minato",  kind: "good", type: "ord", seq: [M_, R_],     up: 1, also: { market: 1 }, pts: 2, memo: "みなとへの 道：市から 海まで 道が のびた" },
    { id: "g_tabibito",kind: "good", type: "ord", seq: [R_, M_, P_], up: 1, also: { market: 1 }, pts: 3, memo: "旅人が あつまる：道 → 市 → おまつり の うわさ" },
    { id: "g_umibe",   kind: "good", type: "ord", seq: [F_, R_, P_], up: 1, also: { farm: 1 }, pts: 3, memo: "海べの 村まつり：畑と 道の あとに 海の まつり" },
    { id: "g_heiwa",   kind: "good", type: "ord", seq: [G_, S_, P_], up: 1, also: { school: 1 }, pts: 3, memo: "へいわな 学び：まもられて 学べて いわえる" },
    { id: "g_iwau",    kind: "good", type: "ord", seq: [S_, F_, M_, P_], up: 2, also: { farm: 1, market: 1 }, pts: 4, memo: "学んで そだてて 売って いわう" },
    // 悪くなる（1だんかい）。悪い パターンが そろった 回は、その回の のびも 良い パターンも なし（良い 絵を 出さない）
    { id: "b_shirake", kind: "bad", type: "adj", seq: [P_, G_],     lose: { fun: 1 }, pts: -2, memo: "おまつりに 兵が 来て しらけた" },
    { id: "b_oshiyose",kind: "bad", type: "adj", seq: [M_, G_],     lose: { market: 1 }, pts: -2, memo: "市に 兵が おしよせて お客が にげた" },
    { id: "b_areta",   kind: "bad", type: "ord", seq: [P_, F_],     lose: { farm: 1 }, pts: -2, memo: "おまつりの あと、畑は あれほうだい" },
    { id: "b_kibishii",kind: "bad", type: "adj", seq: [G_, M_, G_], lose: { market: 1 }, pts: -3, memo: "きびしすぎる 市：見はりばかりで だれも 買わない" },
    { id: "b_fumiare", kind: "bad", type: "adj", seq: [F_, G_],     lose: { farm: 1 }, pts: -2, memo: "兵が 畑を ふみあらした" },
    { id: "b_gomi",    kind: "bad", type: "adj", seq: [P_, R_],     lose: { road: 1 }, pts: -2, memo: "おまつりの ごみで 道が よごれた" },
    { id: "b_kuchidashi", kind: "bad", type: "adj", seq: [S_, M_],  lose: { market: 1 }, pts: -2, memo: "学者が 商売に 口を 出して 店が こまった" },
    { id: "b_heitai",  kind: "bad", type: "adj", seq: [G_, P_],     lose: { fun: 1 }, pts: -2, memo: "兵の 見はりが きびしくて おまつりが しずかに" },
    { id: "b_dekasegi",kind: "bad", type: "ord", seq: [M_, F_],     lose: { farm: 1 }, pts: -2, memo: "市が 先に できて 畑の 人が 町へ 出ていった" },
    // 2だんかい 悪くなる（世界が 暗くなる。big の 名前で 地図の 絵が きまる：volcano 噴火／flood 洪水／rebel 魔王の城／dark 暗やみ）
    { id: "k_funka",   kind: "big", type: "adj", seq: [P_, P_, P_], lose: { fun: 1, farm: 1 }, pts: -10, big: "volcano", memo: "おまつりの さわぎに 山の神が おこった（噴火）" },
    { id: "k_kozui",   kind: "big", type: "adj", seq: [F_, F_, F_], lose: { farm: 2 }, pts: -10, big: "flood", memo: "森を きりすぎて 大雨で 洪水" },
    { id: "k_muhon",   kind: "big", type: "ord", seq: [G_, G_, G_], lose: { guard: 1, school: 1 }, pts: -10, big: "rebel", memo: "兵ばかりの 国で むほんが おきた（魔王の 城）" },
    { id: "k_yami",    kind: "big", type: "adj", seq: [M_, M_, M_], lose: { market: 2 }, pts: -10, big: "dark", memo: "お金の うばいあいで 世界が 暗く なった" },
    { id: "k_kinsho",  kind: "big", type: "adj", seq: [S_, S_, S_], lose: { school: 1, guard: 1 }, pts: -10, big: "dark", memo: "禁じられた 本を 開いて 世界が 暗く なった" },
    { id: "k_kezuri",  kind: "big", type: "adj", seq: [R_, R_, R_], lose: { road: 1, farm: 1 }, pts: -10, big: "volcano", memo: "山を けずりすぎて 火山が 噴火した" },
    // その回の のびが なくなる（何回でも おきる）
    { id: "n_mise",    kind: "none", type: "adj", seq: [M_, M_], again: true, memo: "同じ 店ばかり：もう 買う 人が いない" },
    { id: "n_tsukare", kind: "none", type: "adj", seq: [P_, P_], again: true, memo: "おまつり つづきで みんな つかれた" },
    { id: "n_yomisugi",kind: "none", type: "adj", seq: [S_, S_], again: true, memo: "本の 読みすぎで 手が うごかない" },
  ];
  const PATTERN = Object.fromEntries(PATTERNS.map((p) => [p.id, p]));
  // いま（さいごの 1回で）そろったか
  function completes(p, picks) {
    const n = picks.length, k = p.seq.length;
    if (picks[n - 1] !== p.seq[k - 1]) return false;
    if (p.type === "adj") return n >= k && p.seq.every((x, i) => picks[n - k + i] === x);
    // ord：さいごの 1つは いま。のこりを 前から じゅんに さがす（ぜんぶ となりどうしの ときは adj なので のぞく）
    const find = (j, end, gap) => { // seq[0..j] を picks[0..end] で さがす
      if (j < 0) return gap;
      for (let i = end; i >= 0; i--) if (picks[i] === p.seq[j]) { const r = find(j - 1, i - 1, gap || i < end); if (r) return true; }
      return false;
    };
    return find(k - 2, n - 2, false);
  }

  // けんじゃごとの「なんだんかい すすむか」と そのわけ（セリフ）
  // reasons は [ {text, plus} ] 。plus は そのわけで ふえた だんかい数。
  function gainOf(st, id) {
    const r = [];
    const say = (text, plus) => r.push({ text, plus });
    switch (id) {
      case "road":
        say("まずは 道を つくろう！", 1);
        if (nothingYet(st)) say("まっさらな 土地は 道が ひきやすい！", 1);
        if (has(st, "school")) say("学びの ちからで じょうぶな 石の道に！", 1);
        break;
      case "farm":
        say("たねを まこう！", 1);
        if (has(st, "road")) say("道が あるから しゅうかくを はこべる！", 1);
        else say("道が ないと はこぶのが たいへんだなあ…", 0);
        if (has(st, "school")) say("学んだ しかたで たくさん みのる！", 1);
        break;
      case "guard":
        say("モンスターを おいはらうぞ！", 1);
        if (has(st, "road")) say("道が あれば 見まわりが できる！", 1);
        if (has(st, "farm") || has(st, "market")) say("まもるものが あると 力が わく！", 1);
        else say("まだ まもるものが ないなあ…", 0);
        if (has(st, "school")) say("学んだ 兵は 強い！", 1);
        break;
      case "market":
        say("お店を ひらくぞ！", 1);
        if (has(st, "road")) say("道から お客が やってくる！", 1);
        if (has(st, "farm")) say("はたけの みのりを うろう！", 1);
        if (!has(st, "road") && !has(st, "farm")) say("…でも うるものが ないよ〜", 0);
        if (has(st, "school")) say("学んだ そろばんで しょうばい じょうず！", 1);
        break;
      case "school":
        say("みんなで 学ぼう！", 1);
        if (has(st, "market")) say("市の おかげで 本が 買える！", 1);
        if (has(st, "farm")) say("おなかいっぱいで よく 学べる！", 1);
        else say("おなかが すいて 学べないよ…", 0);
        break;
      case "fun":
        say("おまつりだ！", 1);
        if (has(st, "road") && has(st, "market")) say("道と 市に 人が あつまる！", 1);
        if (has(st, "school")) say("学んだ うたと おどりで もりあがる！", 1);
        if (!has(st, "road") && !has(st, "market") && !has(st, "school")) say("…野原で ひとり おまつり", 0);
        break;
    }
    return r;
  }

  // 1回 えらぶ。state を かえて、おきたことの ならびを かえす。
  function apply(st, id) {
    const events = [];
    st.turn += 1;
    const prev = st.picks[st.picks.length - 1];
    st.picks.push(id);
    const fired = PATTERNS.filter((p) => (p.again || !st.fired.includes(p.id)) && completes(p, st.picks));
    fired.forEach((p) => { if (!st.fired.includes(p.id)) st.fired.push(p.id); });
    const tired = fired.some((p) => p.kind === "none");
    // 悪い パターンが そろった 回：その回の のび・良い パターン・先見の明の のびは なし（良い 絵を 出さない）
    // 同じ 賢者を 3回 つづけた ときから、えらぶ たびに 悪くなる（その ものが 1だんかい さがる。2026-09-27 先方の指示）
    let run = 0; for (let i = st.picks.length - 1; i >= 0 && st.picks[i] === id; i--) run++;
    const repeat = run >= 3 ? [{ id: "r_repeat", kind: "bad", lose: { [id]: 1 }, pts: -5, memo: "同じ 賢者ばかり" }] : [];
    const badTurn = repeat.length > 0 || fired.some((p) => p.kind === "bad" || p.kind === "big");
    const active = badTurn ? [...fired.filter((p) => p.kind === "bad" || p.kind === "big"), ...repeat] : fired;
    st.gloom = badTurn ? (st.gloom || 0) + active.filter((p) => p.kind === "bad").length + 2 * active.filter((p) => p.kind === "big").length
      : Math.max(0, (st.gloom || 0) - fired.filter((p) => p.kind === "good").length - 1); // 良い 回が つづくと うすれる

    // 先見の明：1回目に 知恵の賢者を よぶと、そのあと 毎回 学びが ひとりでに 育つ（真の 100% への 道）
    if (st.turn === 1 && id === "school") st.foresight = true;
    if (st.foresight && st.turn > 1 && !badTurn && st.lv.school < MAX_LV) { st.lv.school += 1; events.push({ type: "grow", elem: "school", to: st.lv.school }); }

    if (id === "guard" && prev === "guard") {
      // つづけて まもりは 逆効果
      events.push({ type: "talk", id, reasons: [{ text: "兵ばかりで はたけに 人が いない！", plus: 0 }] });
      if (st.lv.farm > 0) {
        st.lv.farm -= 1;
        events.push({ type: "lose", elem: "farm", to: st.lv.farm, why: "はたけの 人が へった" });
      }
      st.threat = 0;
      events.push({ type: "threat", value: 0 });
    } else {
      const reasons = tired || badTurn ? [{ text: "…", plus: 0 }] : gainOf(st, id);
      // パターンで この回の のびが ふえる・へる
      const up = tired || badTurn ? 0 : fired.reduce((a, p) => a + (p.up || 0) - (p.down || 0), 0);
      const want = Math.max(0, reasons.reduce((a, r) => a + r.plus, 0) + up);
      const from = st.lv[id];
      const to = Math.min(MAX_LV, from + want);
      events.push({ type: "talk", id, reasons });
      st.lv[id] = to;
      events.push({ type: "gain", elem: id, from, to, amount: to - from, want, capped: to - from < want });

      if (id === "guard") {
        st.threat = 0;
        events.push({ type: "threat", value: 0 });
      } else {
        st.threat = Math.min(3, st.threat + 1);
        events.push({ type: "threat", value: st.threat });
        if (st.threat >= 3 && st.lv.guard < MAX_LV) {
          const target = st.lv.farm > 0 ? "farm" : st.lv.market > 0 ? "market" : null;
          if (target) {
            st.lv[target] -= 1;
            st.damage += 1;
            events.push({ type: "raid", elem: target, to: st.lv[target] });
          } else {
            events.push({ type: "lurk" }); // うろつくだけ（あらすものが ない）
          }
        }
      }
    }

    // パターンの 効果（ぜんぶ 入れる）：ほかの ものが のびる・さがる、大きく 悪くなる
    active.forEach((p) => {
      st.bonus += p.pts || 0;
      Object.entries(p.also || {}).forEach(([e, n]) => {
        const from = st.lv[e], to = Math.min(MAX_LV, from + n);
        if (to > from) { st.lv[e] = to; events.push({ type: "pgain", elem: e, from, to }); }
      });
      Object.entries(p.lose || {}).forEach(([e, n]) => {
        const to = Math.max(0, st.lv[e] - n);
        if (to < st.lv[e]) { st.lv[e] = to; events.push({ type: "plose", elem: e, to }); }
      });
      if (p.kind === "big") st.calamity.push(p.big);
    });
    if (fired.length) events.push({ type: "pattern", ids: active.map((p) => p.id), bad: badTurn, big: active.filter((p) => p.kind === "big").map((p) => p.big) });

    // 第2版：「同じ 賢者を 6回で その道を きわめる」は やめた（3回 つづけた ときから 悪くなる）
    return events;
  }

  const MONKING = -60; // これより 下は モンスター王国（はってん度 -100%）
  const FULL = 17; // 先見の明の 道だけが とどく だんかい（100% には finale も いる）

  // 17だんかい（先見の明の 道だけ）で 100%。それ以外は 98% まで（ふつうの りそうの道 16 → 98%、15 → 94%）
  // 100% は もう1つ 条件つき：はたけの あとに 市を ひらき、さいごは おまつりで しめくくる
  // （17だんかいに とどく 3つの 順番のうち、知恵→創造→力→豊穣→繁栄→祈り だけが これを みたす）
  // 第2版：パターンで 17だんかいに とどく 道が ふえたので、「道の あとに 畑」も 条件に（道が あるから しゅうかくを はこべる）
  const finale = (st) => { const p = st.picks, i = (e) => p.indexOf(e); return p[p.length - 1] === "fun" && i("road") >= 0 && i("road") < i("farm") && i("farm") < i("market"); };
  // はってん度は ゲームの きまり（だんかい・パターン・あらされた 回数）で 決める。地図は この 数に あわせて 描く（index.html の viewLv）
  function score(st) {
    const sum = ELEMS.reduce((a, e) => a + st.lv[e], 0);
    const total = sum - st.damage * 3;
    if (total >= FULL && finale(st)) return 100;
    const raw = Math.round((total / 16) * 100 + (st.bonus || 0)); // パターンで こまかく うごく
    if (raw <= MONKING) return -100; // モンスター王国の完成
    return Math.max(-100, Math.min(98, raw));
  }

  // サブ指標：国の状態から 計算する（絵や 人の数は この数で 決める）
  // どの指標も 2〜3人の 賢者で のびる（おもな 1人が いなくても、ほかの 賢者で ある ていど おぎなえる）
  //   食料 ＝ はたけ ＋ 市（よその国から 買う）＋ 道（はこべる）
  //   商業 ＝ 市 ＋ 道（お客が 来る）＋ はたけ（うる ものが ある）＋ まなび（そろばん）
  //   文化 ＝ まなび ＋ にぎわい（うたと おどり）＋ 道（旅人が 話を はこぶ）
  //   治安 ＝ まもり ＋ にぎわい（みんな 顔見知り）＋ まなび（きまりを まもる）＋ 道（見まわり）
  //   治安は 0 から はじまる（さいしょは モンスターが いる 国なので）
  const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(v)));
  function core(st) {
    const l = st.lv;
    const food = clamp(l.farm * 20 + l.market * 10 + l.road * 6 - st.damage * 6);
    const trade = clamp(l.market * 20 + l.road * 8 + l.farm * 6 + l.school * 4 - st.damage * 4);
    const culture = clamp(l.school * 20 + l.fun * 12 + l.road * 4);
    const safety = clamp(l.guard * 20 + l.fun * 8 + l.school * 6 + l.road * 4 - (l.guard >= MAX_LV ? 0 : st.threat * 8) - st.damage * 8); // じょうへきが あれば モンスターは こわくない
    return { food, trade, culture, safety };
  }
  function stats(st) {
    const l = st.lv; const sc = score(st); const { food, trade, culture, safety } = core(st);
    const happy = clamp((food + culture + safety) / 3 + l.fun * 8 - st.damage * 10);
    const pop = Math.max(0, Math.round(20 + Math.max(0, sc) * 10 + food * 2 + trade + happy));
    return { pop, happy, food, trade, culture, safety };
  }
  const STAT_NAMES = [["pop", "人口"], ["happy", "幸福度"], ["food", "食料"], ["trade", "商業"], ["culture", "文化"], ["safety", "治安"]];

  // 第2版：はってん度が こまかく うごくので、けつまつも こまかく 分けた（BANDS。id は 第1版と おなじ ものは そのまま＝ずかんが 引きつがれる）
  const ENDINGS = [
    { id: "shine",   name: "かがやく国",        text: "みちも はたけも 市も 学校も おまつりも。りそうの 国が できた！" },
    { id: "almost",  name: "大いに さかえる国",  text: "ほとんど りそうの国。でも、まだ その先が あるらしい…。" },
    { id: "hanayaka",name: "はなやかな国",      text: "町じゅうが きらきら。旅人が みんな ふりかえる。" },
    { id: "yutaka",  name: "ゆたかな国",        text: "ごはんも 仕事も たっぷり。みんな 笑顔で くらしている。" },
    { id: "nigiwau", name: "にぎわう国",        text: "朝から 夜まで 人の 声が たえない。" },
    { id: "bloom",   name: "さかえる国",        text: "たくさんの 人が くらす にぎやかな 国に なった。あと ひといき！" },
    { id: "genki",   name: "げんきな 町の国",    text: "町が いくつも できて、子どもたちが 元気に かけまわる。" },
    { id: "nobizakari", name: "のびざかりの国", text: "まだまだ 大きく なりそうな いきおいが ある。" },
    { id: "machi",   name: "町が できた国",      text: "村が あつまって、とうとう 町に なった。" },
    { id: "grow",    name: "そだつ国",          text: "村から 町へ。まだまだ のびそうだ。" },
    { id: "kakekake",name: "町に なりかけの国",  text: "あと すこしで 町と よべそうだ。" },
    { id: "mura",    name: "にぎやかな 村の国",  text: "小さいけれど、村の みんなは なかよしだ。" },
    { id: "sprout",  name: "めばえの国",        text: "小さな 村が できた。順番を かえたら もっと のびるかも？" },
    { id: "komura",  name: "小さな 村の国",      text: "家が いくつか ならんだ。これからが たのしみ。" },
    { id: "shizuka", name: "しずかな 村の国",    text: "風の 音と 鳥の 声だけが きこえる。" },
    { id: "hajimari",name: "はじまりの国",      text: "さいしょの 一歩を ふみだした 国。" },
    { id: "nemuru",  name: "まだ ねむっている国", text: "国は まだ 目を さましていない…。" },
    { id: "sabishii",name: "さびしい国",        text: "人の すがたが ほとんど 見えない。" },
    { id: "blank",   name: "まっさらのまま",    text: "ほとんど なにも のこらなかった…。" },
    { id: "ruin",    name: "あれた国",          text: "モンスターに あらされて、はたけも 市も ぼろぼろ…。" },
    { id: "kuzure",  name: "くずれた国",        text: "こわれた 家が あちこちに。立てなおすのは たいへんだ。" },
    { id: "haikyo",  name: "はいきょの国",      text: "むかしは 人が いたらしい。いまは がれきだけ…。" },
    { id: "monking", name: "モンスター王国の完成", text: "人間は いなくなり、モンスターたちが 国を うごかしている。市も 道も、いまは モンスターの もの。" },
    { id: "revive",  name: "よみがえった国",    text: "いちどは 暗く なった 国が、また かがやきを とりもどした！" },
    { id: "monster", name: "モンスターの国",    text: "まもる人が いない 国は、モンスターの すみかに なってしまった。" },
    { id: "m_road",   name: "道ばかりの国",   text: "道を ひきすぎて 山が くずれ、道まで こわれてしまった…。" },
    { id: "m_farm",   name: "はたけの国",     text: "畑ばかり ひろげて 森が きえ、畑も あれてしまった…。" },
    { id: "m_guard",  name: "じょうへきの国", text: "兵ばかりで はたらく 人が いない。かべの 中は からっぽ…。" },
    { id: "m_market", name: "お店だらけの国", text: "お店ばかりで うる ものが ない。店は つぎつぎ しまった…。" },
    { id: "m_school", name: "学者の国",       text: "本ばかり 読んで ごはんを つくる 人が いない…。" },
    { id: "m_fun",    name: "おまつりの国",   text: "おまつりの さわぎで 山の神が おこり、国は あれてしまった…。" },
  ];
  // [この はってん度 いじょう, けつまつ]（上から じゅんに 見る）
  const BANDS = [[95, "almost"], [90, "hanayaka"], [85, "yutaka"], [80, "nigiwau"], [75, "bloom"], [70, "genki"], [65, "nobizakari"], [60, "machi"],
    [55, "grow"], [50, "kakekake"], [45, "mura"], [40, "sprout"], [35, "komura"], [30, "shizuka"], [25, "hajimari"], [20, "nemuru"], [10, "sabishii"],
    [0, "blank"], [-20, "ruin"], [-40, "kuzure"], [-99, "haikyo"], [-Infinity, "monking"]];
  // ---- 隠し けつまつ（2026-09-27 先方の案）：この 6回の 順番 ぴったりの ときだけ。はってん度の かわりに label を 出す ----
  //  kind は index.html の playHidden() が 地図の 演出を きめる
  const HIDDEN = [
    { id: "h_isekai", kind: "isekai", seq: ["fun", "school", "fun", "farm", "fun", "fun"], label: "？？？",
      name: "気づいたら そこは 異世界だった", text: "光が おさまると、見たことの ない 世界が ひろがっていた…。" },
    { id: "h_alien",  kind: "alien",  seq: ["road", "school", "road", "school", "market", "road"], label: "∞",
      name: "宇宙人と いっしょの 世界線", text: "空から やってきた 宇宙人と いっしょに、見たことも ない 町が できた！" },
    { id: "h_nakayoshi", kind: "nakayoshi", seq: ["school", "farm", "school", "farm", "fun", "school"], label: "100%",
      name: "みんな なかよし！", text: "モンスターも 人も いっしょに おどって わらう。虹の かかる 国に なった！" },
    { id: "h_kagaku", kind: "kagaku", seq: ["school", "guard", "road", "road", "school", "guard"], label: "300%",
      name: "科学技術立国 宣言！", text: "ロケットに 飛行機、自動車に アンテナ。科学の 力で あふれる 国に なった！" },
  ];
  HIDDEN.forEach((h) => ENDINGS.push(h));
  const ENDING = Object.fromEntries(ENDINGS.map((e) => [e.id, e]));
  const hiddenOf = (st) => (st.picks.length === 6 && HIDDEN.find((h) => h.seq.every((x, i) => st.picks[i] === x))) || null;

  function ending(st) {
    const sc = score(st);
    const hid = hiddenOf(st); if (hid) return hid; // 隠し けつまつ が いちばん 先
    if (st.picks.length === 6 && st.picks.every((p) => p === st.picks[0])) return ENDING["m_" + st.picks[0]];
    if (sc <= -100) return ENDING.monking;
    if (st.lv.guard === 0 && st.damage >= 2 && sc < 25) return ENDING.monster; // 建物が 多い 国は モンスターの国に しない（絵と 合わないので）
    if (sc >= 100) return ENDING.shine;
    if (st.calamity && st.calamity.length && sc >= 50) return ENDING.revive;
    return ENDING[BANDS.find(([min]) => sc >= min)[1]];
  }

  // 道すじを まるごと 計算（テストと ヒント用）
  function play(picks) {
    const st = newState();
    const all = picks.map((p) => apply(st, p));
    return { st, events: all, score: score(st), ending: ending(st) };
  }

  // 大きく 悪くなって まだ 暗い（はってん度が 50% に もどるまで）
  const dark = (st) => (!!(st.calamity && st.calamity.length) && score(st) < 50) || score(st) <= -100;
  const monking = (st) => score(st) <= -100;


  return { HIDDEN, hiddenOf, PATTERNS, PATTERN, completes, dark, monking, ELEMS, MAX_LV, SAGES, SAGE, ENDINGS, ENDING, FULL, newState, apply, score, stats, STAT_NAMES, ending, play, gainOf };
})();

if (typeof module !== "undefined") module.exports = RULES;
