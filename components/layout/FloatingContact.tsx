import { PHONE, WHATSAPP } from "@/lib/site";
import { copy } from "@/lib/copy";
import { PhoneIcon, WhatsAppIcon } from "@/components/Icons";

/** Ícones flutuantes no canto superior direito: ligar e WhatsApp. */
export default function FloatingContact() {
  const dict = copy.floating;
  if (!WHATSAPP && !PHONE) return null;
  return (
    <div className="floating">
      {PHONE && (
        <a
          className="fab fab-phone"
          href={`tel:+${PHONE}`}
          aria-label={dict.call}
          title={dict.call}
        >
          <PhoneIcon />
        </a>
      )}
      {WHATSAPP && (
        <a
          className="fab fab-wa"
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noreferrer"
          aria-label={dict.whatsapp}
          title={dict.whatsapp}
        >
          <WhatsAppIcon />
        </a>
      )}
    </div>
  );
}
