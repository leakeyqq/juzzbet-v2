import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { getED25519Key } from "@toruslabs/openlogin-ed25519";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { getWeb3AuthInstance } from "./web3AuthConnector";
import { Keypair } from "@solana/web3.js";
const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL || "https://api.mainnet-beta.solana.com";
const SOLANA_CHAIN_ID = "0x1"; // Solana mainnet

import { ethers } from "ethers";

/**
 * Returns the Solana private key (base58) derived from the current Web3Auth session.
 *
 * Preconditions:
 * - User must have completed Web3Auth login via your Wagmi connector (so web3auth.provider is non-null).
 */
export async function getSolanaPrivateKey(): Promise<string> {
  const web3auth = getWeb3AuthInstance();

  const provider = web3auth?.provider;

  if (!provider) throw new Error("Web3Auth provider not found");

  const privateKeyHex = await web3auth.provider?.request({
    method: "private_key",
  });

  if (!privateKeyHex || typeof privateKeyHex !== "string") {
    throw new Error("Invalid private key");
  }

  const { sk } = getED25519Key(privateKeyHex); // Converts to Ed25519

  const seed = sk.slice(0, 32); // only first 32 bytes are the seed

  const keypair = Keypair.fromSeed(seed); // ✅ create Keypair
  return bs58.encode(sk); // base58-encoded Solana-compatible private key
}


export async function getSolanaAddress(): Promise<string> {
  const web3auth = getWeb3AuthInstance();

  const provider = web3auth?.provider;

  if (!provider) throw new Error("Web3Auth provider not found");

  const privateKeyHex = await web3auth.provider?.request({
    method: "private_key",
  });

  if (!privateKeyHex || typeof privateKeyHex !== "string") {
    throw new Error("Invalid private key");
  }

      // ✅ Ethereum address from private key
  const ethWallet = new ethers.Wallet(privateKeyHex);

  const { sk } = getED25519Key(privateKeyHex); // Converts to Ed25519

  const seed = sk.slice(0, 32); // only first 32 bytes are the seed

  const keypair = Keypair.fromSeed(seed); // ✅ create Keypair

  return keypair.publicKey.toBase58(); // ✅ this is your Solana address
}

export async function getEthereumPrivateKey(): Promise<string>{
  const web3auth = getWeb3AuthInstance();

  const provider = web3auth?.provider;

  if (!provider) throw new Error("Web3Auth provider not found");

  const privateKeyHex = await web3auth.provider?.request({
    method: "private_key",
  });

  if (!privateKeyHex || typeof privateKeyHex !== "string") {
    throw new Error("Invalid private key");
  }

      // ✅ Ethereum address from private key
  const ethWallet = new ethers.Wallet(privateKeyHex);
  return ethWallet.privateKey

}