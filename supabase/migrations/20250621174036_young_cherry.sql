/*
  # Initial Mutant NFT Staking Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches Supabase auth.users id
      - `email` (text, unique) - user email from Google auth
      - `google_uid` (text) - Google OAuth user ID
      - `wallet_address` (text, nullable) - Kaspa wallet address
      - `telegram_username` (text, nullable) - Telegram username
      - `created_at` (timestamp) - account creation time

    - `collections`
      - `id` (uuid, primary key)
      - `name` (text) - collection name
      - `ipfs_cid` (text) - IPFS content identifier for NFT metadata
      - `nft_count` (integer) - total number of NFTs in collection

    - `submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - references users table
      - `collection_id` (uuid, foreign key) - references collections table
      - `nft_ids` (text array) - array of selected NFT IDs
      - `nft_details` (jsonb) - Store detailed NFT info including rarity rank
      - `rarity_weights` (numeric) - calculated total weight including bonuses
      - `bonus_eligible` (boolean) - whether user has minted $MUTANT token
      - `status` (text) - submission status (submitted, reward_sent, pending)
      - `submitted_at` (timestamp) - when submission was created

    - `leaderboard`
      - `user_id` (uuid, foreign key) - references users table
      - `total_nfts` (integer) - total number of NFTs staked
      - `total_weight` (numeric) - total calculated weight
      - `rank` (integer) - current ranking position

    - `admin_status`
      - `user_id` (uuid, foreign key) - references users table
      - `week` (text) - week identifier (YYYY-WW format)
      - `reward_sent` (boolean) - whether reward has been sent for this week

    - `user_nfts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - references users table
      - `ticker` (text) - MUTANT, MUTANT2, PXMUTANT, KASMUTANT
      - `token_id` (text) - NFT token ID
      - `name` (text) - NFT name
      - `image_url` (text) - NFT image URL
      - `rarity_rank` (integer) - NFT rarity rank
      - `fetched_at` (timestamp) - when NFT data was fetched

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for leaderboard public read access
    - Add admin policies for admin panel access

  3. Sample Data
    - Insert sample collections for testing
    - Collections include popular NFT project names with mock IPFS CIDs
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  google_uid text NOT NULL,
  wallet_address text,
  telegram_username text,
  created_at timestamptz DEFAULT now()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ipfs_cid text NOT NULL,
  nft_count integer NOT NULL DEFAULT 0
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  nft_ids text[] NOT NULL DEFAULT '{}',
  nft_details jsonb NOT NULL DEFAULT '[]', -- Store detailed NFT info including rarity rank
  rarity_weights numeric NOT NULL DEFAULT 0,
  bonus_eligible boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'submitted',
  submitted_at timestamptz DEFAULT now()
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_nfts integer NOT NULL DEFAULT 0,
  total_weight numeric NOT NULL DEFAULT 0,
  rank integer NOT NULL DEFAULT 0
);

-- Create admin_status table
CREATE TABLE IF NOT EXISTS admin_status (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  week text NOT NULL,
  reward_sent boolean NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, week)
);

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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Collections policies (public read)
CREATE POLICY "Collections are publicly readable"
  ON collections
  FOR SELECT
  TO authenticated
  USING (true);

-- Submissions policies
CREATE POLICY "Users can read own submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin can read all submissions
CREATE POLICY "Admin can read all submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@mutantecosystem.com'
    )
  );

-- Admin can update all submissions
CREATE POLICY "Admin can update all submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@mutantecosystem.com'
    )
  );

-- Leaderboard policies (public read)
CREATE POLICY "Leaderboard is publicly readable"
  ON leaderboard
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin status policies
CREATE POLICY "Users can read own admin status"
  ON admin_status
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Insert sample collections
INSERT INTO collections (name, ipfs_cid, nft_count) VALUES
  ('Mutant Apes', 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', 50),
  ('Crypto Punks', 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH', 30),
  ('Bored Apes', 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI', 40),
  ('Cool Cats', 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdJ', 25)
ON CONFLICT DO NOTHING;

-- Create function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS trigger AS $$
BEGIN
  -- Update or insert leaderboard entry
  INSERT INTO leaderboard (user_id, total_nfts, total_weight, rank)
  SELECT 
    user_id,
    SUM(array_length(nft_ids, 1)) as total_nfts,
    SUM(rarity_weights) as total_weight,
    0 as rank
  FROM submissions
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  GROUP BY user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_nfts = EXCLUDED.total_nfts,
    total_weight = EXCLUDED.total_weight;
  
  -- Update ranks
  WITH ranked_users AS (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_weight DESC) as new_rank
    FROM leaderboard
  )
  UPDATE leaderboard 
  SET rank = ranked_users.new_rank
  FROM ranked_users
  WHERE leaderboard.user_id = ranked_users.user_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update leaderboard
DROP TRIGGER IF EXISTS update_leaderboard_trigger ON submissions;
CREATE TRIGGER update_leaderboard_trigger
  AFTER INSERT OR UPDATE OR DELETE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard();