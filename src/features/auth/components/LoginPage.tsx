import { useState, type FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';

import { auth, db } from '../../../lib/firebase';

function getLoginError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/email-already-in-use') return 'Akaun dengan e-mel ini sudah wujud. Sila log masuk.';
    if (error.code === 'auth/weak-password') return 'Kata laluan mestilah sekurang-kurangnya 6 aksara.';
    if (error.code === 'auth/invalid-email') return 'Alamat e-mel tidak sah.';
    if (error.code === 'auth/too-many-requests') return 'Terlalu banyak cubaan. Sila cuba semula sebentar lagi.';
    if (error.code === 'auth/network-request-failed') return 'Sambungan internet bermasalah. Sila cuba semula.';
  }
  return 'E-mel atau kata laluan tidak sah.';
}

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (mode === 'register') {
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(credential.user, { displayName: name.trim() });
        await setDoc(doc(db, 'users', credential.user.uid), {
          email: normalizedEmail,
          name: name.trim(),
          hasPaid: false,
          createdAt: serverTimestamp(),
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
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
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="login-title">
        <a className="brand auth-brand" href="/" aria-label="Prompt AI Convert Sale">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>Prompt AI<span className="brand-dot">.</span></span>
        </a>
        <div className="auth-heading">
          <span>{mode === 'login' ? 'Portal ahli' : 'Daftar akaun'}</span>
          <h1 id="login-title">{mode === 'login' ? 'Selamat kembali.' : 'Mulakan akses.'}</h1>
          <p>{mode === 'login' ? 'Log masuk menggunakan akaun anda. Akses hanya dibuka selepas bayaran disahkan.' : 'Daftar dahulu, kemudian buat bayaran OnPay menggunakan e-mel yang sama.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="register-name">Nama</label>
              <div><UserRound size={17} aria-hidden="true" /><input id="register-name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama penuh" required /></div>
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="login-email">Alamat e-mel</label>
            <div><Mail size={17} aria-hidden="true" /><input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required /></div>
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Kata laluan</label>
            <div>
              <LockKeyhole size={17} aria-hidden="true" />
              <input id="login-password" type={isPasswordVisible ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata laluan" required />
              <button type="button" onClick={() => setIsPasswordVisible((value) => !value)} aria-label={isPasswordVisible ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}>{isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </div>

          {message && <p className={`auth-message ${message.type}`} role="status">{message.text}</p>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={17} />}
            {isSubmitting ? 'Sedang diproses...' : mode === 'login' ? 'Log masuk' : 'Daftar & teruskan'}
          </button>
          {mode === 'login' && <button className="forgot-button" type="button" onClick={handlePasswordReset}>Lupa kata laluan?</button>}
        </form>

        <p className="auth-footnote">
          {mode === 'login' ? 'Belum ada akaun?' : 'Sudah ada akaun?'}{' '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(null); }}>
            {mode === 'login' ? 'Daftar di sini' : 'Log masuk'}
          </button>
        </p>
      </section>
    </main>
  );
}
