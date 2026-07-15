'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store all admin data in localStorage
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminName', data.name)
      localStorage.setItem('adminData', JSON.stringify({
        name: data.name,
      }))

      // Store admin data in sessionStorage for immediate use
      sessionStorage.setItem('adminData', JSON.stringify({
        name: data.name,
      }))

      // Redirect to admin dashboard with success animation
      setTimeout(() => {
        router.push('/mahi')
      }, 300)
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex  justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center animate-in fade-in duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#C62828]/10 dark:bg-[#E53935]/10 mb-6">
            <Lock className="h-4 w-4 md:h-10 md:w-10 text-[#C62828] dark:text-[#E53935]" />
          </div>
          <h1 className="text-3xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Admin Portal
          </h1>
         
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-[#1F1F1F] border border-red-200 dark:border-red-900/30 rounded-xl flex items-start animate-in slide-in-from-top duration-300">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-300">Unable to Sign In</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-[#F9FAFB] dark:bg-[#0B0B0B] rounded-2xl shadow-lg dark:shadow-[#1F1F1F]/20 border border-[#E5E7EB] dark:border-[#1F1F1F] overflow-hidden transform transition-all duration-300 hover:shadow-xl dark:hover:shadow-[#1F1F1F]/40">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#C62828] dark:group-focus-within:text-[#E53935] transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#1F1F1F] border border-[#E5E7EB] dark:border-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C62828] dark:focus:ring-[#E53935] focus:border-transparent transition-all duration-200"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#C62828] dark:group-focus-within:text-[#E53935] transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-[#1F1F1F] border border-[#E5E7EB] dark:border-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C62828] dark:focus:ring-[#E53935] focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-200 hover:scale-110 active:scale-95"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black transition-all duration-200 transform ${loading ? 'bg-[#C62828]/80 dark:bg-[#E53935]/80 cursor-not-allowed' : 'bg-[#C62828] dark:bg-[#E53935] hover:bg-[#B71C1C] dark:hover:bg-[#D32F2F] hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      <span className="text-white">Authenticating...</span>
                    </>
                  ) : (
                    <span className="text-white">Sign In as Admin</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="px-6 md:px-8 py-4 border-t border-[#E5E7EB] dark:border-[#1F1F1F] bg-white/50 dark:bg-black/50">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Access restricted to authorized administrators only.
              <br />
              All activities are logged and monitored.
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-[#1F1F1F] border border-blue-100 dark:border-blue-900/20 rounded-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Ensure you're on a secure connection before entering credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C62828]/5 dark:bg-[#E53935]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C62828]/5 dark:bg-[#E53935]/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}