use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Declare the program entrypoint
entrypoint!(process_instruction);

// Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("CodelonX Token program entrypoint");

    // Get account iterator
    let accounts_iter = &mut accounts.iter();

    // Get the account that will be modified
    let account = next_account_info(accounts_iter)?;

    // Ensure the account is owned by the program
    if account.owner != program_id {
        msg!("Account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Process instructions based on the first byte
    match instruction_data[0] {
        0 => {
            msg!("Instruction: Initialize Token");
            // Logic for token initialization
        }
        1 => {
            msg!("Instruction: Mint");
            // Minting logic
        }
        2 => {
            msg!("Instruction: Transfer");
            // Transfer logic
        }
        _ => {
            msg!("Error: Unknown instruction");
            return Err(ProgramError::InvalidInstructionData);
        }
    }

    Ok(())
} 