import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { identifyUser, amplitudeService } from '../lib/amplitude'

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
    ? 'http://localhost:5173'
    : window.location.origin;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Check if this is an email confirmation redirect on initial load
      if (session?.user) {
        const urlParams = new URLSearchParams(window.location.search);
        const signupType = urlParams.get('type');
        
        if (signupType === 'signup') {
          // This is an email confirmation, redirect to profile creation
          window.history.replaceState({}, document.title, '/');
          setTimeout(() => {
            navigate('/create-profile');
          }, 100);
        }
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle Amplitude user identification (non-blocking)
        if (event === 'SIGNED_IN' && session?.user) {
          // Identify user in Amplitude asynchronously
          setTimeout(async () => {
            try {
              const { data: userData } = await supabase
                .from('user')
                .select('name, email, currentPlace')
                .eq('id', session.user.id)
                .single()
              
              identifyUser(session.user.id, {
                email: session.user.email,
                name: userData?.name,
                location: userData?.currentPlace,
                sign_up_method: session.user.app_metadata?.provider || 'email'
              })
            } catch (error) {
              // Fallback identification with minimal data
              identifyUser(session.user.id, {
                email: session.user.email,
                sign_up_method: session.user.app_metadata?.provider || 'email'
              })
            }
          }, 0)
        } else if (event === 'SIGNED_OUT') {
          // Reset Amplitude asynchronously
          setTimeout(() => {
            amplitudeService.reset()
          }, 0)
        }
        
        // Handle post-authentication redirect
        if (event === 'SIGNED_IN' && session?.user) {
          const currentPath = window.location.pathname;
          const hasAuthTokens = window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token');
          const urlParams = new URLSearchParams(window.location.search);
          const signupType = urlParams.get('type');
          const isEmailConfirmation = signupType === 'signup';
          const isPasswordRecovery = signupType === 'recovery';
          const isOAuthCallback = hasAuthTokens && !signupType;
          const isOnHomePage = currentPath === '/';
          
          // Handle email confirmation specifically
          if (isEmailConfirmation) {
            // Clear URL parameters and redirect to profile creation
            window.history.replaceState({}, document.title, '/');
            setTimeout(() => {
              navigate('/create-profile');
            }, 100);
            return;
          }
          
          // Handle password recovery
          if (isPasswordRecovery) {
            window.history.replaceState({}, document.title, '/reset-password');
            return;
          }
          
          // Handle OAuth callback or initial sign in
          if (isOAuthCallback || (isOnHomePage && hasAuthTokens)) {
            setTimeout(async () => {
              try {
                const { data: userData, error } = await supabase
                  .from('user')
                  .select('profileCreated')
                  .eq('id', session.user.id)
                  .single();
                
                if (!error && userData?.profileCreated) {
                  // User has profile, go to dashboard
                  navigate('/dashboard');
                } else {
                  // User needs to create profile or doesn't exist
                  navigate('/create-profile');
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
        emailRedirectTo: `${redirectTo}/?type=signup#`
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${redirectTo}/`
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    setUser(null)
    setSession(null)
    
    window.localStorage.removeItem('supabase.auth.token')
    
    setTimeout(() => {
      navigate('/')
      window.location.reload()
    }, 100)
    
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?type=recovery`
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