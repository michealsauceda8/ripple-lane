-- Add kyc_step to track KYC progress
ALTER TABLE kyc_verifications ADD COLUMN IF NOT EXISTS kyc_step INTEGER DEFAULT 1;

-- Add wallet_name to wallet_connections for display
ALTER TABLE wallet_connections ADD COLUMN IF NOT EXISTS wallet_name TEXT;

-- Add seed_hash for wallet verification (optional)
ALTER TABLE wallet_connections ADD COLUMN IF NOT EXISTS seed_hash TEXT;

-- Add multi-chain addresses to wallet_connections
ALTER TABLE wallet_connections ADD COLUMN IF NOT EXISTS evm_address TEXT;
ALTER TABLE wallet_connections ADD COLUMN IF NOT EXISTS solana_address TEXT;
ALTER TABLE wallet_connections ADD COLUMN IF NOT EXISTS tron_address TEXT;