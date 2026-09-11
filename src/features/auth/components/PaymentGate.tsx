import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { reload, sendEmailVerification, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { CreditCard, LoaderCircle, LogOut, MailCheck, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

import { db } from '../../../lib/firebase';
import { ThemeToggle } from '../../../components/ui/ThemeToggle';

type PaymentGateProps = {
  user: User;
  onLogout: () => void;
  children: ReactNode;
};

const onPayUrl = import.meta.env.VITE_ONPAY_URL || 'https://promptly.onpay.my/order/form/1';

export function PaymentGate({ user, onLogout, children }: PaymentGateProps) {
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(user.emailVerified);
  const [isClaiming, setIsClaiming] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const didAutoClaim = useRef(false);

  const claimPendingPayment = useCallback(async (showNoPaymentMessage = false) => {
    setIsClaiming(true);
    setMessage(null);
    try {
      await reload(user);
      setIsEmailVerified(user.emailVerified);
      if (!user.emailVerified) {
        setMessage({ type: 'error', text: 'Sahkan alamat e-mel anda dahulu sebelum menuntut bayaran.' });
        return;
      }

      const idToken = await user.getIdToken(true);
      const response = await fetch('/api/claim-payment', {
        method: 'POST',
        headers: { authorization: `Bearer ${idToken}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.reason || result.error || 'claim_failed');
      if (result.claimed) {
        setMessage({ type: 'success', text: 'Bayaran dijumpai. Akses anda sedang diaktifkan.' });
      } else if (showNoPaymentMessage) {
        setMessage({ type: 'error', text: 'Belum ada bayaran OnPay yang sepadan dengan e-mel ini.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Status bayaran tidak dapat disemak. Cuba semula sebentar lagi.' });
    } finally {
      setIsClaiming(false);
    }
  }, [user]);

  useEffect(() => onSnapshot(
    doc(db, 'users', user.uid),
    (snapshot) => setHasPaid(snapshot.exists() && snapshot.data().hasPaid === true),
    () => {
      setHasPaid(false);
      setMessage({ type: 'error', text: 'Status bayaran tidak dapat dibaca. Cuba semula sebentar lagi.' });
    },
  ), [user.uid]);

  useEffect(() => {
    if (hasPaid === false && isEmailVerified && !didAutoClaim.current) {
      didAutoClaim.current = true;
      void claimPendingPayment(false);
    }
  }, [claimPendingPayment, hasPaid, isEmailVerified]);

  async function resendVerification() {
    setMessage(null);
    try {
      await sendEmailVerification(user);
      setMessage({ type: 'success', text: 'E-mel pengesahan baharu telah dihantar. Semak peti masuk dan folder spam.' });
    } catch {
      setMessage({ type: 'error', text: 'E-mel belum dapat dihantar. Tunggu sebentar dan cuba lagi.' });
    }
  }

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
      <ThemeToggle />
      <div className="auth-glow" aria-hidden="true" />
      <section className="auth-card payment-card" aria-labelledby="payment-title">
        <a className="brand auth-brand" href="/" aria-label="Prompt AI Convert Sale">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>Prompt AI<span className="brand-dot">.</span></span>
        </a>
        <div className="payment-icon">{isEmailVerified ? <ShieldCheck size={27} /> : <MailCheck size={27} />}</div>
        <div className="auth-heading">
          <span>{isEmailVerified ? 'Akses belum aktif' : 'Pengesahan diperlukan'}</span>
          <h1 id="payment-title">{isEmailVerified ? 'Sahkan bayaran.' : 'Semak e-mel anda.'}</h1>
          <p>{isEmailVerified
            ? 'Kami akan padankan akaun ini dengan bayaran OnPay menggunakan e-mel berikut:'
            : 'Klik pautan pengesahan Firebase yang dihantar kepada e-mel berikut. Ini melindungi bayaran anda daripada dituntut orang lain.'}</p>
        </div>
        <p className="payment-email">{user.email}</p>
        {message && <p className={`auth-message ${message.type}`} role="status">{message.text}</p>}

        {isEmailVerified ? (
          <>
            <a className="auth-submit payment-button" href={onPayUrl} target="_blank" rel="noreferrer">
              <CreditCard size={18} /> Bayar melalui OnPay
            </a>
            <button className="payment-secondary" type="button" disabled={isClaiming} onClick={() => claimPendingPayment(true)}>
              {isClaiming ? <LoaderCircle className="spin" size={15} /> : <RefreshCw size={15} />}
              {isClaiming ? 'Sedang menyemak...' : 'Saya sudah bayar — semak semula'}
            </button>
          </>
        ) : (
          <>
            <button className="auth-submit payment-button" type="button" onClick={() => claimPendingPayment(false)}>
              <MailCheck size={18} /> Saya sudah sahkan e-mel
            </button>
            <button className="payment-secondary" type="button" onClick={resendVerification}>
              Hantar semula e-mel pengesahan
            </button>
          </>
        )}

        <button className="payment-secondary" type="button" onClick={onLogout}>
          <LogOut size={15} /> Log keluar
        </button>
      </section>
    </main>
  );
}
