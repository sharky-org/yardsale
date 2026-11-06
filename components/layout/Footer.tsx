import { REPO_URL, SHARKY_URL, formatPhone } from "@/lib/site";
import { copy, fill } from "@/lib/copy";
import { GitHubIcon } from "@/components/Icons";

/** Rodapé: contatos, link do código-fonte e o "Powered by Sharky". */
export default function Footer({ phone }: { phone: string | null }) {
  const dict = copy.footer;
  return (
    <footer className="site-footer">
      <div className="container">
        {phone && (
          <p className="contacts">
            <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
              {fill(dict.whatsapp, { phone: formatPhone(phone) })}
            </a>
            <a href={`tel:+${phone}`}>
              {fill(dict.call, { phone: formatPhone(phone) })}
            </a>
          </p>
        )}
        <p className="repo">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <GitHubIcon />
            {dict.code}
          </a>
        </p>
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
