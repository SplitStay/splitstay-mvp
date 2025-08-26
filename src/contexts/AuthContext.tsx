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
  
  // Wrap navigate to log all navigation calls
  const loggedNavigate = (to: string, options?: any) => {
    console.log('🧭 Navigation called:', { to, from: window.location.pathname, options })
    return navigate(to, options)
  }
  const isLocalhost = window.location.hostname === 'localhost';
  const redirectTo = isLocalhost
    ? 'http://localhost:5173'
    : window.location.origin;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔄 AuthContext: Initial session check', {
        hasSession: !!session,
        currentPath: window.location.pathname,
        hasHash: !!window.location.hash,
        hash: window.location.hash
      })
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Check if user needs to be redirected on initial load
      if (session?.user) {
        const urlParams = new URLSearchParams(window.location.search);
        const signupType = urlParams.get('type');
        const currentPath = window.location.pathname;
        
        // Only check for auth tokens if we're on the homepage
        // This prevents redirects when navigating to specific pages
        const hasAuthTokens = currentPath === '/' && 
          (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'));
        
        console.log('🔄 AuthContext: Redirect check', {
          signupType,
          currentPath,
          hasAuthTokens,
          willRedirect: signupType === 'signup' || hasAuthTokens
        })
        
        if (signupType === 'signup') {
          console.log('🚀 AuthContext: Redirecting for email confirmation')
          // This is an email confirmation, redirect to profile creation
          window.history.replaceState({}, document.title, '/');
          setTimeout(() => {
            loggedNavigate('/create-profile');
          }, 100);
        } else if (hasAuthTokens) {
          console.log('🚀 AuthContext: Redirecting for OAuth callback')
          // ONLY redirect if we have auth tokens AND we're on the homepage
          // This means it's an OAuth callback, not just a regular page load
          try {
            const { data: userData, error } = await supabase
              .from('user')
              .select('profileCreated')
              .eq('id', session.user.id)
              .single();
            
            if (!error && userData?.profileCreated) {
              console.log('🚀 AuthContext: Redirecting to dashboard (profile exists)')
              // User has profile, go to dashboard
              loggedNavigate('/dashboard');
            } else {
              console.log('🚀 AuthContext: Redirecting to create-profile (no profile)')
              // User needs to create profile or doesn't exist
              loggedNavigate('/create-profile');
            }
            
            // Clean up the URL after handling the callback
            window.history.replaceState({}, document.title, '/');
          } catch (error) {
            console.log('🚀 AuthContext: Redirecting to create-profile (error)')
            // If user doesn't exist in our table, they need to create profile
            loggedNavigate('/create-profile');
          }
        } else {
          console.log('✅ AuthContext: No redirect needed, staying on', currentPath)
        }
        // DO NOT redirect if user is already on a specific page (like /messages)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔥 AuthContext: Auth state change', {
          event,
          hasSession: !!session,
          currentPath: window.location.pathname,
          hasHash: !!window.location.hash
        })

        // Only update state, don't navigate unless it's a real sign in/out
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // IMPORTANT: Only handle redirects for actual sign-in events, not for:
        // - TOKEN_REFRESHED (happens on tab focus)
        // - USER_UPDATED (happens on profile updates)
        // - INITIAL_SESSION (handled separately above)
        // - MFA_CHALLENGE_VERIFIED
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is an actual new sign-in (has auth tokens in URL)
          const hasAuthTokens = window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token');
          const currentPath = window.location.pathname;
          
          console.log('🔥 AuthContext: SIGNED_IN event', {
            hasAuthTokens,
            currentPath,
            willRedirect: hasAuthTokens && (currentPath === '/' || currentPath === '/oauth-callback')
          })
          
          // ONLY redirect if:
          // 1. We have auth tokens in the URL (OAuth callback)
          // 2. We're on the homepage or OAuth callback page
          // 3. This is NOT a tab switch or refresh
          if (hasAuthTokens && (currentPath === '/' || currentPath === '/oauth-callback')) {
            console.log('🚀 AuthContext: SIGNED_IN redirecting')
            // Check if user needs profile creation
            try {
              const { data: userData, error } = await supabase
                .from('user')
                .select('profileCreated')
                .eq('id', session.user.id)
                .single();
              
              if (!error && userData?.profileCreated) {
                loggedNavigate('/dashboard');
              } else {
                loggedNavigate('/create-profile');
              }
              
              // Clean up URL after handling OAuth callback
              window.history.replaceState({}, document.title, currentPath);
            } catch (error) {
              loggedNavigate('/create-profile');
            }
          } else {
            console.log('✅ AuthContext: SIGNED_IN no redirect needed')
          }
          
          // Handle Amplitude user identification (non-blocking)
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
        
        // Removed redundant post-authentication redirect that caused redirects on tab focus for OAuth users
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
        redirectTo: `${redirectTo}/?oauth=true`
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