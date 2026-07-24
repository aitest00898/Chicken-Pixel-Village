import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { firebaseAuth, hasFirebaseConfig } from '../services/firebase';

export function useAuthentication() {
  const [user, setUser] = useState<User | null>(null);
  const [demoOwner, setDemoOwner] = useState(false);
  const [ready, setReady] = useState(!hasFirebaseConfig);

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, (next) => { setUser(next); setReady(true); });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!firebaseAuth) {
      setDemoOwner(true);
      return;
    }
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    setDemoOwner(false);
    if (firebaseAuth) await firebaseSignOut(firebaseAuth);
  }, []);

  return {
    ready,
    configured: hasFirebaseConfig,
    authenticated: Boolean(user) || demoOwner,
    userLabel: user?.email ?? (demoOwner ? '本機示範 Owner' : null),
    signIn,
    signOut,
  };
}
