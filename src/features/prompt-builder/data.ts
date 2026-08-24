import type { ContentTypeOption, PromptFormData } from './types';

export const contentTypes: ContentTypeOption[] = [
  { id: 'sales', label: 'Ayat jualan', shortLabel: 'Jualan', description: 'Ayat jualan berimpak tinggi untuk tawaran dan kempen.' },
  { id: 'social', label: 'Hantaran media sosial', shortLabel: 'Sosial', description: 'Hantaran menarik yang disesuaikan untuk platform anda.' },
  { id: 'email', label: 'Kempen e-mel', shortLabel: 'E-mel', description: 'E-mel yang mendorong pembukaan, klik dan balasan.' },
  { id: 'product', label: 'Penerangan produk', shortLabel: 'Produk', description: 'Penerangan berasaskan manfaat yang meyakinkan.' },
  { id: 'video', label: 'Skrip video', shortLabel: 'Video', description: 'Skrip tersusun dengan pembuka dan arahan yang jelas.' },
];

export const channels = ['Halaman pendaratan', 'Instagram', 'TikTok', 'LinkedIn', 'E-mel', 'WhatsApp', 'Pasar dalam talian'];
export const tones = ['Yakin', 'Mesra', 'Berani', 'Premium', 'Santai', 'Berinformasi'];
export const goals = ['Mendorong pembelian', 'Mendapatkan prospek', 'Membina kesedaran', 'Melancarkan produk', 'Menyasarkan semula pelawat', 'Memulakan perbualan'];

export const initialFormData: PromptFormData = {
  contentType: 'sales',
  product: '',
  audience: 'Pemilik perniagaan kecil yang sibuk',
  channel: 'Halaman pendaratan',
  tone: 'Yakin',
  goal: 'Mendorong pembelian',
  context: '',
};
