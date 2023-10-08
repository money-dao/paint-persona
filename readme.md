# Paint Persona

## Requirements to run:

1. Create a test firebase Realtime Database
2. Create a Solana web3 Keypair

* `/www/service/db_key.js`
  * export Firebase config object
* `/server/asset/fbkey.js`
  * export Firebase Admin SDK private key
* `/server/asset/tls-main.js`
  * export solana web3 Keypair object

## To run:
* npm i
* npm run refresh
* http://localhost:4200

## To Build prod:
* webpack.config.js remove `mode: 'development'`
* webpack.frontend.js remove `mode: 'development'`
* mode.js export true

## Hackathon TODOs:
* fix mobile phantom not working
* show transactions on support page
* raffle MB for likes
* styling
  * signup page
