# `@sharky/sdk` — Referência de integração

Superfície pública do cliente, tipos, endpoints e templates de código. Tudo aqui
foi verificado contra a versão **0.7.0** do SDK.

## Cliente

```ts
import { Sharky, toSeo } from "@sharky/sdk";

const sharky = new Sharky(PROJECT_ID, {
  apiUrl,      // base da API (default: produção)
  locale,      // locale padrão do conteúdo traduzível (ex.: "pt-BR")
  fetch,       // fetch custom (opcional)
  timeoutMs,   // timeout por request — use p/ fail-fast no build (ex.: 8000)
});
```

O cliente só toca a superfície pública da Sharky, então é seguro no browser e no
server. `PROJECT_ID` é o identificador do projeto que representa o site.

## Métodos

| Método | Retorno | Uso |
| --- | --- | --- |
| `getMeta()` | `SharkyMeta` | Meta do site (nome, descrição, socials, tema, SEO, analytics). |
| `getSeo(opts?)` | `SharkySeo` | SEO normalizado p/ `<head>`. **Fail-fast.** |
| `getAnalytics()` | `SharkyAnalytics \| null` | Config Umami. **Fail-fast.** |
| `listPosts(filters?)` | `SharkyItem[]` | Blog — lista simples. |
| `listPostsPage(filters?)` | `SharkyPage<SharkyItem>` | Blog — com `{ data, total, take, skip }`. |
| `getPost(id, opts?)` | `SharkyItem` | Post único (lança se não existir). |
| `listCatalog(filters?)` | `SharkyItem[]` | Catálogo — lista simples. |
| `listCatalogPage(filters?)` | `SharkyPage<SharkyItem>` | Catálogo — paginado. |
| `getCatalog(id, opts?)` | `SharkyItem` | Item de catálogo único. |
| `listCategories()` | `SharkyField[]` | Categorias ativas. |
| `listTags()` | `SharkyField[]` | Tags ativas. |
| `submitContact(input)` | `void` | Envia lead (requer `name` + `message` + email/phone). |

`toSeo(meta, { cdnUrl })` é uma função pura (sem I/O) que normaliza `SharkyMeta` em
`SharkySeo` — útil quando você quer um único `getMeta()` e derivar SEO + analytics
sem duas chamadas. Precedência: bloco "SEO & Meta" vence o nome/descrição do projeto.

## Tipos principais

```ts
interface SharkyItem {         // post OU item de catálogo (mesmo shape)
  id: string;                  // ⚠️ NÃO há slug — a URL é derivada de id + título
  title: string;
  description: string | null;  // HTML
  price: { label: string; value: number }[];
  author: { name: string; img: string | null } | null;
  thumbnail: { id: string; url: string } | null;  // url relativa → prefixe CDN
  images: { id: string; url: string }[];           // urls relativas → prefixe CDN
  categories: { id: string; label: string; type: "CATEGORY" }[];
  tags: { id: string; label: string; type: "TAG" }[];
  customFields: { id: string; label: string | null; value: string }[];
  createdAt: string;           // ISO
}

interface ListItemsFilters {
  q?: string;                  // busca em título/descrição
  categories?: string[];       // ids de categoria
  tags?: string[];             // ids de tag
  take?: number;               // ⚠️ MÁX 100 (a API valida e lança acima disso)
  skip?: number;
  locale?: string;             // sobrepõe o locale default do cliente
}

interface SharkyPage<T> { data: T[]; total: number; take: number; skip: number; }

interface SharkySeo {          // saída de toSeo/getSeo
  siteName: string; title: string; description: string;
  keywords: string[]; image: string | null; favicon: string | null;
  googleTagId: string | null; metaPixelId: string | null;
  socials: SharkySocials;
}

interface SharkyAnalytics { websiteId: string | null; scriptUrl: string | null; }
```

## Endpoints (para debug via curl)

| Endpoint | Método SDK |
| --- | --- |
| `/projects/public/{token}/meta` | `getMeta` |
| `/catalog/public/{token}?type=CATALOG` | `listCatalog*` |
| `/catalog/public/{token}?type=POST` | `listPosts*` |
| `/catalog/public/{token}/{id}` | `getCatalog` / `getPost` |
| `/field/public/{token}` | `listCategories` / `listTags` |
| `/contacts/{token}` | `submitContact` |

A rota de listagem devolve `{ data, meta: { total, take, skip } }`. Blog e catálogo
compartilham `/catalog/public/{token}`, distinguidos pelo query `type`.

Debug rápido:
```bash
curl -s "https://api.bysharky.com/catalog/public/<PROJECT_ID>?type=CATALOG&take=3"
curl -s "https://api.bysharky.com/projects/public/<PROJECT_ID>/meta"
```

## Templates de código

### `lib/sharky.ts` (essência)

```ts
import { cache } from "react";
import { Sharky, toSeo, type ListItemsFilters, type SharkyItem } from "@sharky/sdk";

const CDN_URL = (process.env.NEXT_PUBLIC_SHARKY_CDN_URL ?? "https://sharky.b-cdn.net").replace(/\/+$/, "");
export function toImageUrl(p?: string | null) {
  if (!p) return null;
  return /^https?:\/\//i.test(p) ? p : `${CDN_URL}/${p.replace(/^\/+/, "")}`;
}

const sharky = process.env.NEXT_PUBLIC_SHARKY_PROJECT_ID
  ? new Sharky(process.env.NEXT_PUBLIC_SHARKY_PROJECT_ID, {
      apiUrl: process.env.NEXT_PUBLIC_SHARKY_API_URL,
      locale: "pt-BR",
      timeoutMs: 8000,
    })
  : null;

// Pilar 1 — meta em build-time, fail-fast, dedupe com cache().
const loadMeta = cache(async () => {
  if (!sharky) throw new Error("Sharky não configurado.");
  const meta = await sharky.getMeta();              // SEM try/catch → build quebra
  return { seo: toSeo(meta, { cdnUrl: CDN_URL }), analytics: meta.analytics ?? null };
});
export const fetchSiteSeo = async () => (await loadMeta()).seo;
export const fetchSiteAnalytics = async () => (await loadMeta()).analytics;

// Listagens — degradação graciosa (retornam vazio em falha).
const MAX_PAGE = 100;                               // ⚠️ teto da API
async function collectAll(fetchPage: (p: { take: number; skip: number }) => Promise<{ data: SharkyItem[]; total: number }>) {
  const all: SharkyItem[] = [];
  for (let skip = 0; ; skip += MAX_PAGE) {
    const { data, total } = await fetchPage({ take: MAX_PAGE, skip });
    all.push(...data);
    if (!data.length || all.length >= total) break;
  }
  return all;
}
```

### URL amigável (`lib/slug.ts`)

```ts
const ID_RE = /-([a-f0-9]{24})$/i;                  // ObjectId de 24 hex no fim
export const slugify = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
   .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
export const buildSlug = (i: { id: string; title: string }) =>
  slugify(i.title) ? `${slugify(i.title)}-${i.id}` : i.id;
export const parseId = (slug: string) =>
  slug.match(ID_RE)?.[1] ?? (/^[a-f0-9]{24}$/i.test(slug) ? slug : null);
```

### Detalhe SSG + ISR (`app/blog/[slug]/page.tsx`)

```ts
export const revalidate = 300;                       // ISR
export const dynamicParams = true;                   // itens novos: sob demanda
export async function generateStaticParams() {
  const posts = await fetchAllPosts();               // usa o coletor (pagina ≤100)
  return posts.map((i) => ({ slug: buildSlug(i) }));
}
export async function generateMetadata({ params }) {
  const post = await fetchPost(parseId((await params).slug)!);
  // ...OG por post (title, description = stripHtml, images = [coverUrl])
}
```

### Contato (server action)

```ts
"use server";
import { submitContact } from "@/lib/sharky";
export async function sendContact(_prev, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!name || !email || !message) return { ok: false, error: "Preencha tudo." };
  try { await submitContact({ name, email, message }); return { ok: true }; }
  catch { return { ok: false, error: "Falha ao enviar." }; }
}
```

## Analytics / tracking

`SharkyMeta.analytics` traz Umami (`websiteId` + `scriptUrl`); `SharkySeo` traz
`googleTagId` e `metaPixelId`. Injete no `<head>` do layout com `<script>` cru (não
`next/script`) para que entrem no HTML servido e sejam verificáveis. Sanitize os ids
(remova caracteres fora do formato) antes de interpolar em script inline.
