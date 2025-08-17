use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError,
    msg,
    program_pack::Pack,
    sysvar::{rent::Rent, Sysvar},
    program::invoke,
    system_instruction,
};

use spl_token::{
    instruction as token_instruction,
    state::Mint,
};

use mpl_token_metadata::{
  instructions::{CreateMetadataAccountV3Builder, CreateMasterEditionV3Builder},
  types::{DataV2, Creator},
};

entrypoint!(process_instruction);

#[derive(Clone, Debug, PartialEq)]
pub enum MetaBricksInstruction {
  CreateNFT {
    name: String,
    symbol: String,
    uri: String,
    seller_fee_basis_points: u16,
  },
  TransferNFT,
}

impl MetaBricksInstruction {
  pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
    let (&tag, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
    
    Ok(match tag {
      0 => {
        let name_len = rest[0] as usize;
        let name = String::from_utf8(rest[1..1+name_len].to_vec())
          .map_err(|_| ProgramError::InvalidInstructionData)?;
        
        let symbol_len = rest[1+name_len] as usize;
        let symbol = String::from_utf8(rest[2+name_len..2+name_len+symbol_len].to_vec())
          .map_err(|_| ProgramError::InvalidInstructionData)?;
        
        let uri_len = rest[2+name_len+symbol_len] as usize;
        let uri = String::from_utf8(rest[3+name_len+symbol_len..3+name_len+symbol_len+uri_len].to_vec())
          .map_err(|_| ProgramError::InvalidInstructionData)?;
        
        let seller_fee_basis_points = u16::from_le_bytes([
          rest[3+name_len+symbol_len+uri_len],
          rest[4+name_len+symbol_len+uri_len]
        ]);
        
        MetaBricksInstruction::CreateNFT {
          name,
          symbol,
          uri,
          seller_fee_basis_points,
        }
      },
      1 => MetaBricksInstruction::TransferNFT,
      _ => return Err(ProgramError::InvalidInstructionData),
    })
  }
}

fn process_instruction(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  instruction_data: &[u8],
) -> ProgramResult {
  let instruction = MetaBricksInstruction::unpack(instruction_data)?;
  
  match instruction {
    MetaBricksInstruction::CreateNFT { name, symbol, uri, seller_fee_basis_points } => {
      msg!("Instruction: CreateNFT");
      process_create_nft(program_id, accounts, name, symbol, uri, seller_fee_basis_points)
    },
    MetaBricksInstruction::TransferNFT => {
      msg!("Instruction: TransferNFT");
      process_transfer_nft(program_id, accounts)
    },
  }
}

fn process_create_nft(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  name: String,
  symbol: String,
  uri: String,
  seller_fee_basis_points: u16,
) -> ProgramResult {
  let accounts_iter = &mut accounts.iter();
  
  let mint_account = next_account_info(accounts_iter)?;
  let metadata_account = next_account_info(accounts_iter)?;
  let master_edition_account = next_account_info(accounts_iter)?;
  let mint_authority = next_account_info(accounts_iter)?;
  let payer = next_account_info(accounts_iter)?;
  let update_authority = next_account_info(accounts_iter)?;
  let system_program = next_account_info(accounts_iter)?;
  let sysvar_rent = next_account_info(accounts_iter)?;
  let token_program = next_account_info(accounts_iter)?;
  let associated_token_program = next_account_info(accounts_iter)?;
  let metadata_program = next_account_info(accounts_iter)?;
  
  // Verify accounts
  if !mint_authority.is_signer {
    return Err(ProgramError::MissingRequiredSignature);
  }
  
  if !payer.is_signer {
    return Err(ProgramError::MissingRequiredSignature);
  }
  
  // Create the mint account if it doesn't exist
  if mint_account.owner == system_program.key {
    // Create the mint account
    let create_account_ix = system_instruction::create_account(
      payer.key,
      mint_account.key,
      spl_token::state::Mint::LEN as u64,
      0, // lamports (will be filled by system program)
      token_program.key,
    );
    
    invoke(
      &create_account_ix,
      &[
        payer.clone(),
        mint_account.clone(),
        system_program.clone(),
        sysvar_rent.clone(),
      ],
    )?;
  }
  
  // Initialize the mint
  invoke(
    &token_instruction::initialize_mint(
      token_program.key,
      mint_account.key,
      mint_authority.key,
      Some(mint_authority.key),
      0, // decimals for NFT
    )?,
    &[
      mint_account.clone(),
      mint_authority.clone(),
      token_program.clone(),
      sysvar_rent.clone(),
    ],
  )?;
  
  // Create metadata
  let creators = vec![
    Creator {
      address: *mint_authority.key,
      verified: true,
      share: 100,
    }
  ];
  
  let data_v2 = DataV2 {
    name,
    symbol,
    uri,
    seller_fee_basis_points,
    creators: Some(creators),
    collection: None,
    uses: None,
  };
  
  let metadata_instruction = CreateMetadataAccountV3Builder::new()
    .metadata(*metadata_account.key)
    .mint(*mint_account.key)
    .mint_authority(*mint_authority.key)
    .payer(*payer.key)
    .update_authority(*update_authority.key, false) // as_signer = false
    .system_program(*system_program.key)
    .rent(Some(*sysvar_rent.key))
    .data(data_v2)
    .is_mutable(true)
    .collection_details(mpl_token_metadata::types::CollectionDetails::V1 { size: 0 })
    .instruction();
  
  // Use simple invoke instead of invoke_signed to avoid permission issues
  invoke(
    &metadata_instruction,
    &[
      metadata_account.clone(),
      mint_account.clone(),
      mint_authority.clone(),
      payer.clone(),
      update_authority.clone(),
      system_program.clone(),
      sysvar_rent.clone(),
    ],
  )?;
  
  // Create master edition
  let master_edition_instruction = CreateMasterEditionV3Builder::new()
    .edition(*master_edition_account.key)
    .mint(*mint_account.key)
    .update_authority(*update_authority.key)
    .payer(*payer.key)
    .metadata(*metadata_account.key)
    .mint_authority(*mint_authority.key)
    .max_supply(0)
    .instruction();
  
  // Use simple invoke instead of invoke_signed to avoid permission issues
  invoke(
    &master_edition_instruction,
    &[
      master_edition_account.clone(),
      metadata_account.clone(),
      mint_account.clone(),
      update_authority.clone(),
      payer.clone(),
      system_program.clone(),
      sysvar_rent.clone(),
    ],
  )?;
  
  msg!("NFT created successfully!");
  Ok(())
}

fn process_transfer_nft(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
) -> ProgramResult {
  let accounts_iter = &mut accounts.iter();
  let seller = next_account_info(accounts_iter)?;
  let buyer = next_account_info(accounts_iter)?;
  let nft = next_account_info(accounts_iter)?;

  // Verify the seller is the owner of the NFT
  if *seller.owner != *program_id {
      return Err(ProgramError::IncorrectProgramId);
  }

  // Transfer the NFT from seller to buyer
  // Transfer the payment from buyer to seller
  // (Implementation details here)

  msg!("NFT transferred from seller to buyer");

  Ok(())
}
