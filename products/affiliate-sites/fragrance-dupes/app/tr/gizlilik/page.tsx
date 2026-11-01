import { LegalPage, legalMetadata } from "@/components/legal/legal-page";
import { CONTACT_EMAIL, LEGAL_ENTITY, PRODUCER_CONSOLE } from "@/lib/site";

/**
 * Gizlilik politikası ve KVKK aydınlatma metni - Türkçe. English counterpart:
 * app/privacy/page.tsx. CHANGE BOTH IN ONE COMMIT and keep UPDATED equal.
 *
 * Written 2026-11-01 as the Turkish version of the rewritten English policy,
 * structured to cover what KVKK Article 10 requires a notice to state: the
 * controller's identity, the purposes, to whom and why data is transferred,
 * the method and legal basis of collection, and the Article 11 rights.
 *
 * NOT REVIEWED BY A LAWYER. See LEGAL-COMPLIANCE.md for open items.
 */
export const metadata = legalMetadata({
  lang: "tr",
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
  description:
    "Counterscent hangi kişisel verileri, hangi amaçla ve hangi hukuki sebeple işler; kimlere aktarır, ne kadar saklar ve KVKK kapsamındaki haklarınızı nasıl kullanırsınız.",
  en: "/privacy/",
  tr: "/tr/gizlilik/",
});

const UPDATED = "1 Kasım 2026";

export default function GizlilikPage() {
  return (
    <LegalPage
      lang="tr"
      title="Gizlilik politikası ve KVKK aydınlatma metni"
      updated={UPDATED}
      counterpart="/privacy/"
    >
      <h2>1. Veri sorumlusu</h2>
      <p>
        Counterscent (counterscent.com ve producers.counterscent.com),{" "}
        <strong>{LEGAL_ENTITY}</strong> (&ldquo;Şirket&rdquo;, &ldquo;biz&rdquo;) tarafından
        işletilmektedir. Bu metinde anlatılan işlemeler bakımından 6698 sayılı Kişisel Verilerin
        Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca veri sorumlusu Şirketimizdir. Avrupa Ekonomik
        Alanı&apos;ndaki kişiler bakımından Avrupa Birliği Genel Veri Koruma Tüzüğü (&ldquo;GDPR&rdquo;)
        de uygulanabilir.
      </p>
      <p>
        Bu metinle ilgili tüm sorularınız için:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Şirketimizin tescilli adresi, aynı
        adrese yazmanız hâlinde tarafınıza bildirilir.
      </p>

      <h2>2. Kısaca</h2>
      <ul>
        <li>
          Kataloğu okumak için hesap gerekmez. Ziyaretleri yalnızca siz izin verirseniz ölçeriz ve bu
          ölçüm cihazınıza hiçbir şey kaydetmez.
        </li>
        <li>
          Üretici hesaplarında (parfümlerini listeleyen işletmeler) bir e-posta adresi, isteğe bağlı bir
          ad, şirket bilgileri ve ilanlar tutulur.
        </li>
        <li>
          Kişisel verileri satmayız; reklam veya yeniden hedefleme pikseli kullanmayız; ticari elektronik
          ileti (pazarlama e-postası) göndermeyiz.
        </li>
        <li>Üretici hesabınızı kendiniz silebilir, tuttuğumuz her veri hakkında bize başvurabilirsiniz.</li>
      </ul>

      <h2>3. Katalog ziyaretçileri (counterscent.com)</h2>
      <p>
        <strong>Analiz, yalnızca açık rızanızla.</strong> &ldquo;İzin ver&rdquo; seçeneğini
        seçerseniz tarayıcınız Google Analytics 4&apos;ü yükler. Bu araç görüntülediğiniz sayfayı,
        geldiğiniz siteyi, tarayıcı ve cihaz türünüzü ve yaklaşık bölgenizi kaydeder. Cihazınıza çerez
        yazmayacak ve tanımlayıcı saklamayacak şekilde yapılandırılmıştır; IP adresleri kaydedilmeden
        önce kısaltılır. Reddederseniz ya da seçim yapmazsanız araç hiç yüklenmez ve hiçbir ölçüm
        yapılmaz. Global Privacy Control sinyali gönderen tarayıcılar reddetmiş sayılır. Kararınızı her
        sayfanın altındaki &ldquo;Çerez ayarları&rdquo; bağlantısından dilediğiniz zaman
        değiştirebilirsiniz. Hukuki sebep: açık rızanız (KVKK m. 5/1; GDPR m. 6/1-a).
      </p>
      <p>
        <strong>Sitenin sunulması.</strong> Barındırma hizmeti sağlayıcımız Cloudflare, sayfaları
        iletmek ve siteyi kötüye kullanıma karşı korumak için IP adresinizi, tarayıcı bilgilerinizi ve
        istediğiniz adresi işler; bize kimseyi tanımlamayan toplu trafik istatistikleri sunabilir.
        Hukuki sebep: güvenli bir web sitesi işletmeye yönelik meşru menfaatimiz (KVKK m. 5/2-f; GDPR m.
        6/1-f).
      </p>
      <p>
        <strong>Kendi cihazınızda tutulanlar.</strong> Tarayıcınızın yerel depolamasında iki kayıt
        bulunur: açık/koyu tema tercihiniz ve analiz izni tercihiniz. İkisi de bize gönderilmez.
        Ayrıntılar için <a href="/tr/cerez-politikasi/">çerez politikasına</a> bakınız.
      </p>
      <p>
        <strong>Yazı tipleri bizim sunucumuzdan gelir.</strong> Yazı tipleri site oluşturulurken siteye
        dahil edilir; bir sayfayı açmak Google Fonts&apos;a istek göndermez.
      </p>
      <p>
        <strong>Ortaklık (affiliate) bağlantıları.</strong> Bazı &ldquo;satın al&rdquo; bağlantıları
        ortaklık bağlantısıdır (bkz. <a href="/disclosure/">ortaklık açıklaması</a>). Birine
        tıkladığınızda bir ortaklık ağı (Awin veya CJ) üzerinden satıcıya yönlenirsiniz; bu taraflar
        yönlendirmeyi kaydetmek için kendi gizlilik politikaları kapsamında kendi çerezlerini
        kullanabilir. Bize hiçbir zaman adınız, siparişiniz veya ödeme bilgileriniz iletilmez; yalnızca
        sizi tanımlamayan komisyon raporları alırız.
      </p>
      <p>
        <strong>Bize e-posta gönderirseniz.</strong> Adresinizi ve mesajınızı size yanıt vermek için
        kullanırız; yazışmayı konu ve olası takibi sonuçlanana kadar, olağan durumda son mesajdan
        itibaren en fazla iki yıl saklarız. Hukuki sebep: yanıt vermeye yönelik meşru menfaatimiz (KVKK
        m. 5/2-f) veya üretici iseniz sözleşmenin ifası.
      </p>

      <h2>4. Üretici hesapları (producers.counterscent.com)</h2>
      <p>
        Üretici paneli, ürettiği veya sattığı parfümleri listeleyen işletmeler içindir. Hesap
        sahiplerinin 18 yaşını doldurmuş ve işletme adına hareket etmeye yetkili olması gerekir.
      </p>
      <ul>
        <li>
          <strong>Hesap:</strong> e-posta adresiniz; Google ile giriş yaparsanız Google hesabınızdaki ad
          ve Google&apos;ın bu hesap için verdiği tanımlayıcı. Google şifrenizi veya erişim
          anahtarınızı saklamayız.
        </li>
        <li>
          <strong>Giriş:</strong> tek kullanımlık giriş bağlantıları (yalnızca özet değeri/hash olarak
          saklanır, 15 dakika geçerlidir) ve sizi en fazla 30 gün ya da çıkış yapana kadar oturumda tutan
          bir oturum çerezi.
        </li>
        <li>
          <strong>Şirketiniz ve ilanlarınız:</strong> bize verdiğiniz şirket adı ve iletişim e-postası,
          bir ilan için gönderdiğiniz her şey (ürün bilgileri, mağaza bağlantısı, fotoğraf) ve ilanın
          inceleme durumu.
        </li>
        <li>
          <strong>Değişiklik kaydı:</strong> bir ilanı kimin, ne zaman gönderdiği, değiştirdiği, geri
          çektiği veya incelediği ya da bir giriş yöntemini kimin değiştirdiği. Hesapla ilgili kayıtlar o
          sırada kullanılan e-posta adresini içerebilir.
        </li>
        <li>
          <strong>Kötüye kullanıma karşı koruma:</strong> giriş ve e-posta kötüye kullanımını önlemek için
          ağ adresi başına istek sayarız. Adres yalnızca geri döndürülemez bir özet (hash) olarak
          saklanır ve sayaçlar 48 saat içinde otomatik olarak silinir.
        </li>
        <li>
          <strong>İlan tıklamaları:</strong> her ilanın satın alma bağlantısına yapılan tıklamaları, hangi
          sayfadan gelindiğiyle birlikte sayarız. Bu kayıtlar hiçbir ziyaretçiyi tanımlamaz.
        </li>
      </ul>
      <p>
        Hukuki sebepler: hesap açarak kurduğunuz sözleşmenin ifası (KVKK m. 5/2-c; GDPR m. 6/1-b);
        tutmakla yükümlü olduğumuz ticari kayıtlar için hukuki yükümlülük (KVKK m. 5/2-ç; GDPR m.
        6/1-c); bir hakkın tesisi, kullanılması veya korunması (KVKK m. 5/2-e); güvenlik ve
        dolandırıcılığın önlenmesine yönelik meşru menfaatimiz (KVKK m. 5/2-f; GDPR m. 6/1-f).
        Verileriniz, bu sayfalardaki formlar ve giriş işlemleri aracılığıyla elektronik ortamda
        toplanır.
      </p>
      <p>
        <strong>E-posta.</strong> Panelin gönderdiği tek e-posta, sizin talep ettiğiniz giriş
        bağlantısıdır. Bunlar bilgilendirme amaçlı işlem iletileridir ve ret (abonelikten çıkma)
        bağlantısı içermez: talep etmeyi bıraktığınızda gelmez. Bülten veya ticari elektronik ileti
        göndermeyiz. Bu değişirse, yalnızca önceden onay alarak ve her iletide 6563 sayılı Kanun&apos;un
        gerektirdiği şekilde ret bağlantısıyla göndeririz. E-posta sağlayıcımız gönderilen her giriş
        e-postasının bir kopyasını posta kutumuzda tutar; bu kopyaları düzenli olarak temizleriz ve başka
        hiçbir amaçla kullanmayız.
      </p>
      <p>
        <strong>Otomatik kontroller.</strong> Gönderilen ilanlara ilişkin bazı kontroller otomatik çalışır;
        örneğin orijinalden kopyalanmış bir nota piramidinin tespiti. Bu kontroller bir gönderimi
        reddedebilir veya işaretleyebilir; ancak her onay bir kişi tarafından verilir ve otomatik bir
        sonucun bir kişi tarafından yeniden incelenmesini isteyebilirsiniz.
      </p>
      <p>
        <strong>Ödemeler.</strong> Ücretli planlar henüz açılmamıştır. Açıldığında ödemeler, ödeme
        bilgilerinizi kendi gizlilik politikası kapsamında işleyen bir yetkili satıcı (merchant of
        record) tarafından alınacaktır; kart bilgilerinizi görmeyiz.
      </p>

      <h2>5. Verilerin aktarıldığı taraflar</h2>
      <ul>
        <li>
          <strong>Cloudflare, Inc.</strong> (ABD, küresel ağ): iki sitenin barındırılması, iletilmesi ve
          güvenliği.
        </li>
        <li>
          <strong>Google LLC</strong> (ABD): yalnızca izninizle Google Analytics 4; yalnızca siz seçerseniz
          Google ile giriş.
        </li>
        <li>
          <strong>Neon</strong> (veritabanı ve dosya depolama, ABD): üretici hesapları, ilanlar,
          fotoğraflar ve kayıtlar.
        </li>
        <li>
          <strong>Hostinger</strong>: giriş e-postalarının gönderilmesi ve şirket posta kutumuz.
        </li>
        <li>
          <strong>Awin ve CJ</strong>: 3. bölümde anlatılan bağlantılar için ortaklık ağları.
        </li>
      </ul>
      <p>
        Bu hizmet sağlayıcılar Türkiye dışındadır; dolayısıyla kullanılmaları kişisel verilerin yurt
        dışına aktarılması anlamına gelir. Bu aktarımlar KVKK m. 9 kapsamında, Kişisel Verileri Koruma
        Kurulu&apos;nun ilan ettiği standart sözleşmelere dayanılarak yapılır; bu sözleşmeleri her
        sağlayıcıyla imzalama ve Kuruma bildirme sürecindeyiz. Analiz verisi, buna ek olarak, yalnızca
        siz izin verirseniz toplanır. Avrupa Ekonomik Alanı&apos;ndaki kişiler bakımından
        sağlayıcılar, Avrupa Komisyonu&apos;nun standart sözleşme hükümlerine veya AB-ABD Veri
        Gizliliği Çerçevesi&apos;ne dayanır.
      </p>

      <h2>6. Saklama süreleri</h2>
      <ul>
        <li>Giriş bağlantıları: 15 dakika. Oturumlar: en fazla 30 gün veya çıkış yapana kadar.</li>
        <li>Kötüye kullanım sayaçları: 48 saat içinde otomatik olarak silinir.</li>
        <li>
          Hesap bilgileri: hesabı silene kadar. Silme işlemi e-posta adresinizi, adınızı, oturumlarınızı,
          giriş bağlantılarınızı ve bağlı giriş yöntemlerinizi derhal kaldırır.
        </li>
        <li>
          İlanlar ve değişiklik kaydı: bir ilan geri çekildikten veya hesap silindikten sonra da, hukuki
          taleplerin tesisi, kullanılması veya korunması ve ticari defter tutma yükümlülükleri için
          gerektiği sürece ve en fazla on yıl saklanır. Geri çekilen ilan artık yayımlanmaz.
        </li>
        <li>Analiz verileri: Google Analytics&apos;in sunduğu en kısa saklama süresi.</li>
        <li>Bize gönderilen e-postalar: olağan durumda son mesajdan itibaren en fazla iki yıl.</li>
      </ul>
      <p>
        Süresi dolan veriler, Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi
        Hakkında Yönetmelik&apos;e uygun olarak silinir veya anonim hâle getirilir.
      </p>

      <h2>7. Çocuklar</h2>
      <p>
        Counterscent yetişkinlere yöneliktir. Üretici hesapları, bir işletme adına hareket eden 18 yaşını
        doldurmuş kişiler içindir. 18 yaşından küçüklerden bilerek kişisel veri toplamayız; 16 yaşından
        küçükseniz lütfen analiz izni vermeyin. Bir çocuğun bize kişisel veri verdiğini düşünüyorsanız
        bize yazın; bu verileri sileriz.
      </p>

      <h2>8. KVKK m. 11 kapsamındaki haklarınız</h2>
      <p>Veri sorumlusuna başvurarak şunları talep edebilirsiniz:</p>
      <ul>
        <li>kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi isteme,</li>
        <li>işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>KVKK m. 7&apos;deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
        <li>düzeltme, silme veya yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
        <li>
          münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya
          çıkmasına itiraz etme,
        </li>
        <li>kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
      </ul>
      <p>
        Açık rızanızı dilediğiniz zaman geri alabilirsiniz; bu, geri alma öncesindeki işlemelerin
        hukuka uygunluğunu etkilemez.
      </p>
      <p>
        <strong>Başvuru yöntemi.</strong> Üreticiler hesaplarını{" "}
        <a href={`${PRODUCER_CONSOLE}/console/delete`}>panelden</a> kendileri silebilir. Diğer tüm
        talepler için, varsa hesabınızda kayıtlı adresten,{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> adresine talebinizi açıkça belirterek
        yazabilirsiniz. Başvurular, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ uyarınca en
        geç 30 gün içinde ücretsiz olarak sonuçlandırılır. Başvurunuzun reddedilmesi, cevabı yetersiz
        bulmanız veya süresinde cevap verilmemesi hâlinde Kişisel Verileri Koruma Kurulu&apos;na (
        <a href="https://www.kvkk.gov.tr" rel="noopener noreferrer" target="_blank">
          kvkk.gov.tr
        </a>
        ) şikâyette bulunabilirsiniz.
      </p>

      <h2>9. Güvenlik</h2>
      <p>
        İki site de yalnızca HTTPS üzerinden sunulur. Sızabilecek bir şifre yoktur: giriş, tek
        kullanımlık bağlantılarla veya Google ile yapılır. Giriş bağlantıları ve ağ adresleri yalnızca
        özet (hash) olarak saklanır; veritabanına erişim hizmeti yürüten kişilerle sınırlıdır.
      </p>

      <h2>10. Değişiklikler ve dil</h2>
      <p>
        Bu metni, anlattığı herhangi bir şeyle aynı değişiklikte güncelleriz; yürürlükteki sürüm,
        sayfanın başındaki tarihtir. Önemli değişiklikler üreticilere yürürlüğe girmeden önce bildirilir.
        Bu metin{" "}
        <a href="/privacy/" hrefLang="en">
          İngilizce
        </a>{" "}
        olarak da yayımlanmıştır; KVKK bakımından ve Türkiye&apos;deki kişiler için Türkçe metin, diğer
        durumlarda İngilizce metin esas alınır.
      </p>
    </LegalPage>
  );
}
