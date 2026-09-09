import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { pages } from '../src/site.mjs';
import { layout } from '../src/components/layout.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function renderSite() {
  const output = new Map();
  for (const page of pages) {
    output.set(`${page.slug}.html`, layout(page, await readFile(resolve(root, 'content/guides', `${page.slug}.html`), 'utf8')));
  }
  const styles = await Promise.all(['styles', 'navigation', 'contact'].map(name => readFile(resolve(root, 'src/styles', `${name}.css`), 'utf8')));
  output.set('styles.css', '/* Generated. Edit src/styles/*.css. */\n' + styles.join('\n'));
  return output;
}

export async function validateSite(output) {
  const ids = new Map();
  for (const [file, html] of output) {
    if (!file.endsWith('.html')) continue;
    const found = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    if (new Set(found).size !== found.length) throw new Error(`Duplicate id in ${file}`);
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) throw new Error(`Expected one h1: ${file}`);
    if (/\{\{|写真を入れる場所|写真を予定しています/.test(html)) throw new Error(`Unresolved content: ${file}`);
    ids.set(file, new Set(found));
  }
  for (const [file, html] of output) {
    if (!file.endsWith('.html')) continue;
    for (const [, link] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|\/\/)/.test(link)) throw new Error(`External public link is not approved: ${file} ${link}`);
      const url = new URL(link, `https://local.invalid/${file}`);
      if (url.origin !== 'https://local.invalid') throw new Error(`Unsupported link: ${link}`);
      let target = decodeURIComponent(url.pathname).slice(1) || 'index.html';
      if (!target.includes('.')) target += '.html';
      if (!output.has(target)) await access(resolve(root, 'public', target));
      if (url.hash && !ids.get(target)?.has(decodeURIComponent(url.hash.slice(1)))) throw new Error(`Missing anchor: ${file} -> ${link}`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = await renderSite();
  await validateSite(output);
  const check = process.argv.includes('--check');
  for (const [file, content] of output) {
    const path = resolve(root, 'public', file);
    if (check) {
      if (await readFile(path, 'utf8') !== content) throw new Error(`${file} is stale. Run npm run build.`);
    } else await writeFile(path, content);
  }
  console.log(`${check ? 'Checked' : 'Built'} ${pages.length} pages; internal links and anchors validated.`);
}
