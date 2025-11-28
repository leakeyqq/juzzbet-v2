import { useState, useEffect } from "react";
import StableTokenABI from "./usdc-abi.json";
import JuzzbetABI from "./juzzbet-abi.json"
// import MinipayNFTABI from "./minipay-nft.json";
import { getSolanaAddress, getEthereumPrivateKey, getSolanaPrivateKey } from "../lib/getSolanaKey";
import { getWeb3AuthInstance } from '../lib/web3AuthConnector'; // adjust this import path

import Web3 from 'web3';
// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_CELO_RPC as string));


import { Connection, Keypair, PublicKey, clusterApiUrl, SystemProgram, Transaction, VersionedMessage, VersionedTransaction, MessageV0 } from '@solana/web3.js';

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL || '';

const CELO_RPC = 'https://forno.celo.org'; // or your own RPC
const SPENDER_ADDRESS = process.env.NEXT_PUBLIC_QUESTPANDA_SMART_CONTRACT;
const SPENDER_ADDRESS_BASE = process.env.NEXT_PUBLIC_QUESTPANDA_SMART_CONTRACT_BASE;
const SPENDER_ADDRESS_SCROLL = process.env.NEXT_PUBLIC_QUESTPANDA_SMART_CONTRACT_SCROLL;

// Base network stuff
const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const SCROLL_USDC_ADDRESS="0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4"
const SCROLL_USDT_ADDRESS ="0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df"

const BASE_ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];
const USDC_BASE_DECIMALS = 6;

import {
    createPublicClient,
    createWalletClient,
    custom,
    decodeEventLog,
    encodeFunctionData,
    getContract,
    http,
    parseEther,
    stringToHex
} from "viem";
import { celoAlfajores, celo } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { error } from "console";
import { number } from "zod";

const publicClient = createPublicClient({
    chain: celo,
    transport: http(),
});

const cUSDTokenAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
// const MINIPAY_NFT_CONTRACT = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF";
type SupportedNetwork = "celo" | "solana" | "base" | "scroll" | null;


export const useWeb3 = () => {
    const [address, setAddress] = useState<string | null>(null);
    const { data: walletClient } = useWalletClient();
    const { address: wagmiAddress } = useAccount();
    const [isWalletReady, setIsWalletReady] = useState(false);


    // Track wallet client readiness
    useEffect(() => {
        if (walletClient) {
            setIsWalletReady(true);
        } else {
            setIsWalletReady(false);
        }
    }, [walletClient]);

    const getUserAddress = async () => {
        if (wagmiAddress) {
            setAddress(wagmiAddress);
            return wagmiAddress;
        }

        if (typeof window !== "undefined" && window.ethereum) {
            const client = createWalletClient({
                transport: custom(window.ethereum),
                chain: celo,
            });
            const [addr] = await client.getAddresses();
            setAddress(addr);
            return addr;
        }
        return null;
    };


    async function isUsingWeb3Auth() {
        const web3auth = getWeb3AuthInstance();

        if (web3auth && web3auth.connected && web3auth.provider) {
            console.log("✅ Web3Auth is connected.");
            return true;
        } else {
            console.warn("❌ Web3Auth is NOT connected.");
            return false;
        }
    }

    return {
        address: walletClient?.account.address || address,
        getUserAddress,
        isWalletReady
    };
};