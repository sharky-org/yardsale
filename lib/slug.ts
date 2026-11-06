/**
 * URL de cada item: `/items/<titulo-em-slug>-<id>`. A Sharky não tem slug, só
 * o id (ObjectId de 24 hex); o título na URL é cosmético e o id no fim resolve.
 */
const ID_RE = /-([a-f0-9]{24})$/i;

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80)
    .replace(/-$/, "");

export const buildSlug = (i: { id: string; title: string }) =>
  slugify(i.title) ? `${slugify(i.title)}-${i.id}` : i.id;

/** Id do item a partir do slug (aceita também o id puro); `null` se inválido. */
export const parseId = (slug: string) =>
  slug.match(ID_RE)?.[1] ?? (/^[a-f0-9]{24}$/i.test(slug) ? slug : null);

/** Caminho relativo da página do item. */
export const itemPath = (i: { id: string; title: string }) =>
  `/items/${buildSlug(i)}`;
