# Lofi Çiftlik

Sakin, lo-fi bir gece çiftliği. Her bitki müziğe yeni bir katman ekler. Bitkiler oyun kapalıyken bile gerçek zamanlı büyür; kısa ziyaretler için tasarlandı.

## Nasıl oynanır
- "Başla" ile müziği aç.
- Alttaki çubuktan bir tohum seç, boş toprağa dokun: ekilir.
- Parlayan (olgun) bitkiye dokun: hasat. Bitki %50 büyüklüğe döner ve ara sıra yeni bir tür keşfedersin.
- Sağ tık (telefonda uzun basma) ile ekili bitkiyi kaldır.
- Dolunayda Ay çiçeği ve Ay çiçeği gecesi daha parlak yanar.
- İlerleme tarayıcıda (localStorage) saklanır.

## Yerelde çalıştırma
Derleme yok, bağımlılık yok. Klasörü statik sunucuyla aç:

    npx http-server -c-1 . -p 8138

Sonra http://localhost:8138 adresine git. Testler: `npm test`.

## GitHub Pages
Depo Settings → Pages → Branch: `main`, klasör: `/` → Save.
