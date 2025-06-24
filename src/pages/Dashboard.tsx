import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Wallet, MessageCircle, Trophy, Clock, Image as ImageIcon, Plus } from 'lucide-react'

interface Submission {
  id: string
  collection_id: string
  nft_ids: string[]
  rarity_weights: number
  bonus_eligible: boolean
  status: string
  submitted_at: string
  collections: {
    name: string
  }
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserProfile(profile)

      // Fetch submissions
      const { data: submissionsData, error } = await supabase
        .from('submissions')
        .select(`
          *,
          collections (name)
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setSubmissions(submissionsData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-yellow-400 bg-yellow-400/20'
      case 'reward_sent': return 'text-green-400 bg-green-400/20'
      case 'pending': return 'text-grey-light bg-grey-light/20'
      default: return 'text-grey-light bg-grey-light/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted'
      case 'reward_sent': return 'Reward Sent'
      case 'pending': return 'Pending'
      default: return 'Unknown'
    }
  }

  const calculateEstimatedReward = (weight: number) => {
    const weeklyPool = 500000
    const estimatedTotalWeight = 10000 // This would be calculated from all submissions
    return (weight / estimatedTotalWeight) * weeklyPool
  }

  const getDaysUntilMonday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    return daysUntilMonday
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dark-tertiary border-t-turquoise-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  const totalWeight = submissions.reduce((sum, sub) => sum + sub.rarity_weights, 0)
  const totalNFTs = submissions.reduce((sum, sub) => sum + sub.nft_ids.length, 0)
  const estimatedReward = calculateEstimatedReward(totalWeight)

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-grey-light">Manage your NFT staking and view rewards</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-turquoise-primary/20 rounded-lg flex items-center justify-center">
                <ImageIcon className="text-turquoise-primary" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalNFTs}</div>
            <div className="text-grey-light text-sm">Total NFTs Staked</div>
          </div>

          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-turquoise-primary/20 rounded-lg flex items-center justify-center">
                <Trophy className="text-turquoise-primary" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalWeight.toFixed(1)}</div>
            <div className="text-grey-light text-sm">Total Weight</div>
          </div>

          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-turquoise-primary/20 rounded-lg flex items-center justify-center">
                <Wallet className="text-turquoise-primary" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{estimatedReward.toLocaleString()}</div>
            <div className="text-grey-light text-sm">Est. Weekly Reward</div>
          </div>

          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-turquoise-primary/20 rounded-lg flex items-center justify-center">
                <Clock className="text-turquoise-primary" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{getDaysUntilMonday()}</div>
            <div className="text-grey-light text-sm">Days to Payout</div>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-turquoise-primary/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-turquoise-primary" size={20} />
              </div>
              <div>
                <div className="text-grey-light text-sm">Email</div>
                <div className="text-white font-medium">{user?.email}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-turquoise-primary/20 rounded-lg flex items-center justify-center">
                <Wallet className="text-turquoise-primary" size={20} />
              </div>
              <div>
                <div className="text-grey-light text-sm">Kaspa Wallet</div>
                <div className="text-white font-medium font-mono text-sm">
                  {userProfile?.wallet_address ? 
                    `${userProfile.wallet_address.slice(0, 12)}...${userProfile.wallet_address.slice(-8)}` : 
                    'Not set'
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-turquoise-primary/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-turquoise-primary" size={20} />
              </div>
              <div>
                <div className="text-grey-light text-sm">Telegram</div>
                <div className="text-white font-medium">
                  {userProfile?.telegram_username || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staking History */}
        <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Staking History</h2>
            <button
              onClick={() => navigate('/stake')}
              className="bg-gradient-to-r from-turquoise-primary to-turquoise-secondary text-dark-primary font-semibold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-turquoise-primary/25 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Stake More</span>
            </button>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-grey-medium" size={32} />
              </div>
              <h3 className="text-white font-semibold mb-2">No NFTs staked yet</h3>
              <p className="text-grey-light mb-6">Start staking your NFTs to earn rewards</p>
              <button
                onClick={() => navigate('/stake')}
                className="bg-gradient-to-r from-turquoise-primary to-turquoise-secondary text-dark-primary font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-turquoise-primary/25 transition-all duration-200"
              >
                Stake Your First NFT
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map(submission => (
                <div key={submission.id} className="bg-dark-tertiary/50 border border-dark-quaternary/30 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{submission.collections.name}</h3>
                      <div className="text-grey-light text-sm">
                        {submission.nft_ids.length} NFTs • Weight: {submission.rarity_weights.toFixed(1)}
                        {submission.bonus_eligible && <span className="text-turquoise-primary ml-2">+25% Bonus</span>}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusText(submission.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-grey-light">
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                    <div className="text-turquoise-primary font-medium">
                      Est. Reward: {calculateEstimatedReward(submission.rarity_weights).toLocaleString()} $MUTANT
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard