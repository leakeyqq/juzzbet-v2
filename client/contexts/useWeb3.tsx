import { useState, useEffect } from "react";
import StableTokenABI from "./usdc-abi.json";
import JuzzbetABI from "./juzzbet-abi.json"
// import MinipayNFTABI from "./minipay-nft.json";
import { getSolanaAddress, getEthereumPrivateKey, getSolanaPrivateKey } from "../lib/getSolanaKey";
import { getWeb3AuthInstance } from '../lib/web3AuthConnector'; // adjust this import path

import Web3 from 'web3';
// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_CELO_RPC as string));


import { Connection, Keypair, PublicKey, clusterApiUrl, SystemProgram, Transaction, VersionedMessage, VersionedTransaction, MessageV0 } from '@solana/web3.js';



const CELO_RPC = 'https://forno.celo.org'; // or your own RPC
const QP_CONTRACT_CELO = process.env.NEXT_PUBLIC_QP_CONTRACT_CELO!

const BASE_ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];
const CKES_DECIMALS = 18;

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
import { celo } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import { error } from "console";
import { number } from "zod";

const publicClient = createPublicClient({
    chain: celo,
    transport: http(),
});


// const MINIPAY_NFT_CONTRACT = "0xE8F4699baba6C86DA9729b1B0a1DA1Bd4136eFeF";
type SupportedNetwork = "celo";


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
    const approveSpending = async (_amount: string, tokenSymbol: string) => {
        if(await isUsingWeb3Auth()){
            const web3 = new Web3(new Web3.providers.HttpProvider(CELO_RPC));
            const privateKey = await getEthereumPrivateKey();
            const account = web3.eth.accounts.privateKeyToAccount(privateKey);
            web3.eth.accounts.wallet.add(account);

            const tokenContractAddress = checkContractAddress(tokenSymbol); // your function
            const decimals = checkDecimals(tokenSymbol); // your function
            const amount = Number(_amount) * 1.01;
            const amountInWei = BigInt(Math.floor(amount * 10 ** decimals)).toString();

            const contract = new web3.eth.Contract(StableTokenABI.abi, tokenContractAddress);

            const data = contract.methods.approve(QP_CONTRACT_CELO, amountInWei).encodeABI();

            // 1. Estimate gas
            const gasEstimate = await contract.methods
                .approve(QP_CONTRACT_CELO, amountInWei)
                .estimateGas({ from: account.address });

            // 2. Call refillGas with BigInt
            await prefillGas_v2(BigInt(gasEstimate));

            // 3. Get current gas price
            const gasPrice = await web3.eth.getGasPrice();

            const tx = {
                from: account.address,
                to: tokenContractAddress,
                gas: gasEstimate, // You may estimate it if needed
                gasPrice: gasPrice,
                data,
            };

            const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

            console.log('✅ Approval successful:', receipt.transactionHash);
            return receipt;
        }else{
            throw new Error('Only web3auth is supported at the moment')
        }
    }
    const createMarket = async () => {
        if (await isUsingWeb3Auth()) {
            try {
                
            if (!QP_CONTRACT_CELO) {
                throw new Error("QP_CONTRACT_CELO environment variable is not defined");
            }


            // Setup
            const web3 = new Web3(new Web3.providers.HttpProvider(CELO_RPC));
            const privateKey = await getEthereumPrivateKey();
            const account = web3.eth.accounts.privateKeyToAccount(privateKey);
            web3.eth.accounts.wallet.add(account);

            const tokenSymbol = 'cUSD'
            const decimals = checkDecimals(tokenSymbol);
            const tokenContractAddress = checkContractAddress(tokenSymbol);

            const contract = new web3.eth.Contract(JuzzbetABI, QP_CONTRACT_CELO);

            // try {
            //     // First, let's check if we can call the function
            //     console.log("[DEBUG] Testing contract call...");
            //     const testCall = await contract.methods.createMarket(tokenContractAddress).call({ from: account.address });
            //     console.log("[DEBUG] Test call result:", testCall);
            // } catch (error) {
            //     console.log("[DEBUG] Test call failed (may be normal):", error);
            // }


            const data = contract.methods.createMarket(tokenContractAddress).encodeABI();

            const gas = await contract.methods
                .createMarket(tokenContractAddress)
                .estimateGas({ from: account.address });

            await prefillGas_v2(gas); // Your custom gas topping logic

            const gasPrice = await web3.eth.getGasPrice();
            const nonce = await web3.eth.getTransactionCount(account.address, "pending");

            const tx = {
                from: account.address,
                to: QP_CONTRACT_CELO,
                data,
                gas,
                gasPrice,
                nonce,
            };

            const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

            console.log("✅ Transaction confirmed:", receipt.transactionHash);


            console.log("[DEBUG] Receipt details:", {
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber.toString(),
                gasUsed: receipt.gasUsed.toString(),
                status: receipt.status,
                logs: receipt.logs?.map(log => ({
                    address: log.address,
                    topics: log.topics,
                    data: log.data
                }))
            });

            // Type-safe event extraction - inspired by your working code
            const eventSignature = web3.utils.keccak256("MarketCreated(uint256,address,address)");
            console.log("[DEBUG] Event signature:", eventSignature);

            // Find the correct log with proper type guards
            const marketCreatedLog = receipt.logs?.find((log): log is { address: string; topics: string[]; data: string } => {
                if (!log.address || !log.topics || !log.data) return false;
                return (
                    log.address.toLowerCase() === QP_CONTRACT_CELO.toLowerCase() &&
                    log.topics[0] === eventSignature
                );
            });

            if (!marketCreatedLog) {
                console.error("[DEBUG] All logs:", receipt.logs?.map(l => ({
                    address: l.address,
                    topics: l.topics,
                    data: l.data
                })));
                throw new Error("MarketCreated event not found in transaction logs");
            }

            console.log("[DEBUG] Found event log:", {
                address: marketCreatedLog.address,
                topics: marketCreatedLog.topics,
                data: marketCreatedLog.data
            });

            // Type-safe decoding with error handling
            try {
                console.log("[DEBUG] Decoding log data...");

                // The marketId is the first indexed parameter (topics[1])
                // For MarketCreated(uint256 marketId, address creator, address token)
                // topics[0] = event signature
                // topics[1] = marketId (indexed uint256)
                // topics[2] = creator (indexed address)  
                // topics[3] = token (indexed address)
                // data = (empty since all parameters are indexed)

                const marketId = web3.utils.hexToNumber(marketCreatedLog.topics[1]);
                const creator = web3.eth.abi.decodeParameter('address', marketCreatedLog.topics[2]);
                const token = web3.eth.abi.decodeParameter('address', marketCreatedLog.topics[3]);

                console.log("🎯 Market created with ID:", marketId);
                console.log("[DEBUG] Event details:", {
                    marketId: marketId,
                    creator: creator,
                    token: token
                });

                return marketId;

            } catch (decodeError) {
                console.error("[DEBUG] Failed to decode event:", decodeError);
                throw new Error("Failed to decode MarketCreated event");
            }
            } catch (error) {
                console.log('error imehappend')
                console.error(error)
            }





        } else {
            throw new Error("Only isUsingWeb3Auth is allowed ")
        }
    }

    const checkContractAddress = (tokenSymbol: string) => {
        if (tokenSymbol.toLowerCase() == 'ckes') {
            let address = '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0'
            return address as `0x${string}`;
        }else if(tokenSymbol.toLowerCase() == 'cusd'){
            let address = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
            return address as `0x${string}`;
        } else {
            throw new Error('Token not supported!!')
        }
    }
    const checkDecimals = (tokenSymbol: string) => {
        if (tokenSymbol.toLowerCase() == 'ckes') {
            return 18
        }else if(tokenSymbol.toLowerCase() == 'cusd'){
            return 18
        } else {
            throw new Error('Token not supported!!')
        }
    }
    const prefillGas_v2 = async (gasEstimate: bigint) => {

        try {
            const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_CELO_RPC as string));

            if (typeof (web3) == 'undefined') {
                throw new Error('web3 provider not defined')
            }
            // 1. Get current gas price
            const gasPriceWei = await web3.eth.getGasPrice();
            const gasPrice = BigInt(gasPriceWei);

            console.log('Current gas price (wei):', gasPrice.toString());

            // 2. Compute raw cost (gasEstimate * gasPrice)
            console.log('Gas estimate units:', gasEstimate.toString());
            const rawCost = gasEstimate * gasPrice;

            // 3. Apply buffer if needed (currently skipped)
            const bufferedCost = rawCost;

            // 4. Convert to CELO (1e18 wei = 1 CELO)
            const estimatedCostCELO = Number(bufferedCost) / 1e18;
            console.log('Estimated CELO cost:', estimatedCostCELO);

            // 5. Send the gas estimate to backend
            const gasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fees/gas-estimate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    function: 'createQuestAsBrand',
                    estimatedCostCELO,
                    timestamp: new Date().toISOString(),
                }),
            });

            const { txHash } = await gasResponse.json();

            // 6. Wait for transaction receipt using web3.js
            const receipt = await waitForReceipt(txHash);

            console.log('✅ Gas has been filled:', receipt.transactionHash);
            return true;

        } catch (error) {
            console.error('❌ Error adding gas:', error);
            throw error;
        }
    };
        // Helper function to poll for transaction receipt
    const waitForReceipt = async (txHash: string, interval = 1000, maxTries = 60): Promise<any> => {
        const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_CELO_RPC as string));

        let tries = 0;

        while (tries < maxTries) {
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt) return receipt;
            await new Promise(res => setTimeout(res, interval));
            tries++;
        }

        throw new Error(`Timeout waiting for transaction receipt: ${txHash}`);
    };
    return {
        address: walletClient?.account.address || address,
        approveSpending,
        createMarket,
        getUserAddress,
        isWalletReady
    };
};