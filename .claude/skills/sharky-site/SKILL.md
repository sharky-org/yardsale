---
name: sharky-site
description: When the user wants to build, scaffold, or integrate a new website (or a new page/section) that consumes the Sharky platform — pulling SEO/metadata, a blog, a catalog, or a contact form from a Sharky project. Also use when the user mentions "novo site", "criar site", "site na Sharky", "integrar Sharky", "@sharky/sdk", "boilerplate de site", "puxar do backoffice", "blog da Sharky", "catálogo da Sharky", "getMeta", "listPosts", "listCatalog", "metadados em build-time", or is standing up a Next.js site that reads content from a Sharky backoffice. Covers the tech stack, the SDK surface, the three integration pillars (build-time metadata, blog, catalog), the known gotchas, and a copy-paste scaffold.
metadata:
  version: 1.0.0
---

# Criação de sites na Sharky

Você é responsável por criar e integrar sites que consomem a plataforma **Sharky**
(backoffice/CMS) através do cliente oficial **`@sharky/sdk`**. Todo conteúdo — SEO,
blog, catálogo, contato — mora no backoffice e é lido pelo site. O objetivo desta
skill é padronizar como esses sites são montados, para que cada site novo seja uma
variação previsível do mesmo esqueleto.

## Antes de começar

1. **Existe um boilerplate canônico** em `boilerplate/` no workspace. **Sempre
   comece a partir dele** (copie a pasta) em vez de montar do zero — ele já tem os
   três pilares ligados e verificado por `next build`. Se ele não existir, monte na
   ordem da seção "Passo a passo" usando os templates em `references/`.
2. Descubra os dados do projeto Sharky que o site vai representar:
   - `NEXT_PUBLIC_SHARKY_PROJECT_ID` — o id do projeto (obrigatório).
   - `NEXT_PUBLIC_SHARKY_API_URL` — base da API (produção: `https://api.bysharky.com`).
   - `NEXT_PUBLIC_SHARKY_CDN_URL` — CDN das imagens (default `https://sharky.b-cdn.net`).
   - `NEXT_PUBLIC_SITE_URL` — URL canônica pública do site.
3. Pergunte que **coleções** o site usa: só blog? só catálogo? ambos? contato?
   Nem todo site usa os três pilares — ligue só o que existe no backoffice.

## Stack

- **Next.js 16 (App Router) + React 19 + TypeScript** — RSC/SSG/ISR.
- **`@sharky/sdk`** — cliente HTTP tipado, seguro no browser e no server.
  Consumido via `file:../sdk` (workspace) ou pelo `.tgz` vendored (`file:./vendor/...`).
- **CSS global simples** (sem framework de UI obrigatório) — porte 1:1 do design.
- **Renderização SSG + ISR** para blog/catálogo (bom SEO), metadados em build-time.

## Os três pilares (+ contato)

Todo site Sharky é construído sobre estes blocos. Detalhe de cada método/tipo em
[references/sdk-reference.md](references/sdk-reference.md).

### Pilar 1 — Metadados em build-time (`getMeta` → `toSeo`)
O `<head>` (title/description/OG/twitter/favicon), o `<html lang>` e as tags de
analytics (Umami, Google Tag, Meta Pixel) vêm da meta do projeto e são **assados no
build**. Política **fail-fast**: se a meta falhar, o `next build` quebra (preferimos
build vermelho a publicar SEO vazio). Um único `getMeta()` por render, dedupe com
`cache()` do React, derivando SEO com `toSeo(meta, { cdnUrl })` + `meta.analytics`.

> ⚠️ Como o `<head>` é assado no build, mudar a meta no backoffice **só reflete após
> um novo build/deploy**. Configure o **Deploy Hook** do projeto na Sharky
> (`Project.deployHookUrl`, ex.: Vercel) para redeployar ao salvar a meta.

### Pilar 2 — Blog (`listPostsPage` / `getPost`)
As notícias/artigos. Índice paginado + filtrável e página de artigo. **SSG + ISR**
(`generateStaticParams` + `revalidate`), com OG por post e JSON-LD `NewsArticle`.

### Pilar 3 — Catálogo (`listCatalogPage` / `getCatalog`)
Produtos/cases/guias. **Mesma estrutura do blog** — blog e catálogo compartilham o
tipo `SharkyItem`, então reusam o mesmo mapper, card, listagem e view de detalhe. A
diferença é só o fetcher (`listPosts*` vs `listCatalog*`) e a rota.

### Contato (`submitContact`)
Formulário de lead via **server action** (`"use server"`), para o SDK e as
credenciais não irem para o bundle do cliente. Requer `name` + `message` + (email/phone).

## Passo a passo da integração

1. **Copie o boilerplate** (`cp -r boilerplate meu-site`) e ajuste `package.json`
   (`name`) e o `.env.local` a partir de `.env.example`.
2. **Garanta o SDK buildado.** Se consumir `file:../sdk`, rode `npm run build` dentro
   de `sdk/` — o `dist/` pode estar desatualizado em relação ao `src/`. Sem isso,
   faltam exports (`toSeo`, `listPostsPage`, `getPost`, etc.). Alternativa: usar o
   `.tgz` vendored. Aponte a raiz do Turbopack para o pai no `next.config.ts` quando
   o SDK for symlinkado (senão a resolução para na fronteira do app).
3. **Módulo de integração único** em `lib/sharky.ts` — concentre TUDO: criação do
   cliente (com `timeoutMs`), `toImageUrl` (CDN), meta/SEO/analytics (fail-fast),
   mappers `SharkyItem → ContentItem`, `fetchPostsPage`/`fetchPost`,
   `fetchCatalogPage`/`fetchCatalogItem`, `fetchTags`, e os coletores
   `fetchAllPosts`/`fetchAllCatalog` (paginam em blocos — ver gotcha do `take`).
   Listagens **degradam graciosamente** (retornam vazio em falha); só a **meta** é
   fail-fast. Template em [references/sdk-reference.md](references/sdk-reference.md).
4. **Layout** (`app/layout.tsx`): `generateMetadata()` a partir de `fetchSiteSeo()`;
   injete Umami + `TrackingScripts` (ids da meta) no `<head>`; `<html lang>` = locale.
5. **Rotas de conteúdo** (SSG+ISR):
   - Índices `/(blog|catalog)/page.tsx` — listagem paginada/filtrável via `searchParams`
     resolvida no server (sem JS no cliente, bom SEO).
   - Detalhes `/(blog|catalog)/[slug]/page.tsx` — `generateStaticParams` (usa os
     coletores), `generateMetadata` (OG por item), `dynamicParams = true` (itens
     novos gerados sob demanda), JSON-LD, e `notFound()` quando o item não existe.
6. **SEO técnico**: `app/sitemap.ts` **dinâmico** (rotas fixas + todos os posts +
   todo o catálogo, via coletores) e `app/robots.ts`.
7. **Contato**: `app/contact/actions.ts` (`"use server"` → `submitContact`) +
   um client component com `useActionState`.
8. **Verifique**: `npx tsc --noEmit`, `npx eslint .`, e um `next build` real contra
   um projeto Sharky válido — confirme no output que os detalhes aparecem como
   **● (SSG)** e que o `sitemap.xml` lista os itens.

## Gotchas (aprendidos na prática — não repita)

- **`take` tem teto de 100.** A API valida e **lança** (`SharkyError: Validation
  failed`) para `take > 100`. Como as listagens fazem `catch → vazio`, o erro fica
  silencioso e "some" conteúdo. Para pegar tudo (sitemap, `generateStaticParams`),
  **pagine em blocos de 100** até `all.length >= total`.
- **`SharkyItem` não tem `slug`** — só `id`. Gere URLs `slugify(titulo)-<id>` e
  extraia o `id` do fim (regex de 24 hex) para resolver. O slug do título é cosmético.
- **`description` vem como HTML** e as imagens vêm como **caminho relativo** — sempre
  prefixe com a CDN (`toImageUrl`). Use `stripHtml` para prévias/meta description.
- **Meta = fail-fast; listagens = graciosas.** Nunca troque essa política: build
  vermelho em SEO quebrado, mas página vazia (não erro) quando o catálogo falha.
- **Locale**: passe `locale` no cliente e/ou nos filtros; a API resolve o conteúdo
  traduzível. Mapeie o idioma do site (`pt`/`en`/`es`) para o locale da Sharky
  (`pt-BR`/`en-US`/`es`).
- **`<head>` é de build** — sempre configure o Deploy Hook (ver Pilar 1).
- **`dist/` do SDK pode estar velho** — rode `npm run build` no `sdk/` antes.

## Checklist para um site novo

- [ ] `.env.local` com `PROJECT_ID` + `SITE_URL` (+ API/CDN se não forem default).
- [ ] SDK buildado / turbopack root ajustado.
- [ ] `lib/site.ts`: marca, `NAV`, `DEFAULT_LOCALE`, `REVALIDATE`.
- [ ] Só os pilares que o projeto usa (não crie `/blog` se não há posts).
- [ ] `sitemap.ts` e `robots.ts` apontando para `SITE_URL`.
- [ ] Deploy Hook configurado no backoffice.
- [ ] `tsc` + `eslint` + `next build` limpos, com detalhes como ● (SSG).
