// import React, { useState, useEffect } from 'react'
// import { User, Mail, Code, LogOut, Eye, EyeOff } from 'lucide-react'
// import axios from 'axios'
// import { GoogleLogin } from '@react-oauth/google'

// export default function Profile() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [showLoginForm, setShowLoginForm] = useState(true)
  
//   // Login/Register form states
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [name, setName] = useState('')
//   const [showPassword, setShowPassword] = useState(false)

//   const API_URL = 'http://localhost:5500/api/auth'

//   // Check if user is logged in on component mount
//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       try {
//         const token = localStorage.getItem('token')
//         const savedUser = localStorage.getItem('user')
        
//         if (token && savedUser) {
//           // Verify token with backend
//           const response = await axios.get(`${API_URL}/user`, {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           })
          
//           setUser(response.data)
//           setIsLoggedIn(true)
//         }
//       } catch (error) {
//         // Token is invalid, clear localStorage
//         localStorage.removeItem('token')
//         localStorage.removeItem('user')
//         setIsLoggedIn(false)
//       } finally {
//         setLoading(false)
//       }
//     }

//     checkAuthStatus()
//   }, [])

//   const handleLogin = async (e) => {
//     e.preventDefault()
//     try {
//       const res = await axios.post(`${API_URL}/login`, { email, password })

//       localStorage.setItem('token', res.data.token)
//       localStorage.setItem('user', JSON.stringify(res.data))

//       setUser(res.data)
//       setIsLoggedIn(true)
      
//       // Clear form
//       setEmail('')
//       setPassword('')
      
//       alert('Login successful!')
//       window.location.reload()
//     } catch (error) {
//       alert(error.response?.data?.message || 'Login failed')
//     }
//   }

//   const handleSignup = async (e) => {
//     e.preventDefault()
//     try {
//       const res = await axios.post(`${API_URL}/register`, { name, email, password })

//       localStorage.setItem('token', res.data.token)
//       localStorage.setItem('user', JSON.stringify(res.data))

//       setUser(res.data)
//       setIsLoggedIn(true)
      
//       // Clear form
//       setName('')
//       setEmail('')
//       setPassword('')
      
//       alert('Registration successful!')
//       window.location.reload()
//     } catch (error) {
//       alert(error.response?.data?.message || 'Registration failed')
//     }
//   }

//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       const res = await axios.post(`${API_URL}/google`, { tokenId: credentialResponse.credential })

//       localStorage.setItem('token', res.data.token)
//       localStorage.setItem('user', JSON.stringify(res.data))

//       setUser(res.data)
//       setIsLoggedIn(true)
      
//       alert('Google login successful!')
//     } catch (error) {
//       alert(error.response?.data?.message || 'Google login failed')
//     }
//   }

//   const handleGoogleError = () => {
//     alert('Google sign-in failed. Please try again.')
//   }

//   const handleLogout = () => {
//     if (window.confirm('Are you sure you want to logout?')) {
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       setIsLoggedIn(false)
//       setUser(null)
      
//       // Clear all form fields
//       setEmail('')
//       setPassword('')
//       setName('')
//     }
//   }

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl mb-4 mx-auto animate-pulse">
//             <Code className="h-8 w-8 text-white" />
//           </div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   // If user is logged in, show profile
//   if (isLoggedIn && user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//         {/* Header */}
//         <div className="bg-white border-b border-gray-200">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//                   <Code className="h-6 w-6 text-white" />
//                 </div>
//                 <div className="ml-4">
//                   <h1 className="text-2xl font-bold text-gray-900">Welcome to Aethria</h1>
//                   <p className="text-gray-600">Your AI-powered coding companion</p>
//                 </div>
//               </div>
//               <button 
//                 onClick={handleLogout}
//                 className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//               >
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Profile Content */}
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
//             <div className="text-center mb-8">
//               <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
//                 {user.avatar ? (
//                   <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
//                 ) : (
//                   (user.name || 'U').charAt(0).toUpperCase()
//                 )}
//               </div>
              
//               <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name || 'Welcome User'}</h2>
//               <p className="text-gray-600 text-lg mb-6">{user.email}</p>
              
//               {user.googleId && (
//                 <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
//                   <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//                   Google Account Connected
//                 </div>
//               )}
//             </div>

         

//             {/* Action Buttons */}
//             <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
//               <button 
//                 onClick={() => window.location.href = '/CodeAssistant'}
//                 className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200"
//               >
//                 Start Coding with Aethria
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // If not logged in, show login/register forms
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//               <Code className="h-6 w-6 text-white" />
//             </div>
//             <div className="ml-4">
//               <h1 className="text-2xl font-bold text-gray-900">Welcome to Aethria</h1>
//               <p className="text-gray-600">Sign in to access your AI coding companion</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
//         <div className="flex flex-col md:flex-row items-start justify-center gap-8 w-full max-w-4xl">
          
//           {/* Toggle Buttons */}
//           <div className="w-full md:hidden mb-6">
//             <div className="flex bg-gray-100 rounded-lg p-1">
//               <button
//                 onClick={() => setShowLoginForm(true)}
//                 className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
//                   showLoginForm 
//                     ? 'bg-white text-indigo-600 shadow-sm' 
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => setShowLoginForm(false)}
//                 className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
//                   !showLoginForm 
//                     ? 'bg-white text-indigo-600 shadow-sm' 
//                     : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>

//           {/* Login Form */}
//           <div className={`bg-white p-6 rounded-xl shadow-lg w-full max-w-sm ${!showLoginForm ? 'hidden md:block' : ''}`}>
//             <h2 className="text-xl font-bold text-indigo-600 mb-4">Login</h2>
//             <form onSubmit={handleLogin} className="space-y-4">
//               <div>
//                 <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                 <input 
//                   type="email" 
//                   id="loginEmail" 
//                   name="loginEmail"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//                 <div className="relative">
//                   <input 
//                     type={showPassword ? "text" : "password"}
//                     id="loginPassword" 
//                     name="loginPassword"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={togglePasswordVisibility}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4 text-gray-400" />
//                     ) : (
//                       <Eye className="h-4 w-4 text-gray-400" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//               <button 
//                 type="submit" 
//                 className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
//               >
//                 Login
//               </button>
//             </form>

//             <div className="mt-4 flex justify-center">
//               <GoogleLogin
//                 onSuccess={handleGoogleSuccess}
//                 onError={handleGoogleError}
//               />
//             </div>
//           </div>

//           {/* Sign Up Form */}
//           <div className={`bg-white p-6 rounded-xl shadow-lg w-full max-w-sm ${showLoginForm ? 'hidden md:block' : ''}`}>
//             <h2 className="text-xl font-bold text-indigo-600 mb-4">Sign Up</h2>
//             <form onSubmit={handleSignup} className="space-y-4">
//               <div>
//                 <label htmlFor="signupName" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                 <input 
//                   type="text" 
//                   id="signupName" 
//                   name="signupName"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                 <input 
//                   type="email" 
//                   id="signupEmail" 
//                   name="signupEmail"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//                 <div className="relative">
//                   <input 
//                     type={showPassword ? "text" : "password"}
//                     id="signupPassword" 
//                     name="signupPassword"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={togglePasswordVisibility}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4 text-gray-400" />
//                     ) : (
//                       <Eye className="h-4 w-4 text-gray-400" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//               <button 
//                 type="submit" 
//                 className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
//               >
//                 Sign Up
//               </button>
//             </form>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }
import React from 'react'

export default function Profile() {
  return (
    <div>Profile</div>
  )
}
