# 自前写真の差し替え

トップは添付レイアウトに合わせて、メイン写真 1 枠・ガイドカード 4 枠を用意した。
手順ページには、水気を取る写真・道具・体高・くぼみの工程 2 枚・脚を開く写真・くぼみに置く写真・からだと大顎の固定 2 枚・腿節と脛節の写真 2 枚・跗節の写真 2 枚・触角・乾燥・ラベル・軟化 2 方法・配置比較の 19 枠を置いた。
すべて同じ仕組みで管理する。画像未登録時の枠は、今回の依頼で意図的に表示している。

## 差し替え手順

1. 自分で撮影した写真を public/images/ 以下に置く（例：public/images/home/hero.webp）。
2. src/media.mjs の該当項目の src: null を src: 'images/home/hero.webp' に変更する。
3. alt を実際に写っている内容に合わせ、width / height に実画像の寸法を設定する。
4. トップ写真・カードは枠に合わせてトリミングされる。position で中心位置を調整できる（例：'70% 50%'）。
5. 必要な写真だけ caption を設定する。種名は実際の写真を確認できたときだけ入れる。
6. node scripts/build.mjs と node --test tests/site.test.mjs を実行し、編集元と生成物を一緒にコミットする。

本文の手元写真は登録後、全体を隠さず実画像の縦横比で表示する。カード用とは別の切り抜きを使ってもよい。
src が null の間は画像リクエストを行わない。読み込みに失敗した場合は JavaScript が枠の表示に戻す。

## 撮影する内容

| 設定のキー | 配置 | 写真の内容 |
| --- | --- | --- |
| hero | トップのメイン | 主役の甲虫。PC の右側・スマホの右側に置いて見切れない構図 |
| card-beginner | ガイド 01 | ピンセットと今回の作業台など |
| card-intermediate | ガイド 02 | 甲虫の頭や触角の細部 |
| card-adults | ガイド 03 | 標本とラベル |
| card-home | ガイド 04 | 軟化の道具・容器 |
| tools | beginner#tools | 今回使う 7 種類の道具と名前 |
| surface-drying | beginner#surface-drying | 軟化後の甲虫を吸水用の紙の上に置いた様子 |
| body-height | beginner#body-height | 作業台に置いたクワガタの体の厚みを横から見る |
| recess-mark | beginner#board-recess | 昆虫針でくぼみの位置に印を付けた作業台 |
| recess-made | beginner#board-recess | カッターでくぼみを作った作業台 |
| legs-open | beginner#open-legs | おなか側から脚をひろげた状態 |
| body-in-recess | beginner#place | 背中を上にして、からだをくぼみに置いた状態 |
| fixation | beginner#fix | バンドと作業台の針でからだを固定した状態 |
| jaw-fixation | beginner#fix | からだを固定したあと、大顎の向きを針で支えた状態 |
| legs | beginner#legs | 腿節と脛節から脚の位置を整える全体像 |
| legs-closeup | beginner#legs | 脚の付け根付近と作業台の針を拡大した写真 |
| tarsi | beginner#tarsi | 腿節・脛節を整えたあと、跗節の位置を支える様子 |
| tarsi-closeup | beginner#tarsi | 後脚の跗節と爪を拡大した写真 |
| antennae | beginner#antennae | 触角を支える位置と保持方法 |
| drying | beginner#dry | 乾燥中のケースと通気 |
| label | beginner#label | 採集情報と制作情報、標本との対応 |
| softening-paper | softening#paper-method | 湿った紙と乾いた小皿を隔てた配置 |
| softening-water | softening#water-method | 体を下からすくって取り出す手元 |
| comparison | intermediate#make-it | 配置による見え方の違い |

未撮影の工程は、実際の作業方法を確認してから写真と説明を追加する。
見本のスクリーンショットを切り抜いて本番写真には使わない。外部画像・生成画像も使わない。
