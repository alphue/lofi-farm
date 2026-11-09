# Lo-fi Gece Çiftliği — Tasarım

## Amaç ve neden

Tarayıcıda oynanan, kısa ziyaretlerle oynanan sakin bir çiftlik oyunu. Farkı şu: **çiftliğin kendisi müziği yapar.** Her bitki büyüdükçe arka plandaki lo-fi parçaya bir ses katmanı ekler; tarlayı nasıl ektiğin, ne duyduğunu belirler.

Oyuncu birkaç dakikalığına uğrar, çiftliğinin o an nasıl bir müzik çaldığını dinler, biraz değiştirir ve çıkar. Saatlerce oturmak gerekmez.

Oyun GitHub'da açık kaynak olarak paylaşılacak ve GitHub Pages üzerinden linkle oynanabilecek.

## Hedefler

- Rahatlatıcı, "chill" bir his: lo-fi müzik, gece atmosferi, ceza veya acele yok.
- Kısa oturumlar: anlamlı bir ziyaret 1–5 dakika sürer.
- Bitkiler gerçek zamanlı büyür, oyun kapalıyken de. Geri dönen oyuncuyu değişmiş bir çiftlik ve değişmiş bir müzik karşılar.
- Tarla düzeni ne olursa olsun müzik her zaman kulağa hoş gelir: hiçbir kombinasyon "yanlış" çalmaz.
- Kurulum gerektirmez: bir linke tıklayıp tarayıcıda oynanır.

## Hedef olmayanlar

- Para ekonomisi, dükkân, satış. (Kullanıcı bunu "sıradan" buldu.)
- Görevler, seviyeler, skor, liderlik tablosu.
- Hesap, sunucu, çok oyunculu.
- Mobil uygulama. *(Benim kararım:)* Önce masaüstü için tasarlanır; telefonda açılıp oynanabilir olmalı ama telefona özel düzen gerekmez.

## Anti-hedefler (çalışsa bile başarısızlık sayılır)

- Oyuncuyu stresli hissettiren her şey: geri sayan zamanlayıcı, kuruyan/ölen bitki, kaçırılan hasat cezası.
- Uzun süre oynamaya zorlayan tasarım (grind).
- Kulağı tırmalayan, ritimden kopuk ya da uyumsuz sesler.
- Oyuncuyu geri çağırmak için ısrarcı bildirimler.

## Görsel stil (kullanıcının seçimi)

"Lo-fi gece": koyu lacivert gökyüzü, ay, yıldızlar, ateşböcekleri, ışığı yanan bir ev penceresi, sakin ve koyu yeşil/kahve tonları. Brainstorming sırasında gösterilen C seçeneği bu yönün kaba bir taslağıdır: `visual-style-sketches.html` (bu belgenin yanında, üçüncü kart).

## Oyun döngüsü

1. Oyuncu küçük bir tarla ızgarasında boş bir kareye tohum eker.
2. Bitki gerçek zamanda büyür (dakikalar–saatler). Büyüdükçe kendi ses katmanı yavaşça duyulur hale gelir.
3. Olgunlaşan bitki, döngü içinde kendi partisini tam olarak çalar.
4. Oyuncu olgun bitkiyi hasat ettiğinde bitki kısa bir süreliğine fide haline döner ve kendiliğinden yeniden büyür (sesi kısa süre kısılır, sonra geri gelir). Hasat, küçük bir ihtimalle yeni bir bitki türünün tohumunu keşfettirir.
5. Yeni bitki türü = yeni bir ses/enstrüman. İlerleme, yeni sesler keşfetmekten ibarettir.

*(Benim kararlarım:)*
- Para yoktur. Hasat yalnızca yeni tür keşfi getirir; bitkiyi kaybettirmez, bu yüzden oyuncu sevdiği şarkıyı bozmadan hasat edebilir.
- Açılmış her türün tohumu sınırsızdır; tohum kıtlığı ve kaybetme baskısı yoktur. Oyuncu bir bitkiyi istediği zaman söküp yerine başka tür ekebilir.
- Başlangıçta 4 tür açıktır, toplamda yaklaşık 8 tür vardır. Hepsi keşfedilince oyun bitmez, çalmaya devam eder. Sonradan açılan türler, mevcut 4 rolün üstüne binmeyecek şekilde yeni roller ya da mevcut rollerin alternatif tınıları olarak tasarlanır.

## Müzik sistemi (çekirdek)

- Tek bir ortak saat: yavaş bir tempo (yaklaşık 70–85 BPM). Tüm sesler bu saate kuantize edilir.
- Sabit bir lo-fi akor dizisi (örneğin 4 akorluk döngü). Tüm melodik sesler bu dizinin notalarından seçilir, böylece hiçbir kombinasyon uyumsuz çalmaz.
- Her bitki türü bir müzikal role karşılık gelir. Örnek eşleme:
  - Buğday → yumuşak piyano akorları
  - Balkabağı → bas
  - Ay çiçeği → çan/zil melodisi
  - Lavanta → hafif davul / vinil cızırtısı dokusu
- Bitkinin tarladaki konumu, aynı rol içinde hangi varyasyonu çaldığını belirler (örneğin satır = nota yüksekliği ya da desen varyasyonu). Böylece oyuncu bitkileri dizerek müziği şekillendirir.
- Büyüme sesin yüksekliğine yansır: fide sessiz, yarı büyümüş bitki kısık, olgun bitki tam.
- Tarla boşken bile hafif bir ambiyans çalar (cırcır böcekleri, rüzgâr), sessizlik olmaz.

## Gerçek ay evresi

*(Önerildi, kullanıcı kabul etti.)* Oyun gerçek takvimdeki ay evresini kullanır. Dolunay gecelerinde bazı bitkiler parlar ve nadir bir ses varyasyonu çalar. Ay evresi gökyüzünde de görünür.

## Kalıcılık

- Oyun durumu tarayıcıda saklanır (localStorage). Hesap yok.
- Büyüme zaman damgasıyla hesaplanır: oyuncu geri döndüğünde geçen gerçek süreye göre bitkiler ilerlemiş olur.

## Platform ve teknoloji

*(Benim kararım:)*
- Derleme adımı olmayan statik HTML + JavaScript; GitHub Pages'te doğrudan yayınlanır.
- Ses: tarayıcının Web Audio API'si. Enstrüman sesleri için küçük, ücretsiz lisanslı (CC0) ses örnekleri kullanılabilir.
- Görsel: HTML Canvas ya da DOM/CSS — inşacıya bırakıldı.
- Tarayıcılar sesi ancak kullanıcı bir şeye tıkladıktan sonra başlatır; oyun bir "başla" anıyla açılmalı.

## İnşacıya bırakılanlar

- Kesin büyüme süreleri (oturum ritmine uygun olmak şartıyla).
- Izgara boyutu (küçük olmalı; örneğin 6×4 civarı).
- Başlangıçta kaç bitki türü olacağı (4–5 makul).
- Akor dizisi, tempo ve enstrüman sesleri, ses örneklerinin kaynağı (lisansı uygun olmak şartıyla).
- Çizimlerin ayrıntısı, animasyonlar, arayüz yerleşimi.
- Kod yapısı ve dosya düzeni.
