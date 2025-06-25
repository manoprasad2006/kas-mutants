import React from 'react'

const DebugInfo: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  return (
    <div className="fixed bottom-4 right-4 bg-dark-secondary/90 backdrop-blur-xl border border-dark-tertiary/50 rounded-lg p-4 text-xs text-grey-light max-w-sm">
      <div className="font-medium text-white mb-2">Debug Info</div>
      <div className="space-y-1">
        <div>Supabase URL: {supabaseUrl ? '✅ Set' : '❌ Missing'}</div>
        <div>Supabase Key: {supabaseAnonKey ? '✅ Set' : '❌ Missing'}</div>
        <div>Environment: {import.meta.env.MODE}</div>
        <div>Base URL: {import.meta.env.BASE_URL}</div>
      </div>
    </div>
  )
}

export default DebugInfo 