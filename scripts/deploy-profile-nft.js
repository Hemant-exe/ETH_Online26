// Deployment script for ProfileNFT contract
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI and bytecode
const contractArtifact = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../abi/ProfileNFT.json"), "utf-8")
);

async function main() {
  console.log("Deploying ProfileNFT contract...");

  // Create a wallet connection using private key (from .env or command line)
  const privateKey = process.env.PRIVATE_KEY || "";
  if (!privateKey) {
    console.error("No private key found! Set the PRIVATE_KEY environment variable.");
    process.exit(1);
  }

  // Connect to Unichain Sepolia
  const provider = new ethers.providers.JsonRpcProvider("https://sepolia.unichain.org");
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`Using wallet address: ${wallet.address}`);

  // Create contract factory
  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );

  try {
    // Deploy contract
    console.log("Deploying contract...");
    const contract = await factory.deploy();
    
    console.log("Waiting for deployment transaction to be mined...");
    await contract.deployed();
    
    console.log(`Contract deployed to: ${contract.address}`);
    
    // Save deployed address to a file
    const deploymentInfo = {
      contractAddress: contract.address,
      deploymentTxHash: contract.deployTransaction.hash,
      networkName: "Unichain Sepolia",
      chainId: "1301",
      deployedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      path.join(__dirname, "../contract-deployment.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("Deployment information saved to contract-deployment.json");
    
    // Instructions for updating the contract address in the service
    console.log("\nTo use this contract in your application:");
    console.log(`1. Update the PROFILE_NFT_CONTRACT_ADDRESS in app/services/nft-service.ts with:`);
    console.log(`   "${contract.address}"`);
  } catch (error) {
    console.error("Error deploying contract:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 