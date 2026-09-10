import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSite, validateSite } from '../scripts/build.mjs';
import { pages, workflow, scope, contactStatus } from '../src/site.mjs';
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
    intermediate: ['intermediate-start-heading', 'make-it'],
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

test('contact is a disabled preview, with one shared unavailable status', () => {
  const html = page('contact');
  assert.match(html, /<fieldset disabled>/);
  assert.match(html, /type="submit" disabled/);
  assert.doesNotMatch(html, /「必須」の項目を入力/);
  const disabledFields = html.match(/<fieldset disabled>[\s\S]*?<\/fieldset>/)[0];
  assert.equal((disabledFields.match(/<(?:input|textarea)\b/g) || []).length, 5);
  for (const slug of ['beginner', 'intermediate', 'adults', 'softening', 'contact']) assert.ok(page(slug).includes(contactStatus));
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
    assert.ok(html.includes(scope));
  }
});

test('four guide cards and the hero reserve five explicit photo slots on the homepage', () => {
  const html = page('index');
  assert.equal((html.match(/class="home-guide-card"/g) || []).length, 4);
  assert.equal((html.match(/data-media-slot=/g) || []).length, 5);
  const renderedSlots = [...site.entries()].filter(([file]) => file.endsWith('.html')).flatMap(([, html]) => [...html.matchAll(/data-media-slot="([^"]+)"/g)].map(m => m[1]));
  assert.deepEqual(new Set(renderedSlots), new Set(Object.keys(media)));
  assert.equal(renderedSlots.length, 14);
  assert.doesNotMatch(html, /<img[^>]*src="(?:null|undefined|)"/);
});

test('owned images receive dimensions and fallbacks; unknown assets cannot render silently', () => {
  assert.throws(() => mediaSlot('unknown'), /Unknown photo slot/);
  const original = media.hero.src;
  try {
    media.hero.src = 'images/home/hero.webp';
    const html = mediaSlot('hero', 'hero');
    assert.match(html, /width="1600" height="1000"/);
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
