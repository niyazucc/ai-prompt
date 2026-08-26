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
  const context = data.context.trim() || 'Tiada konteks tambahan. Gunakan gambar produk yang dimuat naik sebagai sumber utama.';

  return `Daripada gambar yang saya upload, analisis produk terlebih dahulu.

MAKLUMAT PRODUK

Nama produk: [PILIH SECARA AUTO DARIPADA GAMBAR]

Kelebihan utama produk: [PILIH SECARA AUTO DARIPADA GAMBAR — SENARAIKAN 3 HINGGA 5 POINT RINGKAS]

Masalah yang produk selesaikan: [PILIH SECARA AUTO DARIPADA GAMBAR]

Sasaran pengguna: [PILIH SECARA AUTO DARIPADA GAMBAR — LELAKI / PEREMPUAN / UMUM BESERTA ANGGARAN UMUR]

Jangan minta saya mengisi maklumat produk di atas. Kenal pasti semuanya secara automatik berdasarkan gambar produk yang saya upload dalam ChatGPT. Jika sesuatu maklumat tidak dapat dipastikan daripada gambar, nyatakan sebagai andaian dan jangan mereka-reka fakta.

MAKLUMAT VIDEO

- Jenis video: ${value('tujuan')}
- Jumlah scene: ${value('scene')}
- Tempoh setiap scene: 8 saat
- Watak: ${value('watak')}
- Lokasi: ${value('lokasi')}
- Gaya bercakap: ${value('gaya')}
- Jenis hook: ${value('hook')}
- CTA: ${value('cta')}
- Konteks tambahan: ${context}

ARAHAN OVERVIEW DAN SKRIP

1. Cadangkan overview idea untuk SEMUA scene berdasarkan jumlah scene yang dipilih.
2. Satu scene bersamaan 8 saat.
3. Terus masukkan skrip dialog Bahasa Melayu untuk setiap scene.
4. Watak mesti bercakap secara direct kepada kamera. Tiada narration atau suara latar.
5. Skrip mesti natural, santai dan kedengaran seperti bercakap dengan kawan.
6. Pastikan panjang dialog realistik untuk disebut dalam masa 8 saat.
7. Jangan asingkan penerangan secara terlalu teknikal. Tulis dengan ringkas dan mudah difahami.
8. Susun hasil tepat mengikut format berikut sehingga semua scene lengkap:

Scene 1 (8 saat)
- Overview:
- Visual dan aksi:
- Dialog:
- Teks pada gambar:

Scene 2 (8 saat)
- Overview:
- Visual dan aksi:
- Dialog:
- Teks pada gambar: Tiada

Teruskan format yang sama untuk scene seterusnya.

ARAHAN KHAS SCENE PERTAMA

- Letakkan hook pada gambar untuk Scene 1 sahaja.
- Hook mesti menggunakan pendekatan ${value('hook')}.
- Hook mesti mempunyai tepat 2 baris.
- Keseluruhan hook maksimum 5 perkataan sahaja.
- Jangan letakkan hook atau teks tambahan pada gambar untuk scene lain kecuali diperlukan bagi CTA.

ARAHAN PRODUK DAN CTA

- Akhiri scene terakhir dengan CTA “${value('cta')}”.
- Jangan ubah saiz, bentuk, warna, label, logo, pembungkusan atau reka bentuk produk.
- Produk mesti kekal 100% sama seperti gambar asal yang saya berikan dalam setiap scene.
- Jangan tambah ciri, tuntutan, harga atau promosi yang tidak kelihatan atau tidak diberikan.

Sila minta saya upload gambar produk dahulu jika gambar belum diberikan. Selepas gambar diterima, paparkan analisis ringkas maklumat produk dan terus hasilkan semua scene lengkap tanpa bertanya soalan tambahan.`;
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
