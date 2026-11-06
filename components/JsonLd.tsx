import type { ContentItem } from "@/lib/sharky";
import { stripHtml } from "@/lib/sharky";
import { SITE_URL } from "@/lib/site";
import { itemPath } from "@/lib/slug";
import { getPrice, getStatus } from "@/lib/garage";

/** `Product` com oferta em USD e disponibilidade por status. */
function productLd(item: ContentItem) {
  const price = getPrice(item);
  const status = getStatus(item);
  return {
    "@type": "Product",
    name: item.title,
    description: stripHtml(item.html).slice(0, 200),
    ...(item.imageUrls.length ? { image: item.imageUrls } : {}),
    url: `${SITE_URL}${itemPath(item)}`,
    itemCondition: "https://schema.org/UsedCondition",
    ...(price !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price,
            availability:
              status === "sold"
                ? "https://schema.org/SoldOut"
                : status === "reserved"
                  ? "https://schema.org/LimitedAvailability"
                  : "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

/** `<` escapado: um título com `</script>` não fecha a tag antes da hora. */
function LdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** JSON-LD da home: lista de todos os itens. */
export default function ItemsJsonLd({ items }: { items: ContentItem[] }) {
  return (
    <LdScript
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: productLd(item),
        })),
      }}
    />
  );
}

/** JSON-LD da página de um item. */
export function ItemJsonLd({ item }: { item: ContentItem }) {
  return (
    <LdScript data={{ "@context": "https://schema.org", ...productLd(item) }} />
  );
}
