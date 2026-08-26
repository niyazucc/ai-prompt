import { contentTypes } from './data';
import type { PromptFormData, PromptTab } from './types';

const tabDirections: Record<PromptTab, string> = {
  Dialog: 'Tulis dialog lengkap bagi setiap scene. Sertakan nama watak, dialog lisan, emosi, pergerakan dan teks pada skrin.',
  Gambar: 'Tulis prompt penjanaan gambar yang terperinci bagi setiap scene. Nyatakan komposisi, watak, produk, pencahayaan, sudut kamera, latar dan gaya visual. Pastikan rupa produk konsisten.',
  'Prompt Flow': 'Susun aliran kerja lengkap mengikut scene, daripada hook hingga seruan tindakan. Bagi setiap scene, berikan tujuan, visual, dialog atau teks, transisi dan arahan kamera.',
};

const categoryDirections: Record<PromptFormData['contentType'], string> = {
  standard: 'Hasilkan konsep video jualan gaya UGC yang autentik, mudah dirakam dan mempunyai perkembangan cerita yang jelas.',
  podcast: 'Hasilkan kandungan podcast yang kedengaran seperti perbualan sebenar, bukan iklan yang dibaca. Selitkan produk secara semula jadi.',
  animasi: 'Hasilkan konsep animasi yang menjadikan produk sebagai fokus visual dengan pergerakan ekspresif, tempo menarik dan kesinambungan antara scene.',
  pov: 'Hasilkan video sudut pandangan pertama yang imersif. Kamera perlu mewakili mata pengguna dan interaksi tangan mesti kelihatan semula jadi.',
  goyang: 'Hasilkan siri visual gaya goyang yang pantas, konsisten dan mudah menarik perhatian. Hook dua baris mesti jelas dibaca pada setiap visual.',
};

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

Jumlah scene: ${value('scene')} [1 scene = 8 saat]

Gaya bercakap: ${value('gaya').toUpperCase()}

Overview:

1. Cadangkan overview idea untuk SEMUA scene berdasarkan jumlah scene yang saya pilih.
2. Satu scene bersamaan 8 saat.
3. Terus masukkan skrip dialog untuk setiap scene dalam Bahasa Melayu sahaja.
4. Watak bercakap secara direct kepada kamera. Tiada narration.
5. Skrip mesti natural seperti bercakap dengan kawan.
6. Pastikan dialog sesuai untuk dituturkan dalam tempoh 8 saat bagi setiap scene.
7. Jangan asingkan penerangan secara terlalu teknikal. Tulis secara ringkas dan mudah difahami.
8. Susun mengikut format berikut sehingga semua scene lengkap:

Scene 1 (8 saat)

Scene 2 (8 saat)

dan seterusnya sehingga lengkap.

Buatkan watak ${value('watak')} berada di ${value('lokasi')}. Buatkan jenis video ${value('tujuan').toLowerCase()}. Buatkan ${value('scene')} beserta CTA ${value('cta').toLowerCase()}.

Jangan ubah saiz, bentuk atau design produk. Pastikan warna, label, logo dan pembungkusan produk kekal sama 100 peratus seperti gambar yang saya berikan.

Untuk scene pertama sahaja, letakkan hook pada gambar. Pastikan hook menggunakan jenis ${value('hook')}, mempunyai tepat 2 baris ayat dan maksimum 5 perkataan sahaja secara keseluruhan. Jangan letakkan hook pada scene lain.

Pastikan scene terakhir mempunyai CTA ${value('cta').toLowerCase()}. Jangan mereka-reka fakta, harga, promosi, testimoni atau kelebihan produk yang tidak dapat dikenal pasti daripada gambar.${context ? `

Arahan tambahan: ${context}` : ''}

Jika gambar produk belum diberikan, minta saya upload gambar dahulu. Selepas gambar diterima, terus lengkapkan maklumat produk dan hasilkan semua scene tanpa bertanya soalan tambahan.`;
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

function generateAnimationImagePrompt(data: PromptFormData): string {
  const color1 = data.values.hookColor1 ?? 'Putih';
  const color2 = data.values.hookColor2 ?? 'Putih';

  return `Gunakan overview dan skrip animasi yang telah dipersetujui.

1. Hasilkan satu gambar animasi berkualiti tinggi berdasarkan Scene.

2. Gunakan watak ${data.values.watak ?? 'Produk sebagai watak utama'}, mood ${data.values.mood ?? 'High Energy'} dan latar ${data.values.lokasi ?? 'Dramatic Glowing Background'}.

3. Pastikan gaya animasi, reka bentuk watak, warna, lighting dan visual konsisten untuk semua scene.

4. Lighting mesti sesuai dengan emosi scene dan menghasilkan depth yang cinematic.

5. Camera angle mesti dinamik dan kelihatan seperti babak filem animasi profesional.

6. Jangan masukkan sebarang tulisan, subtitle, watermark atau teks dalam gambar kecuali hook pada gambar 1 sahaja. Tulisan hook untuk baris pertama warna ${color1} dan baris kedua warna ${color2}.

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

7. Pastikan produk kekal 100 peratus sama seperti gambar asal dari segi design, warna, saiz, bentuk, label, logo dan pembungkusan.

8. Fokus kepada ekspresi, pergerakan dan emosi watak animasi.

Pastikan visual yang konsisten.

Buatkan gambar size 9:16.`;
}

function generateGoyangImagePrompt(data: PromptFormData): string {
  const color1 = data.values.warna1 ?? 'Putih';
  const color2 = data.values.warna2 ?? 'Putih';

  return `Daripada gambar produk yang saya upload, hasilkan ${data.values.gambar ?? '3 Gambar'} untuk konsep Goyang2.

1. Jadikan produk sebagai fokus utama dan pastikan setiap gambar kelihatan seperti visual iklan komersial berkualiti tinggi.

2. Gunakan komposisi yang bertenaga, lighting yang menarik dan camera angle yang berbeza tetapi konsisten antara semua gambar.

3. Jangan ubah design, warna, saiz, bentuk, label, logo atau pembungkusan produk. Produk mesti kekal 100 peratus sama seperti gambar asal.

4. Jangan masukkan subtitle, watermark atau teks lain kecuali hook dua baris pada gambar pertama sahaja.

Tetapan hook gambar pertama:
- Baris 1: ${color1}, font size 90–110 px
- Baris 2: ${color2}, font size 100–120 px
- Jarak antara baris: 15–25 px
- Kedudukan: 200 px dari atas, lebih kurang 15% daripada tinggi gambar
- Minimum 80 px dari tepi kiri dan kanan
- Kawasan teks di tengah selebar lebih kurang 920 px
- Maksimum 5 perkataan secara keseluruhan

5. Pastikan environment nampak hidup, realistik dan sesuai dengan identiti produk.

6. Pastikan semua gambar mempunyai gaya visual, warna dan mood yang konsisten.

7. Buatkan semua gambar dalam size 9:16.`;
}

function generateStandardFlowPrompt(): string {
  return `Gunakan overview dan skrip yang telah dipersetujui.

Mulakan dengan SCENE 1 sahaja.

Arahan penting:

1. Hasilkan prompt untuk Google Flow AI.

2. Semua description mesti dalam Bahasa English.

3. Masukkan dialog watak sahaja dalam Bahasa Melayu.

4. Tiada narration.

5. Tiada subtitle.

6. Watak bercakap secara direct kepada kamera.

7. Skrip mesti cukup untuk 8 saat dengan natural pacing.

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

function generateGoyangFlowPrompt(): string {
  return `Gunakan siri gambar Goyang2 yang telah dipersetujui.

Mulakan dengan GAMBAR 1 sahaja.

Arahan penting:

1. Hasilkan prompt animasi untuk Google Flow AI.

2. Semua description mesti dalam Bahasa English.

3. Tiada dialog, narration atau subtitle.

4. Gunakan pergerakan kamera dan produk yang smooth, bertenaga dan sesuai untuk video jualan.

5. Setiap klip mesti berdurasi 8 saat dengan natural pacing.

6. Jangan masukkan penerangan tambahan di luar prompt.

7. Tulis prompt terus dalam format yang boleh di-copy dan paste ke Google Flow.

8. Hook pada gambar pertama mesti muncul dari saat 0 hingga 3 saat sahaja. Jangan ubah warna, kedudukan, font atau teks hook.

Struktur yang mesti ada dalam prompt:

Scene environment description (English)

Lighting and camera movement (English)

Product movement and visual effects (English)

Terus hasilkan prompt untuk GAMBAR 1 sekarang.

Selepas itu, tunggu arahan saya.

Apabila saya taip: NEXT

Terus hasilkan prompt untuk gambar seterusnya dengan gaya visual, pergerakan dan emosi yang konsisten.

Pastikan produk 100 peratus sama dengan gambar yang saya bagi dari segi design, warna, size, bentuk, label, logo dan pembungkusan. Jangan ubah apa-apa.`;
}

export function generatePrompt(data: PromptFormData): string {
  if (data.contentType === 'standard' && data.activeTab === 'Dialog') {
    return generateStandardDialogPrompt(data);
  }

  if (data.activeTab === 'Gambar') {
    if (data.contentType === 'animasi') return generateAnimationImagePrompt(data);
    if (data.contentType === 'goyang') return generateGoyangImagePrompt(data);
    return generateStandardImagePrompt(data);
  }

  if (data.activeTab === 'Prompt Flow') {
    if (data.contentType === 'goyang') return generateGoyangFlowPrompt();
    return generateStandardFlowPrompt();
  }

  const config = contentTypes.find((item) => item.id === data.contentType) ?? contentTypes[0];
  const selections = config.fields.map((field) => `- ${field.label}: ${data.values[field.id] ?? field.options[0]}`).join('\n');
  const context = data.context.trim() || 'Tiada konteks tambahan. Analisis gambar produk yang pengguna muat naik selepas prompt ini untuk mengenal pasti nama produk, ciri, manfaat, sasaran pelanggan dan masalah yang diselesaikan.';

  return `Bertindak sebagai pengarah kreatif, penulis skrip iklan dan pakar prompt AI untuk kandungan jualan Bahasa Melayu Malaysia.

TUGAS UTAMA
Hasilkan prompt ${data.activeTab} untuk kategori ${config.label} berdasarkan tetapan di bawah.

TETAPAN KANDUNGAN
${selections}
- Konteks tambahan: ${context}

ARAHAN KATEGORI
${categoryDirections[data.contentType]}

FORMAT HASIL: ${data.activeTab.toUpperCase()}
${tabDirections[data.activeTab]}

PERATURAN PENTING
- Minta pengguna memuat naik gambar produk dalam chat, kemudian analisis gambar tersebut sebelum menghasilkan hasil akhir.
- Kenal pasti nama produk, ciri utama, kelebihan, sasaran pelanggan dan masalah pelanggan hanya daripada maklumat atau gambar yang diberikan.
- Jangan mereka-reka dakwaan, harga, statistik, testimoni atau fungsi produk.
- Gunakan Bahasa Melayu Malaysia yang semula jadi, santai dan mudah difahami.
- Pastikan produk kekal konsisten dari segi bentuk, warna, label dan pembungkusan dalam setiap scene.
- Susun hasil mengikut scene atau gambar dengan tajuk yang jelas dan mudah disalin.
- Akhiri kandungan dengan seruan tindakan yang sesuai untuk jualan.

Mulakan dengan ayat: "Sila upload gambar produk anda dahulu." Selepas gambar diterima, buat analisis ringkas produk dan terus hasilkan ${data.activeTab.toLowerCase()} lengkap.`;
}
