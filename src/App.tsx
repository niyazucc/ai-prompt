import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { LoaderCircle, Sparkles } from 'lucide-react';

import { LoginPage } from './features/auth/components/LoginPage';
import { PaymentGate } from './features/auth/components/PaymentGate';
import { PromptBuilder } from './features/prompt-builder/components/PromptBuilder';
import { auth } from './lib/firebase';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setIsAuthLoading(false);
  }), []);

  if (isAuthLoading) {
    return (
      <main className="auth-loading" aria-label="Memeriksa sesi pengguna">
        <span className="brand-mark"><Sparkles size={18} /></span>
        <LoaderCircle className="spin" size={22} />
        <p>Memeriksa akses...</p>
      </main>
    );
  }

  if (!user) return <LoginPage />;

  const userName = user.displayName?.trim() || user.email?.split('@')[0] || 'Pengguna';
  return (
    <PaymentGate user={user} onLogout={() => signOut(auth)}>
      <PromptBuilder userName={userName} onLogout={() => signOut(auth)} />
    </PaymentGate>
  );
}
