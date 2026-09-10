// Navigation labels, document metadata and the production sequence live here.
export const scope = '対象は甲虫の成虫です。チョウ・ガなど、ほかの昆虫や生きている甲虫は、この手順の対象外です。';
export const contactStatus = '現在、受付準備中です。';
export const navigation = [
  { label: 'はじめてつくる', href: 'beginner.html' },
  { label: 'もっとくわしく', href: 'intermediate.html' },
  { label: '大人・先生のために', href: 'adults.html' },
  { label: '家庭でつくる', href: 'softening.html' },
  { label: 'FAQ', href: 'beginner.html#questions' }
];
export const pages = [
  { slug: 'index', label: 'トップ', title: '昆虫標本ガイド｜BOOM INSECT', description: '甲虫標本の作り方と、姿を楽しみ、観察し、記録を残すためのガイドです。' },
  { slug: 'beginner', label: 'はじめてつくる', description: '会場でも家庭でも使える、甲虫標本の準備から展足・乾燥・保管までの手順です。' },
  { slug: 'intermediate', label: 'もっとくわしく', description: '甲虫標本の配置や見せ方、観察と振り返りを通して、制作を工夫するための解説です。' },
  { slug: 'adults', label: '大人・先生のために', description: '子どもと甲虫標本を作る大人のために、工程の意味、標本の役割、記録の意義をまとめた資料です。' },
  { slug: 'softening', label: '軟化について', description: '乾燥した甲虫の軟化方法の選び方、時間の目安、関節を動かせる状態の確認方法を解説します。' },
  { slug: 'contact', label: 'お問い合わせ', description: 'ワークショップ参加者向けのお問い合わせ窓口。現在、受付準備中です。' }
];
export const workflow = [
  { id: 'home-preparation', label: '甲虫の準備', short: '準備' },
  { id: 'tools', label: '道具をそろえる', short: '道具' },
  { id: 'make-it', label: '足と触角を整える', short: '形を整える' },
  { id: 'dry', label: '乾かして保管する', short: '乾燥・保管' },
  { id: 'label', label: 'ラベルを添える', short: 'ラベル' }
];

// Reading topics are not additional production steps.
export const intermediateTopics = [
  { id: 'purpose', label: '作る目的' },
  { id: 'make-it', label: '配置と見せ方' },
  { id: 'observation', label: '観察と比較' },
  { id: 'reflection', label: '次の制作へ' }
];

export const adultTopics = [
  { id: 'roles', label: '標本の楽しみ方と役割' },
  { id: 'home-preparation', label: '制作工程の意味' },
  { id: 'finish', label: '仕上がりと価値' },
  { id: 'label', label: 'ラベルと記録' },
  { id: 'answering', label: '子どもの疑問に付き合う' },
  { id: 'guide-approach', label: 'このガイドの考え方' }
];

export const softeningTopics = [
  { id: 'before-softening', label: '軟化を始める前に' },
  { id: 'softening-methods', label: '方法を選ぶ' },
  { id: 'paper-method', label: '方法 A：湿らせた紙' },
  { id: 'water-method', label: '方法 B：お湯' },
  { id: 'ready-check', label: '動かせるか確認する' },
  { id: 'after-softening', label: '軟化のあとの作業' }
];
