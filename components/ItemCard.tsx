import Link from "next/link";
import type { ContentItem } from "@/lib/sharky";
import { PHONE, WHATSAPP } from "@/lib/site";
import { itemPath } from "@/lib/slug";
import { copy, fill } from "@/lib/copy";
import { ChatIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";
import ShareButton from "@/components/ShareButton";
import Description from "@/components/Description";
import {
  formatPrice,
  getCondition,
  getPrice,
  getStatus,
} from "@/lib/garage";

/** Texto da faixa de vendido, repetido para cobrir a foto de ponta a ponta. */
const SOLD_BAND = Array.from({ length: 8 }, () => copy.status.sold).join(" ✦ ");

/**
 * Um item da venda: foto, título na largura toda, linha com a categoria
 * (etiqueta azul) e o preço à direita, descrição e contato — três botões:
 * WhatsApp e SMS já com o nome do item na mensagem, e ligação. O botão sobre a
 * foto compartilha o link.
 *
 * Na lista o card inteiro leva à página do item (`/items/[slug]`): só a capa,
 * descrição cortada com "Show more". A página usa o mesmo card com `detail`:
 * todas as fotos para deslizar, texto inteiro e o título como h1.
 */
export default function ItemCard({
  item,
  detail = false,
}: {
  item: ContentItem;
  detail?: boolean;
}) {
  const status = getStatus(item);
  const condition = getCondition(item);
  const category = item.categories[0];
  const photos = item.imageUrls.length > 0 ? item.imageUrls : [item.coverUrl];
  // Na lista, deslizar fotos brigaria com o toque que abre o card.
  const shown = detail ? photos : [item.coverUrl ?? photos[0]];
  const t = copy.items;
  const path = itemPath(item);
  const Title = detail ? "h1" : "h3";

  const message = fill(t.message, { title: item.title });
  const wa = WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`
    : null;
  // `?&body=` é a forma que abre a mensagem preenchida no iOS e no Android.
  const sms = PHONE
    ? `sms:+${PHONE}?&body=${encodeURIComponent(message)}`
    : null;

  return (
    <article className="item" data-status={status} id={`item-${item.id}`}>
      {/* As sobreposições ficam fora do carrossel para não rolarem junto. */}
      <div className="media">
        <div
          className="photos"
          {...(detail
            ? {
                tabIndex: 0,
                "aria-label": fill(t.photosLabel, { title: item.title }),
              }
            : {})}
        >
          {shown.map((src, i) => (
            <img
              key={src ?? i}
              src={src ?? "/placeholder.svg"}
              alt={fill(t.photoAlt, {
                title: item.title,
                i: i + 1,
                n: photos.length,
              })}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>
        {status === "reserved" && (
          <span className="badge">{copy.status.reserved}</span>
        )}
        {status === "sold" && (
          <div className="sold-band" role="img" aria-label={copy.status.sold}>
            <span aria-hidden="true">{SOLD_BAND}</span>
          </div>
        )}
        {status !== "sold" && <ShareButton path={path} title={item.title} />}
        {photos.length > 1 && (
          <span className="count">{fill(t.photos, { n: photos.length })}</span>
        )}
      </div>

      <div className="item-body">
        <Title className="display item-title">
          {detail ? (
            item.title
          ) : (
            <Link className="card-link" href={path}>
              {item.title}
            </Link>
          )}
        </Title>
        <div className="item-row">
          {category && <span className="tag">{category}</span>}
          {condition && <span className="condition">{condition}</span>}
          <p className="price">{formatPrice(getPrice(item))}</p>
        </div>

        {item.html &&
          (detail ? (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          ) : (
            <Description html={item.html} />
          ))}

        {status === "sold" ? (
          <p className="item-sold">{t.sold}</p>
        ) : (
          <div className="actions">
            {wa && (
              <a
                className="act act-wa"
                href={wa}
                target="_blank"
                rel="noreferrer"
                aria-label={fill(t.whatsappLabel, { title: item.title })}
              >
                <WhatsAppIcon size={22} />
                <span className="act-label">{t.whatsapp}</span>
              </a>
            )}
            {sms && (
              <a
                className="act"
                href={sms}
                aria-label={fill(t.textLabel, { title: item.title })}
              >
                <ChatIcon size={22} />
                <span className="act-label">{t.text}</span>
              </a>
            )}
            {PHONE && (
              <a
                className="act"
                href={`tel:+${PHONE}`}
                aria-label={fill(t.callLabel, { title: item.title })}
              >
                <PhoneIcon size={20} />
                <span className="act-label">{t.call}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
