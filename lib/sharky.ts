/**
 * Sharky — módulo único de integração do site.
 *
 * Pilares usados na venda de garagem:
 *   1. Meta/SEO + analytics  → resolvidos em BUILD-TIME (fail-fast) para o <head>.
 *   2. Catálogo              → os itens à venda: a lista na home e /items/[slug].
 * O blog e o contato do boilerplate foram removidos: não há posts, e o
 * interesse vai direto para o WhatsApp/telefone.
 *
 * Config por env públicas (o SDK é seguro no browser, mas aqui só usamos no
 * server, em build-time / ISR):
 *   NEXT_PUBLIC_SHARKY_API_URL     ex.: https://sharky-backoffice-api.fly.dev
 *   NEXT_PUBLIC_SHARKY_PROJECT_ID  id do projeto Sharky que representa o site
 *   NEXT_PUBLIC_SHARKY_CDN_URL     CDN que serve as imagens (ex.: sharky.b-cdn.net)
 */
import { cache } from "react";
import {
  Sharky,
  SharkyError,
  toSeo,
  type ListItemsFilters,
  type SharkyAnalytics,
  type SharkyField,
  type SharkyItem,
  type SharkySeo,
} from "@sharky/sdk";

const API_URL = process.env.NEXT_PUBLIC_SHARKY_API_URL ?? "";
const PROJECT_ID = process.env.NEXT_PUBLIC_SHARKY_PROJECT_ID ?? "";
const CDN_URL = (
  process.env.NEXT_PUBLIC_SHARKY_CDN_URL ?? "https://sharky.b-cdn.net"
).replace(/\/+$/, "");

export const isSharkyConfigured = () => Boolean(PROJECT_ID);

/** Monta a URL final da imagem (CDN + caminho). Deixa urls absolutas intactas. */
export function toImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${CDN_URL}/${path.replace(/^\/+/, "")}`;
}

// Cliente único compartilhado. Só criado quando há project id (o construtor do
// SDK lança com token vazio). `timeoutMs` faz o build falhar rápido se a API
// travar em vez de pendurar o deploy.
const sharky = PROJECT_ID
  ? new Sharky(PROJECT_ID, {
      ...(API_URL ? { apiUrl: API_URL } : {}),
      timeoutMs: 8000,
    })
  : null;

// ── Pilar 1: Meta/SEO + analytics (BUILD-TIME, fail-fast) ────────────────────

/**
 * Busca a meta do site UMA vez (dedupe via `cache()` do React no mesmo render) e
 * deriva SEO (`toSeo`) + analytics. **Fail-fast, sem fallback:** se a API falhar,
 * lança — e o `next build` quebra (preferimos build vermelho a SEO vazio).
 */
const loadSiteMeta = cache(async () => {
  if (!sharky) {
    throw new Error(
      "Sharky não configurado: defina NEXT_PUBLIC_SHARKY_PROJECT_ID.",
    );
  }
  const meta = await sharky.getMeta(); // sem try/catch → falha propaga
  return {
    seo: toSeo(meta, { cdnUrl: CDN_URL }),
    analytics: meta.analytics ?? null,
  };
});

export async function fetchSiteSeo(): Promise<SharkySeo> {
  return (await loadSiteMeta()).seo;
}

export async function fetchSiteAnalytics(): Promise<SharkyAnalytics | null> {
  return (await loadSiteMeta()).analytics;
}

// ── Modelo compartilhado (post e item de catálogo dividem o SharkyItem) ──────

export type ContentItem = {
  id: string;
  title: string;
  /** HTML do corpo (descrição rica). Use `stripHtml` para prévia em texto. */
  html: string;
  author: { name: string; img: string | null } | null;
  coverUrl: string | null;
  imageUrls: string[];
  categories: string[];
  tags: { id: string; label: string }[];
  /** Variações de preço (só catálogo costuma ter); vazio no blog. */
  price: { label: string; value: number }[];
  customFields: { id: string; label: string | null; value: string }[];
  createdAt: string;
};

function mapItem(item: SharkyItem): ContentItem {
  return {
    id: item.id,
    title: item.title,
    html: item.description ?? "",
    author: item.author
      ? { name: item.author.name, img: toImageUrl(item.author.img) }
      : null,
    coverUrl: toImageUrl(item.thumbnail?.url ?? item.images[0]?.url),
    imageUrls: item.images
      .map((i) => toImageUrl(i.url))
      .filter((url): url is string => url !== null),
    categories: item.categories.map((c) => c.label),
    tags: item.tags.map((t) => ({ id: t.id, label: t.label })),
    price: item.price ?? [],
    customFields: item.customFields ?? [],
    createdAt: item.createdAt,
  };
}

/** Descrição vem como HTML; extrai texto puro para prévias/meta description. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ContentPage = { data: ContentItem[]; total: number };

type ListParams = {
  /** Locale da Sharky (`pt-BR`/`en-US`) — obrigatório, para o tsc cobrar o idioma. */
  locale: string;
  category?: string; // label da categoria
  q?: string;
  take?: number;
  skip?: number;
};

// Categorias mudam raramente; memoiza (label -> id) por render.
const getCategories = cache(
  async (): Promise<SharkyField[]> =>
    sharky ? sharky.listCategories().catch(() => []) : [],
);

async function resolveCategoryId(label: string): Promise<string | null> {
  const all = await getCategories();
  return (
    all.find((c) => c.label.toLowerCase() === label.toLowerCase())?.id ?? null
  );
}

async function buildFilters(p: ListParams): Promise<ListItemsFilters | null> {
  const filters: ListItemsFilters = { locale: p.locale };
  if (p.q) filters.q = p.q;
  if (typeof p.take === "number") filters.take = p.take;
  if (typeof p.skip === "number") filters.skip = p.skip;
  if (p.category) {
    const id = await resolveCategoryId(p.category);
    if (!id) return null; // categoria inexistente → chamador devolve vazio
    filters.categories = [id];
  }
  return filters;
}

/** Categorias do projeto (filtro da listagem). Vazio em qualquer falha. */
export async function fetchCategories(): Promise<string[]> {
  return (await getCategories()).map((c) => c.label);
}

// ── Catálogo (itens à venda) ────────────────────────────────────────────────────────

export async function fetchCatalogPage(
  p: ListParams,
): Promise<ContentPage> {
  if (!sharky) return { data: [], total: 0 };
  try {
    const filters = await buildFilters(p);
    if (!filters) return { data: [], total: 0 };
    const page = await sharky.listCatalogPage(filters);
    return { data: page.data.map(mapItem), total: page.total };
  } catch {
    return { data: [], total: 0 };
  }
}

/**
 * Um item pelo id. `null` só quando a Sharky responde 404 (item removido ou
 * despublicado → página 404). Outras falhas lançam: no ISR o Next mantém a
 * versão anterior da página em vez de trocá-la por um 404 falso.
 */
export const fetchCatalogItem = cache(
  async (id: string, locale: string): Promise<ContentItem | null> => {
    if (!sharky) return null;
    try {
      return mapItem(await sharky.getCatalog(id, { locale }));
    } catch (e) {
      if (e instanceof SharkyError && e.status === 404) return null;
      throw e;
    }
  },
);

// ── Coletar TODOS os itens (para sitemap / generateStaticParams) ─────────────

// A API valida um teto por página; buscar tudo é paginar em blocos.
const MAX_PAGE = 100;

async function collectAll(
  fetchPage: (p: ListParams) => Promise<ContentPage>,
  locale: string,
): Promise<ContentItem[]> {
  const all: ContentItem[] = [];
  for (let skip = 0; ; skip += MAX_PAGE) {
    const { data, total } = await fetchPage({ locale, take: MAX_PAGE, skip });
    all.push(...data);
    if (data.length === 0 || all.length >= total) break;
  }
  return all;
}

/** Todos os itens de catálogo publicados (paginado internamente). */
export const fetchAllCatalog = (locale: string) =>
  collectAll(fetchCatalogPage, locale);

