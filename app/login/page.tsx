// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { useAuth } from '@/contexts/AuthContext';
// import { Scissors, Eye, EyeOff } from 'lucide-react';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const { login, isLoading } = useAuth();
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!email || !password) {
//       setError('Please fill in all fields');
//       return;
//     }

//     const success = await login(email, password);
//     if (success) {
//       router.push('/admin');
//     } else {
//       setError('Invalid email or password');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
//       {/* Premium Background Elements */}
//       <div className="absolute inset-0 opacity-20">
//         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[150px] animate-pulse"></div>
//         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[150px] animate-pulse"></div>
//       </div>
//       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>

//       <Card className="w-full max-w-md border-white/5 bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">
//         <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary to-transparent"></div>
        
//         <CardHeader className="text-center pt-12 pb-8">
//           <div className="w-20 h-20 bg-secondary/20 border border-secondary/30 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
//             <Scissors className="w-10 h-10 text-secondary" />
//           </div>
//           <CardTitle className="text-3xl font-serif font-bold text-white mb-2">MAN OF<span className="text-secondary">CAVE</span></CardTitle>
//           <CardDescription className="text-gray-400 font-light tracking-widest uppercase text-[10px]">Administrative Concierge</CardDescription>
//         </CardHeader>

//         <CardContent className="px-10 pb-12">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-2">
//               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary ml-1">Email Address</label>
//               <Input
//                 type="email"
//                 placeholder="concierge@manofcave.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="h-14 rounded-2xl border-white/5 bg-white/5 text-white placeholder:text-gray-600 focus:border-secondary focus:ring-secondary transition-all"
//                 disabled={isLoading}
//               />
//             </div>
            
//             <div className="space-y-2">
//               <label className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary ml-1">Security Key</label>
//               <div className="relative">
//                 <Input
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="h-14 rounded-2xl border-white/5 bg-white/5 text-white placeholder:text-gray-600 focus:border-secondary focus:ring-secondary transition-all pr-12"
//                   disabled={isLoading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-secondary transition-colors"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <Alert className="bg-red-500/10 border-red-500/20 text-red-500 rounded-2xl">
//                 <AlertDescription className="text-xs font-bold tracking-wide">{error}</AlertDescription>
//               </Alert>
//             )}

//             <Button
//               type="submit"
//               className="w-full h-16 bg-secondary hover:bg-white text-primary font-black tracking-[0.2em] text-xs rounded-2xl transition-all duration-500 shadow-xl shadow-secondary/10"
//               disabled={isLoading}
//             >
//               {isLoading ? 'AUTHENTICATING...' : 'ACCESS PANEL'}
//             </Button>
//           </form>

//           <div className="mt-10 p-6 bg-white/[0.03] border border-white/5 rounded-[2rem]">
//             <p className="text-[9px] font-black text-secondary uppercase tracking-[0.3em] mb-4">Demo Credentials</p>
//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Branch Admin</span>
//                 <span className="text-[10px] text-white font-mono">admin@branch1.com</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Super Admin</span>
//                 <span className="text-[10px] text-white font-mono">super@manofcave.com</span>
//               </div>
//               <div className="pt-2 border-t border-white/5 flex justify-between items-center">
//                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Password</span>
//                 <span className="text-[10px] text-white font-mono">admin123 / super123</span>
//               </div>
//             </div>
//           </div>

//           {/* Customer Login Link */}
//           <div className="mt-8 text-center">
//             <div className="flex items-center justify-center gap-2 mb-4">
//               <div className="h-px bg-white/10 flex-1"></div>
//               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Customer?</span>
//               <div className="h-px bg-white/10 flex-1"></div>
//             </div>
//             <a href="/customer/login" className="text-secondary hover:text-white font-semibold text-sm transition-colors">
//               → Customer Portal Login
//             </a>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// new code
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Scissors, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[150px] animate-pulse"></div>
      </div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>

      <Card className="w-full max-w-md border-white/5 bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-black to-transparent"></div>
        
        <CardHeader className="text-center pt-12 pb-8">
         
          <CardTitle className="text-3xl font-serif font-bold text-gray-400 mb-2">Jam<span className="text-gray-600">Beauty Lounge</span></CardTitle>
          <CardDescription className="text-gray-400 font-light tracking-widest uppercase text-[10px]">Administrative Concierge</CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-12">
        
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Email Address</label>
              <Input
                type="email"
                placeholder="concierge@manofcave.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-2xl border-white/5 bg-white/5 text-black placeholder:text-gray-600 focus:border-secondary focus:ring-secondary transition-all"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Security Key</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl border-white/5 bg-white/5 text-black placeholder:text-gray-600 focus:border-secondary focus:ring-secondary transition-all pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-secondary transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-500 rounded-2xl">
                <AlertDescription className="text-xs font-bold tracking-wide">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-16 bg-gray-400 hover:bg-white text-primary font-black tracking-[0.2em] text-xs rounded-2xl transition-all duration-500 shadow-xl shadow-secondary/10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                'ACCESS PANEL'
              )}
            </Button>
          </form>

          {/* Demo Credentials Section */}
          
        </CardContent>
      </Card>
    </div>
  );
}