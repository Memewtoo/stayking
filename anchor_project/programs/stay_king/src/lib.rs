// Import necessary modules/libraries
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        self, close_account, transfer, CloseAccount, Mint, MintTo, Token, TokenAccount, Transfer,
    },
};

declare_id!("HLtsjATCY2R9pG29kr3QWhvyuMagjZVj89qqkNyTDTVt");

// Define constant
pub mod constants {
    // Used for seeds
    pub const STAKE_INFO_SEED: &[u8] = b"stake-info";
    pub const KING_VAULT_SEED: &[u8] = b"king-vault";
}

#[program]
pub mod stay_king {
    use super::*;

    pub fn initialize_vault(_ctx: Context<InitializeVault>) -> Result<()> {
        Ok(())
    }

    pub fn initialize_associated_token_account(_ctx: Context<InitializeAta>) -> Result<()> {
        Ok(())
    }

    pub fn airdrop(ctx: Context<AirdropKing>) -> Result<()> {
        // Convert amount to proper decimal format of the minted token
        let airdrop_amount = (1_u64)
            .checked_mul(10u64.pow(ctx.accounts.token_mint.decimals as u32))
            .unwrap();

        // Construct the king vault signer
        let king_vault_key = ctx.accounts.king_vault_account.key();

        let king_auth_bump = ctx.bumps.king_vault_authority;
        let king_auth_seeds = &[king_vault_key.as_ref(), &[king_auth_bump]];
        let king_auth_signer = &[&king_auth_seeds[..]];

        let transfer_to_ctx = ctx.accounts.transfer_to_ctx().with_signer(king_auth_signer);

        transfer(transfer_to_ctx, airdrop_amount)?;

        Ok(())
    }

    pub fn stake(ctx: Context<StakeKing>) -> Result<()> {
        let stake_info = &mut ctx.accounts.stake_info_account;

        if stake_info.is_staked {
            return Err(ErrorCode::IsStaked.into());
        }

        stake_info.is_staked = true;
        stake_info.staker_key = ctx.accounts.user.key();
        stake_info.stake_info_bump = ctx.bumps.stake_info_account;
        stake_info.stake_king_bump = ctx.bumps.stake_king_account;

        // Convert the amount properly in relation to the token decimals
        let stake_amount = (1 as u64)
            .checked_mul(10u64.pow(ctx.accounts.mint.decimals as u32))
            .unwrap();

        stake_info.staked_amount = stake_amount;

        let stake_ctx = ctx.accounts.stake_to_ctx();
        transfer(stake_ctx, stake_amount)?;

        Ok(())
    }

    pub fn unstake(ctx: Context<UnstakeKing>) -> Result<()> {
        let stake_info = &mut ctx.accounts.stake_info_account;

        if !stake_info.is_staked {
            return Err(ErrorCode::NotStaked.into());
        }

        stake_info.is_staked = false;

        /** 1. Return funds from staking account to user ATA  */
        // Construct the staking account signer
        let stake_king_bump = stake_info.stake_king_bump;
        let stake_info_account_key = stake_info.key();

        let stake_king_seeds = &[stake_info_account_key.as_ref(), &[stake_king_bump]];
        let stake_king_signer = &[&stake_king_seeds[..]];

        let amount = stake_info.staked_amount;

        // Invoke the transfer of staked funds from staking account to user ATA with the staking account signer
        let unstake_ctx = ctx.accounts.unstake_to_ctx().with_signer(stake_king_signer);
        transfer(unstake_ctx, amount)?;

        /** 2. Reward 1 Token from the KING vault after unstaking */
        // Construct the king vault signer
        let king_vault_key = ctx.accounts.king_vault_account.key();

        let king_auth_bump = ctx.bumps.king_vault_authority;
        let king_auth_seeds = &[king_vault_key.as_ref(), &[king_auth_bump]];
        let king_auth_signer = &[&king_auth_seeds[..]];

        // Convert the reward properly to the token decimal format
        let reward = (1 as u64)
            .checked_mul(10u64.pow(ctx.accounts.mint.decimals as u32))
            .unwrap();

        //Invoke the transfer of 1 KING token from KING vault to user ATA using KING vault signer
        let vault_reward_ctx = ctx
            .accounts
            .vault_reward_to_ctx()
            .with_signer(king_auth_signer);
        transfer(vault_reward_ctx, reward)?;

        Ok(())
    }

    pub fn close_staking_accounts(ctx: Context<CloseStakingAcounts>) -> Result<()> {
        let stake_info = &mut ctx.accounts.stake_info_account;

        let stake_info_key = stake_info.key();
        let stake_king_bump = stake_info.stake_king_bump;
        let stake_king_seeds = &[stake_info_key.as_ref(), &[stake_king_bump]];

        let stake_king_signer = &[&stake_king_seeds[..]];

        //Manually close the stake king TokenAccount
        let close_ctx = ctx
            .accounts
            .close_staking_accounts_ctx()
            .with_signer(stake_king_signer);
        close_account(close_ctx)?;
        Ok(())
    }

    /** For Debug purpose only, normally I wouldn't close the token vault account */
    pub fn close_king_vault_accounts(ctx: Context<CloseKingVaultAccounts>) -> Result<()> {
        let king_vault_account = &ctx.accounts.king_vault_account;

        // Construct the signer seeds for CPI
        let king_vault_key = king_vault_account.key();

        let king_auth_bump = ctx.bumps.king_vault_authority;
        let king_auth_seeds = &[king_vault_key.as_ref(), &[king_auth_bump]];
        let signer = &[&king_auth_seeds[..]];

        // Transfer all remaining funds from KING vault back to where it was funded from
        if king_vault_account.amount > 0 {
            let remaining_amount = king_vault_account.amount;

            let transfer_ctx = ctx.accounts.transfer_ctx().with_signer(signer);

            transfer(transfer_ctx, remaining_amount)?;
        }

        // Close the KING vault account
        let close_king_vault_ctx = ctx.accounts.close_ctx().with_signer(signer);
        close_account(close_king_vault_ctx)?;

        Ok(())
    }

}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        seeds = [constants::KING_VAULT_SEED],
        bump,
        token::mint = mint,
        token::authority = king_vault_authority
    )]
    pub king_vault_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we are deriving the PDA in the program
    #[account(seeds = [king_vault_account.key().as_ref()], bump)]
    pub king_vault_authority: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeAta<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_mint,
        associated_token::authority = user,
    )]
    pub user_ata: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct AirdropKing<'info> {
    #[account(mut)]
    pub receiver: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [constants::KING_VAULT_SEED],
        bump,
        token::mint = token_mint,
        token::authority = king_vault_authority
    )]
    pub king_vault_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we are deriving the PDA in the program
    #[account(seeds = [king_vault_account.key().as_ref()], bump)]
    pub king_vault_authority: AccountInfo<'info>,

    pub token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeKing<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = user,
        seeds = [constants::STAKE_INFO_SEED, user.key().as_ref()],
        bump,
        space = 8 + StakeInfo::INIT_SPACE,
    )]
    pub stake_info_account: Account<'info, StakeInfo>,

    #[account(
        init,
        payer = user,
        token::mint = mint,
        token::authority = stake_king_account,
        seeds = [stake_info_account.key().as_ref()],
        bump
    )]
    pub stake_king_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnstakeKing<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [constants::STAKE_INFO_SEED, user.key().as_ref()],
        bump = stake_info_account.stake_info_bump
    )]
    pub stake_info_account: Account<'info, StakeInfo>,

    #[account(
        mut,
        seeds = [stake_info_account.key().as_ref()],
        bump = stake_info_account.stake_king_bump
    )]
    pub stake_king_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [constants::KING_VAULT_SEED],
        bump,
    )]
    pub king_vault_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we are deriving the PDA in the program
    #[account(seeds = [king_vault_account.key().as_ref()], bump)]
    pub king_vault_authority: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CloseStakingAcounts<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        close = user,
        seeds = [constants::STAKE_INFO_SEED, user.key().as_ref()],
        bump = stake_info_account.stake_info_bump
    )]
    pub stake_info_account: Account<'info, StakeInfo>,

    #[account(
        mut,
        seeds = [stake_info_account.key().as_ref()],
        bump = stake_info_account.stake_king_bump
    )]
    pub stake_king_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CloseKingVaultAccounts<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        close = payer,
        seeds = [constants::KING_VAULT_SEED],
        bump,
    )]
    pub king_vault_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we are deriving the PDA in the program
    #[account(seeds = [king_vault_account.key().as_ref()], bump)]
    pub king_vault_authority: AccountInfo<'info>,

    #[account(mut)]
    pub funder: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> AirdropKing<'info> {
    pub fn transfer_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.king_vault_account.to_account_info(),
            to: self.receiver.to_account_info(),
            authority: self.king_vault_authority.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'info> StakeKing<'info> {
    pub fn stake_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.user_ata.to_account_info(),
            to: self.stake_king_account.to_account_info(),
            authority: self.user.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'info> UnstakeKing<'info> {
    pub fn unstake_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.stake_king_account.to_account_info(),
            to: self.user_ata.to_account_info(),
            authority: self.stake_king_account.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn vault_reward_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.king_vault_account.to_account_info(),
            to: self.user_ata.to_account_info(),
            authority: self.king_vault_authority.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'info> CloseStakingAcounts<'info> {
    pub fn close_staking_accounts_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = CloseAccount {
            account: self.stake_king_account.to_account_info(),
            destination: self.user.to_account_info(),
            authority: self.stake_king_account.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'info> CloseKingVaultAccounts<'info> {
    pub fn close_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = CloseAccount {
            account: self.king_vault_account.to_account_info(),
            destination: self.payer.to_account_info(),
            authority: self.king_vault_authority.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.king_vault_account.to_account_info(),
            to: self.funder.to_account_info(),
            authority: self.king_vault_authority.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}

#[account]
#[derive(InitSpace)]
pub struct StakeInfo {
    pub is_staked: bool,
    pub staker_key: Pubkey,
    pub stake_info_bump: u8,
    pub stake_king_bump: u8,
    pub staked_amount: u64,
}

// Define customized error codes for the program
#[error_code]
pub enum ErrorCode {
    #[msg("Tokens are already staked.")]
    IsStaked,

    #[msg("There are no staked tokens!")]
    NotStaked,

    #[msg("No Tokens to stake")]
    NoTokens,
}