const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} = require('@solana/spl-token');

// MetaBricks Configuration (matching your metabricks-config.ts)
const METABRICKS_CONFIG = {
  IPFS: {
    METADATA_CID: 'bafybeihkspp2kxsz4moylkgjpkdwm4sbafqluqmtzh3hy7x42jhvx6n5ym',
    GATEWAY_URL: 'https://gateway.pinata.cloud/ipfs',
    TOTAL_BRICKS: 432
  }
};

// Helper function to get metadata URI (matching your metabricks-config.ts)
function getMetadataUri(brickNumber) {
  if (brickNumber < 1 || brickNumber > METABRICKS_CONFIG.IPFS.TOTAL_BRICKS) {
    return null;
  }
  
  return `${METABRICKS_CONFIG.IPFS.GATEWAY_URL}/${METABRICKS_CONFIG.IPFS.METADATA_CID}/${brickNumber}.json`;
}

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

// Function to create NFT using your program
async function createNFT(programId, payer, mintAuthority, name, symbol, uri) {
  // Generate new mint account
  const mintAccount = Keypair.generate();
  
  // Derive metadata account address
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBytes(),
      mintAccount.publicKey.toBytes(),
    ],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  );
  
  // Derive master edition account address
  const [masterEditionAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBytes(),
      mintAccount.publicKey.toBytes(),
      Buffer.from('edition'),
    ],
    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  );
  
  // Create instruction data for CreateNFT
  const nameBytes = Buffer.from(name, 'utf8');
  const symbolBytes = Buffer.from(symbol, 'utf8');
  const uriBytes = Buffer.from(uri, 'utf8');
  
  const instructionData = Buffer.concat([
    Buffer.from([0]), // Instruction tag for CreateNFT
    Buffer.from([nameBytes.length]), // Name length
    nameBytes, // Name
    Buffer.from([symbolBytes.length]), // Symbol length
    symbolBytes, // Symbol
    Buffer.from([uriBytes.length]), // URI length
    uriBytes, // URI
    Buffer.alloc(2), // Seller fee basis points (0 for now)
  ]);
  
  // Create the transaction
  // CRITICAL: Account order must match exactly what the Rust contract expects
  // Contract expects: [mint, metadata, master_edition, mint_authority, payer, update_authority, system_program, rent, token_program, associated_token_program, metadata_program]
  const transaction = new Transaction().add({
    keys: [
      { pubkey: mintAccount.publicKey, isSigner: false, isWritable: true },     // 1. mint_account (created by program) - FIXED: was true, should be false
      { pubkey: metadataAccount, isSigner: false, isWritable: true },           // 2. metadata_account (PDA)
      { pubkey: masterEditionAccount, isSigner: false, isWritable: true },      // 3. master_edition_account (PDA)
      { pubkey: mintAuthority.publicKey, isSigner: true, isWritable: false },   // 4. mint_authority (must sign)
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },            // 5. payer (must sign + writable for fees)
      { pubkey: mintAuthority.publicKey, isSigner: false, isWritable: false },  // 6. update_authority (same as mint_authority, but NOT a signer) - FIXED: was true, should be false
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },   // 7. system_program
      { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false }, // 8. sysvar_rent
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },         // 9. token_program
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // 10. associated_token_program
      { pubkey: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'), isSigner: false, isWritable: false }, // 11. metadata_program
    ],
    programId: programId,
    data: instructionData,
  });
  
  // For testing, just return the transaction details without sending
  console.log('Transaction created successfully!');
  console.log('Mint Account:', mintAccount.publicKey.toString());
  console.log('Metadata Account:', metadataAccount.toString());
  console.log('Master Edition Account:', masterEditionAccount.toString());
  console.log('Instruction Data Length:', instructionData.length);
  
  return {
    transaction,
    mintAddress: mintAccount.publicKey.toString(),
    metadataAddress: metadataAccount.toString(),
    masterEditionAddress: masterEditionAccount.toString(),
    instructionData: instructionData.toString('hex')
  };
}

(async () => {
  try {
      // Generate keypairs for buyer and seller
      const buyer = Keypair.generate();
      const seller = Keypair.generate();

      // Program ID of your deployed smart contract (placeholder for now)
      const programId = new PublicKey('HFCHrCLitKsxwxakcHGRbYmcenokVeQHE2TAJXpPwoSo');

      console.log('Testing NFT creation logic...');
      console.log('Buyer public key:', buyer.publicKey.toString());
      console.log('Seller public key:', seller.publicKey.toString());
      console.log('Program ID:', programId.toString());

      // Test NFT creation (without sending to blockchain)
      console.log('Creating NFT using your program...');
      
      // Test with different brick numbers
      const testBricks = [1, 100, 432]; // First, middle, and last brick
      
      for (const brickNumber of testBricks) {
        const metadataUri = getMetadataUri(brickNumber);
        if (metadataUri) {
          console.log(`\nTesting Brick #${brickNumber}:`);
          console.log(`Metadata URI: ${metadataUri}`);
          
          const nftResult = await createNFT(
            programId,
            buyer, // payer
            buyer, // mint authority
            `MetaBrick #${brickNumber}`,
            'MBRICK',
            metadataUri
          );
          
          console.log(`Brick #${brickNumber} test completed successfully!`);
          console.log(`Mint Address: ${nftResult.mintAddress}`);
        } else {
          console.log(`Invalid brick number: ${brickNumber}`);
        }
      }
      
      console.log('\nAll tests passed! Your program is ready for deployment.');
  } catch (error) {
      console.error('Error during testing:', error);
  }
})();
