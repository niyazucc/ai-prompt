import './RegistrationTerms.css';

export function RegistrationTerms() {
  return (
    <div className="registration-terms">
      <details>
        <summary>Terma, privasi dan akses akaun</summary>
        <div className="registration-terms-content" tabIndex={0} role="region" aria-labelledby="registration-terms-title">
          <h2 id="registration-terms-title">TERMA AKAUN, BAYARAN DAN DATA PERIBADI</h2>
          <p>Tarikh Kuat Kuasa: 12 September 2026<br />Laman Web: <a href="https://promptlytool.my" target="_blank" rel="noreferrer">https://promptlytool.my</a></p>

          <h3>1. Maklumat yang Diproses</h3>
          <p>Untuk memproses bayaran dan menyediakan akaun, kami menggunakan maklumat yang anda masukkan dalam borang OnPay:</p>
          <ul>
            <li>Nama, alamat e-mel dan nombor telefon.</li>
            <li>Rujukan serta status bayaran OnPay.</li>
          </ul>

          <h3>2. Tujuan Pengumpulan Data</h3>
          <p>Maklumat akaun dan bayaran anda diproses untuk tujuan berikut:</p>
          <ul>
            <li>Pengesahan identiti dan keselamatan akaun semasa log masuk.</li>
            <li>Mencipta dan mengaktifkan akaun selepas bayaran disahkan.</li>
            <li>Menghantar pautan selamat untuk menetapkan atau menukar kata laluan.</li>
            <li>Menguruskan pesanan dan akses kepada perkhidmatan.</li>
          </ul>

          <h3>3. Keselamatan Kata Laluan dan Maklumat</h3>
          <ul>
            <li>Jangan masukkan kata laluan dalam borang OnPay. Anda akan menetapkannya terus melalui halaman keselamatan Firebase selepas bayaran diluluskan.</li>
            <li>Kata laluan tidak dihantar kepada atau disimpan oleh sistem OnPay kami.</li>
            <li>Kami melaksanakan langkah-langkah keselamatan teknikal dan organisasi untuk melindungi akaun anda daripada akses tanpa kebenaran, pencerobohan, atau kehilangan data.</li>
          </ul>

          <h3>4. Tanggungjawab Pengguna</h3>
          <ul>
            <li>Anda bertanggungjawab sepenuhnya untuk menjaga kerahsiaan kata laluan dan maklumat akaun anda.</li>
            <li>Anda bersetuju untuk tidak berkongsi kata laluan anda dengan mana-mana pihak ketiga.</li>
            <li>Sekiranya anda mendapati atau mengesyaki terdapat penggunaan tanpa kebenaran ke atas akaun anda, anda hendaklah memaklumkan kepada kami dengan kadar segera.</li>
          </ul>

          <h3>5. Perkongsian Data Kepada Pihak Ketiga</h3>
          <p>Kami tidak akan menjual, menyewa, atau menyerahkan alamat e-mel atau kata laluan anda kepada mana-mana pihak ketiga untuk tujuan pemasaran mereka. Data anda hanya diproses melalui penyedia perkhidmatan pengelogan/penyelenggaraan sistem yang selamat yang terikat dengan kewajipan kerahsiaan.</p>

          <h3>6. Hak Pengguna dan Pembatalan Akaun</h3>
          <p>Di bawah Akta Perlindungan Data Peribadi 2010 (PDPA):</p>
          <ul>
            <li>Anda boleh meminta akses atau pembetulan maklumat akaun dan menetapkan semula kata laluan melalui e-mel.</li>
            <li>Anda berhak untuk memohon penutupan/pemadaman akaun anda pada bila-bila masa dengan menghubungi kami.</li>
          </ul>

          <h3>7. Hubungi Kami</h3>
          <p>Jika anda mempunyai sebarang pertanyaan mengenai keselamatan akaun atau pengendalian data anda, sila hubungi kami di:</p>
          <ul>
            <li>E-mel: <a href="mailto:aezad02@gmail.com">aezad02@gmail.com</a></li>
            <li>Telefon: <a href="tel:+60179846812">0179846812</a></li>
          </ul>
        </div>
      </details>
      <p className="registration-terms-note">Dengan meneruskan ke borang OnPay, anda mengakui terma ini.</p>
    </div>
  );
}
