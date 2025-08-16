use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("FXD4ebDGGDG3L345MD2DYRQ4rxhuswJFZ1o3EASsQxhS");

#[program]
pub mod metabricks {
    use super::*;

    /// Initialize the MetaBricks program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.authority = ctx.accounts.authority.key();
        program_state.total_bricks = 432;
        program_state.bricks_sold = 0;
        program_state.total_revenue = 0;
        program_state.bump = *ctx.bumps.get("program_state").unwrap();
        
        msg!("🎉 MetaBricks program initialized!");
        msg!("   Total bricks: {}", program_state.total_bricks);
        msg!("   Authority: {}", program_state.authority.key());
        
        Ok(())
    }

    /// Purchase a MetaBrick
    pub fn purchase_brick(
        ctx: Context<PurchaseBrick>,
        brick_id: u32,
        price_lamports: u64,
        metadata_uri: String,
    ) -> Result<()> {
        // Validate brick ID
        require!(
            brick_id >= 1 && brick_id <= 432,
            MetaBricksError::InvalidBrickId
        );

        // Check if brick is already sold
        let purchase_record = &mut ctx.accounts.purchase_record;
        require!(!purchase_record.is_sold, MetaBricksError::BrickAlreadySold);

        // Transfer SOL payment
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, price_lamports)?;

        // Record the purchase
        purchase_record.brick_id = brick_id;
        purchase_record.buyer = ctx.accounts.buyer.key();
        purchase_record.purchase_timestamp = Clock::get()?.unix_timestamp;
        purchase_record.price_lamports = price_lamports;
        purchase_record.metadata_uri = metadata_uri;
        purchase_record.is_sold = true;
        purchase_record.bump = *ctx.bumps.get("purchase_record").unwrap();

        // Update program statistics
        let program_state = &mut ctx.accounts.program_state;
        program_state.bricks_sold += 1;
        program_state.total_revenue += price_lamports;

        msg!("🎉 MetaBrick #{} purchased successfully!", brick_id);
        msg!("   Buyer: {}", ctx.accounts.buyer.key());
        msg!("   Price: {} lamports", price_lamports);
        msg!("   Total sold: {}/{}", program_state.bricks_sold, program_state.total_bricks);

        Ok(())
    }

    /// Get brick purchase information
    pub fn get_brick_info(ctx: Context<GetBrickInfo>) -> Result<()> {
        let purchase_record = &ctx.accounts.purchase_record;
        
        if purchase_record.is_sold {
            msg!("MetaBrick #{} is SOLD", purchase_record.brick_id);
            msg!("   Buyer: {}", purchase_record.buyer);
            msg!("   Purchase time: {}", purchase_record.purchase_timestamp);
            msg!("   Price: {} lamports", purchase_record.price_lamports);
            msg!("   Metadata: {}", purchase_record.metadata_uri);
        } else {
            msg!("MetaBrick #{} is AVAILABLE", purchase_record.brick_id);
        }

        Ok(())
    }

    /// Get wallet's owned bricks
    pub fn get_wallet_bricks(ctx: Context<GetWalletBricks>) -> Result<()> {
        let wallet = &ctx.accounts.wallet;
        msg!("Fetching bricks for wallet: {}", wallet.key());
        
        // This would typically iterate through all purchase records
        // For now, we'll just acknowledge the request
        msg!("Wallet brick query initiated");
        
        Ok(())
    }

    /// Update program authority (admin only)
    pub fn update_authority(ctx: Context<UpdateAuthority>, new_authority: Pubkey) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        require!(
            ctx.accounts.authority.key() == program_state.authority,
            MetaBricksError::Unauthorized
        );

        program_state.authority = new_authority;
        msg!("✅ Program authority updated to: {}", new_authority);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = ProgramState::LEN,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(brick_id: u32)]
pub struct PurchaseBrick<'info> {
    #[account(
        init,
        payer = buyer,
        space = PurchaseRecord::LEN,
        seeds = [b"brick", brick_id.to_le_bytes().as_ref()],
        bump
    )]
    pub purchase_record: Account<'info, PurchaseRecord>,
    
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// Treasury account to receive payments
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetBrickInfo<'info> {
    #[account(
        seeds = [b"brick", brick_id.to_le_bytes().as_ref()],
        bump = purchase_record.bump
    )]
    pub purchase_record: Account<'info, PurchaseRecord>,
    
    pub brick_id: u32,
}

#[derive(Accounts)]
pub struct GetWalletBricks<'info> {
    pub wallet: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct ProgramState {
    pub authority: Pubkey,
    pub total_bricks: u32,
    pub bricks_sold: u32,
    pub total_revenue: u64,
    pub bump: u8,
}

impl ProgramState {
    pub const LEN: usize = 8 + 32 + 4 + 4 + 8 + 1;
}

#[account]
pub struct PurchaseRecord {
    pub brick_id: u32,
    pub buyer: Pubkey,
    pub purchase_timestamp: i64,
    pub price_lamports: u64,
    pub metadata_uri: String,
    pub is_sold: bool,
    pub bump: u8,
}

impl PurchaseRecord {
    pub const LEN: usize = 8 + 4 + 32 + 8 + 8 + 200 + 1 + 1; // 200 chars for metadata URI
}

#[error_code]
pub enum MetaBricksError {
    #[msg("Invalid brick ID. Must be between 1 and 432.")]
    InvalidBrickId,
    
    #[msg("Brick is already sold.")]
    BrickAlreadySold,
    
    #[msg("Unauthorized operation.")]
    Unauthorized,
    
    #[msg("Insufficient payment amount.")]
    InsufficientPayment,
}
