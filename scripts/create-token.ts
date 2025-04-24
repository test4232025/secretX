import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import { 
  createInitializeMintInstruction, 
  getMinimumBalanceForRentExemptMint, 
  TOKEN_PROGRAM_ID, 
  MINT_SIZE, 
  createMint
} from '@solana/spl-token';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import BN from 'bn.js';

dotenv.config();

async function main() {
  // Connection to Solana cluster
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );

  // Load the wallet keypair from a .env file
  const privateKeyString = process.env.WALLET_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error('Missing WALLET_PRIVATE_KEY in .env file');
  }

  const secretKey = Uint8Array.from(JSON.parse(privateKeyString));
  const fromWallet = Keypair.fromSecretKey(secretKey);
  
  console.log(`Using wallet: ${fromWallet.publicKey.toBase58()}`);

  // Token details
  const tokenName = "CodelonX";
  const tokenSymbol = "CLX";
  const tokenDecimals = 9;  // Standard for Solana tokens
  const totalSupply = new BN(1_000_000_000).mul(new BN(10).pow(new BN(tokenDecimals))); // 1 billion tokens

  try {
    // Create the token
    console.log(`Creating ${tokenName} token...`);
    
    const tokenMint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      fromWallet.publicKey,
      tokenDecimals
    );

    console.log(`Token created successfully!`);
    console.log(`Token Mint Address: ${tokenMint.toBase58()}`);
    
    // Save the token info to a file
    const tokenInfo = {
      name: tokenName,
      symbol: tokenSymbol,
      mintAddress: tokenMint.toBase58(),
      decimals: tokenDecimals,
      totalSupply: totalSupply.toString(),
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync('token-info.json', JSON.stringify(tokenInfo, null, 2));
    console.log('Token information saved to token-info.json');
    
    console.log('\nNext steps:');
    console.log('1. Run "npm run mint" to mint tokens to your wallet');
    console.log('2. List your token on pump.fun by providing the mint address');

  } catch (error) {
    console.error('Error creating token:', error);
    process.exit(1);
  }
}

main(); 