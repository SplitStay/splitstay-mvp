export default function DebugProfile() {
  return (
    <div className="min-h-screen bg-green-100 p-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-green-800 mb-4">
          🟢 DEBUG PROFILE COMPONENT WORKING!
        </h1>
        <p className="text-lg text-green-600 mb-4">
          If you can see this, the routing is working correctly.
        </p>
        <div className="bg-green-50 p-4 rounded border">
          <h2 className="font-semibold mb-2">Component Details:</h2>
          <ul className="text-sm space-y-1">
            <li>• File: debug-profile.tsx</li>
            <li>• Route: /debug-profile</li>
            <li>• Status: ✅ Active</li>
          </ul>
        </div>
      </div>
    </div>
  );
}