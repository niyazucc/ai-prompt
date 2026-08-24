import { contentTypes } from './data';
import type { PromptFormData } from './types';

const outputDirections: Record<PromptFormData['contentType'], string> = {
  sales: 'Hasilkan tajuk utama, subtajuk sokongan, tiga bahagian berasaskan manfaat, ruang untuk bukti sosial, jawapan kepada bantahan pelanggan dan seruan tindakan yang khusus.',
  social: 'Hasilkan tiga variasi hantaran. Setiap variasi mesti mempunyai pembuka yang menarik, isi ringkas, seruan tindakan semula jadi dan lima tanda pagar yang relevan.',
  email: 'Hasilkan tiga cadangan tajuk e-mel, teks pratonton, isi e-mel yang ringkas, satu seruan tindakan utama dan nota P.S. yang pendek.',
  product: 'Hasilkan tajuk yang menarik, gambaran keseluruhan dua ayat, lima poin berasaskan manfaat, perbezaan utama dan seruan tindakan untuk membeli.',
  video: 'Hasilkan skrip mengikut babak dengan pembuka tiga saat, dialog, teks pada skrin, arahan visual dan seruan tindakan akhir yang kuat.',
};

export function generatePrompt(data: PromptFormData): string {
  const contentLabel = contentTypes.find((item) => item.id === data.contentType)?.label ?? 'kandungan jualan';
  const product = data.product.trim() || '[PRODUK ATAU PERKHIDMATAN]';
  const extraContext = data.context.trim() || 'Tiada konteks tambahan diberikan. Buat andaian yang munasabah dan realistik dari segi komersial, kemudian nyatakan andaian tersebut dengan jelas.';

  return `Bertindak sebagai penulis iklan respons langsung kanan dan pakar strategi penukaran.

TUGAS
Hasilkan ${contentLabel.toLowerCase()} untuk ${product}.

RINGKASAN KEMPEN
- Sasaran audiens: ${data.audience}
- Saluran penerbitan: ${data.channel}
- Matlamat utama: ${data.goal}
- Nada jenama: ${data.tone}
- Konteks produk: ${extraContext}

KEPERLUAN HASIL
${outputDirections[data.contentType]}

PANDUAN PENULISAN
- Mulakan dengan masalah audiens yang paling relevan atau hasil yang mereka inginkan.
- Terjemahkan setiap ciri kepada manfaat pelanggan yang nyata.
- Tulis secara khusus, dipercayai dan mudah difahami; elakkan gimik, ayat pengisi dan dakwaan umum.
- Ikut gaya serta panjang kandungan yang sesuai untuk ${data.channel}.
- Kekalkan nada ${data.tone.toLowerCase()} secara konsisten.
- Jangan mereka-reka statistik, testimoni, jaminan atau keupayaan produk.
- Gunakan perenggan pendek dan format yang mudah diimbas.

Sebelum menulis, nyatakan secara ringkas mesej utama dan sudut pujukan yang dipilih. Kemudian berikan hasil akhir dalam blok berlabel yang jelas dan sedia untuk disalin. Pastikan semua kandungan ditulis dalam Bahasa Melayu Malaysia yang semula jadi.`;
}
