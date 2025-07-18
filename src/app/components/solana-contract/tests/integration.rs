#[cfg(test)]
mod tests {
    use super::*;
    use solana_program_test::*;
    use solana_sdk::{account::Account, instruction::Instruction, pubkey::Pubkey, signature::Signer, transaction::Transaction};

    #[tokio::test]
    async fn test_transfer_nft() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "solana_contract",
            program_id,
            processor!(process_instruction),
        )
        .start()
        .await;

        let seller = Keypair::new();
        let buyer = Keypair::new();
        let nft = Keypair::new();

        // Add your test logic here
    }
}
