import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { 
  createMintToInstruction, 
  getOrCreateAssociatedTokenAccount, 
  getMint, 
  TOKEN_PROGRAM_ID 
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

  // Load token info
  if (!fs.existsSync('token-info.json')) {
    throw new Error('token-info.json not found! Please run create-token.ts first.');
  }

  const tokenInfo = JSON.parse(fs.readFileSync('token-info.json', 'utf-8'));
  const mintAddress = new PublicKey(tokenInfo.mintAddress);
  const tokenDecimals = tokenInfo.decimals;
  
  // The amount to mint (1 billion tokens)
  const totalSupply = new BN(1_000_000_000).mul(new BN(10).pow(new BN(tokenDecimals)));

  try {
    console.log(`Minting ${totalSupply.toString()} ${tokenInfo.symbol} tokens...`);
    
    // Get the token account of the fromWallet address, and if it doesn't exist, create it
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mintAddress,
      fromWallet.publicKey
    );

    console.log(`Token account: ${tokenAccount.address.toBase58()}`);

    // Create mint instructions
    const mintToInstruction = createMintToInstruction(
      mintAddress,
      tokenAccount.address,
      fromWallet.publicKey,
      BigInt(totalSupply.toString()),
      []
    );

    // Send transaction
    const transaction = await connection.sendTransaction({
      instructions: [mintToInstruction],
      signers: [fromWallet],
    });

    console.log(`Transaction signature: ${transaction}`);
    console.log(`Successfully minted ${totalSupply.toString()} tokens to ${tokenAccount.address.toBase58()}`);
    
    console.log('\nNext steps:');
    console.log('1. List your token on pump.fun by providing the mint address');
    console.log(`   Mint Address: ${mintAddress.toBase58()}`);

  } catch (error) {
    console.error('Error minting tokens:', error);
    process.exit(1);
  }
}

main(); 