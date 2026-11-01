import { LegalPage, legalMetadata } from "@/components/legal/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Çerez politikası - Türkçe. English counterpart: app/cookies/page.tsx.
 * CHANGE BOTH IN ONE COMMIT and keep UPDATED equal. Every row names a real
 * cookie or storage key; see the English file's header for where each lives.
 */
export const metadata = legalMetadata({
  lang: "tr",
  title: "Çerez Politikası",
  description:
    "Counterscent'in tarayıcınızda kullandığı her çerez ve yerel depolama kaydı, amacı, süresi ve tercihinizi nasıl değiştireceğiniz.",
  en: "/cookies/",
  tr: "/tr/cerez-politikasi/",
});

const UPDATED = "1 Kasım 2026";

export default function CerezPolitikasiPage() {
  return (
    <LegalPage lang="tr" title="Çerez politikası" updated={UPDATED} counterpart="/cookies/">
      <p>
        Bu politika, counterscent.com ve producers.counterscent.com sitelerini kapsar ve tarayıcınızda sakladığımız her şeyi listeler. Kişisel verilerin genel olarak
        nasıl işlendiği <a href="/tr/gizlilik/">gizlilik politikası ve KVKK aydınlatma metninde</a>{" "}
        anlatılmaktadır.
      </p>

      <h2>1. Kısaca</h2>
      <p>
        Katalog kendi adına hiçbir çerez yazmaz; tarayıcınızın yerel depolamasında iki küçük tercih
        tutar. Analiz yalnızca siz izin verirseniz çalışır ve o zaman bile çerez yazmaz. Üretici paneli
        yalnızca oturumunuzu açık tutmak için gereken çerezleri kullanır.
      </p>

      <h2>2. Katalog (counterscent.com)</h2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-semibold">Ad</th>
              <th className="py-2 pr-4 font-semibold">Tür</th>
              <th className="py-2 pr-4 font-semibold">Amaç</th>
              <th className="py-2 font-semibold">Süre</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs">counterscent-consent</td>
              <td className="py-2 pr-4">Yerel depolama, zorunlu</td>
              <td className="py-2 pr-4">Analize izin verip vermediğinizi hatırlar; kararınıza uyabilmemiz için gereklidir.</td>
              <td className="py-2">Siz silene veya kararınızı değiştirene kadar</td>
            </tr>
            <tr className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs">counterscent-theme</td>
              <td className="py-2 pr-4">Yerel depolama, tercih</td>
              <td className="py-2 pr-4">Seçtiğiniz açık veya koyu temayı hatırlar.</td>
              <td className="py-2">Siz silene kadar</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Bu kayıtların hiçbiri bize veya başka birine gönderilmez.</p>
      <p>
        <strong>Google Analytics 4, yalnızca izninizle.</strong> &ldquo;İzin ver&rdquo; seçeneğini
        seçerseniz tarayıcınız Google&apos;ın analiz betiğini yükler; betik cihazınıza{" "}
        <em>hiçbir</em> çerez yazmayacak ve tanımlayıcı saklamayacak şekilde yapılandırılmıştır. Yine de
        Google&apos;a görüntülediğiniz sayfayı, geldiğiniz siteyi, tarayıcı ve cihaz türünüzü ve yaklaşık
        bölgenizi gönderir. Reddederseniz veya seçim yapmazsanız betik hiç yüklenmez. Global Privacy
        Control sinyali gönderen tarayıcılar reddetmiş sayılır.
      </p>
      <p>
        <strong>Barındırma sağlayıcımızın güvenlik çerezleri.</strong> Siteyi sunan Cloudflare,
        insanları otomatik trafikten ayırması gerektiğinde zorunlu bir güvenlik çerezi (ör.{" "}
        <code>__cf_bm</code>) yazabilir. Bu çerez sizi siteler arasında takip etmez.
      </p>

      <h2>3. Üretici paneli (producers.counterscent.com)</h2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-semibold">Ad</th>
              <th className="py-2 pr-4 font-semibold">Tür</th>
              <th className="py-2 pr-4 font-semibold">Amaç</th>
              <th className="py-2 font-semibold">Süre</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs">__Host-session</td>
              <td className="py-2 pr-4">Çerez, zorunlu</td>
              <td className="py-2 pr-4">Oturumunuzu açık tutar. Güvenli (Secure), HttpOnly, yalnızca bu siteye gönderilir.</td>
              <td className="py-2">En fazla 30 gün veya çıkış yapana kadar</td>
            </tr>
            <tr className="border-b border-border/60 align-top">
              <td className="py-2 pr-4 font-mono text-xs">__Host-oauth</td>
              <td className="py-2 pr-4">Çerez, zorunlu</td>
              <td className="py-2 pr-4">&ldquo;Google ile devam et&rdquo; girişini işlem sürerken korur.</td>
              <td className="py-2">10 dakika</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Zorunlu çerezler için izin gerekmez: bunlar olmadan giriş yapamazsınız. Panelde analiz aracı
        çalışmaz.
      </p>

      <h2>4. Sitemizden ayrıldıktan sonra</h2>
      <p>
        Bir &ldquo;satın al&rdquo; bağlantısına tıkladığınızda bir ortaklık ağı (Awin veya CJ) üzerinden
        bir satıcıya geçersiniz. Bu taraflar, örneğin yönlendirmeyi kaydetmek için, kendi sitelerinde
        kendi çerez politikaları kapsamında çerez kullanabilir. Bu çerezleri biz kontrol etmeyiz ve bize
        iletilmezler.
      </p>

      <h2>5. Tercihinizi değiştirme</h2>
      <p>
        Analiz tercihinizi her sayfanın altındaki <strong>&ldquo;Çerez ayarları&rdquo;</strong>{" "}
        bağlantısından dilediğiniz zaman değiştirebilirsiniz; izni geri almanız ölçümü hemen durdurur.
        Yerel depolamayı ve çerezleri tarayıcınızın ayarlarından da silebilirsiniz. Sorularınız için:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <p>
        Bu politika{" "}
        <a href="/cookies/" hrefLang="en">
          İngilizce
        </a>{" "}
        olarak da yayımlanmıştır; Türkiye&apos;deki kişiler için Türkçe metin esas alınır.
      </p>
    </LegalPage>
  );
}
