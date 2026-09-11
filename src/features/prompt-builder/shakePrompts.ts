import type { PromptFormData } from './types';
import { sceneSeconds } from './categoryPrompts';

const priceHooks = `tiba ii separuh harga 😱📉, harga jatuh tak bagitau 😫, harga macam nak habiskan stok 😭, borong terus jimat gila 🔥, harga budak sekolah 😍🤭, murah sampai tak masuk akal 🤭, tiba ii turun harga 😍🤭, time pokai lah seller drop separuh harga 😫😭, dompet tipis pun lepas 😍, turun harga lagi wehh 😱, murah gila hari ni 😁, tiba ii mughahhh dooh 😍🤭👊🏻, series turun harga tak rilekkk nihh 😱📉, harga baru memang tak masuk akal 😭, nangis yg beli semalam harini harge turun 😫😭, hari ni lagi murah wehh 😱, murah gila tak boleh bawa bincang 😍, harga budak tadika 🤭📉, harga macam duit belanja sekolah 😱, murah gila sampai tak percaya 😭, tiba ii turun harga tak rilekkk 😱📉, tiba ii seller dropkan harga 😱😍📉, harga jatuh macam tak logik 😭`;

const emotionHooks = `Memang melampau lah seller ni!! 😡, Siapa suruh jual murah macam ni?! 😈, Tak masuk akal betul harga dia! 😱, Geram betul tengok promo macam ni! 😠, Ni memang buat orang tak boleh tahan! 😤, Rugi besar kalau tak grab sekarang! 💸, Kenapa baru sekarang saya jumpa benda ni?! 😫, Jangan salahkan saya kalau awak terus checkout! 🛒, Seller ni memang nak buat poket kita bocor! 💰, Serius lah... murah sangat ni! 💯, Takkan harga macam ni pun boleh? 😲, Saya dah cakap jangan tengok video ni! 🛑, Bahaya betul promo macam ni! 💣, Ni bukan diskaun biasa-biasa! 🤩, Macam tak percaya tengok harga dia! 👀, Stop buat promo macam ni boleh tak?! ❌, Memang tak bagi peluang orang berjimat! 😭, Seller ni memang suka buat orang rambang mata! 🥴, Saya geram sebab baru tahu sekarang! 😤, Kalau lambat, memang terlepas! 🏃, Kenapa semua orang diam je pasal produk ni? 🤔, Ni memang level racun yang serius! ☠️, Tak patut murah macam ni! ‼️, Saya marah sebab stok selalu habis! 💔, Boleh tak jangan buat saya asyik checkout?! 🥺, Asal buka TikTok je keluar benda best macam ni! 🎵, Ni memang ujian untuk orang yang nak berjimat! 😥, Jangan klik kalau tak nak terbeli! ✋, Seller ni memang tahu macam mana nak goda customer! 😉, Saya nak komplen... produk ni buat saya ketagih beli! 🛍️, Murah sangat sampai saya syak! 🤨, Dah banyak kali repeat, masih tak puas! 😍, Ni bukan promo, ni gila harga dia! 🤪, Kalau tak beli sekarang, menyesal nanti! ❗, Seller ni memang kejam! Harga macam ni! 😡, Saya sumpah, berbaloi gila! 💯, Ramai dah beli, awak masih tunggu apa?! 👀, Rugi gila kalau tak ambil peluang ni! 😭, Produk ni memang wajib ada! 🤩, Jangan jadi orang terakhir yang tahu! ⚠️, Harga naik bila-bila masa, cepat sebelum menyesal! 📈, Saya sendiri tak sangka best sangat! 👍, Nak cari yang macam ni memang susah! 💯, Ni memang hidden gem! 💎, Kalau saya tak share, memang rugi! 🥺, Memang berbaloi setiap sen! ✅, Kualiti dia memang tip top! 🔥, Saya dah cuba, memang confirm puas hati! 😌, Jangan tunggu orang lain beli dulu! 📢, Klik sekarang sebelum promo berakhir! ⏰`;

export function generateShakePrompt(data: PromptFormData): string {
  if (data.activeTab === 'Gambar') return `Buatkan ${data.values.gambar ?? '3 Gambar'} size portrait daripada gambar yang saya bagi. Buat character tangan lelaki memakai jam tangan hitam memegang produk.
Setiap gambar kekalkan character tangan dan produk, cuma ubah background dan hook sahaja.
Mula dengan Gambar 1 sahaja.

Arahan:
1. Hasilkan satu gambar ultra-realistic.
2. Pastikan gaya cinematic, natural skin texture, realistic lighting.
3. Lighting mesti sesuai dengan emosi scene.
4. Kamera angle nampak seperti rakaman filem sebenar.
5. Environment nampak hidup dan real.
6. Setiap gambar masukkan satu hook secara random ikut kesesuaian produk daripada senarai di bawah.

hook [harga]:
${priceHooks}

hook [emosi]:
${emotionHooks}

Pilih hook jenis emosi.
Warna Hook:
Baris 1: ${data.values.warna1 ?? 'Putih'}
Baris 2: ${data.values.warna2 ?? 'Putih'}

7. Pastikan produk kelihatan realistik dan proportionate. Jangan ubah design, warna, saiz, bentuk, label, logo atau pembungkusan produk.
Tiada tulisan tambahan, subtitle atau watermark selain hook dan tulisan asal produk.

Terus hasilkan gambar untuk Gambar 1 sekarang. Selepas itu, tunggu arahan saya.
Apabila saya taip NEXT, terus hasilkan gambar untuk scene seterusnya berdasarkan overview yang sama dengan gaya visual yang konsisten sehingga lengkap jumlah gambar yang dipilih.
Buatkan gambar size 9:16.`;

  const duration = sceneSeconds(data);
  const time = (seconds: number) => (seconds * duration / 8).toFixed(3).replace(/0+$/, '').replace(/\.$/, '.0');
  return `Create a ${duration}-second ultra HD, ultra-realistic cinematic handheld commercial video based exactly on the provided reference image.

Use the provided image as the ONLY visual reference. Portrait 9:16.

Keep every visible element exactly the same throughout the entire video, except for the hand entrance and motion explicitly described in the timeline:
Keep the exact same product, bottle if present, label, logo, typography, colors, shape, cap if present, proportions, reflections, grip, black wristwatch, fingers, skin tone, background, lighting, shadows, perspective, composition, and hook text. If a workshop or motorcycle is present in the reference, preserve it exactly; do not introduce one otherwise.

Do not replace, redesign, regenerate, or alter the product.
Do not change the hook text, wording, font, size, color, placement, spacing, or effects. Keep the existing hook visible throughout the entire video.
Do not add or remove any objects; the same hand and product enter the frame as specified below.
Keep the product at exactly the same apparent size whenever visible during the entire video. Compensate subtle camera drift to preserve its on-screen scale.
Lock the product identity so it remains perfectly consistent with no morphing, deformation, flickering, stretching, or label changes.
Maintain photorealistic quality with natural skin texture, realistic reflections, and cinematic depth of field.

Video style: Ultra realistic, cinematic, HDR, professional commercial quality, handheld camera, natural lighting, realistic motion blur, subtle camera breathing, non-static camera.

Timeline:

0.0s – ${time(1)}s Only the existing background and the existing hook text are visible exactly as shown in the reference image. No hand and no product visible yet. Handheld camera with subtle natural sway, tiny breathing movement, and gentle forward drift.

${time(1)}s – ${time(3)}s The same hand wearing the same black watch naturally enters from the bottom while holding the exact same product. The product remains exactly the same size as in the reference image. Camera slowly pushes in while preserving the product's apparent size.

${time(3)}s – ${time(6.5)}s The hand gently shakes the product left and right with small natural wrist movement. The movement is smooth and realistic. The product remains perfectly locked with no visual changes. Camera slowly moves closer while maintaining handheld movement and the product's apparent size.

${time(6.5)}s – ${time(8)}s Camera finishes with close framing on the product at the reference scale. The hand naturally stops moving. Maintain subtle handheld breathing movement until the end. Keep the background softly blurred while the product stays perfectly sharp.

No dialogue. No narration. No subtitles. No captions. No music. No sound effects. No additional text. No logo animation. No transitions. No scene cuts. One continuous handheld shot.`;
}
