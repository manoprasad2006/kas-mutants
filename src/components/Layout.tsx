import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Trophy, BarChart3, Settings } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary">
      {/* Navigation */}
      {user && (
        <nav className="border-b border-dark-tertiary bg-dark-primary/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-turquoise-primary to-turquoise-light rounded-lg flex items-center justify-center">
                    <span className="text-dark-primary font-bold text-sm">M</span>
                  </div>
                  <span className="text-white font-semibold text-lg">Mutant Staking</span>
                </Link>
                
                <div className="hidden md:flex space-x-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.to
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-turquoise-primary/20 text-turquoise-primary border border-turquoise-primary/30'
                            : 'text-grey-light hover:text-white hover:bg-dark-tertiary'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-grey-light">
                  <User size={16} />
                  <span className="hidden sm:inline text-sm">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-grey-light hover:text-white hover:bg-dark-tertiary rounded-lg transition-all duration-200"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-turquoise-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-turquoise-secondary/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
}

export default Layout