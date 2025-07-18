# Authentication Setup Guide

This guide explains how to set up and use the authentication system in the SplitStay application.

## Features Implemented

✅ **Email/Password Authentication**
- User registration with email verification
- Sign in with email and password
- Password reset functionality
- Custom user metadata (first name, last name)

✅ **OAuth Providers**
- Google OAuth integration
- Facebook OAuth integration
- Automatic user linking between providers

✅ **Email Verification**
- Email confirmation required for new signups
- Resend confirmation email functionality
- Password reset via email

✅ **User Identity Linking**
- Users can sign in with multiple providers
- Same user account across different authentication methods
- Seamless switching between providers

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Configuration

#### Enable Authentication Providers

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Google** provider:
   - Add your Google OAuth Client ID
   - Add your Google OAuth Client Secret
4. Enable **Facebook** provider:
   - Add your Facebook App ID
   - Add your Facebook App Secret

#### Configure OAuth Redirect URLs

Add these URLs to your OAuth provider settings:

**For Development:**
```
http://localhost:5173
```

**For Production:**
```
https://your-production-domain.com
```

#### Configure Email Templates (Optional)

Go to **Authentication** → **Email Templates** to customize:
- Confirmation email
- Password reset email
- Email change confirmation

### 3. Database Setup

The authentication system uses Supabase's built-in `auth.users` table. You may want to create a `profiles` table for additional user information:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Usage

### Basic Authentication

```tsx
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { user, signIn, signUp, signOut } = useAuth()

  // Sign up with email/password
  const handleSignUp = async () => {
    const { error } = await signUp('user@example.com', 'password123', {
      data: { first_name: 'John', last_name: 'Doe' }
    })
    if (error) console.error('Sign up failed:', error.message)
  }

  // Sign in with email/password
  const handleSignIn = async () => {
    const { error } = await signIn('user@example.com', 'password123')
    if (error) console.error('Sign in failed:', error.message)
  }

  // Sign out
  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) console.error('Sign out failed:', error.message)
  }

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      )}
    </div>
  )
}
```

### OAuth Authentication

```tsx
import { useAuth } from './contexts/AuthContext'

function OAuthExample() {
  const { signInWithOAuth } = useAuth()

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithOAuth('google')
    if (error) console.error('Google sign in failed:', error.message)
  }

  const handleFacebookSignIn = async () => {
    const { error } = await signInWithOAuth('facebook')
    if (error) console.error('Facebook sign in failed:', error.message)
  }

  return (
    <div>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <button onClick={handleFacebookSignIn}>Sign in with Facebook</button>
    </div>
  )
}
```

### Password Reset

```tsx
import { useAuth } from './contexts/AuthContext'

function PasswordResetExample() {
  const { resetPassword } = useAuth()

  const handleResetPassword = async (email: string) => {
    const { error } = await resetPassword(email)
    if (error) {
      console.error('Password reset failed:', error.message)
    } else {
      console.log('Password reset email sent!')
    }
  }

  return (
    <div>
      <button onClick={() => handleResetPassword('user@example.com')}>
        Reset Password
      </button>
    </div>
  )
}
```

## Components

### AuthModal

A complete authentication modal with sign in, sign up, and forgot password forms:

```tsx
import { AuthModal } from './components/auth/AuthModal'

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setAuthModalOpen(true)}>
        Open Auth Modal
      </button>
      
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultView="signin" // or "signup"
      />
    </div>
  )
}
```

### Individual Forms

You can also use the individual form components:

```tsx
import { SignInForm, SignUpForm, ForgotPasswordForm } from './components/auth'

// Use individual forms as needed
<SignInForm
  onSwitchToSignUp={() => setView('signup')}
  onForgotPassword={() => setView('forgot')}
/>
```

## Security Considerations

1. **Row Level Security**: Always enable RLS on your database tables
2. **Environment Variables**: Keep your Supabase keys secure
3. **Email Verification**: Require email verification for new accounts
4. **Password Policies**: Implement strong password requirements
5. **OAuth Scopes**: Only request necessary OAuth permissions

## User Identity Linking

The system automatically handles user identity linking when:
1. A user signs up with email, then later signs in with Google/Facebook using the same email
2. A user signs in with Google/Facebook, then later tries to sign up with email

This ensures users have a single account regardless of how they authenticate.

## Error Handling

The authentication system includes comprehensive error handling:

- Network errors
- Invalid credentials
- Email already in use
- OAuth provider errors
- Session expiration

All errors are displayed to users with appropriate messaging.

## Testing

To test the authentication system:

1. **Email/Password**: Create accounts and test sign in/out
2. **OAuth**: Test Google and Facebook sign in (requires valid OAuth setup)
3. **Password Reset**: Test the forgot password flow
4. **Email Verification**: Test email confirmation for new accounts
5. **Identity Linking**: Test signing in with different providers using same email

## Troubleshooting

### Common Issues

1. **OAuth not working**: Check OAuth provider configuration in Supabase
2. **Email not sending**: Verify email settings in Supabase
3. **CORS errors**: Ensure your domain is added to allowed origins
4. **Environment variables**: Make sure `.env.local` is properly configured

### Debug Mode

Enable debug mode by setting:
```env
VITE_DEBUG=true
```

This will show additional logging in the console.