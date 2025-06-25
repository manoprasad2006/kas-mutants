import React, { useState, useEffect } from 'react'

interface LoadingSpinnerProps {
  timeout?: number // Timeout in milliseconds
  message?: string
  error?: string | null
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  timeout = 10000, // 10 seconds default
  message = "Loading...",
  error = null
}) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)

  useEffect(() => {
    if (error) {
      setShowTimeoutMessage(false)
      return
    }

    const timer = setTimeout(() => {
      setShowTimeoutMessage(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout, error])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <div className="text-white text-lg font-medium mb-4">Authentication Error</div>
          <div className="text-grey-light text-sm mb-6">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-turquoise-primary text-dark-primary rounded-lg hover:bg-turquoise-secondary transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-dark-tertiary border-t-turquoise-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-turquoise-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        
        <div className="text-white text-lg font-medium mb-2">{message}</div>
        
        {showTimeoutMessage && (
          <div className="text-grey-light text-sm max-w-md">
            <p>This is taking longer than expected. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-turquoise-primary text-dark-primary rounded-lg hover:bg-turquoise-secondary transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner