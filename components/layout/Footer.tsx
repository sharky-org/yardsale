import { PHONE, SHARKY_URL, WHATSAPP, formatPhone } from "@/lib/site";
import { copy, fill } from "@/lib/copy";

/** Rodapé: contatos e o "Powered by Sharky". */
export default function Footer() {
  const dict = copy.footer;
  return (
    <footer className="site-footer">
      <div className="container">
        {(WHATSAPP || PHONE) && (
          <p className="contacts">
            {WHATSAPP && (
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
                {fill(dict.whatsapp, { phone: formatPhone(WHATSAPP) })}
              </a>
            )}
            {PHONE && (
              <a href={`tel:+${PHONE}`}>
                {fill(dict.call, { phone: formatPhone(PHONE) })}
              </a>
            )}
          </p>
        )}
        <a
          className="powered"
          href={SHARKY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{dict.poweredBy}</span>
          <img src="/sharky-logo.png" alt="Sharky" width={88} height={24} />
        </a>
      </div>
    </footer>
  );
}
