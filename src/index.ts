const fs = require("fs");
import { GEM_FARM_PROG_ID } from "@gemworks/gem-farm-ts";
import { GemFarm } from "@gemworks/gem-farm-ts/dist/types/gem_farm";
import {
  clusterApiUrl,
  Connection,
  ConnectionConfig,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import farmIdl from "./idl.json";
import config from "../config"

const refreshPayer = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(
      fs.readFileSync(
        config.PAYER_WALLET_PATH,
        "utf8"
      )
    )
  )
);

const FARM_ADDRESS = new PublicKey(config.FARM_ADDRESS);

const RPC_URL = config.RPC_URL;

const fetchAllFarmerPDAs = async (farm: PublicKey) => {
  const farmProgram = getFarmProgram();
  const filters = [];

  if (farm) {
    filters.push({
      memcmp: {
        offset: 8,
        bytes: farm.toBase58(),
      },
    });
  }

  return farmProgram.account.farmer.all(filters);
};

const getFarmProgram = () => {
  const { connection, wallet } = getWallet();

  return new anchor.Program<GemFarm>(
    farmIdl as any,
    GEM_FARM_PROG_ID,
    new anchor.Provider(connection, new anchor.Wallet(wallet), {
      commitment: "confirmed",
    })
  );
};

const ConnectionConfigOb: ConnectionConfig = {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 120000,
};

const getWallet = () => {
  const connection = new Connection(RPC_URL, ConnectionConfigOb);
  const wallet = refreshPayer;
  return { connection, wallet };
};

const createTransactions = async () => {
  const accounts = await fetchAllFarmerPDAs(FARM_ADDRESS);

  // write to a new file named out.txt
  fs.writeFile("./output.json", JSON.stringify(accounts), (err: any) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log("Accounts saved!");
  });

  const farmProgram = getFarmProgram();

  const transactions = [];
  let iter = 0;
  let transaction = new Transaction();

  for (let i = 0; i < accounts.length; i++) {
    if (iter === 0) {
      transactions.push(transaction);
    }

    const account = accounts[i];
    const [key, bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("farmer"),
        FARM_ADDRESS.toBuffer(),
        account.account.identity.toBuffer(),
      ],
      farmProgram.programId
    );

    if (!key.equals(account.publicKey)) {
      continue;
    }

    transactions[transactions.length - 1].add(
      farmProgram.instruction.refreshFarmer(bump, {
        accounts: {
          farm: FARM_ADDRESS,
          farmer: account.publicKey,
          identity: account.account.identity,
        },
      })
    );

    if (iter < 9) {
      iter++;
    } else {
      iter = 0;
      transaction = new Transaction();
    }
  }

  return transactions;
};

const sendAndConfirmTransactionsWithRetry = async (
  transactions: Transaction[],
  maxRetries: number = 0
) => {
  const { connection, wallet } = getWallet();
  const farmProgram = getFarmProgram();

  if (!(transactions && transactions.length)) {
    return Promise.reject("No transactions provided to send");
  }

  let currentRetries = 0;
  let currentIndex = 0;

  const transactionReceipts = [];
  while (
    !(currentIndex >= transactions.length) &&
    !(currentRetries > maxRetries)
  ) {
    let transaction = transactions[currentIndex];
    let signed = null;
    try {
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
    } catch (e) {
      console.error(e);
      currentRetries++;

      continue;
    }

    try {
      signed = await farmProgram.provider.wallet.signTransaction(transaction);
    } catch (e) {
      return Promise.reject(e);
    }

    try {
      const txid = await connection.sendRawTransaction(signed.serialize());
      const receipt = await connection.confirmTransaction(txid);
      transactionReceipts.push(receipt);
      currentIndex++;
    } catch (e) {
      console.error(e);
      currentRetries++;
    }
  }

  if (currentRetries > maxRetries) {
    return Promise.reject("Reached the maximum number of retries");
  } else {
    return Promise.resolve(transactionReceipts);
  }
};

(async function dodo() {
  const transactions = await createTransactions();
  return await sendAndConfirmTransactionsWithRetry(transactions, 10);
})()
  .then(() => {
    console.log("Success!!!");
  })
  .catch((e) => {
    console.log(e);
  });
