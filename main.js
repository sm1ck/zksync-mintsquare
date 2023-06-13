import * as zksync from "zksync-web3";
import ethers from "ethers";
import * as accs from "./accs.js";
import { exit } from "process";
import * as fs from "fs";
import * as path from "path";
import { uploadImg } from "./img.js";

/**
 * Абстрактная задержка
 * @param {Integer} millis
 * @returns
 */

export async function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

/**
 * Случайное min/max целое значение
 * @param {Integer} min
 * @param {Integer} max
 * @returns Случайное число
 */

export const randomIntInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// get gas price

const getGasPrice = async () =>
  (await syncProvider.getFeeData()).lastBaseFeePerGas;

// mint

const mintNft = async (syncWallet) => {
  try {
    const contract = new ethers.Contract(nftContract, NFT_ABI, syncProvider);
    const address = syncWallet.address;
    let hash = await uploadImg(address);
    let hashStr = `ipfs://${hash}`;
    let gasLimit = ethers.BigNumber.from(
      Math.floor(
        (await contract.estimateGas.mint(hashStr, {
          from: address,
        })) / divider
      )
    );
    let gasPrice = await getGasPrice();
    let tx = {
      from: address,
      to: nftContract,
      gasLimit,
      gasPrice,
      data: (await contract.populateTransaction.mint(hashStr)).data,
      value: ethers.BigNumber.from(0),
    };
    let sent = await syncWallet.sendTransaction(tx);
    console.log(
      `(ZkSync Era) => ${address}: https://explorer.zksync.io/tx/${sent.hash}`
    );
    await sent.wait();
    return true;
  } catch (e) {
    console.log(`(ZkSync Era) => ${syncWallet.address}: ошибка ->`);
    console.dir(e);
    let emsg = e.message;
    if (emsg.includes("insufficient funds")) {
      return true;
    }
    await sleep(60000);
    return mintNft(syncWallet);
  }
};

// Базовые переменные
const link = "https://mainnet.era.zksync.io";
const sleep_min = 180; // задержка от
const sleep_max = 3000; // задержка до
const nftContract = "0x53eC17BD635F7A54B3551E76Fd53Db8881028fC3"; // mintsquare
const divider = 2; // делитель в zksync

const __dirname = path.resolve();

const NFT_ABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, "/NFT_ABI.json"), "utf8")
);

// Чтение аккаунтов
let adata = (await accs.importETHWallets())
  .map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);
const syncProvider = new zksync.Provider(link);
// Основной цикл
for (let acc of adata) {
  try {
    // Кошелек
    const syncWallet = new zksync.Wallet(acc, syncProvider);
    await mintNft(syncWallet);
    const sle = randomIntInRange(sleep_min, sleep_max);
    console.log(`ZkSync Era => задержка ${sle}с..`);
    await sleep(sle * 1000);
  } catch (e) {
    console.log(`[ERROR]:`);
    console.dir(e);
  }
}
exit();
