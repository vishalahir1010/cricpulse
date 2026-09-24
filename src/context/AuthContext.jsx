import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase/firebaseConfig';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
          // Custom claims (e.g. role: 'admin') are NOT on the user object
          // itself — they only appear on the decoded ID token, and only
          // after getIdTokenResult() (optionally forcing a refresh so a
          // claim set moments ago by a Cloud Function isn't served stale).
          try {
            const tokenResult = await firebaseUser.getIdTokenResult();
            setIsAdmin(tokenResult.claims.role === 'admin');
          } catch {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }

        setAuthLoading(false);
      },
      () => setAuthLoading(false)
    );
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
