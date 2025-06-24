import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Chrome, Shield, Zap } from 'lucide-react'

const Login: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-dark-tertiary border-t-turquoise-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-turquoise-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-turquoise-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-3/4 w-32 h-32 bg-turquoise-light/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Main Login Card */}
        <div className="bg-dark-secondary/80 backdrop-blur-xl border border-dark-tertiary/50 rounded-2xl p-8 shadow-2xl animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-turquoise-primary to-turquoise-light rounded-2xl mb-4 animate-glow">
              <span className="text-dark-primary font-bold text-2xl">M</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Mutant NFT Ecosystem</h1>
            <p className="text-grey-light">Stake your NFTs and earn rewards</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-dark-primary font-semibold py-4 px-6 rounded-xl hover:bg-grey-light/90 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Chrome size={20} />
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-dark-tertiary/30 rounded-lg">
              <Shield className="text-turquoise-primary" size={20} />
              <div className="text-sm">
                <p className="text-white font-medium">Secure Authentication</p>
                <p className="text-grey-light">Powered by Supabase Auth</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-dark-tertiary/30 rounded-lg">
              <Zap className="text-turquoise-primary" size={20} />
              <div className="text-sm">
                <p className="text-white font-medium">Instant Access</p>
                <p className="text-grey-light">Start staking immediately</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-dark-secondary/60 backdrop-blur-sm border border-dark-tertiary/30 rounded-lg p-4 text-center">
            <div className="text-turquoise-primary font-semibold text-lg">500K</div>
            <div className="text-grey-light text-xs">$MUTANT Weekly Pool</div>
          </div>
          <div className="bg-dark-secondary/60 backdrop-blur-sm border border-dark-tertiary/30 rounded-lg p-4 text-center">
            <div className="text-turquoise-primary font-semibold text-lg">25%</div>
            <div className="text-grey-light text-xs">Bonus Rewards</div>
          </div>
          <div className="bg-dark-secondary/60 backdrop-blur-sm border border-dark-tertiary/30 rounded-lg p-4 text-center">
            <div className="text-turquoise-primary font-semibold text-lg">6x</div>
            <div className="text-grey-light text-xs">Max Multiplier</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login