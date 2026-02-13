// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Header } from '@/components/shared/Header';
// import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles } from 'lucide-react';

// // Firebase imports
// import { db, auth } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import { useAuth } from '@/contexts/AuthContext'; // UPDATED: Import useAuth

// export default function CustomerLogin() {
//   const router = useRouter();
//   const { login: authLogin } = useAuth(); // UPDATED: Use auth context
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // Login form state
//   const [loginData, setLoginData] = useState({
//     email: '',
//     password: ''
//   });
  
//   // Register form state
//   const [registerData, setRegisterData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       // Use AuthContext for login (with isCustomer = true)
//       await authLogin(loginData.email, loginData.password, true);
//       // AuthContext will handle the redirect to /customer/portal
      
//     } catch (error: any) {
//       console.error('Login error:', error);
//       setError(error.message || 'Invalid email or password');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     // Validation
//     if (registerData.password !== registerData.confirmPassword) {
//       setError('Passwords do not match');
//       setIsLoading(false);
//       return;
//     }

//     if (registerData.password.length < 6) {
//       setError('Password must be at least 6 characters long');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       console.log('📝 Starting registration process...');
      
//       // Step 1: Firebase Authentication mein user create karein
//       console.log('1. Creating user in Firebase Auth...');
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         registerData.email,
//         registerData.password
//       );

//       const user = userCredential.user;
//       console.log('✅ Firebase Auth user created with UID:', user.uid);
      
//       // Step 2: Firestore ke "customers" collection mein data store karein
//       // IMPORTANT: Use user.uid as document ID for consistency
//       console.log('2. Saving to Firestore...');
//       const customerData = {
//         uid: user.uid,
//         name: registerData.name,
//         email: registerData.email,
//         phone: registerData.phone,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//         status: "active",
//         role: "customer",
//         emailVerified: false,
//         lastLogin: serverTimestamp()
//       };

//       // Use setDoc with user.uid as document ID
//       await setDoc(doc(db, "customers", user.uid), customerData);
//       console.log('✅ Customer saved to Firestore with UID:', user.uid);
      
//       // Step 3: Also create in "users" collection for AuthContext compatibility
//       // This prevents the "User document not found" error
//       await setDoc(doc(db, "users", user.uid), {
//         email: registerData.email,
//         name: registerData.name,
//         role: "customer", // IMPORTANT: Set role as customer
//         createdAt: serverTimestamp(),
//         status: "active"
//       });
//       console.log('✅ User also saved to users collection');

//       // Step 4: Local storage mein save karein for customer portal
//       const customerObj = {
//         uid: user.uid,
//         email: registerData.email,
//         name: registerData.name,
//         phone: registerData.phone,
//         role: 'customer',
//         createdAt: new Date().toISOString()
//       };
      
//       localStorage.setItem('customerAuth', JSON.stringify({
//         isAuthenticated: true,
//         customer: customerObj
//       }));
      
//       localStorage.setItem('user', JSON.stringify(customerObj));
      
//       console.log('✅ Local storage updated');

//       // Step 5: Auto login the user
//       console.log('3. Auto-login after registration...');
//       await signInWithEmailAndPassword(auth, registerData.email, registerData.password);
      
//       // Success message
//       setSuccess('Account created successfully! Redirecting...');
      
//       // Redirect to customer portal
//       setTimeout(() => {
//         router.push('/customer/portal');
//       }, 1500);

//     } catch (firebaseError: any) {
//       console.error("❌ Firebase Error: ", firebaseError);
      
//       // Firebase specific error messages
//       if (firebaseError.code === 'auth/email-already-in-use') {
//         setError('This email is already registered. Please login instead.');
//       } else if (firebaseError.code === 'auth/invalid-email') {
//         setError('Invalid email address.');
//       } else if (firebaseError.code === 'auth/weak-password') {
//         setError('Password is too weak. Please use a stronger password.');
//       } else if (firebaseError.code === 'auth/network-request-failed') {
//         setError('Network error. Please check your internet connection.');
//       } else {
//         setError(`Registration failed: ${firebaseError.message}`);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-[#FA9DB7] via-gray-600 to-black">
    
//       <div className="pt-5 pb-16 px-4">
//         <div className="max-w-md mx-auto">
//           {/* Hero Section - Code1 Style */}
//           <div className="text-center mb-6">
//             <div className="inline-block  backdrop-blur-md -mt-6 py-2 rounded-full mb-1  ">
//               <span className="text-gray-900 font-bold  tracking-[0.5em] uppercase text-[10px]">Customer Portal</span>
//             </div>
//             <p className="text-2xl md:text-3xl font-serif font-bold text-primary mb-1 leading-[0.85] tracking-tighter">
//              <span className="text-[#E87A9B] italic">Jam Beauty Lounge</span>
//             </p>
            
           
//           </div>

//           <Card className="border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-3xl overflow-hidden">
//             <Tabs defaultValue="login" className="w-full">
//               <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-none">
//                 <TabsTrigger value="login" className="rounded-xl font-black text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Sign In</TabsTrigger>
//                 <TabsTrigger value="register" className="rounded-xl font-black text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Register</TabsTrigger>
//               </TabsList>
              
//               {/* Login Tab */}
//               <TabsContent value="login" className="p-0">
//                 <CardHeader className="pb-4 pt-8 px-8">
//                   <CardTitle className="text-2xl font-serif font-bold text-primary">Sign In</CardTitle>
//                   <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
//                 </CardHeader>
//                 <CardContent className="px-8 pb-8">
//                   <form onSubmit={handleLogin} className="space-y-6">
//                     {error && (
//                       <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
//                         {error}
//                       </div>
//                     )}
                    
//                     {success && (
//                       <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
//                         {success}
//                       </div>
//                     )}
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Email Address</Label>
//                       <div className="relative group">
//                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
//                         <Input
//                           id="email"
//                           type="email"
//                           placeholder="you@example.com"
//                           value={loginData.email}
//                           onChange={(e) => setLoginData({...loginData, email: e.target.value})}
//                           className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
//                           required
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Password</Label>
//                       <div className="relative group">
//                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
//                         <Input
//                           id="password"
//                           type={showPassword ? 'text' : 'password'}
//                           placeholder="Enter your password"
//                           value={loginData.password}
//                           onChange={(e) => setLoginData({...loginData, password: e.target.value})}
//                           className="pl-11 pr-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
//                           required
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
//                         >
//                           {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                         </button>
//                       </div>
//                     </div>

                   

//                     <Button 
//                       type="submit" 
//                       className="w-full h-14 bg-primary hover:bg-secondary hover:text-primary font-black tracking-[0.2em] text-[10px] rounded-2xl transition-all duration-500 shadow-lg hover:shadow-secondary/20 hover:-translate-y-1"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
//                       <ArrowRight className="w-4 h-4 ml-2" />
//                     </Button>
//                   </form>

//                   <div className="mt-6 pt-6 border-t border-gray-100 text-center">
//                     <p className="text-gray-600 text-sm">
//                       Don't have an account?{' '}
//                       <Link href="#register" className="text-[#E87A9B] font-bold hover:underline">
//                         Register here
//                       </Link>
//                     </p>
//                      <div className="mt-2">
//               <Link href="/" className="text-gray-600 hover:text-primary text-sm font-medium flex items-center justify-center gap-2">
//                 ← Back to Home
//               </Link>
//             </div>
//                   </div>
//                 </CardContent>
//               </TabsContent>
              
//               {/* Register Tab */}
//               <TabsContent value="register" className="p-0">
//                 <CardHeader className="pb-4 pt-8 px-8">
//                   <CardTitle className="text-2xl font-serif font-bold text-primary">Create Account</CardTitle>
                 
//                 </CardHeader>
//                 <CardContent className="px-8 pb-8">
//                   <form onSubmit={handleRegister} className="space-y-5">
//                     {/* Success Message */}
//                     {success && (
//                       <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium">
//                         {success}
//                       </div>
//                     )}
                    
//                     {/* Error Message */}
//                     {error && (
//                       <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
//                         {error}
//                       </div>
//                     )}
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Full Name</Label>
//                       <div className="relative group">
//                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
//                         <Input
//                           id="name"
//                           type="text"
//                           placeholder="John Doe"
//                           value={registerData.name}
//                           onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
//                           className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="reg-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Email Address</Label>
//                       <div className="relative group">
//                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
//                         <Input
//                           id="reg-email"
//                           type="email"
//                           placeholder="you@example.com"
//                           value={registerData.email}
//                           onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
//                           className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Phone Number</Label>
//                       <div className="relative group">
//                         <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
//                         <Input
//                           id="phone"
//                           type="tel"
//                           placeholder="(555) 123-4567"
//                           value={registerData.phone}
//                           onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
//                           className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
//                           required
//                         />
//                       </div>
//                     </div>
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="reg-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Password</Label>
//                       <div className="relative group">
//                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
//                         <Input
//                           id="reg-password"
//                           type={showPassword ? 'text' : 'password'}
//                           placeholder="Create a password (min 6 characters)"
//                           value={registerData.password}
//                           onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
//                           className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Confirm Password</Label>
//                       <div className="relative group">
//                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
//                         <Input
//                           id="confirm-password"
//                           type={showPassword ? 'text' : 'password'}
//                           placeholder="Confirm your password"
//                           value={registerData.confirmPassword}
//                           onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
//                           className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
//                           required
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
//                         >
//                           {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                         </button>
//                       </div>
//                     </div>

//                     <Button 
//                       type="submit" 
//                       className="w-full h-14 bg-primary hover:bg-secondary hover:text-primary font-black tracking-[0.2em] text-[10px] rounded-2xl transition-all duration-500 shadow-lg hover:shadow-secondary/20 hover:-translate-y-1"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
//                       <ArrowRight className="w-4 h-4 ml-2" />
//                     </Button>
//                   </form>
                  
//                   {/* Firebase Info Note */}
//                   <div className="mt-6 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                   
//                   </div>
//                 </CardContent>
//               </TabsContent>
//             </Tabs>
//           </Card>

//           {/* Admin Login Link */}
//           <div className="text-center mt-1 pt-1">
//             <Link 
//               href="/login" 
//               className="inline-flex items-center text-gray-500 justify-center gap-3 px-6 py-3 rounded-2xl border-2 border-gray-800 hover:border-secondary hover:bg-secondary/10 hover:text-[#B84A68] transition-all duration-300 text-sm font-black uppercase tracking-[0.2em] text-primary"
//             >
//               <Lock className="w-4 h-4 " />
//               Admin Login
//             </Link>
           
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// new code
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles } from 'lucide-react';

// Firebase imports
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerLogin() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await authLogin(loginData.email, loginData.password, true);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );

      const user = userCredential.user;
      
      const customerData = {
        uid: user.uid,
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
        role: "customer",
        emailVerified: false,
        lastLogin: serverTimestamp()
      };

      await setDoc(doc(db, "customers", user.uid), customerData);
      
      await setDoc(doc(db, "users", user.uid), {
        email: registerData.email,
        name: registerData.name,
        role: "customer",
        createdAt: serverTimestamp(),
        status: "active"
      });

      const customerObj = {
        uid: user.uid,
        email: registerData.email,
        name: registerData.name,
        phone: registerData.phone,
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('customerAuth', JSON.stringify({
        isAuthenticated: true,
        customer: customerObj
      }));
      
      localStorage.setItem('user', JSON.stringify(customerObj));
      
      await signInWithEmailAndPassword(auth, registerData.email, registerData.password);
      
      setSuccess('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        router.push('/customer/portal');
      }, 1500);

    } catch (firebaseError: any) {
      console.error("❌ Firebase Error: ", firebaseError);
      
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Registration failed: ${firebaseError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      
      <div className="pt-16 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Premium Hero Section - #FA9DB7 Pink */}
          <div className="text-center mb-10">
            {/* Pink Accent Line - #FA9DB7 */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-1 bg-[#FA9DB7] rounded-full"></div>
            </div>
            
            {/* Customer Portal Badge - Gray */}
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-5 py-2 rounded-full bg-gray-100 border border-gray-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-[#FA9DB7]" />
                <span className="text-gray-700 font-medium tracking-[0.2em] uppercase text-[10px]">
                  CUSTOMER PORTAL
                </span>
              </span>
            </div>
            
            {/* Brand Name - #FA9DB7 Pink */}
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
              <span className="text-[#FA9DB7] italic drop-shadow-sm">
                Jam Beauty Lounge
              </span>
            </h1>
            
            {/* Subtitle - Gray */}
            <p className="text-gray-500 text-sm font-light tracking-wide">
              Experience luxury beauty services
            </p>
          </div>

          {/* Premium Card - White with #FA9DB7 Pink Accents */}
          <Card className="border border-gray-200 bg-white shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-[#FA9DB7]/20 transition-all duration-500 rounded-3xl overflow-hidden">
            
            {/* Pink Top Border - #FA9DB7 */}
            <div className="h-1.5 w-full bg-[#FA9DB7]"></div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1.5 rounded-none border-b border-gray-200">
                <TabsTrigger 
                  value="login" 
                  className="rounded-xl font-semibold text-xs tracking-[0.15em] uppercase py-3 data-[state=active]:bg-[#FA9DB7] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-xl font-semibold text-xs tracking-[0.15em] uppercase py-3 data-[state=active]:bg-[#FA9DB7] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="p-0">
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-2xl font-serif font-bold text-gray-800">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                        {success}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FA9DB7] transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FA9DB7] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                        Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FA9DB7] transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          className="pl-11 pr-11 h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FA9DB7] focus:border-transparent transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FA9DB7] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="relative w-full h-14 bg-[#FA9DB7] hover:bg-[#E87A9B] text-white font-semibold tracking-[0.15em] text-xs rounded-2xl transition-all duration-500 shadow-md shadow-[#FA9DB7]/30 hover:shadow-lg hover:shadow-[#FA9DB7]/40 hover:-translate-y-0.5 overflow-hidden group"
                      disabled={isLoading}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                      {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-500 text-sm">
                      Don't have an account?{' '}
                      <Link href="#register" className="text-[#FA9DB7] font-semibold hover:text-[#E87A9B] transition-colors">
                        Register here
                      </Link>
                    </p>
                    <div className="mt-3">
                      <Link href="/" className="text-gray-400 hover:text-[#FA9DB7] text-sm flex items-center justify-center gap-2 transition-colors">
                        ← Back to Home
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="p-0">
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-2xl font-serif font-bold text-gray-800">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Join our exclusive beauty community
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleRegister} className="space-y-5">
                    {success && (
                      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">
                        {success}
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                        Full Name
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FA9DB7] transition-colors" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FA9DB7] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FA9DB7] transition-colors" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@example.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FA9DB7] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                        Phone Number
                      </Label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FA9DB7] transition-colors" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FA9DB7] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                        Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FA9DB7] transition-colors" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password (min 6 characters)"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FA9DB7] focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600">
                        Confirm Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#FA9DB7] transition-colors" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#FA9DB7] focus:border-transparent transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FA9DB7] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="relative w-full h-14 bg-[#FA9DB7] hover:bg-[#E87A9B] text-white font-semibold tracking-[0.15em] text-xs rounded-2xl transition-all duration-500 shadow-md shadow-[#FA9DB7]/30 hover:shadow-lg hover:shadow-[#FA9DB7]/40 hover:-translate-y-0.5 overflow-hidden group"
                      disabled={isLoading}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                      {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

         
          
          {/* Footer Note - Gray */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-xs">
              © 2026 Jam Beauty Lounge. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}