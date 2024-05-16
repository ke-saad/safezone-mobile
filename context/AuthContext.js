import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.token,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        userToken: action.token,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        userToken: null,
      };
    default:
      return state;
  }
};

const initialState = {
  isLoading: true,
  isSignout: false,
  userToken: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const restoreToken = async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        console.log('Token found:', userToken);
      } catch (e) {
        console.error('Failed to retrieve the token from storage.', e);
      }
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };
    restoreToken();
  }, []);

  const authActions = {
    signIn: async data => {
      await AsyncStorage.setItem('userToken', data.token);
      dispatch({ type: 'SIGN_IN', token: data.token });
    },
    signOut: async () => {
      await AsyncStorage.removeItem('userToken');
      dispatch({ type: 'SIGN_OUT' });
    },
  };

  console.log('Auth State:', state);

  return (
    <AuthContext.Provider value={{ ...state, ...authActions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
