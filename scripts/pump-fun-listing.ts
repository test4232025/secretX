import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import BN from 'bn.js';
import fetch from 'node-fetch';

dotenv.config();

/**
 * Script to prepare and execute the listing of CodelonX on pump.fun
 * 
 * This script performs the following tasks:
 * 1. Loads your token details from token-info.json
 * 2. Prepares the metadata for pump.fun listing
 * 3. Estimates the SOL required for initial liquidity
 * 4. Outputs instructions for manual completion on pump.fun
 */
async function main() {
  console.log("🔐 CodelonX Pump.fun Listing Preparation 🚀");
  console.log("-------------------------------------------");

  // Connection to Solana cluster
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );

  // Load wallet from .env
  const privateKeyString = process.env.WALLET_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error('Missing WALLET_PRIVATE_KEY in .env file');
  }

  const secretKey = Uint8Array.from(JSON.parse(privateKeyString));
  const wallet = Keypair.fromSecretKey(secretKey);
  
  console.log(`Using wallet: ${wallet.publicKey.toBase58()}`);

  // Load token info
  if (!fs.existsSync('token-info.json')) {
    throw new Error('token-info.json not found! Please run create-token.ts first.');
  }

  const tokenInfo = JSON.parse(fs.readFileSync('token-info.json', 'utf-8'));
  const mintAddress = new PublicKey(tokenInfo.mintAddress);
  
  console.log("\n📊 Token Details:");
  console.log(`Name: ${tokenInfo.name}`);
  console.log(`Symbol: ${tokenInfo.symbol}`);
  console.log(`Mint Address: ${mintAddress.toBase58()}`);
  console.log(`Decimals: ${tokenInfo.decimals}`);
  
  // Check wallet SOL balance
  const solBalance = await connection.getBalance(wallet.publicKey);
  console.log(`\n💰 Wallet SOL Balance: ${solBalance / 1e9} SOL`);
  
  if (solBalance < 0.1 * 1e9) {
    console.warn("⚠️ Warning: Your wallet has less than 0.1 SOL. You may need more for listing and providing liquidity.");
  }

  // Get token balance 
  console.log("\n🔍 Checking token balance...");
  
  // Preparing for pump.fun
  console.log("\n🌊 Preparing for pump.fun listing:");
  
  const initialPrice = 0.0000001; // Initial price in SOL
  const initialLiquidity = 100000000; // 100M tokens for initial liquidity
  const requiredSol = initialPrice * initialLiquidity;
  
  console.log(`Recommended initial price: ${initialPrice} SOL per ${tokenInfo.symbol}`);
  console.log(`Recommended initial liquidity: ${initialLiquidity.toLocaleString()} ${tokenInfo.symbol}`);
  console.log(`Required SOL for liquidity: ~${requiredSol} SOL`);
  
  console.log("\n📝 Next Steps for pump.fun listing:");
  console.log("1. Visit https://pump.fun and connect your wallet");
  console.log("2. Click on 'Launch a Token'");
  console.log("3. Enter the following information:");
  console.log(`   - Token Name: ${tokenInfo.name}`);
  console.log(`   - Token Symbol: ${tokenInfo.symbol}`);
  console.log(`   - Mint Address: ${mintAddress.toBase58()}`);
  console.log("   - Description: CodelonX (CLX) is the official token for the $secretX platform built on Solana.");
  console.log("   - Upload the logo from assets/logo.svg");
  console.log(`4. Set your initial price to around ${initialPrice} SOL`);
  console.log(`5. Allocate approximately ${initialLiquidity.toLocaleString()} tokens for liquidity`);
  console.log("6. Complete the listing process on pump.fun");
  
  console.log("\n🔒 Remember to maintain secrecy around the project's core technologies!");
  console.log("The $secretX community is watching...");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
}); 