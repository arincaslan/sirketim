import { html } from "../lib/html";
import { layout } from "../ui/layout";
import { LEGAL_ENTITY } from "../lib/legal";
import { section } from "../ui/components";

/**
 * The refund and cancellation policy, on the origin where the subscription is
 * actually bought.
 *
 * WHY IT IS HERE AND NOT ON THE CATALOGUE. It was written on the catalogue
 * first (app/refunds/page.tsx, 2026-09-24) and the founder moved it the same
 * day: "refunds kısmı bence consoleda olmalı". That is the right call. Nothing
 * on counterscent.com can be bought, so a refund policy there is a document
 * about a transaction that does not happen on the page carrying it. The person
 * who needs this is signed in here, looking at a plan.
 *
 * THE CATALOGUE STILL LINKS TO IT, from the site footer, pointing at this URL.
 * That is not redundancy - a merchant-of-record domain review requires the
 * refund policy to be "clearly accessible via navigation" on the domain
 * submitted, and both origins may be submitted. One canonical page, linked
 * from both navigations, satisfies that without two copies to drift.
 *
 * UNAUTHENTICATED ON PURPOSE. A reviewer at the payment provider has no
 * account here, and a policy you must sign in to read is not published. It
 * takes no session, reads no database, and is in the plain ROUTES table rather
 * than behind any gate.
 *
 * NOTE THE ORIGIN IS `noindex` (see src/ui/layout.ts and the X-Robots-Tag in
 * src/lib/http.ts). That is correct for a console and harmless here - the
 * people who need this arrive by link, not by search - but it does mean this
 * page will not appear in a search for "counterscent refund policy". If that
 * ever matters, the fix is a canonical copy on the catalogue, not removing
 * noindex from a console.
 *
 * ---
 *
 * THE WINDOW IS 14 DAYS AND THAT IS SHORTER THAN PADDLE EXPECTS.
 *
 * Paddle's seller guidance is that sellers are "expected to have at least a
 * 30-day money-back guarantee as part of their refund policy". The founder
 * chose 14 on 2026-09-24 after that was stated, so it is a decision and not an
 * oversight - recorded here because it is the single most likely thing for a
 * reviewer to come back on, and whoever fields that reply needs to know. The
 * change, if it is ever made, is one number here and one in
 * ../../fragrance-dupes/PRODUCER-TERMS.md §11.
 *
 * Paddle, as merchant of record, runs its own buyer refund process and can
 * approve a refund on its own assessment. This page states what WE undertake.
 * It cannot bind the merchant of record to refuse one.
 *
 * ---
 *
 * PRODUCER-TERMS.md §11 IS THE CANONICAL TEXT. Change both in the same commit
 * or they drift, and the published one is what a producer relies on.
 *
 * ---
 *
 * BILINGUAL SINCE 2026-11-01, ON ONE PAGE. The English text comes first and
 * the Turkish text follows under `id="tr"`, which is the anchor the
 * catalogue's Turkish footer and its Turkish terms link to
 * (`/refunds#tr`). One page rather than two so the two texts cannot be
 * published at different versions, and so a catalogue link deployed before
 * this Worker still lands somewhere real (the English text) instead of a 404.
 * The two halves must say the same thing; for people in Turkiye the Turkish
 * text prevails, which the Turkish half itself states.
 *
 * ALSO 2026-11-01: the contracting party is now LEGAL_ENTITY (src/lib/legal.ts)
 * instead of "Sirketim A.S.", and the page says plainly that paid plans are not
 * open yet. It used to tell a producer to "cancel from the billing section of
 * this console", a section that does not exist - an instruction a reader could
 * not follow is the same failure as a button that does nothing.
 */
export function refunds() {
  return layout({
    title: "Refund and cancellation policy",
    heading: "Refund and cancellation policy",
    showBackLink: false,
    standfirst: html`Last updated 1 November 2026. This applies to producer
      subscriptions on Counterscent, operated by <strong>${LEGAL_ENTITY}</strong>,
      a company established in Türkiye. It sits alongside the
      <a href="https://counterscent.com/terms/">terms of service</a>.
      <span lang="tr">Türkçe metin: <a href="#tr">İade ve iptal politikası</a>.</span>`,
    body: html`
      ${section({
        heading: "Paid plans are not open yet",
        body: html`
          <p>
            No producer can buy a subscription today, so nobody has been charged and
            there is nothing to cancel or refund. This policy is published now so that
            it is in place, and can be read, before the first payment is ever taken.
            When paid plans open, the cancel control described below will be in the
            console, and this notice will be removed.
          </p>
        `,
      })}
      ${section({
        heading: "The short version",
        body: html`
          <p class="muted">
            <strong>The free tier is free.</strong> There is nothing to cancel
            and nothing to refund. Everything below is about the paid tiers.
          </p>
          <ul class="plain-list">
            <li>
              <strong>14 days to change your mind</strong> on a new
              subscription, for any reason or none.
            </li>
            <li>
              <strong>Cancel whenever you like</strong>, from inside your
              account, with no notice period and nobody to talk to first.
            </li>
            <li>
              <strong>No hidden fees.</strong> The price shown before you pay
              is the plan price plus any sales tax or VAT the payment provider
              adds, shown to you before you confirm. There is no setup fee,
              cancellation fee or charge for leaving.
            </li>
            <li>
              <strong>Cancelling is not deleting.</strong> Your listings and
              their history are kept, and republish if you come back.
            </li>
          </ul>
        `,
      })}
      ${section({
        heading: "The 14-day guarantee",
        body: html`
          <p>
            If you are unhappy with a producer subscription, tell us within
            <strong>14 days of the first payment</strong> and we refund it in
            full. You do not have to give a reason, and we will not ask you to
            sit through one being talked out of.
          </p>
          <p>
            The same 14-day window applies to an
            <strong>annual renewal charge</strong>. An annual renewal is a large
            single payment and it is reasonable to have a moment to reconsider
            it.
          </p>
        `,
      })}
      ${section({
        heading: "Renewals",
        body: html`
          <p>
            Subscriptions renew automatically until you cancel. Cancellation
            takes effect at the end of the period you have already paid for —
            you keep everything the plan gives you until then, and you are not
            charged again.
          </p>
          <p>
            <strong>Outside the windows above we do not refund part-periods.</strong>
            On a monthly plan, cancelling in the middle of a month ends the
            subscription at the end of that month rather than refunding the
            remainder. If you know you do not want the next month, cancel before
            it renews and nothing is taken.
          </p>
          <p class="muted">
            This does not affect any right you have under the law where your
            business is established that cannot be contracted out of.
          </p>
        `,
      })}
      ${section({
        heading: "How to cancel",
        body: html`
          <p>
            Once paid plans open, you cancel from inside this console, in the
            same place you chose the plan. Cancelling takes effect immediately as
            an instruction; the subscription itself ends at the end of the paid
            period, and the console shows you that date.
          </p>
          <p>
            If you cannot reach the console for any reason, write to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>
            from the address on your account and a person will do it for you.
          </p>
        `,
      })}
      ${section({
        heading: "How to ask for a refund",
        body: html`
          <p>
            Write to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>
            from the email address on the account and say which payment you
            mean. We answer refund requests within
            <strong>five business days</strong>.
          </p>
          <p>
            Subscriptions will be sold through a <strong>merchant of record</strong>,
            which means the company that took the payment and issued your
            invoice is the one that returns the money. Approved refunds go back
            to the original payment method. That company's own processing time
            applies once we have approved it, and your bank may take a few days
            more to show it. Their name is on your invoice, and you can raise a
            refund request with them directly as well.
          </p>
        `,
      })}
      ${section({
        heading: "What happens to your listings",
        body: html`
          <p>
            When a paid subscription ends, listings above the free allowance
            stop being published at the next rebuild of the catalogue. Nothing
            is deleted — the submissions and their history are retained, and
            they republish if you subscribe again.
          </p>
          <p>
            The same applies if a payment fails. We do not close an account over
            a failed card.
          </p>
        `,
      })}
      ${section({
        heading: "When we will not refund",
        body: html`
          <p>
            We do not refund where an account is closed by us for a serious or
            repeated breach of the
            <a href="https://counterscent.com/terms/">terms of service</a> — in
            particular misrepresenting whose product a listing is, or attempting
            to manipulate a ranking or counting mechanism on the Site.
          </p>
          <p>
            A low match score, a verdict you disagree with, or a listing that
            brings less traffic than you hoped are not refund grounds. The
            subscription buys access to the listing tool and nothing about where
            a listing lands. That is stated on the
            <a href="https://counterscent.com/producers/pricing/">pricing page</a>,
            in the <a href="https://counterscent.com/terms/">terms</a>, and in
            the
            <a href="https://counterscent.com/about/#methodology">published formula</a>
            — we would rather say it three times before you pay than once
            afterwards.
          </p>
        `,
      })}
      <div lang="tr" id="tr" class="lang-block">
        ${section({
          heading: "İade ve iptal politikası (Türkçe)",
          lede: html`Son güncelleme: 1 Kasım 2026. Bu politika, <strong>${LEGAL_ENTITY}</strong>
            tarafından işletilen Counterscent'teki üretici aboneliklerine uygulanır ve
            <a href="https://counterscent.com/tr/kullanim-kosullari/">kullanım koşullarının</a>
            bir parçasıdır. Türkiye'deki kişiler için bu Türkçe metin esas alınır.`,
          body: html`
            <h3>Ücretli planlar henüz açık değil</h3>
            <p>
              Bugün hiçbir üretici abonelik satın alamaz; bu nedenle kimseden ücret
              alınmamıştır ve iptal edilecek ya da iade edilecek bir şey yoktur. Bu politika,
              ilk ödeme alınmadan önce yürürlükte ve okunabilir olsun diye şimdiden
              yayımlanmıştır. Ücretli planlar açıldığında aşağıda anlatılan iptal kontrolü
              panelde yer alacak ve bu not kaldırılacaktır.
            </p>

            <h3>Kısaca</h3>
            <ul class="plain-list">
              <li><strong>Ücretsiz plan ücretsizdir.</strong> İptal edilecek ya da iade edilecek bir şey yoktur; aşağıdakiler ücretli planlarla ilgilidir.</li>
              <li><strong>Yeni bir abonelikte 14 gün içinde</strong>, hiçbir gerekçe göstermeden vazgeçebilirsiniz.</li>
              <li><strong>Dilediğiniz zaman</strong>, hesabınızın içinden, bildirim süresi olmadan ve kimseyle görüşmeniz gerekmeden iptal edebilirsiniz.</li>
              <li><strong>Gizli ücret yoktur.</strong> Ödeme öncesinde gösterilen tutar, plan ücreti ile ödeme sağlayıcının eklediği ve onayınızdan önce size gösterilen satış vergisi veya KDV'den oluşur. Kurulum, iptal ya da ayrılma ücreti alınmaz.</li>
              <li><strong>İptal etmek silmek değildir.</strong> İlanlarınız ve geçmişleri saklanır; geri dönerseniz yeniden yayımlanır.</li>
            </ul>

            <h3>14 günlük iade güvencesi</h3>
            <p>
              Bir üretici aboneliğinden memnun kalmazsanız <strong>ilk ödemeden itibaren 14 gün
              içinde</strong> bize bildirin, ödemenin tamamını iade ederiz. Gerekçe göstermeniz
              gerekmez ve sizi vazgeçirmeye çalışmayız. Aynı 14 günlük süre <strong>yıllık
              yenileme ödemeleri</strong> için de geçerlidir.
            </p>

            <h3>Yenileme</h3>
            <p>
              Abonelikler siz iptal edene kadar otomatik olarak yenilenir. İptal, ödemesini
              yaptığınız dönemin sonunda geçerli olur; o tarihe kadar planın tüm olanaklarını
              kullanmaya devam edersiniz ve yeniden ücret alınmaz. <strong>Yukarıdaki süreler
              dışında kısmi dönem iadesi yapılmaz:</strong> aylık planı ay ortasında iptal
              ederseniz abonelik ay sonunda sona erer. Bir sonraki ayı istemediğinizi
              biliyorsanız yenilemeden önce iptal edin, hiçbir ücret alınmaz.
            </p>
            <p class="muted">
              Bu politika, işletmenizin bulunduğu yerin hukukunun size tanıdığı ve sözleşmeyle
              ortadan kaldırılamayan haklarınızı etkilemez.
            </p>

            <h3>Nasıl iptal edilir</h3>
            <p>
              Ücretli planlar açıldığında, planı seçtiğiniz yerden, bu panelin içinden iptal
              edersiniz. İptal talimatı hemen işlenir; abonelik ödenen dönemin sonunda sona erer
              ve panel size bu tarihi gösterir. Panele herhangi bir nedenle ulaşamazsanız
              hesabınızdaki adresten
              <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> adresine
              yazın; iptali bir çalışanımız yapar.
            </p>

            <h3>İade nasıl istenir</h3>
            <p>
              Hesabınızdaki e-posta adresinden
              <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> adresine
              yazıp hangi ödemeden söz ettiğinizi belirtin. İade taleplerini <strong>beş iş günü
              içinde</strong> yanıtlarız. Abonelikler bir <strong>kayıtlı satıcı (merchant of
              record)</strong> aracılığıyla satılacaktır; yani ödemeyi alan ve faturanızı
              düzenleyen şirket parayı iade eden şirkettir. Onaylanan iadeler ödemenin yapıldığı
              yönteme gönderilir; o şirketin işlem süresi ve bankanızın birkaç günlük süresi
              eklenebilir. Şirketin adı faturanızda yazar ve iade talebinizi doğrudan ona da
              iletebilirsiniz.
            </p>

            <h3>İlanlarınıza ne olur</h3>
            <p>
              Ücretli abonelik sona erdiğinde, ücretsiz kotanın üzerindeki ilanlar katalogun bir
              sonraki yeniden oluşturulmasında yayından kalkar. Hiçbir şey silinmez; başvurular
              ve geçmişleri saklanır ve yeniden abone olursanız tekrar yayımlanır. Ödeme
              başarısız olduğunda da aynısı geçerlidir; başarısız bir kart yüzünden hesap
              kapatmayız.
            </p>

            <h3>İade yapılmayan durumlar</h3>
            <p>
              <a href="https://counterscent.com/tr/kullanim-kosullari/">Kullanım koşullarının</a>
              ciddi veya tekrarlanan ihlali nedeniyle tarafımızca kapatılan hesaplara, özellikle bir
              ilanın kime ait olduğunu yanlış gösterme veya Sitedeki bir sıralama ya da sayma
              mekanizmasını manipüle etmeye çalışma hâllerinde, iade yapılmaz. Düşük bir eşleşme
              puanı, katılmadığınız bir değerlendirme veya beklediğinizden az trafik getiren bir
              ilan iade gerekçesi değildir: abonelik ilan aracına erişim sağlar, bir ilanın nerede
              yer alacağını belirlemez.
            </p>
          `,
        })}
      </div>
    `,
  });
}
