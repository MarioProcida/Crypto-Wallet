import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import CryptoWalletViewer from './components/CryptoWalletViewer';

function App() {
  return (
    <ThemeProvider>
      <CryptoWalletViewer />
    </ThemeProvider>
  );
}

export default App;