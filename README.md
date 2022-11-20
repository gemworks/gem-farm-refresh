
<h1 align="center">
  <br>
  <a href="https://gemfarm.gg"><img src="https://www.gemfarm.gg/img/400x600.9f34760c.gif" alt="GemFarm" width="100"></a>
  <br>
  Gem Farm Refresh
  <br>
</h1>

<h4 align="center">A script for crancking gem-farm fixed rate farms <a href="http://gemfarm.gg" target="_blank">Gem Farm</a>.</h4>


<p align="center">
  <a href="#why-do-you-need-this-script">Why?</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#related">Related</a> •
  <a href="#license">License</a> •
  <a href="https://docs.gemworks.gg/">Documentation</a> •

</p>


## Why Do You Need this script?
When working with Fixed Reward Rate [farms](https://github.com/gemworks/gem-farm-refresh.git), some issues are introducing when a farmer finishes an schedule and another begins. 

* [Rolling](https://docs.gemworks.gg/gem-farm/fixed-rate-rewards#rolling)
* [Cranking](https://docs.gemworks.gg/gem-farm/fixed-rate-rewards#cranking)


This script allows you to move farmers over to the new staking schedule. 


## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:
### Installation
```bash
git clone https://github.com/gemworks/gem-farm-refresh.git
cd gem-farm-refresh
```
Install dependencies
```bash
yarn
# or
npm install
```

### Configuration
Create a file called `.env`  from the `.env.template`
```bash
# you can use this command to create .env file from template
cat .env.template >> .env
```
Change the values in  `.env` file to match the farm you are looking to update. Don't forget to point to the `payer` , make sure this wallet has some SOL balance in order to pay fees. 
```
RPC_URL='https://api.mainnet-beta.solana.com'
FARM_ADDRESS='ADD_FARM_ADDRESS PUBLIC KEY'
PAYER_WALLET_PATH='~/config/solana/id.json'
```
- Make sure your local CLI Solana wallet is funded with a small amount of SOL.
- To find your `FARM_ADDRESS` go to 
### Running the script
```bash
yarn start
# or
npm run start
# or alternatively
ts-node src/index.ts
```

## Related

- [gem-farm](https://github.com/gemworks/gem-farm) - Configurable staking for NFT Projects on Solana
- [gem-farm-ui](https://github.com/gemworks/gem-farm-ui) - React UI for Gem Farm



## License

MIT

---

> GitHub [@gemworks](https://github.com/gemworks/) &nbsp;&middot;
