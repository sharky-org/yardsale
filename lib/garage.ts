/**
 * Convenções da venda de garagem sobre o catálogo da Sharky.
 *
 * O catálogo não tem "status" nem "condição" nativos:
 *   - STATUS vem das TAGS do item (sem acento/caixa): "Sold"/"Vendido" →
 *     vendido, "Reserved"/"Reservado" → reservado. Marcar/desmarcar a tag no
 *     backoffice liga/desliga a faixa de vendido. Sem tag, vale o campo
 *     customizado "Status" com os mesmos valores; sem nenhum dos dois, disponível.
 *   - CONDIÇÃO vem do campo customizado "Condition"/"Condição".
 * O preço é a primeira variação de `price` (a Sharky guarda uma lista).
 */
import type { ContentItem } from "./sharky";
import { LOCALE, copy } from "./copy";

export type ItemStatus = "available" | "reserved" | "sold";

const norm = (s: string | null | undefined) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

function field(item: ContentItem, ...labels: string[]): string | null {
  const wanted = labels.map(norm);
  const f = item.customFields.find((c) => wanted.includes(norm(c.label)));
  return f?.value?.trim() || null;
}

function statusOf(label: string): ItemStatus | null {
  const v = norm(label);
  if (v.startsWith("sold") || v.startsWith("vend")) return "sold";
  if (v.startsWith("reserv")) return "reserved";
  return null;
}

export function getStatus(item: ContentItem): ItemStatus {
  const fromTags = item.tags.map((t) => statusOf(t.label));
  if (fromTags.includes("sold")) return "sold";
  if (fromTags.includes("reserved")) return "reserved";
  return statusOf(field(item, "Status") ?? "") ?? "available";
}

export const getCondition = (item: ContentItem) =>
  field(item, "Condição", "Condition");

/** Preço principal em dólares, ou `null` se o item não tem preço. */
export function getPrice(item: ContentItem): number | null {
  return item.price[0]?.value ?? null;
}

const usd = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
});

/** `$250.00`; sem preço = "Make an offer"; `0` = "Free". */
export function formatPrice(value: number | null): string {
  if (value === null) return copy.price.negotiable;
  if (value === 0) return copy.price.free;
  return usd.format(value);
}
