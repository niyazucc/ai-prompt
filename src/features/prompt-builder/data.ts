import type { ContentType, ContentTypeOption, PromptFormData } from './types';

export const contentTypes: ContentTypeOption[] = [
  {
    id: 'standard', label: 'Standard', shortLabel: 'Standard',
    description: 'Video jualan dengan watak, lokasi dan dialog yang tersusun.',
    tabs: ['Dialog', 'Gambar', 'Prompt Flow'],
    fields: [
      { id: 'tujuan', label: 'Tujuan video', options: ['Jualan', 'Kesedaran jenama', 'Pendidikan', 'Testimoni'] },
      { id: 'watak', label: 'Watak', options: ['Lelaki', 'Perempuan memakai tudung', 'Perempuan tidak memakai tudung', 'Pasangan suami isteri', 'Tanpa watak'] },
      { id: 'lokasi', label: 'Lokasi', options: ['Bandar', 'Kampung', 'Rumah moden', 'Pejabat', 'Kedai', 'Kafe', 'Luar bangunan'] },
      { id: 'scene', label: 'Berapa scene', options: ['3 scene', '4 scene', '5 scene', '6 scene'] },
      { id: 'hook', label: 'Hook', options: ['Problem', 'Soalan', 'Kejutan', 'Hasil', 'Testimoni'] },
      { id: 'gaya', label: 'Gaya bercakap', options: ['Santai', 'Yakin', 'Mesra', 'Bertenaga', 'Profesional'] },
      { id: 'cta', label: 'CTA', options: ['Beg kuning', 'Klik link di bio', 'WhatsApp sekarang', 'Beli sekarang', 'DM untuk order'] },
    ],
    info: 'Tiada pilihan muat naik gambar di halaman ini. Prompt yang terhasil akan meminta ChatGPT menganalisis gambar produk yang anda muat naik terus dalam chat.',
  },
  {
    id: 'podcast', label: 'Podcast', shortLabel: 'Podcast',
    description: 'Perbualan podcast semula jadi untuk memperkenalkan produk.',
    tabs: ['Dialog', 'Gambar', 'Prompt Flow'],
    fields: [
      { id: 'scene', label: 'Jumlah scene', options: ['3 scene', '4 scene', '5 scene', '6 scene'] },
      { id: 'durasi', label: 'Durasi setiap scene', options: ['8 saat', '10 saat', '15 saat', '20 saat'] },
      { id: 'hos', label: 'Hos podcast', options: ['Hos Podcast', 'Hos Lelaki', 'Hos Perempuan'] },
      { id: 'tetamu', label: 'Tetamu', options: ['Tetamu Lelaki', 'Tetamu Perempuan', 'Pakar Produk', 'Pelanggan'] },
      { id: 'lokasi', label: 'Lokasi', options: ['Studio podcast moden', 'Studio podcast premium', 'Studio minimalis', 'Ruang tamu santai'] },
      { id: 'mood', label: 'Mood', options: ['Santai', 'Berinformasi', 'Lucu', 'Profesional'] },
    ],
    info: 'Nama produk, kelebihan dan sasaran pelanggan boleh dikenal pasti daripada gambar produk yang dimuat naik terus dalam ChatGPT.',
  },
  {
    id: 'animasi', label: 'Animasi', shortLabel: 'Animasi',
    description: 'Produk animasi sebagai watak utama dalam visual bertenaga.',
    tabs: ['Dialog', 'Gambar', 'Prompt Flow'],
    fields: [
      { id: 'scene', label: 'Jumlah scene', options: ['3 Scene', '4 Scene', '5 Scene', '6 Scene'] },
      { id: 'watak', label: 'Watak animasi', options: ['Produk sebagai watak utama', 'Maskot jenama', 'Watak manusia 3D', 'Watak kartun 2D'] },
      { id: 'mood', label: 'Mood', options: ['High Energy', 'Fun & Playful', 'Premium & Elegant', 'Cute & Friendly', 'Dramatic'] },
      { id: 'lokasi', label: 'Tempat / Background', options: ['Dramatic Glowing Background', 'Studio Minimalis', 'Dunia Fantasi', 'Bandar Futuristik', 'Latar Warna Jenama'] },
    ],
    info: 'Nama produk, kelebihan produk, sasaran audiens dan masalah pelanggan akan dikenal pasti secara automatik berdasarkan gambar yang telah dimuat naik dalam ChatGPT.',
  },
  {
    id: 'pov', label: 'P.O.V', shortLabel: 'P.O.V',
    description: 'Visual sudut pandangan pertama yang terasa dekat dan autentik.',
    tabs: ['Dialog', 'Gambar', 'Prompt Flow'],
    fields: [
      { id: 'scene', label: 'Jumlah scene', options: ['3 Scene', '4 Scene', '5 Scene', '6 Scene'] },
      { id: 'tangan', label: 'Pilihan tangan', options: ['Tangan Lelaki', 'Tangan Perempuan', 'Tangan memakai sarung', 'Tanpa tangan'] },
      { id: 'mood', label: 'Mood', options: ['Santai', 'Premium', 'Bertenaga', 'Cozy', 'Dramatik'] },
      { id: 'lokasi', label: 'Tempat / Lokasi', options: ['Meja Kerja Minimalis', 'Dapur Moden', 'Dalam Kereta', 'Bilik Tidur Cozy', 'Luar Bangunan'] },
    ],
    info: 'Nama produk, kelebihan produk, masalah pelanggan dan sasaran pelanggan akan dikenal pasti secara automatik berdasarkan gambar produk yang telah dimuat naik dalam ChatGPT.',
  },
  {
    id: 'goyang', label: 'Goyang2', shortLabel: 'Goyang2',
    description: 'Siri visual produk dengan hook teks yang konsisten.',
    tabs: ['Gambar', 'Prompt Flow'],
    fields: [
      { id: 'gambar', label: 'Berapa gambar', options: ['3 Gambar', '4 Gambar', '5 Gambar', '6 Gambar'] },
      { id: 'warna1', label: 'Warna hook — Baris 1', options: ['Putih', 'Kuning', 'Hitam', 'Merah', 'Hijau Neon'] },
      { id: 'warna2', label: 'Warna hook — Baris 2', options: ['Putih', 'Kuning', 'Hitam', 'Merah', 'Hijau Neon'] },
    ],
    info: 'Prompt akan menghasilkan siri visual goyang yang konsisten berdasarkan gambar produk yang anda muat naik terus dalam ChatGPT.',
  },
];

export function getInitialValues(contentType: ContentType): Record<string, string> {
  const config = contentTypes.find((item) => item.id === contentType) ?? contentTypes[0];
  return Object.fromEntries(config.fields.map((field) => [field.id, field.options[0]]));
}

export const initialFormData: PromptFormData = {
  contentType: 'standard', activeTab: 'Dialog', values: getInitialValues('standard'), context: '',
};
