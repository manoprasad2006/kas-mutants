import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Trophy, Medal, Award, User } from 'lucide-react'

interface LeaderboardEntry {
  user_id: string
  total_nfts: number
  total_weight: number
  rank: number
  users: {
    email: string
    telegram_username: string | null
    wallet_address: string | null
  }
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          *,
          users (
            email,
            telegram_username,
            wallet_address
          )
        `)
        .order('rank')
        .limit(100)

      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400" size={24} />
      case 2:
        return <Medal className="text-gray-400" size={24} />
      case 3:
        return <Award className="text-yellow-600" size={24} />
      default:
        return <div className="w-6 h-6 bg-dark-tertiary rounded-full flex items-center justify-center text-xs text-grey-light font-bold">{rank}</div>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30 animate-glow'
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 border-gray-400/30'
      case 3:
        return 'bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border-yellow-600/30'
      default:
        return 'bg-dark-secondary/80 border-dark-tertiary/50'
    }
  }

  const formatWalletAddress = (address: string | null) => {
    if (!address) return 'Not linked'
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.users.telegram_username) {
      return `@${entry.users.telegram_username}`
    }
    return entry.users.email?.split('@')[0] || 'Anonymous'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dark-tertiary border-t-turquoise-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-grey-light text-lg">Top stakers in the Mutant NFT Ecosystem</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-turquoise-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Trophy className="text-turquoise-primary" size={24} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">500K</div>
            <div className="text-grey-light text-sm">Weekly Pool</div>
          </div>

          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-turquoise-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="text-turquoise-primary" size={24} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{leaderboard.length}</div>
            <div className="text-grey-light text-sm">Active Stakers</div>
          </div>

          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-turquoise-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="text-turquoise-primary" size={24} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {leaderboard.reduce((sum, entry) => sum + entry.total_nfts, 0)}
            </div>
            <div className="text-grey-light text-sm">Total NFTs Staked</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-dark-tertiary/50">
            <h2 className="text-xl font-semibold text-white">Rankings</h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-grey-medium" size={32} />
              </div>
              <h3 className="text-white font-semibold mb-2">No rankings yet</h3>
              <p className="text-grey-light">Be the first to stake and claim the top spot!</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-tertiary/30">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`p-6 transition-all duration-200 hover:bg-dark-tertiary/20 ${
                    entry.rank <= 3 ? getRankStyle(entry.rank) + ' backdrop-blur-xl' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-semibold">
                            {getDisplayName(entry)}
                          </h3>
                          {entry.rank <= 3 && (
                            <div className="px-2 py-1 bg-turquoise-primary/20 text-turquoise-primary text-xs rounded-full font-medium">
                              Top {entry.rank}
                            </div>
                          )}
                        </div>
                        <div className="text-grey-light text-sm font-mono">
                          {formatWalletAddress(entry.users.wallet_address)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-white font-semibold">{entry.total_nfts}</div>
                          <div className="text-grey-light text-xs">NFTs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-turquoise-primary font-bold text-lg">
                            {entry.total_weight.toFixed(1)}
                          </div>
                          <div className="text-grey-light text-xs">Weight</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rewards Info */}
        <div className="mt-8 bg-gradient-to-r from-turquoise-primary/10 to-turquoise-secondary/10 border border-turquoise-primary/20 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">How Rewards Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-grey-light">
            <div>
              <p>• <strong className="text-turquoise-primary">Weekly Pool:</strong> 500,000 $MUTANT tokens</p>
              <p>• <strong className="text-turquoise-primary">Distribution:</strong> Proportional to staking weight</p>
            </div>
            <div>
              <p>• <strong className="text-turquoise-primary">Bonus:</strong> +25% for $MUTANT token holders</p>
              <p>• <strong className="text-turquoise-primary">Payout:</strong> Every Monday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard