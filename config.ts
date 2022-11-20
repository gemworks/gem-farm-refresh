import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "./.env") });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  RPC_URL: string | undefined;
  FARM_ADDRESS: string | undefined;
  PAYER_WALLET_PATH: string | undefined;
}

interface Config {
  RPC_URL: string;
  FARM_ADDRESS: string;
  PAYER_WALLET_PATH: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    RPC_URL: process.env.RPC_URL,
    FARM_ADDRESS: process.env.FARM_ADDRESS,
    PAYER_WALLET_PATH: process.env.PAYER_WALLET_PATH
  };
};

// Throwing an Error if any field was undefined 

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
