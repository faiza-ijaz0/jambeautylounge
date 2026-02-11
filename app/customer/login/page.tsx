'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/shared/Header';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles } from 'lucide-react';

// Firebase imports
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext'; // UPDATED: Import useAuth

export default function CustomerLogin() {
  const router = useRouter();
  const { login: authLogin } = useAuth(); // UPDATED: Use auth context
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
      // Use AuthContext for login (with isCustomer = true)
      await authLogin(loginData.email, loginData.password, true);
      // AuthContext will handle the redirect to /customer/portal
      
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

    // Validation
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
      console.log('📝 Starting registration process...');
      
      // Step 1: Firebase Authentication mein user create karein
      console.log('1. Creating user in Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );

      const user = userCredential.user;
      console.log('✅ Firebase Auth user created with UID:', user.uid);
      
      // Step 2: Firestore ke "customers" collection mein data store karein
      // IMPORTANT: Use user.uid as document ID for consistency
      console.log('2. Saving to Firestore...');
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

      // Use setDoc with user.uid as document ID
      await setDoc(doc(db, "customers", user.uid), customerData);
      console.log('✅ Customer saved to Firestore with UID:', user.uid);
      
      // Step 3: Also create in "users" collection for AuthContext compatibility
      // This prevents the "User document not found" error
      await setDoc(doc(db, "users", user.uid), {
        email: registerData.email,
        name: registerData.name,
        role: "customer", // IMPORTANT: Set role as customer
        createdAt: serverTimestamp(),
        status: "active"
      });
      console.log('✅ User also saved to users collection');

      // Step 4: Local storage mein save karein for customer portal
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
      
      console.log('✅ Local storage updated');

      // Step 5: Auto login the user
      console.log('3. Auto-login after registration...');
      await signInWithEmailAndPassword(auth, registerData.email, registerData.password);
      
      // Success message
      setSuccess('Account created successfully! Redirecting...');
      
      // Redirect to customer portal
      setTimeout(() => {
        router.push('/customer/portal');
      }, 1500);

    } catch (firebaseError: any) {
      console.error("❌ Firebase Error: ", firebaseError);
      
      // Firebase specific error messages
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
    <div className="min-h-screen bg-slate-800">
      <Header />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Hero Section - Code1 Style */}
          <div className="text-center mb-10">
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full mb-6 border border-white/10">
              <span className="text-secondary font-black tracking-[0.5em] uppercase text-[10px]">Customer Portal</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-6 leading-[0.85] tracking-tighter">
              Welcome to <br /><span className="text-secondary italic">Jam Beauty</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg font-light leading-relaxed italic mb-8">
              "Artistry is not just a service, it's a transformation."
            </p>
           
          </div>

          <Card className="border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-3xl overflow-hidden">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-none">
                <TabsTrigger value="login" className="rounded-xl font-black text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-black text-[10px] tracking-[0.2em] uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="p-0">
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-2xl font-serif font-bold text-primary">Sign In</CardTitle>
                  <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
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
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          className="pl-11 pr-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-secondary hover:underline font-bold">Forgot password?</a>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-primary hover:bg-secondary hover:text-primary font-black tracking-[0.2em] text-[10px] rounded-2xl transition-all duration-500 shadow-lg hover:shadow-secondary/20 hover:-translate-y-1"
                      disabled={isLoading}
                    >
                      {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600 text-sm">
                      Don't have an account?{' '}
                      <Link href="#register" className="text-secondary font-bold hover:underline">
                        Register here
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="p-0">
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-2xl font-serif font-bold text-primary">Create Account</CardTitle>
                  <CardDescription className="text-gray-600">Join Jam Beauty and start your premium experience</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleRegister} className="space-y-5">
                    {/* Success Message */}
                    {success && (
                      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {success}
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@example.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Phone Number</Label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password (min 6 characters)"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          className="pl-11 h-14 rounded-2xl border-gray-200 bg-white/80 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-primary hover:bg-secondary hover:text-primary font-black tracking-[0.2em] text-[10px] rounded-2xl transition-all duration-500 shadow-lg hover:shadow-secondary/20 hover:-translate-y-1"
                      disabled={isLoading}
                    >
                      {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                  
                  {/* Firebase Info Note */}
                  <div className="mt-6 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                   
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Admin Login Link */}
          <div className="text-center mt-10 pt-8 border-t border-gray-100">
            <Link 
              href="/login" 
              className="inline-flex items-center text-white justify-center gap-3 px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-secondary hover:bg-secondary/10 hover:text-secondary transition-all duration-300 text-sm font-black uppercase tracking-[0.2em] text-primary"
            >
              <Lock className="w-4 h-4 " />
              Admin Login
            </Link>
            <div className="mt-6">
              <Link href="/" className="text-gray-600 hover:text-primary text-sm font-medium flex items-center justify-center gap-2">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}