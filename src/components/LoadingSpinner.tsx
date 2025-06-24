import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-dark-tertiary border-t-turquoise-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-turquoise-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
    </div>
  )
}

export default LoadingSpinner