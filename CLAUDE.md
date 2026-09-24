# あたやさいさいゲームランド — 運用のきまり

公開先 → https://atayasaisai.github.io/game_land/
リポジトリ → https://github.com/atayasaisai/game_land （public / GitHub Pages は main の直下）

## この作り方を崩さない

- 素の HTML / CSS / JavaScript だけ。ビルド工程も npm も外部ライブラリも入れない。
- 1ゲーム＝1フォルダ、中に `index.html`。他のゲームに依存させない。
- あそんだ記録は `localStorage` だけ。サーバーには何も送らない。Cookie も使わない。
- 読み手は子ども。文章はやさしく、漢字は控えめに。

## 手もとで表示を確かめる

    py -m http.server 8399        （Windows）
    python3 -m http.server 8399   （macOS）

→ http://127.0.0.1:8399/ 　止めるのは Ctrl+C。

`index.html` をダブルクリックで直接開くと、相対パスの画像や問題パックが
読み込まれずに止まるブラウザがあります。かならずこのサーバ経由で見ること。

## 公開のしかた

    git add -A
    git commit -m "..."
    git push

数分で公開先に反映されます。ほかに手順はありません。

## ゲームを1本ふやす

1. フォルダを置く（中に `index.html`）
2. `.gitignore` にその名前があれば、その行を消す
3. `index.html` の、その科目の `<div class="grid">` の中に `<a class="tile" href="フォルダ名/">` を
   1枚足す（となりの札をコピーして、絵・名前・ひとこと・リンク先を変える）。
   札の絵は `img/mon_*.png`（各クエストのモンスターを小さくしたもの）。
   見出しの「○つ」の数も直す。科目そのものを足すときは、看板（`nav.subjects`）と段（`section.sec`）を1組足す。
4. `sitemap.xml` にも1行足す

## トップページのつくり（2026-09-24 に3代目へ作り直し）

- 上から：安心バッジの帯 → 題字（`img/title.jpg`）→ ひとこと → 科目の看板（押すと段へ飛ぶ・上に固定）→
  科目ごとの段（さんすう／こくご／えいご／りか／しゃかい）→ おうちのかたへ（3つの約束・寄付・LINEスタンプ）
- 背景は `img/bg.jpg`（題字と同じ絵の文字なし版）。JavaScript は使っていない。
- ガチャ・気分フィルタ・構想中ゲームの一覧は、3代目でやめた。
- 「国旗クエスト」「首都あてクエスト」の札は、どちらも `02_nandemo_learning_quest/` に入る（ゲーム側は未分離）。
- 2代目（ガチャのあったもの）は `atayasaisai-gameland_v2_2026-09-24.html`（非公開）と git のタグ `top-v2` で戻せる。
- 題字の元絵は `00_incoming/あたやさいさいゲームランドv2.png`（上＝題字、下＝背景）。

## フォルダの見取り図

| 場所 | 中身 | 状態 |
|---|---|---|
| `index.html` | トップページ（科目ごとのゲーム一覧・JSON-LD・OGP） | 公開中 |
| `img/` | トップページの題字・背景・札の絵 | 公開中 |
| `02_nandemo_learning_quest/` | なんでもラーニングクエスト | 公開中 |
| `04_sekai_no_recipe/` | せかいのレシピ ／ げんしのへや | 公開中 |
| `06`〜`14` の `*_quest/` | くく・たしざん・ひきざん・かけざん・わりざん・かんじ・えいたんご・げんそきごう・ねんごう（02と同じエンジン） | 公開中 |
| `01_kingdom_of_six/` | 王国発展記 〜六つの選択〜 | 非公開（`.gitignore`） |
| `03_okane_oukoku/` | おかね王国のつくりかた | 非公開（`.gitignore`） |
| `05_kiri_no_sekiban/` | ルーンの谷と霧の王国 〜石板の旅人〜 | 非公開（`.gitignore`） |
| `00_incoming/` | 外から受け取った素材の元ファイル | 非公開（`.gitignore`） |

**非公開の4つは GitHub に入っていません。この端末にしか無いので、消さないこと。**
`02_nandemo_learning_quest/dist/` は配布用の書き出しで、同じフォルダの
`build-single.py` でいつでも作り直せます。

## 制作環境の事情（2026年9月にMacからWindowsへ移りました）

Claude の記憶（`~/.claude/projects/.../memory/`）には Mac 時代の作業手順が
書かれています。次の2つは **Windows には存在しません**。読み替えてください。

- `osascript -l JavaScript`（JXA）でJSを先に流す → 使えない
- `qlmanage -t` でHTMLをPNGにして目視 → 使えない。ブラウザで直接見ること
- `python3` → `py`

ブラウザペインでスクリーンショットを撮るとき、ペインが `hidden` だと
CSSアニメの0%フレームしか映らず、直前のフレームが残ることがあります。
動いていないように見えても実際は正常なことがあるので、
1秒待ってから撮り直して確かめること（記憶の `browser-pane-animation-trap` 参照）。

## 非公開の3本について

`03_okane_oukoku` は通しで遊べますが、**クリア条件が未調整**です（同フォルダの `STATUS.md`）。
`05_kiri_no_sekiban` は**序章＋第一話だけの試作品**で、`img/` の絵9枚は作り直せません。
どちらもトップページの一覧には載せていません。

## 積み残し

- 訪問者カウント（GoatCounter）が3ページとも未設定。
  `index.html` / `02_nandemo_learning_quest/index.html` / `04_sekai_no_recipe/index.html`
  の末尾にコメントアウトされた1行があり、goatcounter.com で取ったコードを
  `MYCODE` の場所に入れてコメントを外すと動きます。
- `robots.txt` は置いていません。プロジェクトページ配下のものはクローラに読まれないため。
