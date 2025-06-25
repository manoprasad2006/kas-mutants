-- Add nft_details column to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS nft_details jsonb NOT NULL DEFAULT '[]';

-- Create user_nfts table to store fetched NFT data
CREATE TABLE IF NOT EXISTS user_nfts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticker text NOT NULL, -- MUTANT, MUTANT2, PXMUTANT, KASMUTANT
  token_id text NOT NULL,
  name text NOT NULL,
  image_url text,
  rarity_rank integer,
  fetched_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ticker, token_id)
);

-- Enable Row Level Security on user_nfts table
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;

-- User NFTs policies
CREATE POLICY "Users can read own NFTs"
  ON user_nfts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NFTs"
  ON user_nfts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own NFTs"
  ON user_nfts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own NFTs"
  ON user_nfts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 