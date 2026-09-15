import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { renderSite, validateSite } from '../scripts/build.mjs';
import { pages, workflow, intermediateTopics, adultTopics, softeningTopics, scope, contactStatus, contactLinkLabel, questionsLabel, homePreparationLabel } from '../src/site.mjs';
import { expandContent } from '../src/components/layout.mjs';
import { media } from '../src/media.mjs';
import { mediaSlot } from '../src/components/media.mjs';
import { searchRecords } from '../src/browser/search.mjs';

const site = await renderSite();
const page = slug => site.get(slug + '.html');

test('all public links and anchors resolve; invalid anchors fail the build', async () => {
  await validateSite(site);
  const broken = new Map(site);
  broken.set('index.html', page('index').replace('beginner.html#tools', 'beginner.html#missing'));
  await assert.rejects(validateSite(broken), /Missing anchor/);
});

test('unknown template tokens cannot silently leak into public output', () => {
  assert.throws(() => expandContent('{{ missing }}', 'index'), /Unknown content token/);
});

test('previously published bookmarks remain available', () => {
  const bookmarks = {
    index: ['choose-guide', 'choose-guide-heading', 'purpose-heading', 'before-heading'],
    beginner: ['beginner-start-heading', 'make-it', 'dry', 'questions'],
    intermediate: ['intermediate-start-heading', 'purpose', 'make-it', 'position', 'fix', 'legs', 'antennae', 'finish', 'observation', 'reflection'],
    softening: ['softening-methods', 'steam-method', 'paper-method', 'water-method', 'ready-check'],
    adults: ['roles', 'what', 'photo', 'home-preparation', 'relax', 'fix', 'spread', 'dry', 'finish', 'symmetry', 'broken', 'adjust', 'improve', 'label', 'label-purpose', 'label-date', 'no-label', 'answering']
  };
  for (const [slug, ids] of Object.entries(bookmarks)) {
    for (const id of ids) assert.ok(page(slug).includes('id="' + id + '"'), slug + '#' + id);
  }
});

test('workflow has one numbering source and a single continuous procedure', () => {
  const html = page('beginner');
  const positions = workflow.map((step, i) => {
    const index = html.indexOf('id="' + step.id + '"');
    assert.ok(index > 0);
    assert.match(html.slice(index, index + 180), new RegExp('STEP ' + (i + 1)));
    return index;
  });
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.doesNotMatch(page('intermediate'), /STEP \d|class="tool-list"/);
  assert.doesNotMatch(page('softening'), /STEP 0|HOME FLOW|家庭でつくる順番/);
  assert.ok(html.indexOf('忘れないうちにメモ') < positions[1]);
  assert.match(html, /ラベルは、乾かしている間に用意しても/);
});

test('tools and detailed drying instructions have one owner', () => {
  for (const sentence of ['<li>固定用バンド</li>', 'ケースのふたを開けて、湿気がこもらないようにする']) {
    assert.deepEqual(pages.filter(p => page(p.slug).includes(sentence)).map(p => p.slug), ['beginner']);
  }
  assert.match(page('intermediate'), /href="beginner.html#dry"/);
  assert.match(page('adults'), /href="beginner.html#label"/);
});

test('softening branches converge and return via tools instead of skipping preparation', () => {
  const html = page('softening');
  for (const [start, end] of [['paper-method', 'water-method'], ['water-method', 'ready-check']]) {
    const method = html.slice(html.indexOf('id="' + start + '"'), html.indexOf('id="' + end + '"'));
    assert.match(method, /class="next-step" href="#ready-check"/);
  }
  const next = html.slice(html.indexOf('id="after-softening"'));
  assert.match(next, /href="beginner.html#tools"/);
  assert.match(next, /href="beginner.html#make-it"/);
  assert.ok(html.indexOf('id="steam-method"') > html.indexOf('id="after-softening"'));
});

test('contact is a disabled preview with no submission path and one shared unavailable status', () => {
  const html = page('contact');
  const main = html.match(/<main\b[\s\S]*?<\/main>/)[0].replace(/<!--[\s\S]*?-->/g, '');
  assert.match(main, /<fieldset disabled aria-describedby="contact-status">/);
  assert.match(main, /type="button" disabled/);
  assert.doesNotMatch(main, /<form\b|\bform=|\bformaction=|type="submit"|送信しました/);
  assert.doesNotMatch(html, /「必須」の項目を入力/);
  const disabledFields = main.match(/<fieldset disabled\b[^>]*>[\s\S]*?<\/fieldset>/)[0];
  assert.equal((disabledFields.match(/<(?:input|textarea)\b/g) || []).length, 5);
  assert.equal((main.match(/<(?:input|textarea)\b/g) || []).length, 5);
  assert.equal((disabledFields.match(/<(?:input|textarea)\b[^>]*\srequired(?:\s|\/?>)/g) || []).length, 3);
  for (const id of ['contact-event', 'contact-date']) assert.doesNotMatch(main.match(new RegExp('<input id="' + id + '"[^>]*>'))[0], /\brequired\b/);
  assert.ok(main.indexOf('id="contact-status"') < main.indexOf('class="form-preview"'));
  assert.ok(html.includes(contactStatus));
  for (const item of pages) assert.ok(page(item.slug).includes(contactLinkLabel));
});

test('contact separates the form preview from optional guide links and retains return paths', () => {
  const html = page('contact');
  assert.match(html, /<body class="article-page contact-route">/);
  assert.match(html, /<header class="lesson-intro">/);
  assert.match(html, /<details class="form-preview">/);
  assert.equal((html.match(/class="contact-group"/g) || []).length, 3);
  assert.doesNotMatch(html, /class="workflow-nav"|class="participant-contact"|contact-intro|contact-panel paper/);
  const reference = html.match(/<aside class="contact-reference"[\s\S]*?<\/aside>/)[0];
  for (const id of ['help', 'dry', 'questions']) assert.ok(reference.includes('href="beginner.html#' + id + '"'));
  assert.match(html, /class="contact-bottom-nav"[\s\S]*?href="index.html#choose-guide"[\s\S]*?href="#page-top"/);
});

test('all documents have balanced explicit tags and valid accessibility references', () => {
  const voidTags = new Set(['meta', 'link', 'input', 'br', 'wbr', 'img', 'hr', 'source']);
  for (const item of pages) {
    const html = page(item.slug);
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    const stack = [];
    for (const match of html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(\/?)([a-z][a-z0-9-]*)\b[^>]*>/g)) {
      const [, close, name] = match;
      if (voidTags.has(name)) continue;
      if (close) assert.equal(stack.pop(), name, item.slug + ': ' + match[0]);
      else stack.push(name);
    }
    assert.equal(stack.length, 0, item.slug);
    for (const [, refs] of html.matchAll(/\b(?:aria-labelledby|aria-describedby|for)="([^"]+)"/g)) {
      for (const ref of refs.split(/\s+/)) assert.ok(ids.has(ref), item.slug + ': ' + ref);
    }
    assert.match(html, /name="robots" content="noindex"/);
    assert.doesNotMatch(html, /GUIDE 0[1-4]|class="card-number"/);
    assert.ok(html.includes(scope));
  }
});

test('every page declares the shared SVG icon with a multi-size ICO fallback', () => {
  for (const item of pages) {
    assert.match(page(item.slug), /rel="icon" href="favicon\.svg" type="image\/svg\+xml" sizes="any"/);
    assert.match(page(item.slug), /rel="icon" href="favicon\.ico" sizes="16x16 32x32"/);
  }
  assert.match(site.get('favicon.svg'), /<svg[^>]*viewBox="0 0 16 16"/);
  const ico = site.get('favicon.ico');
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 2);
  for (const [i, size] of [16, 32].entries()) {
    const entry = 6 + 16 * i;
    const offset = ico.readUInt32LE(entry + 12);
    const length = ico.readUInt32LE(entry + 8);
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    assert.ok(offset + length <= ico.length);
    assert.equal(ico.readUInt32LE(offset + 4), size);
    assert.equal(ico.readUInt32LE(offset + 8), size * 2);
  }
});

test('four guide cards and the hero reserve five explicit photo slots on the homepage', () => {
  const html = page('index');
  assert.equal((html.match(/class="home-guide-card"/g) || []).length, 4);
  assert.equal((html.match(/data-media-slot=/g) || []).length, 5);
  const renderedSlots = [...site.entries()].filter(([file]) => file.endsWith('.html')).flatMap(([, html]) => [...html.matchAll(/data-media-slot="([^"]+)"/g)].map(m => m[1]));
  assert.deepEqual(new Set(renderedSlots), new Set(Object.keys(media)));
  assert.equal(renderedSlots.length, 24);
  assert.doesNotMatch(html, /<img[^>]*src="(?:null|undefined|)"/);
});

test('owned images receive dimensions and fallbacks; unknown assets cannot render silently', () => {
  assert.throws(() => mediaSlot('unknown'), /Unknown photo slot/);
  const original = media.hero.src;
  try {
    media.hero.src = 'images/home/hero.webp';
    const html = mediaSlot('hero', 'hero');
    assert.match(html, /width="1600" height="1200"/);
    assert.match(html, /fetchpriority="high"/);
    assert.match(html, /class="media-placeholder" hidden/);
    media.hero.src = 'https://external.invalid/photo.jpg';
    assert.throws(() => mediaSlot('hero'), /Invalid owned image path/);
  } finally { media.hero.src = original; }
});

test('search finds live guide content, normalizes Japanese input and omits photo scaffolding', async () => {
  const records = JSON.parse(site.get('search-index.json'));
  assert.equal(searchRecords(records, '  ').length, 0);
  assert.equal(searchRecords(records, '存在しない検索語abcdef').length, 0);
  assert.ok(searchRecords(records, 'なんか').some(r => r.href.startsWith('softening.html')));
  assert.ok(searchRecords(records, 'ラベル').some(r => r.href === 'beginner.html#label'));
  assert.ok(searchRecords(records, '乾燥').some(r => r.href === 'beginner.html#dry'));
  assert.deepEqual(searchRecords(records, '脚'), searchRecords(records, '足'));
  assert.doesNotMatch(site.get('search-index.json'), /写真スペース|メイン写真|data-media/);
  const linked = new Map(site);
  linked.set('index.html', page('index').replace('</main>', records.map(r => '<a href="' + r.href + '">検索結果</a>').join('') + '</main>'));
  await validateSite(linked);
});

test('mobile menu works as native disclosure and search is progressively enhanced', () => {
  assert.match(page('index'), /<details class="mobile-menu" id="mobile-menu">/);
  assert.match(page('index'), /aria-controls="site-search" hidden/);
  assert.match(page('index'), /<dialog[^>]*id="site-search"[^>]*aria-labelledby="search-heading"/);
  assert.match(site.get('site.js'), /textContent = result.title/);
  assert.doesNotMatch(site.get('site.js'), /innerHTML|localStorage|sessionStorage/);
});

test('beginner lesson pairs instructions and photos, with one native contents and a return path', () => {
  const html = page('beginner');
  assert.match(html, /<body class="article-page beginner-page">/);
  assert.match(html, /<details class="lesson-index" id="lesson-index">/);
  const contents = html.match(/<details class="lesson-index"[\s\S]*?<\/details>/)[0];
  for (const step of workflow) {
    assert.match(contents, new RegExp('href="#' + step.id + '"'));
    assert.ok(contents.includes(step.label));
  }
  assert.match(contents, /href="#enjoy">作った標本を楽しもう/);
  assert.equal((html.match(/class="lesson-chapter"/g) || []).length, 5);
  assert.equal((html.match(/class="lesson-media-row(?: recess-step)?"/g) || []).length, 16);
  assert.equal((html.match(/data-media-slot=/g) || []).length, 16);
  assert.match(html, /id="legs"[\s\S]*?腿節（たいせつ）[\s\S]*?脛節（けいせつ）[\s\S]*?id="tarsi"[\s\S]*?跗節（ふせつ）/);
  assert.match(html, /class="lesson-bottom-nav"[\s\S]*?href="index.html#choose-guide"[\s\S]*?href="#page-top"/);
  assert.match(html, /id="home-softening"[\s\S]*?href="softening.html"/);
  for (const slug of ['index', 'contact']) {
    assert.doesNotMatch(page(slug), /lesson-layout|lesson-chapter|lesson-index|beginner-page/);
  }
});

test('intermediate uses the shared layout with reading topics, not another production workflow', () => {
  const html = page('intermediate');
  assert.match(html, /<body class="article-page intermediate-page">/);
  const contents = html.match(/<details class="lesson-index"[\s\S]*?<\/details>/)[0];
  assert.ok(contents.includes('このページの目次'));
  for (const topic of intermediateTopics) {
    assert.ok(contents.includes('href="#' + topic.id + '"'));
    assert.ok(contents.includes(topic.label));
  }
  assert.equal((html.match(/class="lesson-chapter"/g) || []).length, 4);
  assert.equal((html.match(/class="reference-topic"/g) || []).length, 5);
  assert.equal((html.match(/data-media-slot="comparison"/g) || []).length, 1);
  assert.doesNotMatch(html, /class="workflow-nav"|class="flow-step"|beginner-page/);
  assert.match(html, /class="lesson-bottom-nav"[\s\S]*?href="index.html#choose-guide"[\s\S]*?href="#page-top"/);
  for (const href of ['beginner.html#make-it', 'beginner.html#fix', 'beginner.html#dry', 'softening.html#ready-check', 'adults.html#roles']) assert.ok(html.includes('href="' + href + '"'));
});

test('adult reference has six discoverable chapters and keeps child answers on the beginner page', () => {
  const html = page('adults');
  assert.match(html, /<body class="article-page adults-page">/);
  const contents = html.match(/<details class="lesson-index"[\s\S]*?<\/details>/)[0];
  for (const topic of adultTopics) {
    assert.ok(contents.includes('href="#' + topic.id + '"'));
    assert.ok(contents.includes(topic.label));
  }
  assert.equal((html.match(/class="lesson-chapter"/g) || []).length, 6);
  assert.equal((html.match(/class="reference-topic"/g) || []).length, 16);
  assert.doesNotMatch(html, /class="workflow-nav"|class="flow-step"|class="beginner-question"/);
  assert.match(contents, /href="beginner.html#questions"/);
  assert.match(html, /class="lesson-bottom-nav"[\s\S]*?href="index.html#choose-guide"[\s\S]*?href="#page-top"/);
  const records = JSON.parse(site.get('search-index.json'));
  for (const id of ['guide-approach', 'respect-intent', 'facts-and-ideas', 'unanswered']) {
    assert.ok(records.some(record => record.href === 'adults.html#' + id));
  }
});

test('home preparation uses its own contents, explicit method choices and a shared readiness check', () => {
  const html = page('softening');
  assert.match(html, /<body class="article-page softening-page">/);
  const contents = html.match(/<details class="lesson-index"[\s\S]*?<\/details>/)[0];
  for (const topic of softeningTopics) {
    assert.ok(contents.includes('href="#' + topic.id + '"'));
    assert.ok(contents.includes(topic.label));
  }
  assert.doesNotMatch(html, /class="workflow-nav"|class="flow-step"/);
  assert.equal((html.match(/class="lesson-chapter"/g) || []).length, 6);
  assert.equal((html.match(/class="softening-choice"/g) || []).length, 2);
  assert.equal((html.match(/class="reference-topic softening-step"/g) || []).length, 11);
  const choices = html.slice(html.indexOf('id="softening-methods"'), html.indexOf('id="paper-method"'));
  assert.match(choices, /方法 Aの手順を見る/);
  assert.match(choices, /方法 Bの手順を見る/);
  assert.match(choices, /両方を続けて行う手順ではありません/);
  for (const [start, end, photo] of [['paper-method', 'water-method', 'softening-paper'], ['water-method', 'ready-check', 'softening-water']]) {
    const method = html.slice(html.indexOf('id="' + start + '"'), html.indexOf('id="' + end + '"'));
    assert.match(method, /<details class="softening-method" name="softening-method">/);
    assert.ok(method.indexOf('data-media-slot="' + photo + '"') < method.indexOf('class="softening-steps"'));
    const exit = method.match(/<nav class="method-exit lesson-actions"[\s\S]*?<\/nav>/)[0];
    assert.match(exit, /href="#ready-check"/);
    assert.doesNotMatch(exit, /href="#(?:paper|water)-method"/);
  }
  assert.match(html, /class="lesson-bottom-nav"[\s\S]*?href="index.html#choose-guide"[\s\S]*?href="#page-top"/);
});

test('shared destinations keep consistent names and contact comes before the final page navigation', () => {
  for (const item of pages) {
    const html = page(item.slug);
    for (const [destination, label] of [['contact.html', contactLinkLabel], ['beginner.html#questions', questionsLabel], ['softening.html', homePreparationLabel]]) {
      const footer = html.match(/<nav class="footer-nav"[\s\S]*?<\/nav>/)[0];
      const links = [...footer.matchAll(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/g)];
      assert.equal(links.find(link => link[1] === destination)?.[2], label);
    }
    if (['index', 'contact'].includes(item.slug)) continue;
    const main = html.match(/<main\b[\s\S]*?<\/main>/)[0];
    const contactPosition = main.indexOf('<aside class="participant-contact"');
    const navigationPosition = main.indexOf('<nav class="lesson-bottom-nav"');
    assert.ok(contactPosition > main.indexOf('<article class="lesson-content"'));
    assert.ok(contactPosition < navigationPosition);
    assert.equal((main.match(/class="participant-contact"/g) || []).length, 1);
    assert.doesNotMatch(main.slice(navigationPosition), /<aside|<section/);
  }
});

test('method links open only their selected disclosure, including unchanged hashes and nested bookmarks', () => {
  const documentEvents = new Map();
  const windowEvents = new Map();
  class Details {
    open = false;
    parentElement = null;
    events = new Map();
    addEventListener(name, handler) { this.events.set(name, handler); }
    querySelector() { return null; }
  }
  const paper = new Details();
  const water = new Details();
  const summary = { focus() {} };
  const section = method => ({
    parentElement: null,
    scrolls: 0,
    querySelector(selector) { return selector.endsWith('> summary') ? summary : method; },
    scrollIntoView() { this.scrolls++; }
  });
  const paperSection = section(paper);
  const waterSection = section(water);
  paper.parentElement = paperSection;
  water.parentElement = waterSection;
  const child = { parentElement: paper, querySelector() { return null; }, scrollIntoView() {} };
  const anchors = new Map([['paper-method', paperSection], ['water-method', waterSection], ['ready-check', section(null)], ['nested-bookmark', child]]);
  const location = { href: 'https://guide.example/softening.html', origin: 'https://guide.example', pathname: '/softening.html', search: '', hash: '#ready-check' };
  const document = {
    querySelector() { return null; },
    querySelectorAll(selector) { return selector === '.softening-method' ? [paper, water] : []; },
    getElementById(id) { return anchors.get(id); },
    addEventListener(name, handler) { documentEvents.set(name, [...(documentEvents.get(name) || []), handler]); }
  };
  runInNewContext(site.get('site.js').replace(/^import[^\n]*\n/, ''), {
    document, location, URL, HTMLDetailsElement: Details,
    window: { addEventListener(name, handler) { windowEvents.set(name, handler); } }
  });
  assert.equal(paper.open || water.open, false, 'readiness link does not expand either method');
  const navigate = hash => { location.hash = hash; windowEvents.get('hashchange')(); };
  navigate('#paper-method');
  assert.equal(paper.open, true);
  assert.equal(water.open, false);
  navigate('#water-method');
  assert.equal(paper.open, false);
  assert.equal(water.open, true);
  assert.ok(waterSection.scrolls > 0);
  water.open = false;
  const click = (overrides, href = location.hash) => {
    const event = { button: 0, target: { closest: () => ({ href }) }, ...overrides };
    for (const handler of documentEvents.get('click')) handler(event);
  };
  click({ ctrlKey: true });
  assert.equal(water.open, false, 'opening a link in another tab does not change this page');
  click();
  assert.equal(water.open, true, 'the same hash reopens a manually closed method');
  water.open = false;
  click({}, 'softening.html#water-method');
  assert.equal(water.open, true, 'a search result with a full page path reopens the same method');
  water.open = false;
  click({}, 'https://elsewhere.example/softening.html#water-method');
  assert.equal(water.open, false, 'other sites do not change the local disclosure');
  navigate('#nested-bookmark');
  assert.equal(paper.open, true);
  assert.equal(water.open, false);
  water.open = true;
  water.events.get('toggle')();
  assert.equal(paper.open, false, 'manual expansion closes the other method in older browsers');
  assert.doesNotThrow(() => navigate('#%broken'));
  assert.doesNotThrow(() => navigate('#not-present'));
});
