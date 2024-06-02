export type StayKing = {
  "version": "0.1.0",
  "name": "stay_king",
  "instructions": [
    {
      "name": "initializeVault",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "kingVaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeAssociatedTokenAccount",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "airdrop",
      "accounts": [
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfoAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeKingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfoAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeKingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeStakingAccounts",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakeInfoAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeKingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeKingVaultAccounts",
      "docs": [
        "For Debug purpose only, normally I wouldn't close the token vault account"
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "kingVaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "StakeInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isStaked",
            "type": "bool"
          },
          {
            "name": "stakerKey",
            "type": "publicKey"
          },
          {
            "name": "stakeInfoBump",
            "type": "u8"
          },
          {
            "name": "stakeKingBump",
            "type": "u8"
          },
          {
            "name": "stakedAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "IsStaked",
      "msg": "Tokens are already staked."
    },
    {
      "code": 6001,
      "name": "NotStaked",
      "msg": "There are no staked tokens!"
    },
    {
      "code": 6002,
      "name": "NoTokens",
      "msg": "No Tokens to stake"
    }
  ],
  "metadata": {
    "address": "HLtsjATCY2R9pG29kr3QWhvyuMagjZVj89qqkNyTDTVt"
  }
};

export const IDL: StayKing = {
  "version": "0.1.0",
  "name": "stay_king",
  "instructions": [
    {
      "name": "initializeVault",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "kingVaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeAssociatedTokenAccount",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "airdrop",
      "accounts": [
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfoAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeKingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeInfoAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeKingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeStakingAccounts",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakeInfoAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeKingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeKingVaultAccounts",
      "docs": [
        "For Debug purpose only, normally I wouldn't close the token vault account"
      ],
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "kingVaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "kingVaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "StakeInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isStaked",
            "type": "bool"
          },
          {
            "name": "stakerKey",
            "type": "publicKey"
          },
          {
            "name": "stakeInfoBump",
            "type": "u8"
          },
          {
            "name": "stakeKingBump",
            "type": "u8"
          },
          {
            "name": "stakedAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "IsStaked",
      "msg": "Tokens are already staked."
    },
    {
      "code": 6001,
      "name": "NotStaked",
      "msg": "There are no staked tokens!"
    },
    {
      "code": 6002,
      "name": "NoTokens",
      "msg": "No Tokens to stake"
    }
  ],
  "metadata": {
    "address": "HLtsjATCY2R9pG29kr3QWhvyuMagjZVj89qqkNyTDTVt"
  }
};