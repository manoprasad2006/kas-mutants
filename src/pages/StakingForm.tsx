import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Wallet, MessageCircle, Image, Check, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface UserNFT {
  id: string
  ticker: string
  tokenId: string
  name: string
  imageUrl: string
  rarityRank: number | null
  isSelected: boolean
}

interface NFTDetails {
  ticker: string
  tokenId: string
  name: string
  imageUrl: string
  rarityRank: number | null
}

const StakingForm: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    walletAddress: '',
    telegramUsername: '',
    bonusEligible: false
  })
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingNFTs, setFetchingNFTs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutantCIDs: Record<string, string> = {
    'MUTANT': 'QmdbXA8LEvxNy7gGQbcz8iWvLLspyqDB1vvHpnmGL5WLFW',
    'MUTANT2': 'QmbqrouZp5MbDHQ6KjjAQBHvYNR8PNwjZcAN8Q8fTHUHhB',
    'KASMUTANT': 'QmVnowzF4poqmNGbbRQVhgbdnN5Ytk8WPrrw9hrdFfYryE',
    'PXMUTANT': 'QmS8WECqbrweqwR8HxTyKJgwBWwXznoGxbq7cdmi6d5pBE'
  };

  useEffect(() => {
    if (user) {
      loadUserProfile()
      loadUserNFTs()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('users')
      .select('wallet_address, telegram_username')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setFormData(prev => ({
        ...prev,
        walletAddress: data.wallet_address || '',
        telegramUsername: data.telegram_username || ''
      }))
    }
  }

  const loadUserNFTs = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_nfts')
      .select('*')
      .eq('user_id', user.id)
      .order('ticker')
      .order('token_id')

    if (!error && data) {
      const nfts: UserNFT[] = data.map(nft => ({
        id: `${nft.ticker}-${nft.token_id}`,
        ticker: nft.ticker,
        tokenId: nft.token_id,
        name: nft.name,
        imageUrl: nft.image_url || '',
        rarityRank: nft.rarity_rank,
        isSelected: false
      }))
      setUserNFTs(nfts)
    }
  }

  const getNftRank = async (ticker: string, tokenId: string): Promise<number | null> => {
    // Use the local proxy to avoid CORS
    const apiUrl = 'http://localhost:3001/proxy/kaspa-tokens';

    try {
      const response = await axios.post(
        apiUrl,
        {
          ticker: ticker,
          sortField: 'rarityRank',  // Sorting by rarityRank (rank)
          sortDirection: 'asc',     // Ascending order for rank (lower rarityRank means higher rank)
          limit: 10000,             // High limit to ensure we get all tokens
          offset: 0                 // Starting from the first token
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const items = response.data.items;  // List of tokens in the collection
      const index = items.findIndex((item: any) => String(item.tokenId) === String(tokenId));

      if (index === -1) {
        console.log(`❌ Token ID ${tokenId} not found in the ${ticker} collection.`);
        return null;
      } else {
        // Rank is 1-based, so add 1 to the index
        const rank = index + 1;
        console.log(`✅ ${ticker} #${tokenId} has rank: #${rank}`);
        return rank;
      }
    } catch (error: any) {
      if (error.response) {
        console.error(`❌ API Error: ${error.response.status} ${error.response.statusText}`);
      } else {
        console.error('❌ Error:', error.message);
      }
      return null;
    }
  }

  function ipfsToHttp(url: string) {
    if (!url) return '';
    if (url.startsWith('ipfs://')) {
      return url.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
    }
    return url;
  }

  const fetchAllNFTs = async (address: string) => {
    let allNFTs: any[] = [];
    let next: string | null = null;
    do {
      const url = `https://mainnet.krc721.stream/api/v1/krc721/mainnet/address/${address}` + (next ? `?offset=${next}` : '');
      const response = await axios.get(url);
      const result = response.data.result || [];
      allNFTs = allNFTs.concat(result);
      next = response.data.next;
    } while (next);
    return allNFTs;
  }

  const fetchUserNFTs = async () => {
    if (!user || !formData.walletAddress) {
      setError('Please enter your Kaspa wallet address first')
      return
    }

    setFetchingNFTs(true)
    setError(null)

    try {
      // Clear existing NFTs
      await supabase
        .from('user_nfts')
        .delete()
        .eq('user_id', user.id)

      // Fetch ALL NFTs from KRC721 API (all pages)
      const allNFTs = await fetchAllNFTs(formData.walletAddress);
      console.log('Fetched NFTs:', allNFTs)
      
      const allowedTickers = ['MUTANT', 'MUTANT2', 'PXMUTANT', 'KASMUTANT']
      const filteredNFTs = allNFTs.filter((nft: any) => 
        allowedTickers.includes((nft.tick || '').toUpperCase().trim())
      )

      if (filteredNFTs.length === 0) {
        setError('No eligible NFTs found in your wallet. Make sure you have MUTANT, MUTANT2, PXMUTANT, or KASMUTANT NFTs.')
        setFetchingNFTs(false)
        return
      }

      const processedNFTs: NFTDetails[] = []
      
      for (const nft of filteredNFTs) {
        const ticker = (nft.tick || '').toUpperCase().trim();
        let imageUrl = '';
        try {
          const metadataUrl = ipfsToHttp(nft.buri);
          const metadataResp = await axios.get(metadataUrl);
          const metadata = metadataResp.data;
          if (metadata.image) {
            imageUrl = ipfsToHttp(metadata.image);
          } else if (mutantCIDs[ticker]) {
            imageUrl = `https://ipfs.io/ipfs/${mutantCIDs[ticker]}/${nft.tokenId}.png`;
          } else {
            imageUrl = 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
          }
        } catch (e) {
          if (mutantCIDs[ticker]) {
            imageUrl = `https://ipfs.io/ipfs/${mutantCIDs[ticker]}/${nft.tokenId}.png`;
          } else {
            imageUrl = 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
          }
        }

        // Try to get rarityRank, but skip if CORS error
        let rarityRank: number | null = null
        try {
          rarityRank = await getNftRank(ticker, nft.tokenId)
        } catch (e) {
          rarityRank = null
        }

        processedNFTs.push({
          ticker,
          tokenId: nft.tokenId,
          name: `${ticker} #${nft.tokenId}`,
          imageUrl,
          rarityRank
        })
      }

      // Save to database
      const nftsToInsert = processedNFTs.map(nft => ({
        user_id: user.id,
        ticker: nft.ticker,
        token_id: nft.tokenId,
        name: nft.name,
        image_url: nft.imageUrl,
        rarity_rank: nft.rarityRank
      }))

      const { error: insertError } = await supabase
        .from('user_nfts')
        .insert(nftsToInsert)

      if (insertError) {
        throw insertError
      }

      // Update local state
      const newUserNFTs: UserNFT[] = processedNFTs.map(nft => ({
        id: `${nft.ticker}-${nft.tokenId}`,
        ticker: nft.ticker,
        tokenId: nft.tokenId,
        name: nft.name,
        imageUrl: nft.imageUrl,
        rarityRank: nft.rarityRank,
        isSelected: false
      }))

      setUserNFTs(newUserNFTs)

    } catch (error: any) {
      console.error('Error fetching NFTs:', error)
      setError(error.response?.data?.message || error.message || 'Failed to fetch NFTs')
    } finally {
      setFetchingNFTs(false)
    }
  }

  const getRarityMultiplier = (rarityRank: number | null) => {
    if (!rarityRank) return 1
    
    // Convert rank to multiplier (lower rank = higher multiplier)
    if (rarityRank <= 10) return 6      // Top 10
    if (rarityRank <= 50) return 3      // Top 50
    if (rarityRank <= 100) return 2     // Top 100
    return 1                            // Common
  }

  const getRarityColor = (rarityRank: number | null) => {
    if (!rarityRank) return 'text-grey-light'
    
    if (rarityRank <= 10) return 'text-yellow-400'    // Gold
    if (rarityRank <= 50) return 'text-gray-400'      // Silver
    if (rarityRank <= 100) return 'text-yellow-600'   // Bronze
    return 'text-grey-light'                          // Common
  }

  const getRarityLabel = (rarityRank: number | null) => {
    if (!rarityRank) return 'Unknown'
    
    if (rarityRank <= 10) return 'Legendary'
    if (rarityRank <= 50) return 'Epic'
    if (rarityRank <= 100) return 'Rare'
    return 'Common'
  }

  const calculateTotalWeight = () => {
    const baseWeight = userNFTs
      .filter(nft => nft.isSelected)
      .reduce((total, nft) => {
        return total + getRarityMultiplier(nft.rarityRank)
      }, 0)
    return formData.bonusEligible ? baseWeight * 1.25 : baseWeight
  }

  const toggleNFTSelection = (nftId: string) => {
    setUserNFTs(prev => prev.map(nft => 
      nft.id === nftId ? { ...nft, isSelected: !nft.isSelected } : nft
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const selectedNFTs = userNFTs.filter(nft => nft.isSelected)
    if (selectedNFTs.length === 0) {
      setError('Please select at least one NFT to stake')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const totalWeight = calculateTotalWeight()
      const nftDetails = selectedNFTs.map(nft => ({
        ticker: nft.ticker,
        tokenId: nft.tokenId,
        name: nft.name,
        imageUrl: nft.imageUrl,
        rarityRank: nft.rarityRank
      }))

      const { error } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          collection_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          nft_ids: selectedNFTs.map(nft => nft.id),
          nft_details: nftDetails,
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
    } catch (error: any) {
      console.error('Error submitting form:', error)
      setError(error.message || 'Failed to submit staking form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Stake Your NFTs</h1>
          <p className="text-grey-light text-lg">Connect your wallet and select NFTs to start earning rewards</p>
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

          {/* Fetch NFTs Button */}
          <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Your NFTs</h2>
              <button
                type="button"
                onClick={fetchUserNFTs}
                disabled={fetchingNFTs || !formData.walletAddress}
                className="bg-gradient-to-r from-turquoise-primary to-turquoise-secondary text-dark-primary font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-turquoise-primary/25 transition-all duration-200 flex items-center space-x-2"
              >
                {fetchingNFTs ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Fetch Data</span>
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-500/20 border border-red-500/50 rounded-lg mb-4">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            {userNFTs.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-grey-light">
                  {userNFTs.filter(nft => nft.isSelected).length} selected • Total Weight: {calculateTotalWeight().toFixed(2)}
                </div>
              </div>
            )}

            {userNFTs.length === 0 && !fetchingNFTs && (
              <div className="text-center py-12 text-grey-light">
                <Image size={48} className="mx-auto mb-4 opacity-50" />
                <p>No NFTs found. Click "Fetch Data" to load your NFTs.</p>
              </div>
            )}

            {userNFTs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userNFTs.map(nft => {
                  // Debug log for image URL and NFT
                  console.log('NFT image URL:', nft.imageUrl, nft);
                  return (
                    <div
                      key={nft.id}
                      onClick={() => toggleNFTSelection(nft.id)}
                      className={`relative cursor-pointer group transition-all duration-200 ${
                        nft.isSelected 
                          ? 'ring-2 ring-turquoise-primary shadow-lg shadow-turquoise-primary/20' 
                          : 'hover:ring-2 hover:ring-turquoise-primary/50'
                      } rounded-lg overflow-hidden`}
                    >
                      <div className="aspect-square bg-dark-tertiary relative">
                        {nft.imageUrl ? (
                          <img
                            src={nft.imageUrl}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-dark-quaternary flex items-center justify-center">
                            <Image size={32} className="text-grey-medium" />
                          </div>
                        )}
                        
                        {nft.isSelected && (
                          <div className="absolute inset-0 bg-turquoise-primary/20 flex items-center justify-center">
                            <div className="w-8 h-8 bg-turquoise-primary rounded-full flex items-center justify-center">
                              <Check size={16} className="text-dark-primary" />
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-primary/90 to-transparent p-2">
                          <div className="text-white text-xs font-medium truncate">{nft.name}</div>
                          <div className={`text-xs ${getRarityColor(nft.rarityRank)}`}>
                            {nft.rarityRank ? `#${nft.rarityRank} (${getRarityLabel(nft.rarityRank)})` : 'Rank Unknown'}
                          </div>
                          <div className="text-xs text-grey-light">
                            {getRarityMultiplier(nft.rarityRank)}x weight
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

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
              disabled={loading || userNFTs.filter(nft => nft.isSelected).length === 0}
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