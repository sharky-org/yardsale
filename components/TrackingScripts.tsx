/**
 * Tags de tracking (Google Tag / gtag.js e Meta Pixel), com ids vindos da meta
 * da Sharky ("SEO & Meta" → Tracking) em build-time. Usamos <script> cru (não
 * next/script) para que as tags entrem no HTML servido (SSR/view-source) e sejam
 * verificáveis — cada tag só é injetada quando o id correspondente existe.
 */
export function TrackingScripts({
  googleTagId,
  metaPixelId,
}: {
  googleTagId?: string | null;
  metaPixelId?: string | null;
}) {
  // Defesa em profundidade: como estes ids entram em <script> inline, removemos
  // qualquer caractere fora do formato esperado (evita injeção mesmo que um
  // valor inválido escape da validação do backend).
  const gtag = googleTagId?.replace(/[^A-Za-z0-9-]/g, "") || null;
  const pixel = metaPixelId?.replace(/[^0-9]/g, "") || null;

  return (
    <>
      {gtag && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gtag}');`,
            }}
          />
        </>
      )}

      {pixel && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}
