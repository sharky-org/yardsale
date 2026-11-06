# Yard Sale

A one-page, mobile-first yard sale site. Every item lives in a
[Sharky](https://bysharky.com) catalog, and buyers reach you straight from each
item via **WhatsApp**, **text** or a **call**. No forms and no checkout.

Built with Next.js (App Router) + TypeScript on top of the
`sharky-boilerplate`, using the `@sharky/sdk` client.

## What you get

- **One page, no pagination.** Each item shows its photos (swipe through them), title, price,
  category, description and three contact buttons. There are no detail pages.
- **Contact buttons.** WhatsApp and SMS open with a pre-filled message naming the item
  ("Hi! I saw "…" in your yard sale and I'm interested."). Call dials your number.
  Floating phone and WhatsApp buttons stay in the top-right corner.
- **Sold items.** Add the `Sold` tag in Sharky and the item gets a diagonal "SOLD" ribbon. Its
  photo turns grey, the price is struck through, the contact buttons disappear and it moves
  to the end of the list. A `Reserved` tag shows a "Reserved" badge instead.
- **Category filter** built from the item categories.
- **Fresh content.** Items revalidate every 60 seconds (ISR), so changes in Sharky show up
  without a redeploy.
- **SEO.** Each item is listed as a `Product` with an `Offer` in JSON-LD (`SoldOut` once
  sold). The site also ships a sitemap and robots.txt.
- **Look.** Inspired by yard sale Instagram stories: royal blue, lime and peach, Bowlby One
  headlines, and flat SVG illustrations (dresser, lamp, moving box, picket fence).

## Getting started

```bash
cp .env.example .env    # fill in at least NEXT_PUBLIC_SHARKY_PROJECT_ID
npm install
npm run dev             # http://localhost:3000
```

The Sharky SDK is vendored in `vendor/` (see [`vendor/README.md`](vendor/README.md)),
so the repo builds on its own with no sibling folders or private registry.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SHARKY_PROJECT_ID` | **Required.** The Sharky project that holds your items. |
| `NEXT_PUBLIC_SHARKY_API_URL` | Sharky API base URL (defaults to production). |
| `NEXT_PUBLIC_SHARKY_CDN_URL` | CDN that serves the item images. |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site (canonical URL, sitemap, robots). |
| `NEXT_PUBLIC_WHATSAPP` | Your WhatsApp number, digits only with country code (e.g. `14705551234`). Leave empty to hide WhatsApp. |
| `NEXT_PUBLIC_PHONE` | Number used for **Text** and **Call**. Optional: falls back to the WhatsApp number. |

The build is **fail-fast**: without a valid project ID the site metadata cannot
be loaded and `next build` stops, so you never ship an empty `<head>`.

## Adding items in Sharky

Create a Sharky project for the sale and add each item to its **Catalog**:

| In Sharky | On the site |
| --- | --- |
| Title | Item name |
| Description (rich text) | Details: size, condition, flaws… |
| Images (the first one, or the thumbnail, is the cover) | Swipeable photo gallery |
| Price (first price variation) | Price in USD. No price shows "Make an offer" and `0` shows "Free". |
| Category | Blue tag on the item, plus the category filter |
| Tag `Sold` / `Reserved` | Sold ribbon / Reserved badge (see above) |
| Custom field `Condition` | Optional free text shown next to the category |

Tags and custom field labels are matched case- and accent-insensitively; see
[`lib/garage.ts`](lib/garage.ts). Instead of tags you can also use a custom
field named `Status` with the values `Sold` / `Reserved`.

The project's **meta** in Sharky (OG image, keywords, analytics) is baked in at
build time. Set the project's **Deploy Hook** to redeploy when you save it. The
items themselves don't need a redeploy.

## Customizing

- **Text:** every interface string lives in [`lib/copy.json`](lib/copy.json). To show
  the sale dates and hours at the top, fill in `hero.when` (for example "Sat & Sun · 9am–3pm").
  If you leave it empty, the line doesn't appear.
- **Colors:** design tokens are at the top of [`app/globals.css`](app/globals.css) (`:root`).
- **Icon:** [`app/icon.svg`](app/icon.svg) is the favicon and header logo.
  [`app/apple-icon.png`](app/apple-icon.png) is the iOS home-screen icon.

## Project structure

```
app/
  layout.tsx            # <html lang="en-US">, fonts, metadata
  page.tsx              # hero, steps and the item list (available first, sold last)
  icon.svg · apple-icon.png
components/
  Board.tsx             # category filter + list (client component)
  ItemCard.tsx          # one item: photos, price, tag, description, contact buttons
  Illustrations.tsx     # stamp, hero illustration, picket fence
  Icons.tsx · JsonLd.tsx
  layout/               # Header, FloatingContact, Footer
lib/
  sharky.ts             # the single Sharky integration module
  garage.ts             # status / condition / price rules
  copy.json · copy.ts   # all UI text
  site.ts               # site URL, phone numbers, links
vendor/                 # vendored @sharky/sdk tarball
```

## Deploying

The site deploys as-is to Vercel or any Next.js host. Set the environment
variables above in your host. `package-lock.json` is committed, so every deploy
installs exactly the tested dependency versions.

## Credits

Powered by [Sharky](https://bysharky.com).
