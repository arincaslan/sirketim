# Counterscent Affiliate Gelirleri – Mali Müşavir Bilgilendirme Notu

**Tarih:** 29 Ağustos 2026
**Konu:** Counterscent (counterscent.com) sitesi üzerinden başlayacak affiliate komisyon gelirleri — ödeme alıcısı yapısı, faturalama mekanizması ve netleştirilmesi gereken konular

## 1. Genel Bağlam

Sirketim A.Ş. bünyesinde geliştirilen Counterscent (counterscent.com), üç farklı affiliate ağı üzerinden komisyon geliri elde etmeyi planlıyor:

- **Awin** — İngiltere merkezli affiliate ağı
- **CJ / Commission Junction** — ABD merkezli affiliate ağı
- **Amazon Associates (ABD programı)** — henüz başvurulmadı, en erken Eylül ortası

Üç programın da ödeme alıcısı, faturalama kuralları ve ödeme mekanizması birbirinden farklı. Aşağıda her biri özetlenmiştir.

## 2. Ödeme Alıcısı (Payee) Yapısı

| Program | Fatura Kesen / Ödemeyi Alan | Gerekçe |
|---|---|---|
| Awin | **Sirketim A.Ş.** | Awin, Türkiye'de vergi mükellefi yayıncılara kendi adına fatura kesmiyor (self-billing yok) — yayıncı kendi faturasını kesmek zorunda. Alıcının tüzel kişi (A.Ş.) olması gerekiyor; aksi halde fatura kesen ile ödemeyi alan farklı taraflar olur. |
| CJ | **Sirketim A.Ş.** | Aynı mantık — fatura A.Ş. adına kesiliyor, ödeme şirket hesabına gelmeli. |
| Amazon Associates | **Kurucu (şahsen)**, kişisel Payoneer hesabı üzerinden | Amazon, yayıncıdan fatura istemiyor — bu gelir akışı için şirket hiçbir zaman fatura kesmeyecek. **Bu konuda telefonda görüşülüp onay alındı**: şirket bu gelir için fatura kesmediği sürece sorun yok. Bu şart kesinlikle korunacak. |

**Önemli:** Amazon gelirinin şahsen alınması, yalnızca şirketin o gelir için hiçbir zaman fatura kesmemesi koşuluyla sorunsuz kabul edildi. Awin ve CJ gelirleri ise şirket hesaplarına gidecek ve şirket adına faturalandırılacak — bu ikisi ile Amazon birbirine karıştırılmamalı.

## 3. Awin'in Faturalama Mekanizması

Doğrudan Awin'in başvuru ekranındaki "Türk Vergi Mükellefleri İçin Ek Şartlar" bölümünden alınmıştır:

1. Platformdaki tüm komisyon tutarları **brüttür** (uygulanabilir tüm vergiler dahil). Fatura tutarı bu brüt rakamla eşleşmeli.
2. Awin önce hesaba bir **ödeme bildirimi** gönderiyor; yayıncı ancak bu bildirimden sonra fatura kesme hakkına sahip oluyor.
3. Fatura şu adrese kesilmeli: **AWIN Ltd., 5th floor, 2 Thomas More Square, London, E1W 1YN, VAT No. GB766 0309 30.**
4. Fatura, ödeme bildirimiyle para birimi, brüt tutar ve referans numarası açısından birebir eşleşmeli.
5. **En kritik kural:** Ödeme, faturada ne yazarsa yazsın, yayıncı hesabındaki "Payment Details" (Ödeme Bilgileri) bölümünde kayıtlı banka hesabına yapılıyor. Yani asıl belirleyici unsur fatura metni değil, o bölümde kayıtlı hesap — bu yüzden o hesabın da A.Ş. adına olması şart, aksi halde fatura kesen ile parayı alan farklı taraflar olur.
6. Ödeme Bilgileri bölümünden, komisyon para biriminden bağımsız farklı bir ödeme para birimi seçilebiliyor (örn. TL). Bu seçenek henüz değerlendirilmedi; şimdilik USD/EUR üzerinden devam edilmesi varsayımı geçerli.
7. Fatura, Awin Ltd. tarafından teslim alındıktan sonra **14 gün içinde** ödeniyor.

## 4. Banka Hesapları Durumu

- Şirket adına **USD ve EUR (döviz) hesapları** açıldı (VakıfBank).
- Her iki hesapta da **herhangi bir limit/kota bulunmuyor** (bankadan teyit edildi).
- **Türkiye SEPA bölgesinde olmadığı için EUR hesabı SEPA ile değil, SWIFT ile para alıyor.**
- VakıfBank'ın SWIFT işlem ücreti, kanal ve tutara göre **işlem başına 10 USD ile 30 EUR arasında** değişiyor.
- Bu sabit ücret küçük ödemelerde oransal olarak yüksek kalıyor (örn. 50 USD'lik bir ödemede ücret oranı %60'a kadar çıkabiliyor). Bu nedenle Awin'de ödeme eşiğinin (payment threshold) mümkün olan en yüksek seviyeye (yaklaşık 500–600 USD/EUR) ayarlanması planlanıyor.

## 5. Payoneer Yapısı — İki Ayrı Hesap

- **Kişisel Payoneer hesabı** (kurucu adına, zaten mevcut) — **yalnızca Amazon** için kullanılacak.
- **Yeni bir şirket Payoneer hesabı** için başvuru yapıldı, belgeler gönderildi, onay bekleniyor. Bu hesap **CJ** ödemeleri için düşünülüyor — CJ, uluslararası yayıncılara Payoneer üzerinden "sıfır tahsilat ücreti" ile ödeme yapabiliyor, bankanın SWIFT ücretinden daha ucuz olabilir.
- **Awin için ayrı bir Payoneer hesabına gerek yok.** Awin'in kendi Payoneer entegrasyonu, gerçek bir Payoneer hesabı açmadan sadece ödeme bilgilerini (isim + banka hesabı) topluyor ve doğrudan o banka hesabına ödeme yapıyor. Bu yüzden Awin'e doğrudan şirketin banka hesabı girilecek.

## 6. Sizden İstenen Onaylar / Netleştirilmesi Gereken Konular

1. **Kur farkı kaydı**: Fatura kesim tarihi ile paranın hesaba geçtiği tarih arasında oluşan kur farkının nasıl muhasebeleştirileceği.
2. **Hizmet ihracatı KDV istisnası**: Affiliate komisyon gelirinin (hem Awin hem CJ) "hizmet ihracatı" kapsamında KDV istisnasından yararlanıp yararlanamayacağı.
3. **Fatura başına maliyet**: Awin ayda 2 kez ödeme yapıyor; her ödeme için ayrı fatura kesmenin getirdiği işlem/maliyet yükü — bu yüzden ödeme eşiğinin yükseltilmesi planlanıyor (bkz. madde 4), ama görüşünüz önemli.
4. **Awin'in "Payment Details'teki hesaba öder" kuralı** muhasebe açısından ek bir kayıt/tutarsızlık sorunu yaratır mı?
5. **TRY ödeme seçeneği** (Awin'de mevcut) değerlendirilmeli mi, yoksa USD/EUR ile devam mı edilmeli?

---

*Bu belge, Sirketim'in iç operasyon dokümantasyonundan (`departments/accounting/CLAUDE.md`) derlenmiştir. Sorularınız veya ek bilgi ihtiyacınız olursa lütfen bildirin.*
