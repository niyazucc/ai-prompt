import { useState, type FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { CreditCard, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';

import { auth } from '../../../lib/firebase';
import { RegistrationTerms } from './RegistrationTerms';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';

const onPayUrl = import.meta.env.VITE_ONPAY_URL || 'https://promptly.onpay.my/order/form/1';

function getLoginError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/invalid-email') return 'Alamat e-mel tidak sah.';
    if (error.code === 'auth/too-many-requests') return 'Terlalu banyak cubaan. Sila cuba semula sebentar lagi.';
    if (error.code === 'auth/network-request-failed') return 'Sambungan internet bermasalah. Sila cuba semula.';
  }
  return 'E-mel atau kata laluan tidak sah.';
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
    } catch (error) {
      setMessage({ type: 'error', text: getLoginError(error) });
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Masukkan alamat e-mel anda dahulu.' });
      return;
    }
    setMessage(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage({ type: 'success', text: 'Pautan tetapan semula kata laluan telah dihantar jika akaun tersebut wujud.' });
    } catch {
      setMessage({ type: 'error', text: 'Permintaan tidak dapat diproses. Sila cuba semula.' });
    }
  }

  return (
    <main className="auth-page">
      <ThemeToggle />
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="login-title">
        <a className="brand auth-brand" href="/" aria-label="Promptly Tool">
          <img className="brand-icon" src="/images/logo-promptly-icon.png" alt="" />
          <span>Promptly Tool<span className="brand-dot">.</span></span>
        </a>
        <div className="auth-heading">
          <span>Portal ahli</span>
          <h1 id="login-title">Selamat kembali.</h1>
          <p>Selepas bayaran disahkan, log masuk menggunakan e-mel dan kata laluan yang anda masukkan dalam borang OnPay.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Alamat e-mel</label>
            <div><Mail size={17} aria-hidden="true" /><input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required /></div>
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Kata laluan</label>
            <div>
              <LockKeyhole size={17} aria-hidden="true" />
              <input id="login-password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata laluan" required />
              <button type="button" onClick={() => setIsPasswordVisible((value) => !value)} aria-label={isPasswordVisible ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}>{isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </div>

          {message && <p className={`auth-message ${message.type}`} role="status">{message.text}</p>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={17} />}
            {isSubmitting ? 'Sedang diproses...' : 'Log masuk'}
          </button>
          <button className="forgot-button" type="button" onClick={handlePasswordReset}>Lupa atau belum tetapkan kata laluan?</button>
        </form>

        <div className="auth-purchase">
          <p>Belum ada akaun? Isi borang OnPay dan buat bayaran. Akaun akan dicipta selepas penjual mengesahkan bayaran.</p>
          <a className="auth-submit" href={onPayUrl} target="_blank" rel="noreferrer"><CreditCard size={17} /> Daftar & bayar melalui OnPay</a>
        </div>
        <RegistrationTerms />
      </section>
    </main>
  );
}
