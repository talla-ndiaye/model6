import React, { createContext, useContext, useState, useEffect } from 'react';
import { utilisateurs } from '../data/donneesTemporaires';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, motDePasse) => {
    try {
      const utilisateur = utilisateurs.find(
        u => u.email === email && u.motDePasse === motDePasse
      );

      if (utilisateur) {
        const { motDePasse: _, ...userWithoutPassword } = utilisateur;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        console.log('Connexion réussie:', userWithoutPassword);
        return { success: true, user: userWithoutPassword };
      } else {
        console.log('Échec de connexion: identifiants invalides');
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('Déconnexion effectuée');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};