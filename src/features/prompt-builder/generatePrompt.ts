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

export function generatePrompt(data: PromptFormData): string {
  if (data.contentType === 'standard' && data.activeTab === 'Dialog') {
    return generateStandardDialogPrompt(data);
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
