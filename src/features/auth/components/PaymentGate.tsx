import { useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { CreditCard, LoaderCircle, LogOut, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

import { db } from '../../../lib/firebase';

type PaymentGateProps = {
  user: User;
  onLogout: () => void;
  children: ReactNode;
};

const onPayUrl = import.meta.env.VITE_ONPAY_URL || 'https://promptly.onpay.my/';

export function PaymentGate({ user, onLogout, children }: PaymentGateProps) {
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => onSnapshot(
    doc(db, 'users', user.uid),
    (snapshot) => {
      setHasPaid(snapshot.exists() && snapshot.data().hasPaid === true);
      setError('');
    },
    () => {
      setHasPaid(false);
      setError('Status bayaran tidak dapat disemak. Cuba semula sebentar lagi.');
    },
  ), [user.uid, refreshKey]);

  if (hasPaid === true) return children;

  if (hasPaid === null) {
    return (
      <main className="auth-loading" aria-label="Memeriksa status bayaran">
        <LoaderCircle className="spin" size={22} />
        <p>Memeriksa status bayaran...</p>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card payment-card" aria-labelledby="payment-title">
        <a className="brand auth-brand" href="/" aria-label="Prompt AI Convert Sale">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>Prompt AI<span className="brand-dot">.</span></span>
        </a>
        <div className="payment-icon"><ShieldCheck size={27} /></div>
        <div className="auth-heading">
          <span>Akses belum aktif</span>
          <h1 id="payment-title">Sahkan bayaran.</h1>
          <p>Buat bayaran melalui OnPay menggunakan e-mel yang sama seperti akaun ini:</p>
        </div>
        <p className="payment-email">{user.email}</p>
        {error && <p className="auth-message error" role="status">{error}</p>}
        <a className="auth-submit payment-button" href={onPayUrl} target="_blank" rel="noreferrer">
          <CreditCard size={18} /> Bayar melalui OnPay
        </a>
        <button className="payment-secondary" type="button" onClick={() => { setHasPaid(null); setRefreshKey((value) => value + 1); }}>
          <RefreshCw size={15} /> Saya sudah bayar — semak semula
        </button>
        <button className="payment-secondary" type="button" onClick={onLogout}>
          <LogOut size={15} /> Log keluar
        </button>
      </section>
    </main>
  );
}
