# Counterscent Affiliate Gelirleri – Mali Müşavir Bilgilendirme Notu

**Tarih:** 30 Ağustos 2026
**Konu:** Counterscent (counterscent.com) sitesi üzerinden başlayacak affiliate komisyon gelirleri — ödeme alıcısı yapısı, faturalama mekanizması ve netleştirilmesi gereken konular

## 1. Genel Bağlam

IGDIR INSAAT MADENCILIK TUR. SAN. TIC. A.Ş. bünyesinde geliştirilen Counterscent (counterscent.com), üç farklı affiliate ağı üzerinden komisyon geliri elde etmeyi planlıyor:

- **Awin** — İngiltere merkezli affiliate ağı. **Başvuru yapıldı ve onaylandı (30 Ağustos).** Ödeme bilgileri tanımlandı.
- **CJ / Commission Junction** — ABD merkezli affiliate ağı
- **Amazon Associates (ABD programı)** — henüz başvurulmadı, en erken Eylül ortası

Üç programın da ödeme alıcısı, faturalama kuralları ve ödeme mekanizması birbirinden farklı. Aşağıda her biri özetlenmiştir.

## 2. Ödeme Alıcısı (Payee) Yapısı

| Program | Fatura Kesen / Ödemeyi Alan | Gerekçe |
|---|---|---|
| Awin | **IGDIR INSAAT MADENCILIK TUR. SAN. TIC. A.Ş.** | Awin, Türkiye'de vergi mükellefi yayıncılara kendi adına fatura kesmiyor (self-billing yok) — yayıncı kendi faturasını kesmek zorunda. Alıcının tüzel kişi (A.Ş.) olması gerekiyor; aksi halde fatura kesen ile ödemeyi alan farklı taraflar olur. |
| CJ | **IGDIR INSAAT MADENCILIK TUR. SAN. TIC. A.Ş.** | Aynı mantık — fatura A.Ş. adına kesiliyor, ödeme şirket hesabına gelmeli. |
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
- Bu sabit ücret küçük ödemelerde oransal olarak yüksek kalıyor (örn. 50 USD'lik bir ödemede ücret oranı %60'a kadar çıkabiliyor). Bu nedenle Awin'de ödeme eşiği **250 EUR olarak ayarlandı** (30 Ağustos). Ödeme para birimi **USD** seçildi — VakıfBank'ın EUR üzerinden 30, USD üzerinden 10 ücret alması nedeniyle.

## 5. Payoneer Yapısı — İki Ayrı Hesap

- **Kişisel Payoneer hesabı** (kurucu adına, zaten mevcut) — **yalnızca Amazon** için kullanılacak.
- **Şirket adına ayrı bir Payoneer hesabı açıldı ve onaylandı** (30 Ağustos). Bu hesap **CJ** ödemeleri için kullanılacak — CJ, uluslararası yayıncılara Payoneer üzerinden "sıfır tahsilat ücreti" ile ödeme yapabiliyor, bankanın SWIFT ücretinden daha ucuz olabilir. Kişisel Payoneer hesabıyla karıştırılmamalı; ikisi ayrı hesaplardır.
- **Awin için ayrı bir Payoneer hesabına gerek yok.** Awin'in kendi Payoneer entegrasyonu, gerçek bir Payoneer hesabı açmadan sadece ödeme bilgilerini (isim + banka hesabı) topluyor ve doğrudan o banka hesabına ödeme yapıyor. Bu yüzden Awin'e doğrudan şirketin banka hesabı girilecek.

## 6. Sizden İstenen Onaylar / Netleştirilmesi Gereken Konular

1. **Faaliyet konusu / ana sözleşme kapsamı — en önemli soru.** Şirketin tescilli faaliyet konusu **inşaat ve madencilik**. Affiliate/reklam geliri ve e-ticaret faaliyeti bu kapsamın dışında kalıyor olabilir. Bu gelirin mevcut şirket üzerinden faturalandırılması mümkün mü, yoksa ana sözleşmeye e-ticaret / reklam / dijital pazarlama faaliyet kodu eklenmesi mi gerekiyor? **İlk ödeme gelmeden önce netleşmesi gereken konu.**
2. **Kur farkı kaydı**: Fatura kesim tarihi ile paranın hesaba geçtiği tarih arasında oluşan kur farkının nasıl muhasebeleştirileceği.
3. **Hizmet ihracatı KDV istisnası**: Affiliate komisyon gelirinin (hem Awin hem CJ) "hizmet ihracatı" kapsamında KDV istisnasından yararlanıp yararlanamayacağı.
4. **Fatura başına maliyet**: Awin ayda 2 kez ödeme yapıyor; her ödeme için ayrı fatura kesmenin getirdiği işlem/maliyet yükü — bu yüzden ödeme eşiğinin yükseltilmesi planlanıyor (bkz. madde 4), ama görüşünüz önemli.
5. **Awin'in "Payment Details'teki hesaba öder" kuralı** muhasebe açısından ek bir kayıt/tutarsızlık sorunu yaratır mı?
6. **TRY ödeme seçeneği** (Awin'de mevcut) değerlendirilmeli mi, yoksa USD/EUR ile devam mı edilmeli?

---

*Bu belge şirketin iç operasyon dokümantasyonundan derlenmiştir. Sorularınız veya ek bilgi ihtiyacınız olursa lütfen bildirin.*
