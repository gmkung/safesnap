require("@typechain/hardhat");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.6",
  paths: {
    sources: "./contracts",
    artifacts: "./src/artifacts",
  },
  typechain: {
    outDir: 'src/types/contracts',
    target: 'ethers-v6',
  },
}; 