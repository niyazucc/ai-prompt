import { X } from 'lucide-react';

import { SUPPORT_CONTACT, SUPPORT_EMAIL, TERMS_EFFECTIVE_DATE } from '../config';

interface TermsModalProps {
  onClose: () => void;
}

export function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="terms-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="terms-header">
          <div>
            <span>Polisi akaun</span>
            <h2 id="terms-title">Terma dan Syarat Akaun dan Pengumpulan Data Log Masuk</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup terma dan syarat"><X size={19} /></button>
        </header>

        <div className="terms-content">
          <p><strong>Tarikh Kuat Kuasa:</strong> {TERMS_EFFECTIVE_DATE}<br /><strong>Laman Web:</strong> {window.location.origin}</p>

          <h3>1. Pengumpulan Data Log Masuk</h3>
          <p>Untuk membolehkan anda mendaftar akaun dan menggunakan perkhidmatan di laman web ini, kami mengumpul maklumat log masuk anda, iaitu:</p>
          <ul><li>Alamat e-mel (sebagai pengenal pasti akaun / username)</li><li>Kata laluan (password)</li></ul>

          <h3>2. Tujuan Pengumpulan Data</h3>
          <p>Maklumat e-mel dan kata laluan anda dikumpul dan diproses untuk tujuan berikut:</p>
          <ul>
            <li>Pengesahan identiti dan keselamatan akaun semasa log masuk.</li>
            <li>Menguruskan akaun pengguna, pesanan, atau perkhidmatan anda.</li>
            <li>Menghantar pengesahan akaun, penetapan semula kata laluan, dan pemberitahuan keselamatan.</li>
            <li>Menghantar maklumat perkhidmatan, kemas kini, atau bahan pemasaran (sekiranya dipersetujui).</li>
          </ul>

          <h3>3. Keselamatan Kata Laluan dan Maklumat</h3>
          <ul>
            <li>Kata laluan anda akan dikendalikan menggunakan teknologi hashing yang selamat supaya ia tidak boleh dibaca secara terus, termasuk oleh pentadbir laman web kami.</li>
            <li>Kami melaksanakan langkah keselamatan teknikal dan organisasi untuk melindungi akaun anda daripada akses tanpa kebenaran, pencerobohan, atau kehilangan data.</li>
          </ul>

          <h3>4. Tanggungjawab Pengguna</h3>
          <ul>
            <li>Anda bertanggungjawab sepenuhnya untuk menjaga kerahsiaan kata laluan dan maklumat akaun anda.</li>
            <li>Anda bersetuju untuk tidak berkongsi kata laluan anda dengan mana-mana pihak ketiga.</li>
            <li>Jika anda mendapati atau mengesyaki penggunaan tanpa kebenaran, maklumkan kepada kami dengan segera.</li>
          </ul>

          <h3>5. Perkongsian Data kepada Pihak Ketiga</h3>
          <p>Kami tidak akan menjual, menyewa, atau menyerahkan alamat e-mel atau kata laluan anda kepada pihak ketiga untuk tujuan pemasaran mereka. Data anda hanya diproses melalui penyedia perkhidmatan sistem yang selamat dan terikat dengan kewajipan kerahsiaan.</p>

          <h3>6. Hak Pengguna dan Pembatalan Akaun</h3>
          <p>Di bawah Akta Perlindungan Data Peribadi 2010 (PDPA):</p>
          <ul>
            <li>Anda berhak memohon akses, kemas kini, atau penukaran kata laluan dan alamat e-mel melalui tetapan akaun anda.</li>
            <li>Anda berhak memohon penutupan atau pemadaman akaun pada bila-bila masa dengan menghubungi kami.</li>
          </ul>

          <h3>7. Hubungi Kami</h3>
          <p>Jika anda mempunyai pertanyaan mengenai keselamatan akaun atau pengendalian data:</p>
          <ul><li>E-mel: {SUPPORT_EMAIL}</li><li>Alamat/Telefon: {SUPPORT_CONTACT}</li></ul>
        </div>

        <button className="terms-close" type="button" onClick={onClose}>Saya sudah baca</button>
      </section>
    </div>
  );
}
