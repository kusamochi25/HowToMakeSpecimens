// Set src to a path below public (e.g. images/home/hero.webp) when an owned photo is ready.
// A null src deliberately reserves the requested photo frame without requesting a missing file.
export const media = {
  hero: { src: 'images/home/hero.webp', label: 'メイン写真', alt: '甲虫の姿が分かるメイン写真', width: 1600, height: 1200, position: '65% 50%', caption: '' },
  'card-beginner': { src: null, label: '道具の写真', alt: '標本制作に使う道具', width: 800, height: 450 },
  'card-intermediate': { src: null, label: '甲虫の写真', alt: '甲虫の頭と触角の細部', width: 800, height: 450 },
  'card-adults': { src: null, label: '標本とラベル', alt: '甲虫標本と採集情報のラベル', width: 800, height: 450 },
  'card-home': { src: null, label: '軟化の写真', alt: '家庭で甲虫を軟化するための道具と配置', width: 800, height: 450 },
  tools: { src: 'images/guides/beginner/tools.webp', label: '使う道具の写真', alt: 'スタイロフォームの作業台など、今回使う七つの道具', width: 1200, height: 1200 },
  'surface-drying': { src: 'images/guides/beginner/surface-drying.webp', label: '軟化後の水気を取る写真', alt: '吸水用の紙の上に置いた軟化後の甲虫', width: 1200, height: 1200 },
  'body-height': { src: 'images/guides/beginner/body-height.webp', label: 'クワガタの体高の写真', alt: '横から見たクワガタのからだの厚みと脚', width: 1200, height: 1200 },
  'recess-mark': { src: 'images/guides/beginner/recess-mark.webp', label: 'くぼみの位置を決める写真', alt: 'クワガタの体のそばにピンでくぼみの位置を示した作業台', width: 1200, height: 1200, caption: '作業台にくぼみの位置を付けたところ' },
  'recess-made': { src: 'images/guides/beginner/recess-made.webp', label: 'くぼみを作った写真', alt: 'クワガタのそばにくぼみを作ったスタイロフォームの作業台', width: 1200, height: 1200, caption: 'くぼみを作ったあとの作業台' },
  'legs-open': { src: 'images/guides/beginner/legs-open.webp', label: '脚をひろげた写真', alt: 'おなか側から見た、脚をひろげたクワガタ', width: 1200, height: 1200, caption: 'おなか側から見た、脚をひろげた状態' },
  'body-in-recess': { src: 'images/guides/beginner/body-in-recess.webp', label: 'くぼみに置いた写真', alt: '背中を上にして作業台のくぼみに置いたクワガタ', width: 1200, height: 1200, caption: '背中を上にして、くぼみに置いた状態' },
  fixation: { src: null, label: '固定方法の手元写真', alt: 'バンドと昆虫針と作業台の位置関係', width: 1000, height: 650 },
  legs: { src: null, label: '足を整える手元写真', alt: '足を支えるピンセットの位置', width: 1000, height: 650 },
  antennae: { src: null, label: '触角を整える手元写真', alt: '触角の付け根に近い部分を支えて整える様子', width: 1000, height: 650 },
  drying: { src: null, label: '乾燥中のケースの写真', alt: '固定した甲虫をケースで乾かす配置', width: 1000, height: 650 },
  label: { src: null, label: 'ラベルの写真', alt: '採集と制作の情報を区別したラベルと標本の対応', width: 1000, height: 650 },
  'softening-paper': { src: null, label: '湿度容器の配置写真', alt: '湿った紙と乾いた小皿を隔てて甲虫を置いた容器', width: 1000, height: 650 },
  'softening-water': { src: null, label: 'お湯から取り出す手元写真', alt: '甲虫の体を下からすくって取り出す様子', width: 1000, height: 650 },
  comparison: { src: 'images/guides/intermediate/comparison.webp', label: '配置を見比べる写真', alt: '昆虫標本の配置を見比べるための写真', width: 3781, height: 2836 }
};
