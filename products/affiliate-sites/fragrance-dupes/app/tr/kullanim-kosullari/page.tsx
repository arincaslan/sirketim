import { LegalPage, legalMetadata } from "@/components/legal/legal-page";
import { LEGAL_ENTITY, PRODUCER_CONSOLE } from "@/lib/site";

/**
 * Kullanım koşulları - Türkçe. English counterpart: app/terms/page.tsx, which
 * is derived from PRODUCER-TERMS.md. Written 2026-11-01 as a section-by-section
 * translation of the English text in force that day. CHANGE BOTH IN ONE COMMIT
 * and keep UPDATED equal; the section numbers match so a reader can compare.
 *
 * NOT REVIEWED BY A LAWYER.
 */
export const metadata = legalMetadata({
  lang: "tr",
  title: "Kullanım Koşulları",
  description: "Counterscent'in kullanımına ve üretici hesabı sahipliğine uygulanan koşullar.",
  en: "/terms/",
  tr: "/tr/kullanim-kosullari/",
});

const UPDATED = "1 Kasım 2026";

export default function KullanimKosullariPage() {
  return (
    <LegalPage lang="tr" title="Kullanım koşulları" updated={UPDATED} counterpart="/terms/">
      <p>
        Counterscent (&ldquo;Site&rdquo;; counterscent.com ve producers.counterscent.com),
        Türkiye&apos;de kurulu <strong>{LEGAL_ENTITY}</strong> (&ldquo;biz&rdquo;) tarafından
        işletilmektedir. Bu koşullar iki ayrı şeyi kapsar: Site&apos;yi okuyucu olarak kullanmak ve bir
        üretici hesabına sahip olmak. Bu sayfanın büyük bölümü ikincisiyle ilgilidir.
      </p>

      <h2>1. Site&apos;yi okumak</h2>
      <p>
        Katalog ücretsizdir ve hesap gerektirmez. Yayımladığı içerik, tasarım (designer) parfümler ile
        onlardan esinlenen daha uygun fiyatlı parfümler arasında, <a href="/about/#methodology">standartlar
        sayfamızda</a> açıklanan yayımlanmış bir formülle hesaplanan kendi editoryal karşılaştırmamızdır.
      </p>
      <p>
        <strong>Bu bir görüş ve analizdir, garanti değildir.</strong> Eşleşme puanı, beyan edilmiş iki
        nota piramidinin birbirine ne kadar yakın olduğunu anlatır. İki parfümü benzer bulacağınızı vaat
        etmez ve ne satın almanız gerektiğine dair bir tavsiye değildir. Fiyatlar, stok durumu ve
        formüller bize haber verilmeden değişebilir.
      </p>
      <p>
        Site&apos;de adı geçen hiçbir parfüm evi ile bağlantılı değiliz; onlar tarafından onaylanmadık ve
        onlar adına hareket etmiyoruz. Marka adları yalnızca karşılaştırılan ürünleri tanımlamak için
        kullanılır. Bazı dış bağlantılar bize komisyon kazandırır; bkz.{" "}
        <a href="/disclosure/">ortaklık açıklaması</a>. Hiçbir markadan katalogda yer almak veya herhangi
        bir sırada görünmek için ödeme almayız.
      </p>
      <p>
        <strong>Görseller ve markalar.</strong> Site&apos;deki ürün fotoğrafları, ortaklık programlarına
        dahil olduğumuz satıcılar tarafından kendi ürünlerinin tanıtımı için veya üreticiler tarafından
        kendi ilanları için sağlanır; atmosfer görselleri ve videoları bizim için üretilmiştir ve gerçek
        bir ürün içermez. Parfüm ve marka adları ile şişe tasarımları sahiplerine aittir ve yalnızca
        karşılaştırılan ürünleri tanımlamak için kullanılır. Herhangi bir sayfaya bağlantı verebilirsiniz;
        ancak Site&apos;nin görsellerini, verilerini veya editoryal metinlerini yazılı iznimiz olmadan toplu
        olarak kopyalayamaz veya yeniden yayımlayamazsınız. Buradaki bir içeriğin haklarınızı ihlal ettiğini
        düşünüyorsanız bize yazın; konuyu hızla inceleriz.
      </p>
      <p>
        Katalog yetişkinlere yöneliktir. Çocuklardan bilerek kişisel veri toplamayız; bkz.{" "}
        <a href="/tr/gizlilik/">gizlilik politikası</a>.
      </p>

      <h2>2. Üretici hesapları &mdash; hizmet nedir</h2>
      <p>
        Üretici hesabı, bir işletmenin ürettiği veya sattığı parfümleri kataloğa göndermesini, bir ilanı
        güncel tutmasını ve geri çekmesini sağlar. Yayımlanan bir gönderim (&ldquo;ilan&rdquo;), Dupe
        Finder&apos;da ve karşılaştırıldığı orijinalin sayfasında, diğer tüm ilanlarla tamamen aynı
        şekilde gösterilir: aynı kart, aynı sıralama, aynı formül.
      </p>
      <p>
        <strong>Hizmet, hesap ve ilan aracıdır. Reklam veya öne çıkarma (yerleştirme) değildir.</strong>{" "}
        Trafik, tıklama, satış veya bir ilanın hangi sırada yer alacağı konusunda hiçbir taahhüt
        içermez.
      </p>

      <h2>3. Kimler hesap açabilir</h2>
      <p>
        Listelediğiniz parfümü üreten veya satan ve gerçek bir adreste ulaşılabilen bir işletmeyseniz
        hesap açabilirsiniz. Program işletmeden işletmeye (B2B) yöneliktir; tüketicilere açık değildir ve
        gerçek kişiler kendi adlarına hesap açamaz. Hesabı açan kişi 18 yaşını doldurmuş ve işletme adına
        hareket etmeye yetkili olmalıdır; hesabı oluştururken her ikisini de beyan eder.
      </p>
      <p>
        Kendi ticari kimliğinizle listeleme yapmalısınız.{" "}
        <strong>Kontrol etmediğiniz bir şirket adına hesap açamazsınız.</strong> Site&apos;de bizimle hiçbir
        ilişkisi olmayan çok sayıda parfüm evinin adı geçer ve bunlardan birinin kimliğine bürünmek gerçek
        bir işletmeyi yanlış temsil etmektir. Bunu sözleşmeyle olduğu kadar teknik olarak da uygularız.
      </p>

      <h2>4. Sizin sağladıklarınız ve bizim yazdıklarımız</h2>
      <p>
        <strong>Siz sağlarsınız:</strong> ürününüzün, mevcut kataloğumuzdan seçilen hangi orijinale
        alternatif olduğu; ürününüzün adı, fiyatı, şişe hacmi ve konsantrasyonu; üst, orta ve dip
        notalar olarak nota piramidi; orijinalden gerçekten neyin farklı olduğuna dair açık bir beyan;
        kendi mağazanızdaki ürün bağlantısı; ve ürünün bir fotoğrafı.
      </p>
      <p>
        <strong>Orijinal ekleyemezsiniz.</strong> Karşılaştırma, bizim araştırdığımız bir nota piramidine
        göre hesaplanır. Ürününüzün esinlendiği parfüm kataloğumuzda yoksa, biz ekleyene kadar ilanınız
        puanlanamaz ve bunun için bir tarih taahhüt etmeyiz.
      </p>
      <p>
        <strong>Geri kalan her şeyi biz yazarız:</strong> altı profil puanı, parfümünüzün nasıl
        karşılaştırıldığını anlatan değerlendirme (verdict) ve eşleşme puanı. Değerlendirme bizim
        üslubumuzla yazılır; ürününüzün başarılı olduğu yerleri olduğu kadar eksik kaldığı yerleri de
        söyler ve üzerinde onay hakkınız yoktur. Eşleşme puanı yayımlanmış formülle hesaplanır;
        pazarlığa açık değildir ve satılık değildir.
      </p>

      <h2>5. İnceleme ve yayın</h2>
      <p>
        Her gönderim yayımlanmadan önce bir kişi tarafından incelenir. Hiçbir şey otomatik olarak
        onaylanmaz. Otomatik kontroller bir gönderimi reddedebilir veya içindeki bir iddiayı
        zayıflatabilir; hiçbir otomatik süreç bir gönderimi onaylayamaz veya hakkındaki bir iddiayı
        güçlendiremez.
      </p>
      <p>
        <strong>&ldquo;Onaylandı&rdquo; ve &ldquo;yayında&rdquo; farklı durumlardır.</strong> Herkese açık
        katalog, değişiklikleri yayımlamak için yeniden oluşturulan statik bir sitedir; bu nedenle onaylanan
        bir ilan hemen değil, bir sonraki derlemede yayına girer. Panel bu iki durumu ayrı gösterir.
        İnceleme süresi veya yayın sıklığı taahhüt etmeyiz ve bu sayfadan böyle bir taahhüt
        çıkarmamalısınız.
      </p>
      <p>
        Bir gönderimi reddedebiliriz ve size gerekçesini bildiririz. Yaygın gerekçeler: orijinalin
        kataloğumuzda olmaması; beyan edilen verilerin kendi herkese açık ürün sayfanızla
        bağdaştırılamaması; bağlantının kontrollerimizden geçmemesi; veya gönderimin orijinalin kendi nota
        piramidini aynen tekrarlaması.
      </p>

      <h2>6. Ürün fotoğrafı</h2>
      <p>
        Fotoğraf zorunludur ve fotoğrafsız bir ilan yayımlanamaz. Fotoğrafı yükleyerek; fotoğrafın sahibi
        olduğunuzu veya lisanslama hakkına sahip olduğunuzu, listelenen gerçek ürünü gösterdiğini ve
        yayımlanmasının kimsenin hakkını ihlal etmediğini beyan edersiniz. İlanınızla ve Site&apos;nin
        kataloğu tanıtmasıyla bağlantılı olarak, ilan yayında kaldığı sürece ve sonrasında kopyalar
        kontrolümüz dışındaki önbelleklerde ve arşivlerde bulunduğu sürece, fotoğrafı gösterme, yeniden
        boyutlandırma ve önbelleğe alma için bize münhasır olmayan, dünya çapında, bedelsiz bir lisans
        verirsiniz.
      </p>
      <p>
        Fotoğrafınızı yeniden boyutlandırma ve biçim dönüştürme dışında değiştirmeyiz; kimse için ürün
        görseli üretmez veya rötuşlamayız. Bir görselin haklarına artık sahip olmadığınızı bize
        bildirirseniz, görseli ve onunla birlikte ilanı kaldırırız.
      </p>

      <h2>7. Doğruluk ve piramit kuralı</h2>
      <p>
        Gönderdiğiniz her şey kendi ürününüz hakkındaki kendi beyanınızdır ve bu şekilde yayımlanır.
        Doğruluğundan siz sorumlusunuz.
      </p>
      <p>
        <strong>Bir nota piramidi ancak onu siz de yayımlıyorsanız sizin sayılır.</strong> Aynı
        üst/orta/dip dağılımı kendi alıcılarınızın görebileceği bir yerde yayımlanıyorsa, beyan edilmiş
        olarak kaydederiz. Yalnızca burada yer alıyorsa, ilan dağılımı bizim çıkarmışız gibi puanlanır ve bu
        da belgelenmiş bir puan indirimi getirir. Bu sizinle ilgili bir yargı değildir: bize söyledikleriniz
        ile tüm alıcılarınıza söyledikleriniz farklı türde beyanlardır ve yalnızca biri bir okuyucu
        tarafından doğrulanabilir.
      </p>
      <p>
        Orijinalin kendi piramidini aynen tekrarlayan bir gönderim yayımlanmaz; formül bunu neredeyse
        mükemmel bir eşleşme olarak okur, oysa öyle değildir. Ürününüzü, orijinalin üreticisinin onu
        ürettiğini, onayladığını veya onunla bağlantılı olduğunu düşündürecek şekilde tanımlayamazsınız.
      </p>

      <h2>8. Bağlantınız</h2>
      <p>
        İlanınız, hesabınızda kayıtlı olan kendi mağaza alan adınızdaki ürüne bağlanır. Bağlantı https
        olmalı, kimlik bilgisi taşımamalı ve{" "}
        <strong>ortaklık, izleme veya kısaltılmış bir bağlantı olmamalıdır</strong> &mdash; ne kendi
        ağınızın ne de üçüncü bir tarafın. Onaydan sonra hedefi değiştirilebilen bir bağlantıyı
        yayımlayamayız. Alan adı değiştirmeden önce bize haber verin; bağlantıyı güncelleriz ve bize
        bildirilmemiş bir yönlendirmeyi takip etmeyiz.
      </p>

      <h2>9. Hiçbir planın satın alamayacakları</h2>
      <p>
        Hiçbir plan, seviye veya ödeme daha iyi bir eşleşme puanı, daha üst bir sıra, öne çıkarma veya daha
        olumlu bir değerlendirme satın alamaz. Bu yalnızca vaat edilmekle kalmaz, kodla uygulanır:
        puanları hesaplayan ve sıralayan modüllerin ne ödediğinizi bilen hiçbir şeyi içe aktarması
        engellenmiştir ve bu değişirse derleme başarısız olur.
      </p>
      <p>
        <strong>Ücretsiz plan dahil hiçbir planda satışlarınızdan komisyon almayız.</strong> İlanınız
        doğrudan kendi mağazanıza bağlanır. Hangi sırada yer aldığından veya ne kadar trafik aldığından
        hiçbir mali çıkarımız yoktur ve bu bilinçli bir tercihtir; yukarıdaki paragrafı değerli kılan budur.
        Varsa abonelik, bize ödediğiniz tek şeydir. Ücretli bir plan inceleme sırasında öncelik
        sağlayabilir; bu, bir gönderime ne kadar hızlı baktığımızı etkiler, nereye yerleştiğini değil.
      </p>

      <h2>10. Bir ilanı kaldırmak ve sakladıklarımız</h2>
      <p>
        Bir ilanı istediğiniz zaman, ücretsiz plan dahil her planda, panelden kendiniz kaldırabilirsiniz.
        Gerekçe sormayız ve geciktirmeyiz. Geri çekme, ilanı bir sonraki derlemede katalogdan çıkarır ve
        bağlantısının çalışmasını durdurur.
      </p>
      <p>
        <strong>Geri çekme bir durum değişikliğidir, silme değildir.</strong> İlanın geçmişini &mdash;
        neyin gönderildiğini, neyin yayımlandığını, ne zaman yayımlandığını ve ona bağlı tıklama kaydını
        &mdash; saklarız; çünkü bir uyuşmazlık veya hak ihlali şikâyeti, ilan kaldırıldıktan haftalar sonra
        gelebilir ve hakkında olduğu tarafça silinebilen bir kayıt, kayıt değildir. Geri çekilen bir ilanın
        bağlantı tanımlayıcısını yeniden kullanmayız.
      </p>
      <p>
        Bir ilanı kendimiz de kaldırabiliriz: bu koşulların ihlali, bir hak ihlali şikâyeti, bağdaştıramadığımız
        veriler veya kapatılmış bir hesap nedeniyle. Hangisi olduğunu size söyleriz. Geri çekilen bir ürünü
        yeniden gönderebilirsiniz; bir ürün geri çekilip aynı orijinale karşı farklı beyan edilmiş verilerle
        yeniden gönderilirse ikisine yan yana bakarız ve düşük bir puandan sonra geri çekip daha
        &ldquo;elverişli&rdquo; bir piramitle yeniden gönderme örüntüsü, bir ilanı reddetme gerekçesidir.
      </p>

      <h2>11. Ücretler ve faturalandırma</h2>
      <p>
        Ücretsiz plan açıktır. <strong>Ücretli planlar henüz açık değildir</strong> ve şu anda hiçbir
        ödeme alınamaz; Site&apos;de gösterilen fiyatlar fikir vermek içindir ve ücretli planlar açılana
        kadar bir teklif niteliği taşımaz.
      </p>
      <p>
        Ücretli planlar açıldığında abonelikler bir <strong>yetkili satıcı (merchant of record)</strong>{" "}
        aracılığıyla satılacaktır. Bu, ödemenin kendisine ilişkin sözleşmenizin o şirketle olduğu ve
        faturanızın bizden değil ondan geleceği, bulunduğunuz yerde geçerli satış vergisini veya KDV&apos;yi
        onun ekleyeceği anlamına gelir. Ücretler vergi hariç olarak belirtilir.
      </p>
      <p>
        Abonelikler iptal edilene kadar otomatik olarak yenilenir. İptal, iadeler ve bir ödeme başarısız
        olduğunda ne olacağı, üretici panelindeki{" "}
        <a href={`${PRODUCER_CONSOLE}/refunds#tr`}>iade ve iptal politikamızda</a> anlatılmaktadır.
      </p>
      <p>
        Fiyatları değiştirebiliriz. Mevcut abonelere değişiklik kendilerine uygulanmadan önce bildirim
        yapılır ve bunun yerine iptal edebilirler.
      </p>

      <h2>12. Askıya alma ve hesabın kapatılması</h2>
      <p>
        Hesabınızı istediğiniz zaman panelin &ldquo;Hesabı sil&rdquo; sayfasından kendiniz silebilirsiniz;
        ilanlarınız bir sonraki derlemede kaldırılır ve 10. bölümde anlatılan kayıt,{" "}
        <a href="/tr/gizlilik/">gizlilik politikasında</a> açıklandığı şekilde saklanır. Bu koşulların
        ciddi veya tekrarlanan ihlali hâlinde bir hesabı askıya alabilir veya kapatabiliriz &mdash; özellikle
        bir ilanın kime ait ürün olduğunu yanlış temsil etmek, kendi herkese açık ürün sayfanızla çelişen
        veriler sunmak, çözemediğimiz hak ihlali şikâyetleri veya Site&apos;deki herhangi bir sıralama ya da
        sayma mekanizmasını manipüle etmeye çalışmak nedeniyle. İhlal giderilebilir nitelikteyse, önce neyin
        gidereceğini söyleriz.
      </p>

      <h2>13. Veriler</h2>
      <p>
        Hesap bilgilerinizi, gönderdiklerinizi ve 10. bölümde anlatılan kaydı tutarız. Bunları programı
        yürütmek için kullanırız, başka hiçbir amaçla kullanmayız ve satmayız. Türkiye&apos;de kuruluyuz ve
        kişisel verileri 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında işleriz. Bu
        işlemeye kendi hukuku uygulanan bir yerde kuruluysanız, o hukukun gerektirdiği veri koruma hükümleri
        burada varsayılarak geçiştirilmez; hesabınız açılmadan önce eklenir. Bkz.{" "}
        <a href="/tr/gizlilik/">gizlilik politikası ve KVKK aydınlatma metni</a>.
      </p>
      <p>
        Herkese açık katalog kendi adına çerez yazmaz ve ziyaretleri yalnızca ziyaretçi izin verirse ölçer.
        Bu, kataloğa ait bir özelliktir; oturum açan kişiyi zorunlu olarak bilen üretici paneli için bir vaat
        değildir. Bkz. <a href="/tr/cerez-politikasi/">çerez politikası</a>.
      </p>

      <h2>14. Sorumluluk</h2>
      <p>
        Site&apos;yi ve üretici programını oldukları gibi sunarız. Site&apos;nin kesintisiz çalışacağını, bir
        ilanın belirli bir tarihte yayımlanacağını veya herhangi bir trafik ya da satış getireceğini garanti
        etmeyiz.
      </p>
      <p>
        Bu koşullardaki hiçbir hüküm, hukuken sınırlandırılamayacak bir sorumluluğu ortadan kaldırmaz.
        Bu kayıtla ve bu düzenleme işletmeden işletmeye olduğundan; kâr, gelir, iş veya veri kaybından
        sorumlu değiliz ve herhangi bir talep için size karşı toplam sorumluluğumuz, talebin doğmasından
        önceki on iki ay içinde bize ödediğiniz tutarla sınırlıdır. Ücretsiz planda bu tutar sıfırdır; bu,
        planın ücretsiz olmasının dürüst sonucudur.
      </p>

      <h2>15. Değişiklikler ve uygulanacak hukuk</h2>
      <p>
        Bu koşulları değiştirebiliriz. Önemli değişiklikler, yürürlüğe girmeden önce hesap sahiplerine
        bildirilir ve sonrasında hesabı kullanmaya devam etmek kabul anlamına gelir. Sayfanın başındaki tarih,
        yürürlükteki sürümdür.
      </p>
      <p>
        Bu koşullara Türk hukuku uygulanır ve İstanbul mahkemeleri yetkilidir. Başka bir ülkede kurulu bir
        işletmeyseniz, kendi ülkenizin hukukunun sözleşmeyle bertaraf edilemeyen emredici koruyucu hükümleri
        size uygulanmaya devam eder.
      </p>
      <p>
        Bu koşullar{" "}
        <a href="/terms/" hrefLang="en">
          İngilizce
        </a>{" "}
        olarak da yayımlanmıştır. İki metin arasında farklılık olması hâlinde, Türkiye&apos;deki kullanıcılar
        için Türkçe metin, diğer durumlarda İngilizce metin esas alınır.
      </p>

      <h2>16. İletişim</h2>
      <p>
        {LEGAL_ENTITY}, Türkiye. Bu koşullarla ilgili sorularınız için{" "}
        <a href="/contact/">iletişim sayfamızı</a> kullanabilirsiniz.
      </p>
    </LegalPage>
  );
}
