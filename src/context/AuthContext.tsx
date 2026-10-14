import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

interface AuthContextData {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Monitora o estado da sessão do Firebase para persistência automática
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    async function signIn(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    async function signUp(email: string, password: string, name: string) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: name,
        });
        // Atualiza o estado local do usuário com o novo perfil
        setUser({ ...userCredential.user, displayName: name });
    }

    async function signOutUser() {
        await signOut(auth);
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}