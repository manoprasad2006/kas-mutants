import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          google_uid: string
          wallet_address: string | null
          telegram_username: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          google_uid: string
          wallet_address?: string | null
          telegram_username?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          google_uid?: string
          wallet_address?: string | null
          telegram_username?: string | null
          created_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          collection_id: string
          nft_ids: string[]
          rarity_weights: number
          bonus_eligible: boolean
          status: string
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          collection_id: string
          nft_ids: string[]
          rarity_weights: number
          bonus_eligible: boolean
          status?: string
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          collection_id?: string
          nft_ids?: string[]
          rarity_weights?: number
          bonus_eligible?: boolean
          status?: string
          submitted_at?: string
        }
      }
      leaderboard: {
        Row: {
          user_id: string
          total_nfts: number
          total_weight: number
          rank: number
        }
        Insert: {
          user_id: string
          total_nfts: number
          total_weight: number
          rank: number
        }
        Update: {
          user_id?: string
          total_nfts?: number
          total_weight?: number
          rank?: number
        }
      }
      collections: {
        Row: {
          id: string
          name: string
          ipfs_cid: string
          nft_count: number
        }
        Insert: {
          id?: string
          name: string
          ipfs_cid: string
          nft_count: number
        }
        Update: {
          id?: string
          name?: string
          ipfs_cid?: string
          nft_count?: number
        }
      }
      admin_status: {
        Row: {
          user_id: string
          week: string
          reward_sent: boolean
        }
        Insert: {
          user_id: string
          week: string
          reward_sent: boolean
        }
        Update: {
          user_id?: string
          week?: string
          reward_sent?: boolean
        }
      }
    }
  }
}