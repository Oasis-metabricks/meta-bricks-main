import { Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getProvider } from './web3Provider';

export const purchaseNFT = async (nftPublicKey, buyerPublicKey) => {
  const provider = getProvider();
  if (!provider) return;

  try {
    const transaction = new Transaction();
    // Add instructions to the transaction
    // Example: transaction.add(SystemProgram.transfer({fromPubkey: buyerPublicKey, toPubkey: nftPublicKey, lamports: 1000}));

    const signature = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [provider.publicKey], // The signer
    );
    console.log('Transaction successful with signature:', signature);
    return signature;
  } catch (error) {
    console.error('Failed to send transaction:', error);
  }
};
