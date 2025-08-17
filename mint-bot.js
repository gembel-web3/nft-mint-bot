require("dotenv").config();
const { ethers } = require("ethers");
const chalk = require("chalk");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const abi = [
  "function claim(address _receiver,uint256 _quantity,address _currency,uint256 _pricePerToken,(bytes32[] proof,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency) _allowlistProof,bytes _data)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

async function main() {
  try {
    const receiver = wallet.address;
    const quantity = 1;
    const currency = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const pricePerToken = ethers.parseEther("0.00001");

    const allowlistProof = {
      proof: [],
      quantityLimitPerWallet: 20,
      pricePerToken: pricePerToken,
      currency: currency
    };

    const data = "0x";
    const totalValue = pricePerToken * BigInt(quantity);

    const txRequest = await contract.claim.populateTransaction(
      receiver,
      quantity,
      currency,
      pricePerToken,
      allowlistProof,
      data,
      { value: totalValue }
    );

    const estimatedGas = await provider.estimateGas({
      ...txRequest,
      from: wallet.address,
    });

    const feeData = await provider.getFeeData();
    const gasLimit = estimatedGas * 120n / 100n;

    const tx = await wallet.sendTransaction({
      ...txRequest,
      gasLimit,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
    });

    console.log(`${chalk.cyan.bold("📤 Tx sent!")} ${chalk.yellow.bold("Hash:")} ${chalk.hex("0000FF").bold(tx.hash)}`);

    const receipt = await tx.wait();

    console.log(`${chalk.green.bold("✅ Success!")} ${chalk.bold("Minted")} ${chalk.bold(quantity)} ${chalk.bold("NFT")}`);
    console.log(`${chalk.yellow.bold("🔗 Block")} ${chalk.hex("#0000FF").bold(receipt.blockNumber)}`);

  } catch (err) {
    console.error(chalk.red.bold("❌ Minting failed:"), err.reason || err.message);
  }
}

main();
