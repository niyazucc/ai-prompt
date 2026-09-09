import { useState, type FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, deleteUser, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, Sparkles, UserRound } from 'lucide-react';

import { auth, db } from '../../../lib/firebase';

interface SignUpProps {
  onLogin: () => void;
}

function getSignUpError(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/email-already-in-use') return 'E-mel ini sudah didaftarkan. Sila log masuk.';
    if (error.code === 'auth/weak-password') return 'Kata laluan mesti sekurang-kurangnya 6 aksara.';
    if (error.code === 'auth/invalid-email') return 'Alamat e-mel tidak sah.';
    if (error.code === 'auth/network-request-failed') return 'Sambungan internet bermasalah. Sila cuba semula.';
  }
  return 'Pendaftaran tidak dapat diproses. Sila cuba semula.';
}

export function SignUp({ onLogin }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Kata laluan dan pengesahan kata laluan tidak sama.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const displayName = name.trim();

      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }

      await setDoc(doc(db, 'users', credential.user.uid), {
        email: credential.user.email,
        name: displayName,
        phone: phone.trim(),
        hasPaid: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      if (auth.currentUser && auth.currentUser.email === email.trim()) {
        await deleteUser(auth.currentUser).catch(() => undefined);
      }
      setMessage({ type: 'error', text: getSignUpError(error) });
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="signup-title">
        <a className="brand auth-brand" href="/" aria-label="Prompt AI Convert Sale">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>Prompt AI<span className="brand-dot">.</span></span>
        </a>
        <div className="auth-heading">
          <span>Akaun baru</span>
          <h1 id="signup-title">Daftar akaun.</h1>
          <p>Cipta akaun dahulu. Akses premium akan terbuka selepas bayaran OnPay disahkan.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="signup-name">Nama</label>
            <div><UserRound size={17} aria-hidden="true" /><input id="signup-name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama anda" required /></div>
          </div>
          <div className="auth-field">
            <label htmlFor="signup-email">Alamat e-mel</label>
            <div><Mail size={17} aria-hidden="true" /><input id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required /></div>
          </div>
          <div className="auth-field">
            <label htmlFor="signup-phone">Nombor telefon</label>
            <div><Phone size={17} aria-hidden="true" /><input id="signup-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Contoh: 0123456789" required /></div>
          </div>
          <div className="auth-field">
            <label htmlFor="signup-password">Kata laluan</label>
            <div>
              <LockKeyhole size={17} aria-hidden="true" />
              <input id="signup-password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minima 6 aksara" required minLength={6} />
              <button type="button" onClick={() => setIsPasswordVisible((value) => !value)} aria-label={isPasswordVisible ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}>{isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="signup-confirm">Sahkan kata laluan</label>
            <div><LockKeyhole size={17} aria-hidden="true" /><input id="signup-confirm" type={isPasswordVisible ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Ulang kata laluan" required minLength={6} /></div>
          </div>

          {message && <p className={`auth-message ${message.type}`} role="status">{message.text}</p>}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={17} />}
            {isSubmitting ? 'Mendaftar...' : 'Daftar akaun'}
          </button>
          <button className="forgot-button" type="button" onClick={onLogin}>Sudah ada akaun? Log masuk</button>
        </form>
      </section>
    </main>
  );
}
