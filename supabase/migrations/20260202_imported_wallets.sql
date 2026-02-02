-- Create imported_wallets table to store user's imported wallets
CREATE TABLE IF NOT EXISTS public.imported_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  xrp_address TEXT NOT NULL,
  xrp_balance TEXT DEFAULT '0',
  evm_address TEXT,
  solana_address TEXT,
  tron_address TEXT,
  bitcoin_address TEXT,
  seed_hash TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique user-address combination to prevent duplicates
  UNIQUE(user_id, xrp_address)
);

-- Create index for faster lookups
CREATE INDEX idx_imported_wallets_user_id ON public.imported_wallets(user_id);
CREATE INDEX idx_imported_wallets_xrp_address ON public.imported_wallets(xrp_address);

-- Enable RLS (Row Level Security)
ALTER TABLE public.imported_wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own imported wallets
CREATE POLICY "Users can view their own imported wallets"
ON public.imported_wallets FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own imported wallets
CREATE POLICY "Users can insert their own imported wallets"
ON public.imported_wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own imported wallets
CREATE POLICY "Users can update their own imported wallets"
ON public.imported_wallets FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own imported wallets
CREATE POLICY "Users can delete their own imported wallets"
ON public.imported_wallets FOR DELETE
USING (auth.uid() = user_id);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_imported_wallets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the timestamp function
CREATE TRIGGER update_imported_wallets_timestamp
BEFORE UPDATE ON public.imported_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_imported_wallets_timestamp();
