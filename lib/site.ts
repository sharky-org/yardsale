/**
 * Configuração estática do site. Tudo que é "de marca"/infra e não vem da meta
 * da Sharky mora aqui, para que trocar de site seja só mexer em env + esta lib.
 */

/** URL canônica pública. Usada em metadataBase, sitemap e robots. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

// ISR: o `export const revalidate = 60` vive na página (o Next só aceita literal).

/** WhatsApp (só dígitos, DDI+DDD+número). Vazio → botão não aparece. */
export const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(
  /\D/g,
  "",
);

/** Telefone para ligação (só dígitos). Sem valor, usa o número do WhatsApp. */
export const PHONE =
  (process.env.NEXT_PUBLIC_PHONE ?? "").replace(/\D/g, "") || WHATSAPP;

/** Link público da Sharky (rodapé "Powered by"). */
export const SHARKY_URL = "https://bysharky.com";

/** Formata dígitos para exibição: BR (55…), EUA (1…) ou genérico (+…). */
export function formatPhone(digits: string): string {
  const br = digits.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  if (br) return `+55 (${br[1]}) ${br[2]}-${br[3]}`;
  const us = digits.match(/^1(\d{3})(\d{3})(\d{4})$/);
  if (us) return `+1 (${us[1]}) ${us[2]}-${us[3]}`;
  return `+${digits}`;
}
