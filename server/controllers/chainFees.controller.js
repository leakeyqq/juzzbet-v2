import {ethers} from 'ethers'
import dotenv from 'dotenv'
dotenv.config()


export const customFundFeesOnWallet = async(req, res) => {
      try {
        const beneficiary_address = req.walletAddress
        const amountInCelo = req.body.estimatedCostCELO
        const txHash = await customSendCelo(beneficiary_address, amountInCelo )
        return res.status(200).json({txHash})
    } catch (error) {
      console.log('error is ', error)
        return res.status(500).json({'error': error.message})
    }
}

async function customSendCelo(toAddress, celoAmount){
    const MAX_RETRIES = 3;
    let attempt = 0;

    // const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
    const provider = new ethers.JsonRpcProvider(process.env.CELO_RPC)
    // const provider = new ethers.JsonRpcProvider("https://celo.drpc.org");


    // Create wallet
    const wallet = new ethers.Wallet(process.env.CELO_FEES_KEY, provider);
    
    console.log(`🟡 Sending ${Number(celoAmount)} CELO from ${wallet.address} to ${toAddress}`);

    const amountString = typeof celoAmount === 'number' ? celoAmount.toString() : String(celoAmount);
    
    while(attempt < MAX_RETRIES){
      try {
          console.log(`🟡 Attempt ${attempt + 1}: Sending ${amountString} CELO to ${toAddress}`);
          
          // Send transaction (0.01 CELO)
          const tx = await wallet.sendTransaction({
            to: toAddress,
            value: ethers.parseEther(amountString)
          });
      
          console.log("🟢 Transaction sent:", tx.hash);
          console.log(`🔗 Explorer: https://celoscan.io/tx/${tx.hash}`);
      
          // Wait for confirmation (this is what you're missing)
          console.log("⏳ Waiting for transaction confirmation...");
          const receipt = await tx.wait(); // This waits for mining

          console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
          console.log(`🔗 Confirmed at: https://celoscan.io/tx/${tx.hash}`);

          return tx.hash;
      } catch (error) {
        console.log('error is ', error)
          attempt++;
          const msg = error?.message || "";
          console.error(`❌ Attempt ${attempt} failed:`, msg);

          if (msg.includes('block is out of range') || msg.includes('nonce') || msg.includes('replacement') || msg.includes('underpriced') || msg.includes('insufficient funds')) {
              const delay = 1000 * attempt;
              console.log(`🔁 Retrying in ${delay}ms...`);
              await new Promise(res => setTimeout(res, delay));
          } else {
              throw error; // don't retry for unknown errors
          }

          if (attempt >= MAX_RETRIES) throw error;
      }
    }
}



export const fundFeesOnWallet = async(req, res)=>{
    try {
        const beneficiary_address = req.userWalletAddress
        console.log('waiting for tx')
        const txHash = await sendCelo(beneficiary_address)
        console.log('got tx')
        return res.status(200).json({txHash})
    } catch (error) {
      console.log('error is ', error)
        return res.status(500).json({'error': error.message})
    }

}

async function sendCelo(toAddress) {
    try {
      const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
  
      // Create wallet
      const wallet = new ethers.Wallet(process.env.CELO_FEES_KEY, provider);
      
      console.log(`🟡 Sending 0.001 CELO from ${wallet.address} to ${toAddress}`);
  
      // Send transaction (0.01 CELO)
      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: ethers.parseEther("0.003")
      });
  
      console.log("🟢 Transaction sent:", tx.hash);
      console.log(`🔗 Explorer: https://celoscan.io/tx/${tx.hash}`);
  
      return tx.hash;
    } catch (error) {
      console.error("❌ Error:", error);
    //   process.exit(1);
    }
}
