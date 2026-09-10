import { media } from '../media.mjs';

const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function mediaSlot(id, mode = 'article') {
  const item = media[id];
  if (!item) throw new Error(`Unknown photo slot: ${id}`);
  if (item.src && (!/^images\/[\p{L}\p{N}_./ -]+\.(webp|png|jpe?g|avif)$/iu.test(item.src) || item.src.includes('..'))) throw new Error(`Invalid owned image path: ${id}`);
  if (![item.width, item.height].every(value => Number.isInteger(value) && value > 0)) throw new Error(`Invalid photo dimensions: ${id}`);
  const image = item.src ? `<img src="${escape(item.src)}" alt="${escape(item.alt)}" width="${item.width}" height="${item.height}" ${mode === 'hero' ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" style="object-position:${escape(item.position || '50% 50%')}" />` : '';
  // Card photos are decorative beside a descriptive link title. Article slots retain their text label.
  return `<figure class="media-slot media-slot--${mode}" data-media-slot="${id}" data-media-state="${item.src ? 'image' : 'empty'}" style="--media-ratio:${item.width}/${item.height}"${mode === 'card' ? ' aria-hidden="true"' : ''}>
<div class="media-surface">${image}<div class="media-placeholder"${item.src ? ' hidden' : ''}><span class="media-placeholder-label">${escape(item.label)}</span><span class="media-placeholder-note">写真スペース</span></div></div>
${item.caption ? `<figcaption>${escape(item.caption)}</figcaption>` : ''}
</figure>`;
}
