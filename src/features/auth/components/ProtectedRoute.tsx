import { useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { AlertCircle, CreditCard, LoaderCircle, LogOut, Sparkles } from 'lucide-react';

import { db } from '../../../lib/firebase';

interface ProtectedRouteProps {
  user: User;
  children: ReactNode;
  onLogout: () => Promise<void>;
}

interface UserProfile {
  hasPaid?: boolean;
}

export function ProtectedRoute({ user, children, onLogout }: ProtectedRouteProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [error, setError] = useState('');
  const paymentUrl = import.meta.env.VITE_ONPAY_PAYMENT_URL?.trim() || 'https://promptly.onpay.my/';

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() as UserProfile : null);
        setIsProfileLoading(false);
      },
      () => {
        setError('Profil pengguna tidak dapat dibaca. Sila cuba semula.');
        setIsProfileLoading(false);
      },
    );

    return unsubscribe;
  }, [user.uid]);

  function handlePayment() {
    setError('');
    if (!paymentUrl) {
      setError('Pautan pembayaran OnPay belum ditetapkan. Hubungi admin.');
      return;
    }

    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  }

  if (isProfileLoading) {
    return (
      <main className="auth-loading" aria-label="Memeriksa status bayaran">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <LoaderCircle className="spin" size={22} />
        <p>Memeriksa status premium...</p>
      </main>
    );
  }

  if (profile?.hasPaid) return children;

  return (
    <main className="payment-gate">
      <section className="payment-panel" aria-labelledby="payment-title">
        <div className="payment-header">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <button className="logout-button" type="button" onClick={() => void onLogout()}><LogOut size={14} /> Logout</button>
        </div>
        <span className="payment-kicker">Prompt AI Convert Sale</span>
        <h1 id="payment-title">Aktifkan akses premium.</h1>
        <p>Akaun anda sudah didaftarkan. Lengkapkan bayaran melalui OnPay untuk membuka semua prompt builder.</p>
        <p className="payment-email-note">Gunakan e-mel yang sama semasa membuat bayaran: <strong>{user.email}</strong></p>

        {error && <div className="payment-error" role="alert"><AlertCircle size={16} /> {error}</div>}

        <button className="auth-submit payment-button" type="button" onClick={handlePayment}>
          <CreditCard size={18} />
          Bayar dengan OnPay
        </button>
        <p className="auth-footnote">Halaman OnPay akan dibuka dalam tab baharu. Selepas jualan disahkan, halaman ini akan membuka akses secara automatik.</p>
      </section>
    </main>
  );
}
