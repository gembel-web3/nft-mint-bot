require("dotenv").config();
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const abi = [
  "function claim(address _receiver,uint256 _quantity,address _currency,uint256 _pricePerToken,(bytes32[] proof,uint256 quantityLimitPerWallet,uint256 pricePerToken,address currency) _allowlistProof)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

const QUANTITY = 5;
const CURRENCY = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const PRICE_PER_TOKEN = ethers.parseEther("0.00001");

const allowlistProof = {
  proof: [],
  quantityLimitPerWallet: 10,
  pricePerToken: PRICE_PER_TOKEN,
  currency: CURRENCY
};

async function main() {
  try {
    const receiver = wallet.address;

    const tx = await contract.claim(
      receiver,
      QUANTITY,
      CURRENCY,
      PRICE_PER_TOKEN,
      allowlistProof
    );

    console.log(`${chalk.cyan("🚀 Tx sent!")} ${chalk.yellow("Hash:")} ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`${chalk.green("✅ Success!")} ${chalk.white(`Minted ${QUANTITY} NFT`)}`);
    console.log(`${chalk.magenta("Block")} ${chalk.white(receipt.blockNumber)}`);
  } catch (err) {
    console.error(chalk.red("❌ Minting failed:"), err.reason || err.message);
  }
}

main();
