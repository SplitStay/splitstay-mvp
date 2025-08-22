import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, options?: { data?: Record<string, unknown> }) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const isLocalhost = window.location.hostname === 'localhost';
  const redirectTo = isLocalhost
    ? 'http://localhost:5173/create-profile'
    : `${window.location.origin}/create-profile`;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle post-authentication redirect
        if (event === 'SIGNED_IN' && session?.user) {
          // Only redirect if we're on the home page (from email verification or OAuth)
          const currentPath = window.location.pathname;
          const hasAuthTokens = window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token');
          
          if ((currentPath === '/' || currentPath === '') && hasAuthTokens) {
            // This is from email verification or OAuth, check profile status
            setTimeout(async () => {
              try {
                const { data: userData, error } = await supabase
                  .from('user')
                  .select('profileCreated')
                  .eq('id', session.user.id)
                  .single();
                
                if (!error && (!userData || !userData.profileCreated)) {
                  // User needs to create profile
                  navigate('/create-profile');
                } else if (!error && userData.profileCreated) {
                  // User has profile, go to dashboard
                  navigate('/dashboard');
                }
              } catch (error) {
                // If user doesn't exist in our table, they need to create profile
                navigate('/create-profile');
              }
            }, 100);
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, options?: { data?: Record<string, unknown> }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...options,
        emailRedirectTo: `${redirectTo}/create-profile`
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    console.log("Called")
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    navigate('/')
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectTo}/reset-password`
    })
    return { error }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password
    })
    return { error }
  }

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}