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

function animationImageWithCaption(data: PromptFormData): string {
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

function animationImageWithoutCaption(): string {
  return `Gunakan skrip yang telah dihasilkan sebagai panduan utama.

Hasilkan satu gambar bagi setiap scene berdasarkan skrip tersebut.

Maklumat:

Format:
9:16 Portrait

Gaya Visual:
Ultra-realistic 3D product mascot advertisement
Cinematic
Premium commercial rendering
High-quality glossy materials
Ultra HD
Professional advertising photography
Realistic reflections
High saturation
Film look

Watak:
Produk itu sendiri berperanan sebagai watak maskot yang hidup dan ekspresif.

Ciri-ciri Watak:
• Mata besar dan ekspresif.
• Kening tebal dan ekspresif.
• Mulut animasi.
• Tangan kartun yang fleksibel.
• Kaki kartun yang fleksibel.
• Personaliti yang bertenaga dan sangat ekspresif.
• Penampilan yang lucu serta menarik perhatian.
• Watak memenuhi kira-kira 70% daripada keseluruhan bingkai.

Keperluan Konsistensi Produk:

• Pastikan produk kekal 100% sama dalam semua scene.
• Label produk mesti dikekalkan sepenuhnya tanpa sebarang perubahan.
• Jangan ubah nama, tulisan, logo asal, warna, bentuk, reka bentuk, pembungkusan, bahan, atau perkadaran produk.
• Jangan tambahkan sebarang elemen pada label atau pembungkusan produk.
• Pastikan bentuk dan saiz produk kekal konsisten dari satu scene ke scene yang lain.
• Ciri-ciri maskot seperti mata, kening, mulut, tangan, dan kaki mesti kekal konsisten dalam semua scene.
• Jangan ubah identiti visual produk.
• Produk mesti kelihatan seperti produk sebenar yang diberikan personaliti maskot animasi.

Latar Belakang:

Latar belakang radial burst berwarna merah jingga yang kuat.

• Pancaran tenaga yang dinamik.
• Partikel cahaya terapung.
• Kesan pergerakan yang dinamik.
• Kontras tinggi.
• Persekitaran pengiklanan komersial yang premium.
• Suasana visual yang bertenaga.
• Latar belakang mesti kekal konsisten sepanjang semua scene, kecuali perubahan yang diperlukan berdasarkan skrip.

Pencahayaan:

• Pencahayaan HDR.
• Rim light sinematik.
• Pantulan lembut dan realistik.
• Pencahayaan berkualiti studio.
• Saturasi tinggi.
• Pencahayaan mesti disesuaikan dengan emosi dan aksi dalam setiap scene.
• Pastikan highlight dan pantulan pada permukaan produk kelihatan realistik.

Kamera:

• Medium close-up.
• Perspektif sedikit dari sudut rendah.
• Komposisi potret.
• Depth of field yang cetek.
• Kualiti kamera komersial profesional.
• Pembingkaian sinematik.
• Perspektif semula jadi.
• Pastikan maskot menjadi fokus utama.

Ekspresi dan Emosi:

• Bertenaga.
• Lucu.
• Menarik perhatian.
• Sangat ekspresif.
• Ceria dan bersahaja.
• Bahasa tubuh animasi yang semula jadi.
• Sesuai untuk iklan affiliate TikTok yang berpotensi menjadi tular.
• Pastikan ekspresi dan bahasa tubuh selaras dengan skrip bagi setiap scene.

Keperluan Visual:

• Jangan sertakan sebarang sari kata.
• Jangan sertakan sebarang kapsyen.
• Jangan sertakan sebarang hook.
• Jangan sertakan sebarang teks tambahan.
• Jangan sertakan watermark.
• Jangan ubah logo atau label asal produk.
• Jangan tambahkan logo baharu.
• Jangan tambahkan sebarang tulisan pada latar belakang.
• Jangan tambahkan sebarang elemen yang tidak diperlukan dalam scene.
• Pastikan persekitaran kelihatan kemas, premium, dinamik, dan realistik.

Fokus Utama:

• Produk sebagai watak utama.
• Ekspresi maskot yang jelas.
• Interaksi maskot berdasarkan skrip.
• Identiti produk.
• Bahan berkilat yang realistik.
• Komposisi sinematik.
• Persembahan komersial yang dinamik.

Konsistensi Visual:

Pastikan produk, label produk, reka bentuk produk, ciri-ciri maskot, mata, kening, mulut, tangan, kaki, warna, bahan, pencahayaan, latar belakang, pancaran tenaga, perspektif kamera, komposisi, dan gaya visual keseluruhan kekal konsisten dalam semua scene.

Format Output Setiap Scene:

Scene Number

Hasilkan gambar untuk Scene 1 terlebih dahulu.

Apabila saya menaip “Next”, hasilkan gambar untuk Scene 2.

Teruskan kaedah yang sama bagi scene seterusnya sehingga semua scene selesai.

Hasilkan setiap gambar dalam format 9:16 Portrait.`;
}

function povImageWithCaption(data: PromptFormData): string {
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

function povImageWithoutCaption(): string {
  return `Gunakan overview dan skrip yang telah diluluskan sebagai panduan utama.

Mulakan dengan Scene 1 sahaja.

Style:

POV Affiliate Marketing

Format:

9:16 Portrait

Gaya Visual:

• Ultra-realistic.
• Kualiti DSLR profesional.
• Pencahayaan sinematik.
• Tekstur kulit semula jadi.
• Persekitaran realistik.
• Gaya visual seperti filem.
• Depth of field semula jadi.
• Komposisi kamera handheld.
• Perspektif POV yang autentik.
• Produk mesti sentiasa menjadi fokus utama.

Peraturan Produk:

• Produk mesti 100% sama seperti dalam gambar asal.
• Jangan ubah logo.
• Jangan ubah tulisan asal pada produk.
• Jangan ubah warna.
• Jangan ubah bentuk.
• Jangan ubah reka bentuk.
• Jangan ubah pembungkusan.
• Jangan tambah aksesori.
• Jangan buang aksesori.
• Jangan ubah saiz atau nisbah produk.
• Pastikan material, tekstur, label, dan semua butiran produk kelihatan realistik.
• Pastikan produk kelihatan seperti produk sebenar yang dirakam menggunakan kamera DSLR profesional.
• Produk mesti kekal konsisten dalam semua scene.

Peraturan Watak:

• Hanya tangan yang boleh kelihatan.
• Jangan tunjukkan muka.
• Jangan tunjukkan kepala.
• Jangan tunjukkan badan.
• Jangan tunjukkan identiti atau bahagian tubuh lain yang tidak diperlukan.
• Tangan mesti kelihatan realistik.
• Gunakan tekstur kulit semula jadi.
• Pastikan nisbah tangan realistik.
• Pastikan anatomi jari kelihatan semula jadi.
• Posisi dan pergerakan tangan hendaklah disesuaikan dengan keperluan setiap scene.
• Pastikan tangan kelihatan natural ketika memegang, menggunakan, menunjukkan, atau berinteraksi dengan produk.

Peraturan POV:

• Kamera mesti mewakili pandangan mata pengguna.
• Gunakan komposisi first-person POV.
• Tangan mesti kelihatan seperti milik individu yang sedang menggunakan produk.
• Gunakan pergerakan kamera handheld yang natural.
• Elakkan pergerakan kamera yang terlalu artifisial.
• Pastikan interaksi tangan dengan produk kelihatan meyakinkan.
• Produk mesti kekal sebagai focal point utama sepanjang scene.

Peraturan Background:

• Background mesti selaras dengan jalan cerita dan situasi dalam scene.
• Persekitaran mesti kelihatan realistik dan hidup.
• Gunakan tekstur realistik serta butiran persekitaran semula jadi.
• Pencahayaan mesti disesuaikan dengan masa, lokasi, mood, dan emosi scene.
• Pastikan background tidak mengganggu fokus utama terhadap produk.
• Kekalkan konsistensi visual bagi lokasi dan persekitaran apabila scene berlaku di tempat yang sama.

Peraturan Lighting:

• Gunakan pencahayaan sinematik yang realistik.
• Pencahayaan mesti selaras dengan emosi dan suasana scene.
• Gunakan highlights dan shadows yang natural.
• Pastikan pantulan pada produk kelihatan realistik.
• Pastikan pencahayaan kelihatan seperti rakaman sebenar menggunakan kamera profesional.

Fokus Utama:

• Produk.
• Interaksi tangan dengan produk.
• Pergerakan tangan yang natural.
• Persembahan produk yang realistik.
• Pengalaman POV.
• Suasana emosi berdasarkan skrip.
• Komposisi sinematik.
• Visual affiliate marketing yang autentik.

Keperluan Visual:

• Jangan sertakan sebarang hook.
• Jangan sertakan sebarang caption.
• Jangan sertakan sebarang subtitle.
• Jangan sertakan sebarang teks tambahan.
• Jangan sertakan watermark.
• Jangan sertakan logo tambahan.
• Jangan tambahkan sebarang elemen yang tidak diperlukan dalam scene.
• Pastikan produk sentiasa kelihatan jelas dan realistik.

Konsistensi Visual:

Pastikan produk, reka bentuk produk, logo, tulisan asal, warna, bentuk, pembungkusan, aksesori, tangan, tekstur kulit, perspektif kamera, pencahayaan, persekitaran, background, tona warna, depth of field, dan keseluruhan gaya sinematik kekal konsisten sepanjang semua scene.

Format Output:

Scene Number

Hasilkan gambar untuk Scene 1 sahaja terlebih dahulu.

Apabila saya menaip “NEXT”, hasilkan gambar untuk Scene 2.

Teruskan kaedah yang sama untuk scene seterusnya sehingga semua scene selesai.

Hasilkan setiap gambar dalam format 9:16 Portrait.`;
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
    if (data.contentType === 'animasi') {
      return data.values.caption === 'Ya' ? animationImageWithCaption(data) : animationImageWithoutCaption();
    }
    if (data.contentType === 'pov') {
      return data.values.caption === 'Ya' ? povImageWithCaption(data) : povImageWithoutCaption();
    }
  }
  if (data.activeTab === 'Prompt Flow' && ['podcast', 'animasi', 'pov'].includes(data.contentType)) return flow(data);
  return undefined;
}
