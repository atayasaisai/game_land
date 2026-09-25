// ============================================================
// 6人の賢者 〜あたやさいさい国発展記〜  ルール（画面の処理は入れない）
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
    return { lv, threat: 0, damage: 0, picks: [], turn: 0, foresight: false };
  }

  const has = (st, e) => st.lv[e] >= 1;
  const nothingYet = (st) => ELEMS.every((e) => st.lv[e] === 0);

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

    // 先見の明：1回目に 知恵の賢者を よぶと、そのあと 毎回 学びが ひとりでに 育つ（真の 100% への 道）
    if (st.turn === 1 && id === "school") st.foresight = true;
    if (st.foresight && st.turn > 1 && st.lv.school < MAX_LV) { st.lv.school += 1; events.push({ type: "grow", elem: "school", to: st.lv.school }); }

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
      const reasons = gainOf(st, id);
      const want = reasons.reduce((a, r) => a + r.plus, 0);
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

    // おなじ けんじゃを 6回 → その道を きわめる（絵は 3だんかいに）
    if (st.turn === 6 && st.picks.every((p) => p === id)) {
      st.lv[id] = MAX_LV;
      events.push({ type: "master", elem: id });
    }
    return events;
  }

  const FULL = 17; // 先見の明の 道だけが とどく だんかい

  // 17だんかい（先見の明の 道だけ）で 100%。それ以外は 98% まで（ふつうの りそうの道 16 → 98%、15 → 94%）
  function score(st) {
    const total = ELEMS.reduce((a, e) => a + st.lv[e], 0) - st.damage * 3;
    if (total >= FULL) return 100;
    const raw = Math.round((total / 16) * 100);
    return Math.max(-100, Math.min(98, raw));
  }

  // サブ指標：国の状態から 計算する（絵や 人の数は この数で 決める）
  const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(v)));
  function stats(st) {
    const l = st.lv; const sc = score(st);
    const food = clamp(l.farm * 28 + (l.road ? 8 : 0) + (l.guard ? 4 : 0) - st.damage * 6);
    const trade = clamp(l.market * 27 + l.road * 6 + (l.farm ? 5 : 0) - st.damage * 4);
    const culture = clamp(l.school * 25 + l.fun * 12);
    const safety = clamp(40 + l.guard * 22 - (l.guard >= MAX_LV ? 0 : st.threat * 14) - st.damage * 8); // じょうへきが あれば モンスターは こわくない
    const happy = clamp((food + culture + safety) / 3 + l.fun * 8 - st.damage * 10);
    const pop = Math.max(0, Math.round(20 + Math.max(0, sc) * 10 + food * 2 + trade + happy));
    return { pop, happy, food, trade, culture, safety };
  }
  const STAT_NAMES = [["pop", "人口"], ["happy", "幸福度"], ["food", "食料"], ["trade", "商業"], ["culture", "文化"], ["safety", "治安"]];

  const ENDINGS = [
    { id: "shine",   name: "かがやく国",      text: "みちも はたけも 市も 学校も おまつりも。りそうの 国が できた！" },
    { id: "almost",  name: "大いに さかえる国", text: "ほとんど りそうの国。でも、まだ その先が あるらしい…。" },
    { id: "bloom",   name: "さかえる国",      text: "たくさんの 人が くらす にぎやかな 国に なった。あと ひといき！" },
    { id: "grow",    name: "そだつ国",        text: "村から 町へ。まだまだ のびそうだ。" },
    { id: "sprout",  name: "めばえの国",      text: "小さな 村が できた。順番を かえたら もっと のびるかも？" },
    { id: "blank",   name: "まっさらのまま",  text: "ほとんど なにも のこらなかった…。" },
    { id: "ruin",    name: "あれた国",        text: "モンスターに あらされて、はたけも 市も ぼろぼろ…。" },
    { id: "monster", name: "モンスターの国",  text: "まもる人が いない 国は、モンスターの すみかに なってしまった。" },
    { id: "m_road",   name: "道ばかりの国",   text: "どこまでも 道が つづく。でも だれも 歩いていない…。" },
    { id: "m_farm",   name: "はたけの国",     text: "見わたすかぎり はたけ。とれた 野さいは だれが 食べるの？" },
    { id: "m_guard",  name: "じょうへきの国", text: "高い かべに かこまれて、モンスターは 1ぴきも いない。人も いない。" },
    { id: "m_market", name: "お店だらけの国", text: "お店は ならんだ。うるものは ない。" },
    { id: "m_school", name: "学者の国",       text: "みんな 本を 読んでいる。ごはんは だれが つくるの？" },
    { id: "m_fun",    name: "おまつりの国",   text: "まいにち おまつり。たのしいけど、おなかが すいた…。" },
  ];
  const ENDING = Object.fromEntries(ENDINGS.map((e) => [e.id, e]));

  function ending(st) {
    const sc = score(st);
    if (st.picks.length === 6 && st.picks.every((p) => p === st.picks[0])) return ENDING["m_" + st.picks[0]];
    if (st.lv.guard === 0 && st.damage >= 2) return ENDING.monster;
    if (sc >= 100) return ENDING.shine;
    if (sc >= 95) return ENDING.almost;
    if (sc >= 75) return ENDING.bloom;
    if (sc >= 50) return ENDING.grow;
    if (sc >= 25) return ENDING.sprout;
    if (sc >= 0) return ENDING.blank;
    return ENDING.ruin;
  }

  // 道すじを まるごと 計算（テストと ヒント用）
  function play(picks) {
    const st = newState();
    const all = picks.map((p) => apply(st, p));
    return { st, events: all, score: score(st), ending: ending(st) };
  }

  return { ELEMS, MAX_LV, SAGES, SAGE, ENDINGS, ENDING, FULL, newState, apply, score, stats, STAT_NAMES, ending, play, gainOf };
})();

if (typeof module !== "undefined") module.exports = RULES;
