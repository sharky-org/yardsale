# Venda de garagem

Site Next.js (App Router) + TypeScript para a venda de garagem da mudança,
integrado à **Sharky** via `@sharky/sdk`. Construído sobre o
`sharky-boilerplate`: os itens à venda vivem no **catálogo** da Sharky e o
interesse vai direto para o WhatsApp (ou telefone) — não há formulário.

## Rodando

```bash
cp .env.example .env.local   # preencha NEXT_PUBLIC_SHARKY_PROJECT_ID e NEXT_PUBLIC_SITE_URL
npm install
npm run dev
```

O SDK está vendorizado em `vendor/` (ver `vendor/README.md`), então não depende
de pasta irmã.

## Como cadastrar os itens (backoffice da Sharky)

Crie um projeto Sharky para o site e cadastre cada item no **Catálogo**:

| Na Sharky | Vira no site |
| --- | --- |
| Título | nome do item |
| Descrição (HTML) | detalhes/defeitos/medidas |
| Imagens (a 1ª, ou a thumbnail, é a capa) | galeria |
| Preço (1ª variação) | preço em US$ (sem preço = "Make an offer"; `0` = "Free") |
| Categoria | etiqueta azul no item + filtro (Furniture, Books…) |
| Tag **Sold** (ou **Reserved**) | faixa diagonal "SOLD", foto em cinza, preço riscado e sem botões (ou selo "Reserved"). Alternativa: campo customizado **Status** |
| Campo customizado **Condição** | texto livre (ex.: "Usado – ótimo estado") |

Tags e campos customizados são casados pelo **rótulo** (sem acento/caixa) — ver
[`lib/garage.ts`](lib/garage.ts). Item vendido vai para o fim da lista e, no
Google, aparece como `SoldOut` (JSON-LD).

A **meta** do projeto (título, descrição, imagem OG, favicon, redes, analytics)
define a home e o `<head>`. Ela é assada no build — configure o **Deploy Hook**
do projeto para redeployar ao salvar. Os itens revalidam sozinhos (ISR, 60 s).

## Variáveis de ambiente

| Var | Para quê |
| --- | --- |
| `NEXT_PUBLIC_SHARKY_PROJECT_ID` | id do projeto Sharky (obrigatório) |
| `NEXT_PUBLIC_SHARKY_API_URL` | base da API (default produção) |
| `NEXT_PUBLIC_SHARKY_CDN_URL` | CDN das imagens |
| `NEXT_PUBLIC_SITE_URL` | URL canônica (metadataBase, sitemap, robots) |
| `NEXT_PUBLIC_WHATSAPP` | opcional: só dígitos com DDI+DDD; habilita o botão de WhatsApp |

## Estrutura

Página única, mobile first, **só em inglês e com preços em dólar** (a venda é
nos EUA e os itens são cadastrados em inglês). `/pt` e `/en`, de quando o site
era bilíngue, redirecionam para `/`. Sem páginas internas e sem paginação: cada
item aparece inteiro na lista (fotos deslizáveis, título, preço, categoria na
etiqueta azul, descrição, "I want this", que abre o WhatsApp com o nome do item,
e "Call"). No canto superior direito flutuam os ícones de telefone e WhatsApp.
Visual inspirado em stories de yard sale: azul royal, limão e pêssego, títulos
em Bowlby One, ilustração e cerquinha em SVG.

```
app/
  layout.tsx       # <html lang="en-US">, metadados (título/descrição vêm da copy)
  page.tsx         # hero + passos + lista (disponíveis primeiro, vendidos por último)
components/
  Board.tsx        # filtro por categoria + lista (cliente)
  ItemCard.tsx · Illustrations.tsx · JsonLd.tsx
  layout/          # Header, FloatingContact, Footer (Powered by Sharky)
lib/
  copy.json        # TODO o texto da interface
  copy.ts · sharky.ts · garage.ts · site.ts
```

Para mostrar data e horário da venda no topo, preencha `hero.when` em
`lib/copy.json` (vazio = some). Cores em `app/globals.css` (`:root`).
