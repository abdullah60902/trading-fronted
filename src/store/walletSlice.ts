import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletInfo {
  _id: string;
  currency: 'USD' | 'BTC' | 'ETH' | 'USDT';
  mainBalance: string;
  depositBalance: string;
  earningsBalance: string;
  withdrawalBalance: string;
  lockedBalance: string;
  depositAddress: string;
}

interface WalletState {
  wallets: WalletInfo[];
  selectedCurrency: 'USD' | 'BTC' | 'ETH' | 'USDT';
}

const initialState: WalletState = {
  wallets: [],
  selectedCurrency: 'USDT',
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallets(state, action: PayloadAction<WalletInfo[]>) {
      state.wallets = action.payload;
    },
    setSelectedCurrency(state, action: PayloadAction<'USD' | 'BTC' | 'ETH' | 'USDT'>) {
      state.selectedCurrency = action.payload;
    },
    clearWallets(state) {
      state.wallets = [];
    },
  },
});

export const { setWallets, setSelectedCurrency, clearWallets } = walletSlice.actions;
export default walletSlice.reducer;
