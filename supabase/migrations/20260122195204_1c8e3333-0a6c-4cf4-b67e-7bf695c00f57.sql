-- Auto-approve all existing KYC records for testing
UPDATE public.kyc_verifications 
SET status = 'approved', reviewed_at = now()
WHERE status != 'approved';

-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;