import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      console.log('Tentando fazer login com:', email);
      
      // O login real é feito no backend, aqui apenas simulamos o estado
      setUser({ email, id: 'local-user' });
      
      console.log('Login bem-sucedido via backend');
    } catch (error) {
      console.error('Erro no signIn:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    try {
      setLoading(true);
      console.log('Tentando criar conta com:', email);
      
      // O cadastro real é feito no backend, aqui apenas simulamos o estado
      setUser({ email, id: 'local-user' });
      
      console.log('Cadastro bem-sucedido via backend');
    } catch (error) {
      console.error('Erro no signUp:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      console.log('Logout realizado');
    } catch (error) {
      console.error('Erro no signOut:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      console.log('Reset de senha solicitado para:', email);
      // Implementar quando necessário
    } catch (error) {
      console.error('Erro no resetPassword:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
