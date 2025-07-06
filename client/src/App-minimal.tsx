import { Switch, Route } from "wouter";

function CreateProfilePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#001F3F', 
            marginBottom: '8px' 
          }}>
            Build your traveler profile
          </h1>
          <p style={{ color: '#666', fontSize: '18px' }}>
            Let's start with the basics
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '32px' 
        }}>
          <h2 style={{ fontSize: '24px', color: '#001F3F', marginBottom: '20px' }}>
            Step 1 of 2
          </h2>
          <div style={{ 
            padding: '40px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#059669', fontSize: '28px', marginBottom: '16px' }}>
              ✅ SUCCESS!
            </h3>
            <p style={{ color: '#374151', fontSize: '18px' }}>
              The CreateProfile component is now working correctly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>SplitStay Home Page</h1>
      <p>Navigate to /create-profile to test the form</p>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/create-profile" component={CreateProfilePage} />
      <Route>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>404 - Page Not Found</h1>
        </div>
      </Route>
    </Switch>
  );
}

export default App;