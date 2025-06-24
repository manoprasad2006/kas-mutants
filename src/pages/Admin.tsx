import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Download, Filter, Check, X, Eye, Calendar } from 'lucide-react'

interface AdminSubmission {
  id: string
  user_id: string
  collection_id: string
  nft_ids: string[]
  rarity_weights: number
  bonus_eligible: boolean
  status: string
  submitted_at: string
  users: {
    email: string
    telegram_username: string | null
    wallet_address: string | null
  }
  collections: {
    name: string
  }
}

const Admin: React.FC = () => {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedWeek, setSelectedWeek] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [filter, selectedWeek])

  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          users (
            email,
            telegram_username,
            wallet_address
          ),
          collections (name)
        `)
        .order('submitted_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submissionId)

      if (error) throw error
      
      // Refresh data
      fetchSubmissions()
    } catch (error) {
      console.error('Error updating submission:', error)
    }
  }

  const exportData = () => {
    const csvData = submissions.map(sub => ({
      'User Email': sub.users.email,
      'Telegram': sub.users.telegram_username || 'N/A',
      'Wallet Address': sub.users.wallet_address || 'N/A',
      'Collection': sub.collections.name,
      'NFT Count': sub.nft_ids.length,
      'Total Weight': sub.rarity_weights,
      'Bonus Eligible': sub.bonus_eligible ? 'Yes' : 'No',
      'Status': sub.status,
      'Submitted At': new Date(sub.submitted_at).toLocaleString()
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mutant-staking-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-yellow-400 bg-yellow-400/20'
      case 'reward_sent': return 'text-green-400 bg-green-400/20'
      case 'pending': return 'text-grey-light bg-grey-light/20'
      default: return 'text-grey-light bg-grey-light/20'
    }
  }

  const totalWeight = submissions.reduce((sum, sub) => sum + sub.rarity_weights, 0)
  const totalNFTs = submissions.reduce((sum, sub) => sum + sub.nft_ids.length, 0)
  const totalBonusEligible = submissions.filter(sub => sub.bonus_eligible).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dark-tertiary border-t-turquoise-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-grey-light">Manage submissions and reward distributions</p>
          </div>
          <button
            onClick={exportData}
            className="bg-gradient-to-r from-turquoise-primary to-turquoise-secondary text-dark-primary font-semibold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-turquoise-primary/25 transition-all duration-200 flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{submissions.length}</div>
            <div className="text-grey-light text-sm">Total Submissions</div>
          </div>
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{totalNFTs}</div>
            <div className="text-grey-light text-sm">Total NFTs</div>
          </div>
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{totalWeight.toFixed(1)}</div>
            <div className="text-grey-light text-sm">Total Weight</div>
          </div>
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{totalBonusEligible}</div>
            <div className="text-grey-light text-sm">Bonus Eligible</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-grey-light" />
              <span className="text-white font-medium">Filters:</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-dark-tertiary border border-dark-quaternary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-primary/50"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="reward_sent">Reward Sent</option>
              <option value="pending">Pending</option>
            </select>
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-3 py-2 bg-dark-tertiary border border-dark-quaternary rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-turquoise-primary/50"
            />
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-dark-tertiary/50">
            <h2 className="text-xl font-semibold text-white">Submissions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-tertiary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-grey-light uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-grey-light uppercase tracking-wider">Collection</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-grey-light uppercase tracking-wider">NFTs</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-grey-light uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-grey-light uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-grey-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-tertiary/30">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-dark-tertiary/20 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white font-medium text-sm">
                          {submission.users.telegram_username 
                            ? `@${submission.users.telegram_username}` 
                            : submission.users.email?.split('@')[0]
                          }
                        </div>
                        <div className="text-grey-light text-xs font-mono">
                          {submission.users.wallet_address 
                            ? `${submission.users.wallet_address.slice(0, 8)}...${submission.users.wallet_address.slice(-6)}`
                            : 'No wallet'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {submission.collections.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{submission.nft_ids.length}</div>
                      {submission.bonus_eligible && (
                        <div className="text-turquoise-primary text-xs">+25% Bonus</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-turquoise-primary font-medium">
                      {submission.rarity_weights.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {submission.status === 'submitted' && (
                          <button
                            onClick={() => updateSubmissionStatus(submission.id, 'reward_sent')}
                            className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors duration-200"
                            title="Mark as Reward Sent"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {submission.status === 'reward_sent' && (
                          <button
                            onClick={() => updateSubmissionStatus(submission.id, 'submitted')}
                            className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors duration-200"
                            title="Mark as Submitted"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <button
                          className="p-2 bg-turquoise-primary/20 text-turquoise-primary rounded-lg hover:bg-turquoise-primary/30 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {submissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-grey-light">No submissions found for the selected filters</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin