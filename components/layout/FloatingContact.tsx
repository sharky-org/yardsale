import { copy } from "@/lib/copy";
import { PhoneIcon, WhatsAppIcon } from "@/components/Icons";

/** Ícones flutuantes no canto superior direito: ligar e WhatsApp. */
export default function FloatingContact({ phone }: { phone: string | null }) {
  const dict = copy.floating;
  if (!phone) return null;
  return (
    <div className="floating">
      <a
        className="fab fab-phone"
        href={`tel:+${phone}`}
        aria-label={dict.call}
        title={dict.call}
      >
        <PhoneIcon />
      </a>
      <a
        className="fab fab-wa"
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noreferrer"
        aria-label={dict.whatsapp}
        title={dict.whatsapp}
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}
