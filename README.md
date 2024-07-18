# StayKing

StayKing is a simplified staking decentralized application (dApp) designed for staking KING tokens. 

This project aims to replicate the core logic of staking, providing aspiring builders with a high-level understanding of how staking works.

## Program ID (on Devnet)

`HLtsjATCY2R9pG29kr3QWhvyuMagjZVj89qqkNyTDTVt`

## Features

- **Stake KING:** Stakes 1 KING token.
- **Unstake KING:** Unstake your current staked KING token and get 1 KING token reward.
- **Airdrop KING:** Airdrops 1 KING token to the user.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or higher)
- Solana CLI
- Anchor CLI
- A Solana wallet with some SOL for transaction fees (e.g., Phantom Wallet)

## Installation and Testing

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Memewtoo/stayking.git
    cd stayking
    ```

2. **Install the dependencies:**

    ```bash
    npm install
    ```

3. **Build the program:**

    ```bash
    anchor build
    ```

4. **Test the program:**

    ```bash
    anchor test
    ```

    > Note: Testing may fail due to not being able to read environment variables that weren't pushed in the project, so make sure to replace those with your variables.

## Contributing

Contributions are always welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## Acknowledgements

- [Solana](https://solana.com/)
- [Anchor Framework](https://project-serum.github.io/anchor/)
- [Phantom Wallet](https://phantom.app/)

Feel free to use this project as a learning resource to understand the basic mechanisms of staking on the Solana blockchain and build upon it to create more complex and feature-rich applications. Happy coding!
