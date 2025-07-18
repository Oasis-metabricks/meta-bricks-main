import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export const connectWallet = async () => {
  try {
    const { solana } = window;

    if (solana && solana.isPhantom) {
      console.log('Phantom wallet found!');
      const response = await solana.connect({ onlyIfTrusted: true });
      console.log('Connected with Public Key:', response.publicKey.toString());
      return response.publicKey;
    } else {
      alert('Phantom wallet not found! Please install it.');
      return null;
    }
  } catch (error) {
    console.error('Wallet connection error:', error);
  }
};

export const getProvider = () => {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  window.open("https://phantom.app/", "_blank");
};

export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
