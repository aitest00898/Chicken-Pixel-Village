import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { firebaseAuth, firebaseFirestore, hasFirebaseConfig } from '../services/firebase';

const ADMIN_USERNAME = 'Aitest00898';
const ADMIN_EMAIL = 'aitest00898@gmail.com';

export function useAuthentication() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(!hasFirebaseConfig);

  useEffect(() => {
    if (!firebaseAuth) return;
    let active = true;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (next) => {
      setReady(false);
      setError(null);
      void (async () => {
        let admin = false;
        if (next && firebaseFirestore) admin = (await getDoc(doc(firebaseFirestore, 'admins', next.uid))).exists();
        if (!active) return;
        setUser(next);
        setIsAdmin(admin);
        setReady(true);
      })().catch(() => {
        if (!active) return;
        setUser(next);
        setIsAdmin(false);
        setError('無法驗證管理員權限。');
        setReady(true);
      });
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    if (!firebaseAuth || !firebaseFirestore) throw new Error('Firebase 管理員驗證尚未配置。');
    if (username.trim().toLocaleLowerCase() !== ADMIN_USERNAME.toLocaleLowerCase()) throw new Error('管理員帳號或密碼不正確。');
    const credential = await signInWithEmailAndPassword(firebaseAuth, ADMIN_EMAIL, password);
    const admin = (await getDoc(doc(firebaseFirestore, 'admins', credential.user.uid))).exists();
    if (!admin) {
      await firebaseSignOut(firebaseAuth);
      throw new Error('此帳號沒有管理員權限。');
    }
  }, []);

  const signOut = useCallback(async () => {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth);
  }, []);

  return {
    ready,
    configured: hasFirebaseConfig,
    userId: user?.uid ?? null,
    isAdmin: Boolean(user) && isAdmin,
    username: Boolean(user) && isAdmin ? ADMIN_USERNAME : null,
    error,
    signIn,
    signOut,
  };
}
