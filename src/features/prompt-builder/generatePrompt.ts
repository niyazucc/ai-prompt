import { generateCategoryPrompt, sceneSeconds } from './categoryPrompts';
import { generateShakePrompt } from './shakePrompts';
import type { PromptFormData } from './types';

function generateStandardDialogPrompt(data: PromptFormData): string {
  const value = (id: string) => data.values[id] ?? '[AUTO]';
  const context = data.context.trim();

  return `Daripada gambar yang di-upload, lengkapkan maklumat produk berikut secara automatik.

Maklumat produk:

Nama produk: [ISI]

Kelebihan utama produk: [ISI 3–5 POINT RINGKAS]

Masalah yang produk selesaikan: [ISI]

Sasaran pengguna: [LELAKI / PEREMPUAN / UMUM + ANGGARAN UMUR]

[Untuk nama produk, kelebihan utama produk, masalah yang produk selesaikan dan sasaran pengguna, pilih dan isi secara automatik mengikut gambar yang di-upload dalam ChatGPT. Jangan minta pengguna mengisi maklumat ini.]

Maklumat video:

Jumlah scene: ${value('scene')} [1 scene = ${sceneSeconds(data)} saat]

Gaya bercakap: ${value('gaya').toUpperCase()}

Overview:

1. Cadangkan overview idea untuk SEMUA scene berdasarkan jumlah scene yang saya pilih.
2. Satu scene bersamaan ${sceneSeconds(data)} saat.
3. Terus masukkan skrip dialog untuk setiap scene dalam Bahasa Melayu sahaja.
4. Watak bercakap secara direct kepada kamera. Tiada narration.
5. Skrip mesti natural seperti bercakap dengan kawan.
6. Pastikan dialog sesuai untuk dituturkan dalam tempoh ${sceneSeconds(data)} saat bagi setiap scene.
7. Jangan asingkan penerangan secara terlalu teknikal. Tulis secara ringkas dan mudah difahami.
8. Susun mengikut format berikut sehingga semua scene lengkap:

Scene 1 (${sceneSeconds(data)} saat)

Scene 2 (${sceneSeconds(data)} saat)

dan seterusnya sehingga lengkap.

Buatkan watak ${value('watak')} berada di ${value('lokasi')}. Buatkan jenis video ${value('tujuan').toLowerCase()}. Buatkan ${value('scene')} beserta CTA ${value('cta').toLowerCase()}.

Jangan ubah saiz, bentuk atau design produk. Pastikan warna, label, logo dan pembungkusan produk kekal sama 100 peratus seperti gambar yang saya berikan.

Untuk scene pertama sahaja, letakkan hook pada gambar. Pastikan hook menggunakan jenis ${value('hook')}, mempunyai tepat 2 baris ayat dan maksimum 5 perkataan sahaja secara keseluruhan. Jangan letakkan hook pada scene lain.

Pastikan scene terakhir mempunyai CTA ${value('cta').toLowerCase()}. Jangan mereka-reka fakta, harga, promosi, testimoni atau kelebihan produk yang tidak dapat dikenal pasti daripada gambar.${context ? `

Arahan tambahan: ${context}` : ''}

Jika gambar produk belum diberikan, minta saya upload gambar dahulu. Selepas gambar diterima, terus lengkapkan maklumat produk dan hasilkan semua scene tanpa bertanya soalan tambahan.`;
}

function generatePodcastDialogPrompt(data: PromptFormData): string {
  const value = (id: string) => data.values[id] ?? '[ISI]';
  const context = data.context.trim();

  return `Berdasarkan gambar yang telah di-upload, hasilkan skrip podcast yang kelihatan seperti perbualan sebenar.

Maklumat Produk:
[Kenal pasti secara auto berdasarkan gambar yang telah di-upload]

Kelebihan Produk:
[Kenal pasti secara auto berdasarkan gambar yang telah di-upload]

Target Audience:
[Kenal pasti secara auto berdasarkan gambar yang telah di-upload]

Masalah Customer:
[Kenal pasti secara auto berdasarkan gambar yang telah di-upload]

Jumlah Scene:
${value('scene')}

Durasi:
Setiap scene ${sceneSeconds(data)} saat.

Watak:
Hos Podcast: ${value('hos')}
Tetamu: ${value('tetamu')}

Lokasi:
${value('lokasi')}

Mood:
${value('mood')}

Peraturan:

- Dialog sahaja.
- Tiada narration.
- Tiada subtitle.
- Dialog natural seperti podcast sebenar.
- Jangan terlalu menjual pada awal video.
- Produk hanya disebut apabila sesuai.
- CTA pada scene terakhir.
- Setiap scene cukup untuk ${sceneSeconds(data)} saat.
- Semua dialog dalam Bahasa Melayu.

Output:

SCENE 1
Overview
Dialog Hos
Dialog Tetamu

SCENE 2
Overview
Dialog Hos
Dialog Tetamu

SCENE 3
Overview
Dialog Hos
Dialog Tetamu

dan seterusnya sehingga lengkap berdasarkan jumlah scene yang dipilih.${context ? `

Arahan tambahan:
${context}` : ''}`;
}

function generateStandardImagePrompt(data: PromptFormData): string {
  const color1 = data.values.hookColor1 ?? 'Putih';
  const color2 = data.values.hookColor2 ?? 'Putih';

  return `1. Hasilkan satu gambar ultra-realistic berdasarkan Scene.

2. Pastikan gaya cinematic, natural skin texture dan realistic lighting.

3. Lighting mesti sesuai dengan emosi scene.

4. Camera angle mesti nampak seperti rakaman filem sebenar.

5. Environment mesti nampak hidup dan real.

6. Jangan masukkan sebarang tulisan, subtitle, watermark atau teks dalam gambar kecuali hook pada gambar 1 sahaja. Tulisan hook untuk baris pertama warna ${color1} dan untuk baris kedua warna ${color2}.

Pastikan ikut kedudukan hook di bawah:

Jarak dari atas:
- 200 px dari bahagian atas gambar
- Lebih kurang 15% daripada tinggi gambar

Jarak kiri dan kanan:
- Minimum 80 px dari tepi kiri dan kanan
- Pastikan teks berada dalam kawasan tengah selebar lebih kurang 920 px

Baris 1 ${color1}
Font size: 90–110 px

Baris 2 ${color2}
Font size: 100–120 px

Jarak antara baris: 15–25 px

7. Pastikan produk, jika ada dalam scene tersebut, kelihatan realistik dan proportionate.

8. Fokus kepada ekspresi muka dan emosi watak.

Pastikan visual yang konsisten.

Buatkan gambar size 9:16.`;
}

function generatePodcastImagePromptWithCaption(data: PromptFormData): string {
  const color1 = data.values.hookColor1 ?? 'Putih';
  const color2 = data.values.hookColor2 ?? 'Putih';

  return `Gunakan skrip yang telah dihasilkan.

Hasilkan gambar untuk setiap scene.

Maklumat:

Format:
9:16 Portrait

Style:
Ultra realistic
Cinematic
Podcast Studio
Professional Camera
Realistic Lighting
Natural Skin Texture
Film Look

Watak:
Hos: ${data.values.hos ?? 'Hos Podcast'}
Tetamu: ${data.values.tetamu ?? 'Tetamu Lelaki'}
[Kekalkan watak sama sehingga habis]

Pastikan:

- Character muka sama.
- Pakaian sama.
- Studio sama.
- Microphone sama.
- Kamera sama.
- Warna studio sama.
- Tiada perubahan wajah.
- Tiada perubahan umur.
- Tiada watermark.
- Tiada logo.
- Tiada subtitle.
- Tiada text tambahan kecuali hook pada gambar Scene 1 sahaja.

Background:
${data.values.lokasi ?? 'Studio podcast moden'} dengan LED light.

Output setiap scene:

Scene Number

Buatkan gambar scene 1 dahulu, kemudian apabila saya taip NEXT baru buat gambar untuk scene 2 dan seterusnya.

1. Jangan masukkan sebarang tulisan, subtitle, watermark atau teks dalam gambar kecuali hook pada gambar 1 sahaja. Tulisan hook untuk baris pertama warna ${color1} dan untuk baris kedua warna ${color2}.

Pastikan ikut kedudukan hook di bawah:

Jarak dari atas:
200 px dari bahagian atas gambar
Lebih kurang 15% daripada tinggi gambar

Jarak kiri dan kanan:
Minimum 80 px dari tepi kiri dan kanan
Pastikan teks berada dalam kawasan tengah selebar lebih kurang 920 px

Baris 1 ${color1}
Font size: 90–110 px

Baris 2 ${color2}
Font size: 100–120 px

Jarak antara baris: 15–25 px

2. Pastikan produk, jika ada dalam scene tersebut, kelihatan realistik dan proportionate.

3. Fokus kepada ekspresi muka dan emosi watak.

Pastikan visual yang konsisten.

Buatkan gambar size 9:16.`;
}

function generatePodcastImagePromptWithoutCaption(): string {
  return `Gunakan skrip yang telah dihasilkan sebagai panduan utama.

Hasilkan satu gambar untuk setiap scene berdasarkan skrip tersebut.

Maklumat:

Format:
9:16 Portrait

Gaya Visual:
Ultra-realistic
Cinematic
Podcast studio profesional
Kamera profesional
Pencahayaan realistik
Tekstur kulit semula jadi
Gaya filem

Watak:
[Kekalkan watak yang sama sepanjang semua scene]

Keperluan Konsistensi:

- Pastikan wajah setiap watak kekal sama dari satu scene ke scene yang lain.
- Kekalkan ciri-ciri wajah secara konsisten.
- Pastikan pakaian tidak berubah.
- Kekalkan reka bentuk dan susun atur podcast studio.
- Pastikan mikrofon yang digunakan kekal sama.
- Kekalkan kamera, sudut rakaman, dan persediaan visual.
- Pastikan warna serta reka bentuk studio tidak berubah.
- Elakkan sebarang perubahan pada wajah atau usia watak.
- Kekalkan gaya rambut dan penampilan keseluruhan setiap watak.
- Tiada watermark.
- Tiada logo.
- Tiada sari kata.
- Tiada sebarang teks atau tulisan dalam gambar.

Latar Belakang:
Studio podcast moden dan profesional dengan pencahayaan LED.

Pastikan pencahayaan, sudut kamera, komposisi, persekitaran, dan gaya visual keseluruhan kekal konsisten dalam semua scene.

Jika terdapat produk dalam sesuatu scene:

- Pastikan produk kelihatan ultra-realistik.
- Pastikan bentuk, saiz, warna, bahan, dan perkadaran produk kelihatan semula jadi serta tepat.
- Jangan ubah reka bentuk atau penampilan asal produk.
- Pastikan produk kelihatan seperti objek sebenar yang dirakam menggunakan kamera profesional.

Fokus Utama:

- Ekspresi wajah.
- Bahasa tubuh yang semula jadi.
- Ekspresi emosi.
- Interaksi realistik antara watak.
- Hubungan mata yang semula jadi.
- Suasana podcast yang autentik.

Konsistensi Visual:

Pastikan identiti wajah, gaya rambut, pakaian, mikrofon, studio, perabot, pencahayaan LED, persediaan kamera, tona warna, persekitaran, dan gaya sinematik setiap watak kekal konsisten sepanjang semua scene.

Format Output Setiap Scene:

Scene Number

Hasilkan gambar untuk Scene 1 terlebih dahulu.

Apabila saya menaip “Next”, hasilkan gambar untuk Scene 2.

Teruskan dengan kaedah yang sama untuk scene seterusnya sehingga semua scene selesai.

Hasilkan setiap gambar dalam format 9:16 Portrait.`;
}

function generateStandardFlowPrompt(data: PromptFormData): string {
  return `Gunakan overview dan skrip yang telah dipersetujui.

Mulakan dengan SCENE 1 sahaja.

Arahan penting:

1. Hasilkan prompt untuk Google Flow AI.

2. Semua description mesti dalam Bahasa English.

3. Masukkan dialog watak sahaja dalam Bahasa Melayu.

4. Tiada narration.

5. Tiada subtitle.

6. Watak bercakap secara direct kepada kamera.

7. Skrip mesti cukup untuk ${sceneSeconds(data)} saat dengan natural pacing.

8. Jangan masukkan penerangan tambahan di luar prompt.

9. Jangan gunakan ayat seperti “Malay dialogue:” atau sebarang label dialog lain.

10. Tulis prompt terus dalam format yang boleh di-copy dan paste ke Google Flow.

11. Hook untuk gambar 1, pastikan hook muncul dari saat 0 hingga 3 saat sahaja. Jangan ubah warna hook.

Struktur yang mesti ada dalam prompt:

Scene environment description (English)

Lighting and camera movement (English)

Character action and facial expression (English)

Then continue with the character speaking naturally in Bahasa Melayu

Terus hasilkan prompt untuk SCENE 1 sekarang.

Selepas itu, tunggu arahan saya.

Apabila saya taip: NEXT

Terus hasilkan prompt untuk scene seterusnya dengan gaya visual dan emosi yang konsisten.

Pastikan produk 100 peratus sama dengan gambar yang saya bagi. Pastikan sama dari segi design, warna dan size. Jangan ubah apa-apa.`;
}

export function generatePrompt(data: PromptFormData): string {
  let prompt = generateCategoryPrompt(data);
  if (data.contentType === 'goyang') prompt = generateShakePrompt(data);
  if (!prompt) {
    if (data.activeTab === 'Dialog') {
      prompt = data.contentType === 'podcast' ? generatePodcastDialogPrompt(data) : generateStandardDialogPrompt(data);
    } else if (data.activeTab === 'Gambar') {
      prompt = data.contentType === 'podcast'
        ? data.values.caption === 'Ya'
          ? generatePodcastImagePromptWithCaption(data)
          : generatePodcastImagePromptWithoutCaption()
        : generateStandardImagePrompt(data);
    } else {
      prompt = generateStandardFlowPrompt(data);
    }
  }
  const context = data.context.trim();
  const usesFixedImageTemplate = data.activeTab === 'Gambar'
    && data.contentType !== 'standard'
    && data.values.caption !== 'Ya';
  // Existing dialog templates already include the additional context.
  if (context && !usesFixedImageTemplate && !(data.activeTab === 'Dialog' && ['standard', 'podcast'].includes(data.contentType))) {
    prompt += '\n\nArahan tambahan:\n' + context;
  }
  return prompt;
}
