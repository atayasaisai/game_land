#!/usr/bin/env python3
"""index.html と packs/ と画像を、1枚のHTMLにまとめる。

  python3 build-single.py

→ dist/なんでもラーニングクエスト.html ができる。
  相手にはこの1ファイルを送るだけでよい（ダブルクリックで遊べる）。
"""
import base64, mimetypes, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
OUT  = HERE / "dist" / "なんでもラーニングクエスト.html"

def data_uri(path: pathlib.Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return "data:%s;base64,%s" % (mime, base64.b64encode(path.read_bytes()).decode())

def main() -> int:
    html = (HERE / "index.html").read_text(encoding="utf-8")

    # 1) 画像をぜんぶ data URI にして window.__IMG に載せる
    images = {}
    for folder in ("mon", "hero", "boom"):
        for f in sorted((HERE / folder).glob("*.png")):
            images["%s/%s" % (folder, f.name)] = data_uri(f)
    for extra in ("congrats.jpg", "field.jpg", "road.jpg"):
        p = HERE / extra
        if p.exists():
            images[extra] = data_uri(p)

    img_js = "window.__IMG={\n" + ",\n".join(
        '"%s":"%s"' % (k, v) for k, v in sorted(images.items())
    ) + "\n};"

    # 2) 問題パックのファイルを、そのまま埋め込む
    packs = sorted((HERE / "packs").glob("*.js"))
    pack_js = "\n".join(p.read_text(encoding="utf-8") for p in packs)

    tag = '<script src="packs/flags.js"></script>'
    if tag not in html:
        print("！ index.html の <script src=\"packs/flags.js\"> が見つかりません", file=sys.stderr)
        return 1

    html = html.replace(
        tag,
        "<script>\n%s\n</script>\n<script>\n%s\n</script>" % (img_js, pack_js),
    )

    # 3) 1ファイルだと分かる印をタイトル下のメモに足しておく
    html = html.replace(
        "</head>",
        "<!-- 1ファイル版: 画像も問題パックも中に入っています。"
        "ダブルクリックで遊べます。編集するときは index.html のほうを直してください。 -->\n</head>",
    )

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    mb = OUT.stat().st_size / 1024 / 1024
    print("できました: %s (%.1f MB)" % (OUT, mb))
    print("画像 %d枚 / パック %d本 を埋め込みました" % (len(images), len(packs)))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
