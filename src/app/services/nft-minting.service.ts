import { Injectable } from '@angular/core';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair 
} from '@solana/web3.js';
import { WalletService } from './wallet.service';
import { getMetadataUri } from '../components/metabricks-nfts/metabricks-config';
import { MintLayout, createInitializeMintInstruction } from '@solana/spl-token';

// Extend Window interface to include solana property
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      signTransaction?: (transaction: Transaction) => Promise<Transaction>;
      signAndSendTransaction?: (transaction: Transaction) => Promise<string>;
      connect?: () => Promise<any>;
      disconnect?: () => Promise<void>;
      isConnected?: boolean;
      publicKey?: PublicKey;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class NftMintingService {
  private connection: Connection;
  private readonly PROGRAM_ID = new PublicKey('HFCHrCLitKsxwxakcHGRbYmcenokVeQHE2TAJXpPwoSo');
  // Updated to use the correct Metaplex Token Metadata program ID for devnet
  private readonly METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  private readonly TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  // Updated to use the correct Associated Token Account program ID
  private readonly ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

  constructor(private walletService: WalletService) {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  }

  // Method to try alternative RPC endpoints
  private async tryAlternativeRPC(): Promise<Connection | null> {
    const rpcEndpoints = [
      'https://api.devnet.solana.com',
      'https://solana-devnet.g.alchemy.com/v2/demo',
      'https://devnet.genesysgo.net',
      'https://rpc.ankr.com/solana_devnet'
    ];
    
    for (const endpoint of rpcEndpoints) {
      try {
        console.log(`Trying RPC endpoint: ${endpoint}`);
        const testConnection = new Connection(endpoint, 'confirmed');
        const version = await testConnection.getVersion();
        console.log(`✅ RPC endpoint ${endpoint} working, version:`, version);
        return testConnection;
      } catch (error) {
        console.log(`❌ RPC endpoint ${endpoint} failed:`, error);
        continue;
      }
    }
    
    console.error('All alternative RPC endpoints failed');
    return null;
  }

  // Test method to verify basic connectivity
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Solana connection...');
      
      // Test basic connection
      const version = await this.connection.getVersion();
      console.log('Solana version:', version);
      
      // Test program access
      const programInfo = await this.connection.getAccountInfo(this.PROGRAM_ID);
      if (!programInfo) {
        console.error('Program not found on devnet');
        return false;
      }
      console.log('Program found, size:', programInfo.data.length);
      
      // Test wallet connection
      const wallet = await this.walletService.checkWalletConnected();
      if (!wallet) {
        console.error('Wallet not connected');
        return false;
      }
      console.log('Wallet connected:', wallet.toString());
      
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Test method to verify basic transaction signing with Phantom
  async testBasicTransaction(): Promise<boolean> {
    try {
      console.log('Testing basic transaction signing with Phantom...');
      
      const wallet = await this.walletService.checkWalletConnected();
      if (!wallet) {
        throw new Error('Wallet not connected');
      }
      
      if (!window.solana?.isConnected) {
        throw new Error('Phantom wallet is not connected');
      }
      
      // Create a simple transfer transaction to test basic signing
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet,
          toPubkey: wallet, // Transfer to self (no-op)
          lamports: 0, // 0 lamports (no-op)
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet;
      
              console.log('Testing simple transfer transaction...');
        console.log('Transaction fee payer:', transaction.feePayer?.toString());
        console.log('Transaction has blockhash:', !!transaction.recentBlockhash);
      
      try {
        // Try to sign the simple transaction
        if (!window.solana?.signTransaction) {
          throw new Error('Phantom signTransaction method not available');
        }
        
        const signedTransaction = await window.solana.signTransaction(transaction);
        console.log('✅ Basic transaction signing test passed');
        
        // Don't actually send it, just verify signing works
        return true;
        
      } catch (signError: any) {
        console.error('Basic transaction signing test failed:', signError);
        return false;
      }
      
    } catch (error) {
      console.error('Basic transaction test failed:', error);
      return false;
    }
  }

  async mintMetaBrickNFT(brickNumber: number): Promise<string> {
    try {
      const wallet = await this.walletService.checkWalletConnected();
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      // Verify the program exists
      console.log('Verifying program exists...');
      const programInfo = await this.connection.getAccountInfo(this.PROGRAM_ID);
      if (!programInfo) {
        throw new Error(`Program ${this.PROGRAM_ID.toString()} not found on devnet`);
      }
      console.log('Program verified successfully');

      // Check if we're on desktop with Phantom wallet
      if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
        return await this.mintWithPhantomWallet(brickNumber, wallet);
      } else {
        // Fallback for mobile or other wallets
        return await this.mintWithFallback(brickNumber, wallet);
      }

    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  private async mintWithPhantomWallet(brickNumber: number, wallet: PublicKey): Promise<string> {
    try {
      console.log('Using Phantom wallet for minting...');
      
      // The contract will create and initialize the mint account
      // We need to derive the expected addresses for PDAs
      // For now, we'll use a placeholder that the contract will replace
      const placeholderMint = PublicKey.findProgramAddressSync(
        [Buffer.from('mint'), wallet.toBuffer()],
        this.PROGRAM_ID
      )[0];
      
      // Derive PDAs for metadata and master edition
      const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          this.METADATA_PROGRAM_ID.toBuffer(),
          placeholderMint.toBuffer(),
        ],
        this.METADATA_PROGRAM_ID
      );

      const [masterEditionAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          this.METADATA_PROGRAM_ID.toBuffer(),
          placeholderMint.toBuffer(),
        ],
        this.METADATA_PROGRAM_ID
      );

      console.log('=== PDA DERIVATION DEBUG ===');
      console.log('Metadata account derived:', metadataAccount.toBase58());
      console.log('Master edition account derived:', masterEditionAccount.toBase58());

      // Get the metadata URI for this brick
      const metadataUri = getMetadataUri(brickNumber);
      if (!metadataUri) {
        throw new Error('Invalid brick number');
      }
      console.log('Metadata URI:', metadataUri);

      // Create instruction data for the contract
      const instructionData = this.createCreateNFTInstructionData(
        `MetaBrick #${brickNumber}`,
        'MBRICK',
        metadataUri,
        500 // 5% royalty
      );

      // Create the transaction
      const transaction = new Transaction();
      
      // Add the contract instruction
      transaction.add({
        keys: [
          { pubkey: placeholderMint, isSigner: false, isWritable: true }, // NOT a signer - created by program
          { pubkey: metadataAccount, isSigner: false, isWritable: true },
          { pubkey: masterEditionAccount, isSigner: false, isWritable: true },
          { pubkey: wallet, isSigner: true, isWritable: false }, // mint authority
          { pubkey: wallet, isSigner: true, isWritable: true },  // payer
          { pubkey: wallet, isSigner: false, isWritable: false }, // update authority (same as mint_authority, but NOT a signer)
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          { pubkey: this.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: this.ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: this.METADATA_PROGRAM_ID, isSigner: false, isWritable: false }, // ADDED: metadata program
        ],
        programId: this.PROGRAM_ID,
        data: instructionData,
      });

      // Set the fee payer
      transaction.feePayer = wallet;
      console.log('Setting fee payer as wallet:', wallet.toBase58());

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // NOTE: We don't need to sign with mintAccount since it's created by the program
      // The mint account is marked as isSigner: false in the instruction keys
      
      console.log('Using signAndSendTransaction method...');
      
      // Debug: Log the complete transaction details
      console.log('=== TRANSACTION DEBUG INFO ===');
      console.log('Transaction fee payer:', transaction.feePayer?.toBase58());
      console.log('Transaction recent blockhash:', transaction.recentBlockhash);
      
      // Log all accounts that require signatures
      const signers = transaction.instructions.flatMap(instruction =>
        instruction.keys.filter(key => key.isSigner).map(key => key.pubkey.toBase58())
      );
      console.log('Accounts requiring signatures:', signers);
      
      // Verify wallet connection
      if (!window.solana?.isConnected) {
        throw new Error('Phantom wallet not connected');
      }
      
      if (!window.solana.publicKey?.equals(wallet)) {
        throw new Error('Connected wallet does not match expected wallet');
      }
      
      console.log('Wallet connection verified, proceeding with transaction signing...');
      
      // Final validation before sending
      console.log('Final transaction validation:');
      console.log('- Has recent blockhash:', !!transaction.recentBlockhash);
      console.log('- Has fee payer:', !!transaction.feePayer);
      console.log('- Has instructions:', transaction.instructions.length > 0);
      
      // Ensure the wallet is marked as a signer in at least one instruction
      const walletIsSigner = transaction.instructions.some(instruction =>
        instruction.keys.some(key => key.isSigner && key.pubkey.equals(wallet))
      );
      
      if (!walletIsSigner) {
        throw new Error('Wallet is not marked as a signer in any instruction');
      }
      
      console.log('✅ Wallet signature requirement verified');
      
      // Try to serialize the transaction to catch any formatting errors
      try {
        const serialized = transaction.serialize({ requireAllSignatures: false });
        console.log('Transaction serialization successful, length:', serialized.length);
      } catch (serializeError) {
        console.error('Transaction serialization failed:', serializeError);
        throw new Error(`Transaction serialization failed: ${serializeError}`);
      }
      
      // Check transaction size before sending
      try {
        const serializedSize = transaction.serialize({ requireAllSignatures: false }).length;
        console.log('Transaction serialized size:', serializedSize, 'bytes');
        
        if (serializedSize > 1200) {
          console.warn('⚠️ Transaction size is large:', serializedSize, 'bytes');
        }
      } catch (sizeError) {
        console.warn('Could not determine transaction size:', sizeError);
      }
      
      // Try alternative approach: use signTransaction + sendRawTransaction instead of signAndSendTransaction
      console.log('Attempting alternative transaction signing approach...');
      
      try {
        // First try to sign the transaction
        console.log('Step 1: Signing transaction with Phantom...');
        if (!window.solana?.signTransaction) {
          throw new Error('Phantom signTransaction method not available');
        }
        const signedTransaction = await window.solana.signTransaction(transaction);
        console.log('✅ Transaction signed successfully');
        
        // Then send the signed transaction
        console.log('Step 2: Sending signed transaction...');
        const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        });
        
        console.log('✅ Transaction sent successfully with signature:', signature);
        return signature;
        
      } catch (signError: any) {
        console.log('Alternative approach failed, trying signAndSendTransaction...');
        console.error('Sign error details:', signError);
        
        // Fallback to original signAndSendTransaction method
        if (!window.solana?.signAndSendTransaction) {
          throw new Error('Phantom signAndSendTransaction method not available');
        }
        
        const signature = await window.solana.signAndSendTransaction(transaction);
        
        if (!signature) {
          throw new Error('Transaction signature not returned from wallet');
        }
        
        console.log('Transaction sent successfully with signature:', signature);
        return signature;
      }
      
    } catch (error: any) {
      console.error('Error minting with Phantom wallet:', error);
      
      // Try to extract more specific error information
      if (error.message && error.message.includes('0x')) {
        console.error('Transaction error code:', error.message);
      }
      
      if (error.code) {
        console.error('Error code:', error.code);
      }
      
      if (error.details) {
        console.error('Error details:', error.details);
      }
      
      // Check if it's a specific Phantom error
      if (error.message === 'Oe: Unexpected error') {
        console.error('⚠️ Phantom "Oe: Unexpected error" detected');
        console.error('This often indicates a transaction format issue or wallet state problem');
        console.error('Suggestions:');
        console.error('1. Refresh the page and reconnect wallet');
        console.error('2. Check if wallet has sufficient SOL for fees');
        console.error('3. Try a different RPC endpoint');
        console.error('4. Check wallet permissions and connection status');
        
        // If we get a specific error, try alternative RPC endpoints
        console.log('⚠️ Trying alternative RPC endpoints due to Phantom error...');
        
        try {
          const alternativeConnection = await this.tryAlternativeRPC();
          if (alternativeConnection) {
            console.log('🔄 Retrying transaction with alternative RPC endpoint...');
            
            // Update the connection temporarily
            const originalConnection = this.connection;
            this.connection = alternativeConnection;
            
            try {
              // Retry the transaction
              const signature = await this.mintWithPhantomWallet(brickNumber, wallet);
              console.log('✅ Transaction succeeded with alternative RPC endpoint');
              return signature;
            } finally {
              // Restore original connection
              this.connection = originalConnection;
            }
          }
        } catch (rpcError) {
          console.error('Alternative RPC endpoint retry failed:', rpcError);
        }
      }
      
      throw error;
    }
  }

  private async mintWithFallback(brickNumber: number, wallet: PublicKey): Promise<string> {
    try {
      console.log('Using fallback minting method...');
      
      // This is a simplified fallback - in a real implementation you'd want more robust handling
      throw new Error('Fallback minting not implemented for this wallet type');
      
    } catch (error) {
      console.error('Error in fallback minting:', error);
      throw error;
    }
  }

  private createCreateNFTInstructionData(
    name: string,
    symbol: string,
    uri: string,
    sellerFeeBasisPoints: number
  ): Buffer {
    const nameBytes = Buffer.from(name, 'utf8');
    const symbolBytes = Buffer.from(symbol, 'utf8');
    const uriBytes = Buffer.from(uri, 'utf8');
    
    // Create a buffer for seller fee basis points (2 bytes, little-endian)
    const sellerFeeBuffer = Buffer.alloc(2);
    sellerFeeBuffer.writeUInt16LE(sellerFeeBasisPoints, 0);
    
    // Instruction format: [tag(1), name_len(1), name(...), symbol_len(1), symbol(...), uri_len(1), uri(...), seller_fee(2)]
    const data = Buffer.concat([
      Buffer.from([0]), // tag = 0 for CreateNFT
      Buffer.from([nameBytes.length]),
      nameBytes,
      Buffer.from([symbolBytes.length]),
      symbolBytes,
      Buffer.from([uriBytes.length]),
      uriBytes,
      sellerFeeBuffer, // seller_fee_basis_points as 2-byte little-endian
    ]);
    
    return data;
  }

  // Fallback methods (keeping for compatibility)
  async fallbackSimpleMinting(brickNumber: number): Promise<string> {
    console.log('Using fallback simple minting...');
    return this.mintMetaBrickNFT(brickNumber);
  }

  async fallbackMockMinting(brickNumber: number): Promise<string> {
    console.log('Using fallback mock minting...');
    return this.mintMetaBrickNFT(brickNumber);
  }
}
