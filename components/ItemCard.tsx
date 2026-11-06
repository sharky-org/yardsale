import type { ContentItem } from "@/lib/sharky";
import { PHONE, WHATSAPP } from "@/lib/site";
import { copy, fill } from "@/lib/copy";
import { ChatIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";
import {
  formatPrice,
  getCondition,
  getPrice,
  getStatus,
} from "@/lib/garage";

/**
 * Um item da venda, inteiro na lista: fotos (deslizar), título na largura
 * toda, linha com a categoria (etiqueta azul) e o preço à direita, descrição e
 * contato.
 * Não existe página interna: três botões de contato — WhatsApp e SMS já com o
 * nome do item na mensagem, e ligação.
 */
/** Texto da faixa de vendido, repetido para cobrir a foto de ponta a ponta. */
const SOLD_BAND = Array.from({ length: 8 }, () => copy.status.sold).join(" ✦ ");

export default function ItemCard({ item }: { item: ContentItem }) {
  const status = getStatus(item);
  const condition = getCondition(item);
  const category = item.categories[0];
  const photos = item.imageUrls.length > 0 ? item.imageUrls : [item.coverUrl];
  const t = copy.items;

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
          tabIndex={0}
          aria-label={fill(t.photosLabel, { title: item.title })}
        >
          {photos.map((src, i) => (
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
        {photos.length > 1 && (
          <span className="count">{fill(t.photos, { n: photos.length })}</span>
        )}
      </div>

      <div className="item-body">
        <h3 className="display">{item.title}</h3>
        <div className="item-row">
          {category && <span className="tag">{category}</span>}
          {condition && <span className="condition">{condition}</span>}
          <p className="price">{formatPrice(getPrice(item))}</p>
        </div>

        {item.html && (
          <div className="prose" dangerouslySetInnerHTML={{ __html: item.html }} />
        )}

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
                {t.whatsapp}
              </a>
            )}
            {sms && (
              <a
                className="act"
                href={sms}
                aria-label={fill(t.textLabel, { title: item.title })}
              >
                <ChatIcon size={22} />
                {t.text}
              </a>
            )}
            {PHONE && (
              <a
                className="act"
                href={`tel:+${PHONE}`}
                aria-label={fill(t.callLabel, { title: item.title })}
              >
                <PhoneIcon size={20} />
                {t.call}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
