import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Wallet, MessageCircle, Image, Check, ChevronDown } from 'lucide-react'

interface Collection {
  id: string
  name: string
  ipfs_cid: string
  nft_count: number
}

interface NFT {
  id: string
  name: string
  image: string
  rarity: 'common' | 'bronze' | 'silver' | 'gold'
}

const StakingForm: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    walletAddress: '',
    telegramUsername: '',
    collectionId: '',
    selectedNFTs: [] as string[],
    bonusEligible: false
  })
  const [collections, setCollections] = useState<Collection[]>([])
  const [nfts, setNFTs] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingNFTs, setLoadingNFTs] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  useEffect(() => {
    if (formData.collectionId) {
      fetchNFTs(formData.collectionId)
    }
  }, [formData.collectionId])

  const fetchCollections = async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching collections:', error)
    } else {
      setCollections(data || [])
    }
  }

  const fetchNFTs = async (collectionId: string) => {
    setLoadingNFTs(true)
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return

    // Mock NFT data - in production, this would fetch from IPFS
    const mockNFTs: NFT[] = Array.from({ length: collection.nft_count }, (_, i) => ({
      id: `${collectionId}-${i + 1}`,
      name: `${collection.name} #${i + 1}`,
      image: `https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop`,
      rarity: ['common', 'bronze', 'silver', 'gold'][Math.floor(Math.random() * 4)] as any
    }))

    setNFTs(mockNFTs)
    setLoadingNFTs(false)
  }

  const getRarityMultiplier = (rarity: string) => {
    switch (rarity) {
      case 'common': return 1
      case 'bronze': return 2
      case 'silver': return 3
      case 'gold': return 6
      default: return 1
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-grey-light'
      case 'bronze': return 'text-yellow-600'
      case 'silver': return 'text-gray-400'
      case 'gold': return 'text-yellow-400'
      default: return 'text-grey-light'
    }
  }

  const calculateTotalWeight = () => {
    const baseWeight = formData.selectedNFTs.reduce((total, nftId) => {
      const nft = nfts.find(n => n.id === nftId)
      return total + (nft ? getRarityMultiplier(nft.rarity) : 0)
    }, 0)
    return formData.bonusEligible ? baseWeight * 1.25 : baseWeight
  }

  const toggleNFTSelection = (nftId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedNFTs: prev.selectedNFTs.includes(nftId)
        ? prev.selectedNFTs.filter(id => id !== nftId)
        : [...prev.selectedNFTs, nftId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const totalWeight = calculateTotalWeight()

      const { error } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          collection_id: formData.collectionId,
          nft_ids: formData.selectedNFTs,
          rarity_weights: totalWeight,
          bonus_eligible: formData.bonusEligible,
          status: 'submitted'
        })

      if (error) throw error

      // Update user profile
      await supabase
        .from('users')
        .update({
          wallet_address: formData.walletAddress,
          telegram_username: formData.telegramUsername
        })
        .eq('id', user.id)

      navigate('/dashboard')
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Stake Your NFTs</h1>
          <p className="text-grey-light text-lg">Select your collection and NFTs to start earning rewards</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Details */}
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">User Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-grey-light mb-2">
                  <Wallet size={16} className="inline mr-2" />
                  Kaspa Wallet Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.walletAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-tertiary border border-dark-quaternary rounded-lg text-white placeholder-grey-medium focus:outline-none focus:ring-2 focus:ring-turquoise-primary/50 focus:border-turquoise-primary transition-all duration-200"
                  placeholder="kaspa:qqr5ap..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-grey-light mb-2">
                  <MessageCircle size={16} className="inline mr-2" />
                  Telegram Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.telegramUsername}
                  onChange={(e) => setFormData(prev => ({ ...prev, telegramUsername: e.target.value }))}
                  className="w-full px-4 py-3 bg-dark-tertiary border border-dark-quaternary rounded-lg text-white placeholder-grey-medium focus:outline-none focus:ring-2 focus:ring-turquoise-primary/50 focus:border-turquoise-primary transition-all duration-200"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Collection Selection */}
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Select Collection</h2>
            <div className="relative">
              <select
                required
                value={formData.collectionId}
                onChange={(e) => setFormData(prev => ({ ...prev, collectionId: e.target.value, selectedNFTs: [] }))}
                className="w-full px-4 py-3 bg-dark-tertiary border border-dark-quaternary rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-turquoise-primary/50 focus:border-turquoise-primary transition-all duration-200 appearance-none"
              >
                <option value="">Choose a collection</option>
                {collections.map(collection => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name} ({collection.nft_count} NFTs)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-grey-medium pointer-events-none" size={20} />
            </div>
          </div>

          {/* NFT Selection */}
          {formData.collectionId && (
            <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Select NFTs</h2>
                <div className="text-sm text-grey-light">
                  {formData.selectedNFTs.length} selected • Total Weight: {calculateTotalWeight().toFixed(2)}
                </div>
              </div>

              {loadingNFTs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-dark-tertiary border-t-turquoise-primary rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {nfts.map(nft => {
                    const isSelected = formData.selectedNFTs.includes(nft.id)
                    return (
                      <div
                        key={nft.id}
                        onClick={() => toggleNFTSelection(nft.id)}
                        className={`relative cursor-pointer group transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-turquoise-primary shadow-lg shadow-turquoise-primary/20' 
                            : 'hover:ring-2 hover:ring-turquoise-primary/50'
                        } rounded-lg overflow-hidden`}
                      >
                        <div className="aspect-square bg-dark-tertiary relative">
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-turquoise-primary/20 flex items-center justify-center">
                              <div className="w-8 h-8 bg-turquoise-primary rounded-full flex items-center justify-center">
                                <Check size={16} className="text-dark-primary" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-primary/90 to-transparent p-2">
                            <div className="text-white text-xs font-medium truncate">{nft.name}</div>
                            <div className={`text-xs ${getRarityColor(nft.rarity)} capitalize`}>
                              {nft.rarity} ({getRarityMultiplier(nft.rarity)}x)
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bonus Eligibility */}
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.bonusEligible}
                onChange={(e) => setFormData(prev => ({ ...prev, bonusEligible: e.target.checked }))}
                className="w-5 h-5 text-turquoise-primary bg-dark-tertiary border-dark-quaternary rounded focus:ring-turquoise-primary/50 focus:ring-2"
              />
              <div>
                <div className="text-white font-medium">I've minted $MUTANT token</div>
                <div className="text-grey-light text-sm">Eligible for 25% bonus rewards</div>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || formData.selectedNFTs.length === 0}
              className="bg-gradient-to-r from-turquoise-primary to-turquoise-secondary text-dark-primary font-semibold py-4 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-turquoise-primary/25 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {loading ? 'Submitting...' : 'Stake NFTs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StakingForm