# 昆虫標本ガイド

BOOM INSECT の甲虫標本制作ガイド。Cloudflare Workers の静的ファイル配信を使用する。
公開先と既存の URL は変更しない。本文は JavaScript が無効でも読める。

## 編集する場所

| 内容の責任 | 編集元 | 公開ページ |
| --- | --- | --- |
| 入口・解説の選び方 | content/guides/index.html | / |
| 一連の作業、道具、固定、乾燥・保管、ラベルを用意する行為 | content/guides/beginner.html | /beginner |
| 軟化の方法選択・実施・完了確認 | content/guides/softening.html | /softening |
| 配置・見せ方・観察・振り返りの工夫 | content/guides/intermediate.html | /intermediate |
| 工程の意味、標本の多面的な価値、記録の学術的意味、教育的背景 | content/guides/adults.html | /adults |
| 参加者向け問い合わせ窓口 | content/guides/contact.html | /contact |
| ページ名・対象範囲・工程番号・受付状態 | src/site.mjs | 全ページ共通 |
| ヘッダー・フッター・手順の目次・参加者向け導線 | src/components/layout.mjs | 全ページ共通 |
| 表示・余白・改行・配色 | src/styles/*.css | styles.css |
| 自前写真のパス・説明・寸法・切り抜き位置 | src/media.mjs | トップと作業手順の写真枠 |
| スマホメニュー・検索・画像エラー時の表示 | src/browser/* | site.js / search.js |
| 検索対象の抽出 | src/search-index.mjs | search-index.json（本文から自動生成） |

同じ作業手順を別ページへ複写しない。理由の説明は各解説ページが持ち、具体的な操作は担当ページへリンクする。
家庭向けに別の全体手順を作らない。軟化を読む必要がある場合だけ分岐し、道具の確認へ戻る。
STEP の番号は src/site.mjs にだけ定義する。軟化の各方法内では「方法 A・1」など別の体系を使う。
採集情報のメモは作業開始時、ラベルを添える行為は仕上げの段階。乾燥中に書いてもよい。

## 更新と確認

Node.js 20 以上。外部ライブラリのインストールは不要。

```sh
node scripts/build.mjs
node scripts/build.mjs --check
node --test tests/site.test.mjs
node scripts/serve.mjs
```

npm のある環境では、npm run build / npm test / npm run dev も同じ処理を実行する。

プレビューは http://127.0.0.1:4173。本文・CSS の変更は再読み込みで反映する。
共有レイアウトや設定を変更した場合はプレビューを再起動する。
公開用 HTML、styles.css、site.js、search.js、search-index.json は生成物なので直接編集しない。
編集元と生成した public の両方をコミットして、従来どおり main に push する。
Cloudflare のデプロイコマンドは既存の npx wrangler deploy のまま。
wrangler.jsonc の build.command がデプロイ前に生成・内部リンク検証を実行する。

`npm test` は生成物の更新漏れ、リンクとアンカー、工程の一貫性、道具や乾燥手順の複製、
問い合わせが入力不可であること、HTML のタグ構造とアクセシブルな参照先を確認する。
文章の科学的正確性や、スマートフォンの実表示を自動で保証するものではない。

## 残しているもの・確認が必要なもの

- 初期 Markdown は content/archive に原文を保管。現行原稿ではなく、ビルド対象にも含めない。
- 2026-09-10 のレイアウト見本に合わせ、トップのメイン写真と 4 ガイドカード、作業手順の自前写真枠を再設置した。今回は枠を空けることが仕様。差し替え方は content/photo-plan.md を参照。
- 固定用バンドと昆虫針の実際の使い方、足・触角の保持方法は主催者の確認が必要。推測で体に針を刺す工程を加えない。
- 受付は準備中。送信先、受信方式、個人情報の扱い、迷惑送信対策を決めるまでフォームを有効化しない。
- noindex は従来どおり維持。公開サイトへの外部リンク・外部画像は追加しない。

内容の根拠・判断の記録は content/editorial-notes.md に残す。公開ディレクトリには出力しない。

## レイアウトとナビゲーション

トップは白地と細い罫線、深緑のボタンで構成する。大画面では 4 列、
タブレットでは 2 列、760px 以下では画像・説明を横並びにした 1 列のガイドカードに切り替える。
本文の読者別の役割は変えない。「家庭でつくる」は軟化の解説ページに接続する。
FAQ は既存の beginner#questions へ接続。開催日時など未提供の情報は作らない。

「はじめてつくる」「もっとくわしく」の本文レイアウトは src/styles/lesson.css で共通管理する。トップと同じ白地・細い罫線を使い、
1100px 以上では横の目次、狭い画面では上部の開閉式目次とする。写真と説明は 760px 以下で一列に並ぶ。
目次は JavaScript 無効でも開閉でき、広い画面での初期展開のみ JavaScript で補う。
初級の 5 工程と公開済みのアンカーは維持する。「もっとくわしく」は作る目的・配置と見せ方・観察と比較・次の制作の 4 章。
作業の STEP 番号は使わず、読む項目の目次にする。自前の配置比較写真は解説の後に配置する。
大人向け・軟化・問い合わせの本文レイアウトにはまだ適用していない。

検索は生成した公開本文だけを使う。入力した検索語は外部サービスに送らない。
スマホメニューは details を使い JavaScript 無効でも開ける。
検索ボタンは JavaScript が動く場合だけ表示する。本文とリンク、写真は JavaScript に依存しない。
