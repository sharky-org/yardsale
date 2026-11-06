import type { ContentItem } from "@/lib/sharky";
import { stripHtml } from "@/lib/sharky";
import { SITE_URL } from "@/lib/site";
import { getPrice, getStatus } from "@/lib/garage";

/** JSON-LD: lista de `Product` com oferta em USD e disponibilidade por status. */
export default function ItemsJsonLd({ items }: { items: ContentItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => {
      const price = getPrice(item);
      const status = getStatus(item);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: item.title,
          description: stripHtml(item.html).slice(0, 200),
          ...(item.imageUrls.length ? { image: item.imageUrls } : {}),
          url: `${SITE_URL}/#item-${item.id}`,
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
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
