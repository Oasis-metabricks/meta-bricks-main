const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} = require('@solana/web3.js');

// Function to perform exponential backoff
async function exponentialBackoff(fn, retries = 5, delay = 500) {
  for (let i = 0; i < retries; i++) {
      try {
          return await fn();
      } catch (error) {
          if (i < retries - 1) {
              console.error(`Server responded with ${error.message}. Retrying after ${delay}ms delay...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
          } else {
              throw error;
          }
      }
  }
}

const connection = new Connection('https://api.devnet.solana.com');

(async () => {
  try {
      // Generate keypairs for buyer and seller
      const buyer = Keypair.generate();
      const seller = Keypair.generate();

      // Program ID of your deployed smart contract
      const programId = new PublicKey('5asLfkbBXe3N8sJ8JQfRuSGxUJHhMGjnY2hRyqcJSuaW'); // Replace with your program ID

      // Airdrop SOL to buyer and seller for testing
      console.log('Requesting airdrop for buyer...');
      await exponentialBackoff(() => connection.requestAirdrop(buyer.publicKey, 1e9)); // 2 SOL for buyer
      console.log('Requesting airdrop for seller...');
      await exponentialBackoff(() => connection.requestAirdrop(seller.publicKey, 1e9)); // 2 SOL for seller

      // Wait for the airdrops to complete
      await new Promise(resolve => setTimeout(resolve, 10000)); // Increased delay to ensure airdrop completion

      // Create a transaction to transfer SOL from buyer to seller
      const transaction = new Transaction().add(
          SystemProgram.transfer({
              fromPubkey: buyer.publicKey,
              toPubkey: seller.publicKey,
              lamports: 1e9, // Transfer 1 SOL
          })
      );

      // Send and confirm the transaction
      const signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [buyer]
      );

      console.log('Transaction successful with signature:', signature);
  } catch (error) {
      console.error('Error performing transaction:', error);
  }
})();
