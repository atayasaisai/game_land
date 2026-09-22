# あたやさいさいゲームランド

ブラウザでそのまま遊べるゲームを集めたサイトです。
公開先 → https://atayasaisai.github.io/game_land/

## 中身

| フォルダ | ゲーム | 状態 |
|---|---|---|
| `index.html` | ゲームランドのトップページ | 公開中 |
| `02_nandemo_learning_quest/` | なんでもラーニングクエスト | 公開中 |
| `04_sekai_no_recipe/` | せかいのレシピ ／ げんしのへや | 公開中 |
| `01_kingdom_of_six/` | 王国発展記 〜六つの選択〜 | 非公開（`.gitignore`） |
| `03_okane_oukoku/` | おかね王国のつくりかた | 非公開（`.gitignore`） |
| `05_kiri_no_sekiban/` | ルーンの谷と霧の王国 〜石板の旅人〜 | 非公開（`.gitignore`） |

すべて素のHTML/CSS/JavaScript。ビルドの手順はありません。
あそんだ記録は、それぞれの端末の `localStorage` にだけ残ります。サーバーには何も送りません。

## 手もとで確かめる

```bash
python3 -m http.server 8399
```
→ http://127.0.0.1:8399/

（`file://` で直接開くと、相対パスの読み込みが止まるブラウザがあります）

## ゲームを1本ふやす

1. フォルダを置く（中に `index.html`）
2. `.gitignore` に名前が入っていたら、その行を消す
3. `index.html` の `var G=[` の並びに1行足す
   — `url:"フォルダ名/"` を書くと「あそぶ ▶」ボタンが出ます
4. `git add -A && git commit -m "..." && git push`

数分で https://atayasaisai.github.io/game_land/ に反映されます。
