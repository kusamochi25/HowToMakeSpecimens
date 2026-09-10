import { searchRecords } from './search.js';

// Missing images keep the reserved dimensions and readable fallback instead of a broken-image icon.
for (const image of document.querySelectorAll('[data-media-slot] img')) {
  const fallback = () => {
    image.hidden = true;
    const slot = image.closest('[data-media-slot]');
    slot.dataset.mediaState = 'error';
    slot.querySelector('.media-placeholder').hidden = false;
    slot.querySelector('.media-placeholder-note').textContent = '写真を読み込めませんでした';
  };
  image.addEventListener('error', fallback, { once: true });
  if (image.complete && image.naturalWidth === 0) fallback();
}

const menu = document.querySelector('#mobile-menu');
menu?.addEventListener('click', event => {
  if (event.target.closest('a')) menu.open = false;
});
document.addEventListener('click', event => {
  if (menu?.open && !menu.contains(event.target)) menu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});

function revealAnchor() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = id && document.getElementById(id);
  if (!target) return;
  let ancestor = target;
  let opened = false;
  while (ancestor) {
    if (ancestor instanceof HTMLDetailsElement && !ancestor.open) { ancestor.open = true; opened = true; }
    ancestor = ancestor.parentElement;
  }
  if (opened) target.scrollIntoView({ block: 'start' });
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();

// A sidebar on wide screens; a native, initially collapsed contents list on phones.
const lessonIndex = document.querySelector('#lesson-index');
if (lessonIndex) {
  const wideLesson = window.matchMedia('(min-width: 1100px)');
  const syncLessonIndex = () => { lessonIndex.open = wideLesson.matches; };
  syncLessonIndex();
  wideLesson.addEventListener('change', syncLessonIndex);
  lessonIndex.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || wideLesson.matches) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    lessonIndex.open = false;
    // Move keyboard focus out of the collapsed contents without changing browser history.
    const heading = target.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  });
}

const dialog = document.querySelector('#site-search');
const trigger = document.querySelector('[data-search-open]');
if (dialog && trigger && typeof dialog.showModal === 'function') {
  const field = dialog.querySelector('#search-query');
  const status = dialog.querySelector('.search-status');
  const list = dialog.querySelector('.search-results');
  let records;
  let pending;
  let revision = 0;
  let timer;

  async function loadRecords() {
    if (records) return records;
    if (!pending) pending = fetch('search-index.json').then(response => {
      if (!response.ok) throw new Error('Search unavailable');
      return response.json();
    }).then(value => {
      if (!Array.isArray(value)) throw new Error('Invalid search index');
      records = value;
      return records;
    }).finally(() => { pending = undefined; });
    return pending;
  }

  async function search() {
    const version = ++revision;
    const query = field.value.trim();
    list.replaceChildren();
    if (!query) { status.textContent = '例：軟化、乾燥、ラベル。ひらがなの「なんか」でも探せます。'; return; }
    status.textContent = '探しています…';
    try {
      const index = await loadRecords();
      if (version !== revision) return;
      const results = searchRecords(index, query);
      status.textContent = results.length ? `${results.length}件の見出しが見つかりました。` : '見つかりませんでした。別の言葉や、短い言葉で試してください。';
      for (const result of results) {
        const url = new URL(result.href, location.href);
        if (url.origin !== location.origin) continue;
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = result.href;
        const page = document.createElement('span');
        page.className = 'search-result-page';
        page.textContent = result.page;
        const title = document.createElement('strong');
        title.textContent = result.title;
        const snippet = document.createElement('span');
        snippet.className = 'search-result-snippet';
        snippet.textContent = result.text.slice(0, 110) + (result.text.length > 110 ? '…' : '');
        link.append(page, title, snippet);
        link.addEventListener('click', () => dialog.close());
        item.append(link);
        list.append(item);
      }
    } catch {
      if (version === revision) status.textContent = '検索を読み込めませんでした。通信を確認して、もう一度「検索」を押してください。';
    }
  }

  trigger.hidden = false;
  trigger.addEventListener('click', () => {
    if (menu) menu.open = false;
    dialog.showModal();
    field.focus();
    if (field.value.trim()) search();
  });
  dialog.querySelector('[data-search-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { ++revision; clearTimeout(timer); trigger.focus(); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); search(); });
  field.addEventListener('input', () => { clearTimeout(timer); ++revision; timer = setTimeout(search, 150); });
}
