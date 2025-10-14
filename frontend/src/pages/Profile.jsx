import { useUser, SignInButton, UserButton } from "@clerk/clerk-react";

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Sign In</h1>
          <p className="text-gray-600 mb-6">Please sign in to continue</p>
          <SignInButton>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
              Sign In with Google
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Profile</h1>

        {/* User Avatar and Email */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4 border-4 border-blue-500"
          />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-gray-600 mt-2">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Account Details</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
            </p>
            <p className="text-gray-700">
              <strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}