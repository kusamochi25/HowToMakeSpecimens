export function plainText(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, entity => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&nbsp;':' '})[entity]).replace(/\s+/g, ' ').trim();
}

export function createSearchIndex(pages, output) {
  const records = [];
  for (const page of pages.filter(page => !['index', 'contact'].includes(page.slug))) {
    const html = output.get(`${page.slug}.html`).match(/<main\b[\s\S]*?<\/main>/)[0]
      .replace(/<nav\b[\s\S]*?<\/nav>/g, '')
      .replace(/<figure\b[\s\S]*?<\/figure>/g, '')
      .replace(/<aside class="participant-contact"[\s\S]*?<\/aside>/g, '');
    const parents = [];
    let current;
    for (const match of html.matchAll(/<section\b[^>]*>|<\/section>|<h([123])\b[^>]*>[\s\S]*?<\/h\1>/g)) {
      const tag = match[0];
      if (tag.startsWith('<section')) parents.push(tag.match(/\bid="([^"]+)"/)?.[1]);
      else if (tag === '</section>') parents.pop();
      else {
        if (current) current.text = plainText(html.slice(current.start, match.index));
        const anchor = tag.match(/\bid="([^"]+)"/)?.[1] || [...parents].reverse().find(Boolean);
        current = { page: page.label, title: plainText(tag), href: `${page.slug}.html${anchor ? '#' + anchor : ''}`, start: match.index + tag.length };
        records.push(current);
      }
    }
    if (current) current.text = plainText(html.slice(current.start));
  }
  return records.map(({start, ...record}) => record);
}
