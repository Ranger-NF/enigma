// Imports will go here
// - React
// - Router hooks
// - Auth components
// - Form components
// frontend/src/pages/SignInPage.tsx
export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="text-gray-600">Google Auth will go here</p>
    </div>
  );
}

// Will contain:
// - Sign in form
// - Redirect to Play page on successful sign in
// - Back to Welcome page option