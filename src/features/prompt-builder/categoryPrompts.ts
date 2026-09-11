import type { PromptFormData } from './types';

export function sceneSeconds(data: PromptFormData): number {
  return ({ '6 saat': 6, '8 saat': 8, '10 saat': 10 } as Record<string, number>)[data.values.durasi] ?? 8;
}

const productInfo = `Maklumat Produk:
[Kenal pasti secara auto berdasarkan gambar yang telah di-upload]

Kelebihan Produk:
[Kenal pasti secara auto berdasarkan gambar yang telah di-upload]

Target Audience:
[Kenal pasti secara auto berdasarkan gambar yang telah di-upload]

Masalah Customer:
[Kenal pasti secara auto berdasarkan gambar yang telah di-upload]`;

const nextImage = `Mulakan dengan gambar SCENE 1 sahaja. Selepas itu, tunggu arahan saya.
Apabila saya taip NEXT, terus hasilkan gambar scene seterusnya sehingga lengkap berdasarkan jumlah scene yang dipilih, dengan visual dan emosi yang konsisten.
Buatkan gambar size 9:16 Portrait.`;

function imageHook(data: PromptFormData): string {
  return `Hook hanya pada gambar Scene 1 sahaja. Tiada tulisan, subtitle, watermark atau teks tambahan kecuali hook gambar 1. Kekalkan tulisan dan logo asal pada produk.
Hook position: 200 px dari atas, lebih kurang 15% daripada tinggi gambar.
Minimum 80 px dari tepi kiri dan kanan. Kawasan tengah selebar lebih kurang 920 px.
Baris 1: ${data.values.hookColor1 ?? 'Putih'}. Font size: 90–110 px.
Baris 2: ${data.values.hookColor2 ?? 'Putih'}. Font size: 100–120 px.
Jarak antara baris: 15–25 px. Jangan ubah warna hook.`;
}

function animationDialog(data: PromptFormData): string {
  const count = parseInt(data.values.scene) || 3;
  return `Berdasarkan gambar produk yang telah di-upload, hasilkan skrip iklan affiliate animasi yang sangat menarik dalam format vertical 9:16.

${productInfo}

Jumlah Scene: ${count}
Durasi: Setiap scene ${sceneSeconds(data)} saat.
Watak: Produk sebagai watak utama dengan mata kartun, kening, mulut, tangan dan kaki yang ekspresif.
Tempat / Background: ${data.values.lokasi}
Mood: ${data.values.mood}

Style:
- Viral TikTok commercial.
- Pixar-quality 3D character animation, ultra detailed, bright vibrant colors.
- Cinematic commercial, high energy, funny personality, fast pacing.
- Product is the main character. Designed for high CTR and watch retention.

Peraturan:
- Produk mesti menjadi watak utama dengan mata kartun, kening, mulut, tangan dan kaki yang ekspresif.
- Produk mesti kekal sama dari segi design, warna, bentuk dan saiz.
- Dialog sahaja. Tiada narration. Tiada subtitle.
- Semua dialog dalam Bahasa Melayu dan cukup untuk ${sceneSeconds(data)} saat setiap scene.
- Scene pertama mesti mempunyai hook yang kuat.
- Scene pertengahan menerangkan masalah atau sebab customer patut cuba produk.
- Scene terakhir mesti mempunyai CTA yang kuat untuk TikTok affiliate.
- Pergerakan cepat, bertenaga dan lucu. Visual konsisten sehingga scene terakhir.

Scene 1 (Hook):
The product suddenly appears in front of a dramatic glowing background, with expressive cartoon eyes, eyebrows, mouth, arms and legs. It points directly at the camera with an angry but funny expression while shouting to attract attention. Camera performs a fast push-in.

Scene pertengahan (Problem):
The character turns sideways while explaining why everyone should try the product. Floating ingredients supported by the product reference, glowing particles and energetic visual effects appear around the product. Camera circles slowly around the character. Kembangkan masalah dan demonstrasi mengikut jumlah scene yang dipilih.

Scene ${count} (Call To Action):
The product jumps closer to the camera with a confident smile. Background becomes brighter with strong radial light rays. Camera zooms toward the product. End with a powerful call-to-action pose suitable for TikTok affiliate marketing.

Overall Style:
Ultra realistic 3D rendering, cinematic lighting, glossy material, soft shadows, HDR, dramatic rim light, animated commercial quality, premium advertisement.

Output:
${Array.from({ length: count }, (_, index) => `SCENE ${index + 1}\nOverview\nDialog`).join('\n\n')}

Lengkapkan semua scene berdasarkan jumlah scene yang dipilih.`;
}

function povDialog(data: PromptFormData): string {
  const count = parseInt(data.values.scene) || 3;
  return `Anda ialah seorang pakar menghasilkan skrip video TikTok Affiliate yang mempunyai hook kuat dan kadar retention tinggi.
Tugas anda ialah menghasilkan jalan cerita berdasarkan produk yang saya berikan.

${productInfo}

Durasi: ${sceneSeconds(data)} saat setiap scene.
Bilangan scene: ${count}
Style: POV Affiliate Marketing
Pilihan tangan: ${data.values.tangan}
Lokasi: ${data.values.lokasi}
Mood: ${data.values.mood}

Peraturan:
- Video hanya menunjukkan tangan dan produk sahaja. Jangan ada muka. Jangan ada badan.
- Dialog hanya datang daripada pemilik tangan dalam Bahasa Melayu sahaja.
- Tiada narration. Tiada subtitle. Tiada background music.
- Dialog mesti pendek, natural dan sedap didengar, cukup untuk ${sceneSeconds(data)} saat setiap scene.
- Setiap scene mesti ada tujuan yang jelas.
- Scene pertama mesti mempunyai hook yang sangat kuat.
- Scene terakhir mesti mempunyai CTA beg kuning.

Susunan setiap scene:
Scene 1: Hook
${count === 3 ? 'Scene 2: Masalah dan Penyelesaian / Demonstrasi' : `Scene 2: Masalah\nScene 3: Penyelesaian / Demonstrasi${count > 4 ? `\nScene 4 hingga ${count - 1}: Kembangkan demonstrasi dan kelebihan produk tanpa mengulang dialog` : ''}`}
Scene ${count}: Call To Action — beg kuning

Output:
Overview jalan cerita.
Kemudian tulis dialog setiap scene sahaja, sehingga lengkap ${count} scene.`;
}

function animationImage(data: PromptFormData): string {
  return `Gunakan skrip dan overview yang telah dipersetujui untuk ${data.values.scene}.
Create an ultra realistic 3D product mascot advertisement in portrait 9:16.
The product itself becomes a lively animated character.

Features:
- Big expressive eyes, thick eyebrows, animated mouth.
- Flexible cartoon arms and legs.
- High quality glossy material, premium commercial rendering.
- Product label remains completely unchanged. Product design remains exactly identical, including color, shape and size.
- Character occupies around 70% of the frame.

Background:
Strong red-orange radial burst, energy rays, floating light particles, dynamic motion feeling, high contrast, commercial advertising style.

Lighting:
HDR lighting, cinematic rim light, soft reflections, studio quality, high saturation.

Camera:
Medium close-up, slight low angle, portrait composition, shallow depth of field.

Expression:
Energetic, funny, attention grabbing, highly expressive, suitable for viral TikTok affiliate advertisement.

${imageHook(data)}
No watermark. No logo modification. No extra text. Ultra HD.
${nextImage}`;
}

function povImage(data: PromptFormData): string {
  return `Gunakan overview dan skrip yang telah dipersetujui untuk ${data.values.scene}.
Style: POV Affiliate Marketing
Format: Portrait 9:16

Peraturan wajib:
- Ultra realistic, DSLR quality, cinematic lighting, natural skin texture.
- Real environment, film look, natural depth of field, handheld camera composition.
- Produk sentiasa menjadi fokus utama.

Peraturan produk:
- Produk mesti 100% sama seperti gambar asal.
- Jangan ubah logo, tulisan, warna atau bentuk.
- Jangan tambah aksesori. Jangan buang aksesori.

Peraturan watak:
- ${data.values.tangan}. Hanya tangan sahaja. Jangan ada muka. Jangan ada badan.
- Tangan realistik. Posisi tangan berubah mengikut scene.

Peraturan background:
- Background mengikut jalan cerita, bermula di ${data.values.lokasi}.
- Environment mesti realistik. Lighting ikut emosi scene.

Hook:
- Pilih satu hook problem dan letakkan di bahagian atas gambar Scene 1 sahaja.
- Warna Hook Baris 1: ${data.values.hookColor1 ?? 'Putih'}.
- Warna Hook Baris 2: ${data.values.hookColor2 ?? 'Putih'}.
- Jangan ubah warna hook yang telah dipilih.
- Tiada teks tambahan, subtitle atau watermark. Kekalkan tulisan asal produk.

${nextImage}`;
}

function flow(data: PromptFormData): string {
  const podcast = data.contentType === 'podcast';
  const pov = data.contentType === 'pov';
  return `Gunakan gambar dan skrip yang telah dipersetujui.
Hasilkan prompt untuk Google Flow AI bermula dengan SCENE 1 sahaja.
Durasi: ${sceneSeconds(data)} saat setiap scene.

Peraturan:
- Semua description dalam English. Dialog sahaja dalam Bahasa Melayu.
- Tiada narration. Tiada subtitle. Tiada background music. Tiada caption.
- Dialog natural cukup untuk ${sceneSeconds(data)} saat dengan natural pacing.
- ${pov ? 'Dialog hanya daripada pemilik tangan.' : 'Watak bercakap secara direct. Pastikan lip sync natural.'}
- Video ultra realistic dan cinematic.
- Produk 100 peratus sama dengan gambar asal dari segi design, warna, size, bentuk, logo dan tulisan. Never replace the product. Jangan ubah apa-apa sepanjang video.
${podcast ? '- Character mesti sama. Jangan ubah pakaian, studio, microphone atau kamera.' : '- Hook gambar 1 muncul dari 0 hingga 3 saat sahaja untuk scene 1. Jangan ubah warna hook. Tiada hook pada scene lain.'}
${pov ? '- Show hands only. Never show face. Never show body. Realistic hands and natural hand movement.' : '- Kekalkan watak, gaya visual dan emosi yang konsisten.'}
- Jangan gunakan ayat seperti “Malay dialogue:” atau label dialog lain.
- Jangan masukkan penerangan tambahan di luar prompt.

Struktur prompt:
Scene environment description (English)
Lighting description (English)
Camera movement (English)
${pov ? 'Hand movement (English)\nProduct interaction (English)' : 'Character action (English)\nFacial expression (English)' + (podcast ? '\nHand movement (English)' : '')}
Then continue with the ${pov ? 'hand owner' : 'character'} speaking naturally in Bahasa Melayu only.

${podcast ? `Pastikan kamera bergerak secara perlahan seperti rakaman podcast sebenar.
Gunakan Slow Push In, Slow Dolly, Medium Shot, Close Up apabila sesuai dan handheld cinematic movement yang sangat minimum.` : pov ? `Camera Style:
POV camera, handheld camera, natural and cinematic movement. Pilih pergerakan yang sesuai untuk scene daripada: slow push in, slow push out, orbit left, orbit right, front angle, side angle, top angle, macro close-up, detail close-up, focus pull, small handheld shake, natural breathing movement.

Hand Movement:
Hold the product naturally. Rotate slowly, lift, lower, bring closer to camera, pull back, tilt, change grip naturally and show different sides as appropriate to the scene. Keep movement smooth. Never cover important branding.` : 'Character action: Expressive cartoon eyes, eyebrows, mouth, arms and legs. Fast, energetic, funny product character animation with consistent product design.'}

Terus hasilkan prompt untuk SCENE 1 sekarang, dalam format yang boleh copy paste ke Google Flow AI.
Selepas itu, tunggu arahan saya. Apabila saya taip NEXT, baru hasilkan prompt scene seterusnya sehingga lengkap ${data.values.scene}.
Hasilkan prompt sahaja.`;
}

export function generateCategoryPrompt(data: PromptFormData): string | undefined {
  if (data.activeTab === 'Dialog') {
    if (data.contentType === 'animasi') return animationDialog(data);
    if (data.contentType === 'pov') return povDialog(data);
  }
  if (data.activeTab === 'Gambar') {
    if (data.contentType === 'animasi') return animationImage(data);
    if (data.contentType === 'pov') return povImage(data);
  }
  if (data.activeTab === 'Prompt Flow' && ['podcast', 'animasi', 'pov'].includes(data.contentType)) return flow(data);
  return undefined;
}
