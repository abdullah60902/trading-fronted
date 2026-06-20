import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'superadmin';
  isMobileVerified?: boolean;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  tempToken: string | null;
  twoFactorRequired: boolean;
  isAuthenticated: boolean;
}

const AUTH_STORAGE_KEY = 'authState';

const persistAuthState = (state: AuthState) => {
  if (typeof window === 'undefined') return;
  if (state.user && state.accessToken) {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: state.user, accessToken: state.accessToken })
    );
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem('refreshToken');
  }
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  tempToken: null,
  twoFactorRequired: false,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: UserInfo; accessToken: string }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.tempToken = null;
      state.twoFactorRequired = false;
      state.isAuthenticated = true;
      persistAuthState(state);
    },
    setUser(state, action: PayloadAction<UserInfo>) {
      state.user = action.payload;
      state.isAuthenticated = !!state.accessToken;
      persistAuthState(state);
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.isAuthenticated = !!state.user;
      persistAuthState(state);
    },
    setTempCredentials(state, action: PayloadAction<{ tempToken: string }>) {
      state.tempToken = action.payload.tempToken;
      state.twoFactorRequired = true;
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      persistAuthState(state);
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.tempToken = null;
      state.twoFactorRequired = false;
      state.isAuthenticated = false;
      persistAuthState(state);
    },
    updateUser(state, action: PayloadAction<Partial<UserInfo>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, setUser, setAccessToken, setTempCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
