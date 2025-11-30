import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { CheckCircle, Mail, Lock, User, Building, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, register, clearError } from '@/store/slices/authSlice';
import { UserRole } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'manager']),
  department: z.string().min(2, 'Department is required'),
});

const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as UserRole,
    department: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    dispatch(clearError());

    const result = loginSchema.safeParse(loginForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    const actionResult = await dispatch(login(loginForm));
    if (login.fulfilled.match(actionResult)) {
      navigate('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    dispatch(clearError());

    const result = registerSchema.safeParse(registerForm);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    const actionResult = await dispatch(register(registerForm));
    if (register.fulfilled.match(actionResult)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a12]">
      {/* Dynamic Animated Background - Behind Everything */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] via-[#1a1025] to-[#0a0a12]" />
        
        {/* Moving Orbs with CSS Animations */}
        <div 
          className="absolute w-[700px] h-[700px] bg-purple-600/40 rounded-full blur-[150px]"
          style={{
            animation: 'float1 20s ease-in-out infinite',
            top: '-15%',
            left: '-15%',
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] bg-indigo-500/35 rounded-full blur-[130px]"
          style={{
            animation: 'float2 25s ease-in-out infinite',
            bottom: '-20%',
            right: '-10%',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px]"
          style={{
            animation: 'float3 18s ease-in-out infinite',
            top: '30%',
            left: '20%',
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] bg-fuchsia-500/25 rounded-full blur-[100px]"
          style={{
            animation: 'float4 22s ease-in-out infinite',
            top: '60%',
            right: '25%',
          }}
        />
        <div 
          className="absolute w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-[90px]"
          style={{
            animation: 'float5 15s ease-in-out infinite',
            top: '10%',
            right: '30%',
          }}
        />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Keyframes for orb animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(80px, 60px) scale(1.1); }
          50% { transform: translate(40px, 120px) scale(0.95); }
          75% { transform: translate(-60px, 80px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-100px, -80px) scale(1.15); }
          50% { transform: translate(-60px, -140px) scale(0.9); }
          75% { transform: translate(80px, -60px) scale(1.1); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(120px, -80px) scale(1.2); }
          66% { transform: translate(-80px, 100px) scale(0.85); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(-60px, -100px) scale(1.1); }
          40% { transform: translate(100px, -60px) scale(0.9); }
          60% { transform: translate(80px, 80px) scale(1.15); }
          80% { transform: translate(-40px, 60px) scale(0.95); }
        }
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-120px, 80px) scale(1.2); }
        }
      `}</style>

      {/* Centered Container */}
      <div className="flex w-full max-w-6xl mx-4 lg:mx-auto min-h-[580px] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 relative z-10 border border-white/[0.08]">
        {/* Left Panel - Image (40%) */}
        <div className="hidden lg:flex lg:w-[40%] flex-col relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://freight.cargo.site/t/original/i/9cea083327707bd87d2f89b980e8289859216e9573a701f594d3bf458cd3b262/sarah-lawrence_1.png)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-indigo-900/50" />
        </div>

        {/* Right Panel - Auth Forms (60%) */}
        <div className="flex-1 lg:w-[60%] flex flex-col items-center justify-center px-8 py-10 lg:px-12 bg-[#12111a]/95 backdrop-blur-2xl">
          {/* AttendEase Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              AttendEase
            </span>
          </div>

          {/* Auth Card */}
          <div className="w-full max-w-sm">
            <Card className="bg-transparent border-0 shadow-none">
              {/* Header */}
              <CardHeader className="text-center px-0 pt-0 pb-6">
                <CardTitle className="text-2xl font-semibold text-white">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-sm text-white/50 mt-1">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-0 pb-0">
                <Tabs defaultValue="login" className="w-full">
                  {/* Clean Toggle */}
                  <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-white/[0.03] rounded-xl h-12 border border-white/[0.06]">
                    <TabsTrigger
                      value="login"
                      className="rounded-lg text-sm font-medium text-white/50 hover:text-white/70 transition-all duration-200 h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="rounded-lg text-sm font-medium text-white/50 hover:text-white/70 transition-all duration-200 h-10 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                    <TabsContent value="login" className="mt-0">
                      <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        {/* Email Field */}
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="login-email" className="text-white/70 text-sm font-medium">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="john@company.com"
                              className="pl-11 h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/[0.05] rounded-xl text-sm transition-all duration-200"
                              value={loginForm.email}
                              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            />
                          </div>
                          {formErrors.email && (
                            <p className="text-xs text-red-400">⚠ {formErrors.email}</p>
                          )}
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="login-password" className="text-white/70 text-sm font-medium">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="••••••••"
                              className="pl-11 h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/[0.05] rounded-xl text-sm transition-all duration-200"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            />
                          </div>
                          {formErrors.password && (
                            <p className="text-xs text-red-400">⚠ {formErrors.password}</p>
                          )}
                        </div>

                        {error && (
                          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                            ⚠ {error}
                          </div>
                        )}

                        {/* Sign In Button */}
                        <Button 
                          type="submit" 
                          className="w-full h-12 mt-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 text-sm" 
                          disabled={isLoading}
                        >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing in...
                          </div>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                    <TabsContent value="register" className="mt-0">
                      <form onSubmit={handleRegister} className="flex flex-col gap-5">
                        {/* Name and Email */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="register-name" className="text-white/70 text-sm font-medium">Name</Label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                              <Input
                                id="register-name"
                                type="text"
                                placeholder="John Smith"
                                className="pl-11 h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/[0.05] rounded-xl text-sm transition-all duration-200"
                                value={registerForm.name}
                                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                              />
                            </div>
                            {formErrors.name && (
                              <p className="text-xs text-red-400">⚠ {formErrors.name}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label htmlFor="register-email" className="text-white/70 text-sm font-medium">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                              <Input
                                id="register-email"
                                type="email"
                                placeholder="john@company.com"
                                className="pl-11 h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/[0.05] rounded-xl text-sm transition-all duration-200"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              />
                            </div>
                            {formErrors.email && (
                              <p className="text-xs text-red-400">⚠ {formErrors.email}</p>
                            )}
                          </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="register-password" className="text-white/70 text-sm font-medium">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <Input
                              id="register-password"
                              type="password"
                              placeholder="••••••••"
                              className="pl-11 h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/[0.05] rounded-xl text-sm transition-all duration-200"
                              value={registerForm.password}
                              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            />
                          </div>
                          {formErrors.password && (
                            <p className="text-xs text-red-400">⚠ {formErrors.password}</p>
                          )}
                        </div>

                        {/* Role and Department */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-2">
                            <Label className="text-white/70 text-sm font-medium">Role</Label>
                            <Select
                              value={registerForm.role}
                              onValueChange={(value: UserRole) =>
                                setRegisterForm({ ...registerForm, role: value })
                              }
                            >
                              <SelectTrigger className="h-12 bg-white/[0.03] border-white/[0.08] text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-sm">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a1825] backdrop-blur-xl border-white/10 rounded-xl">
                                <SelectItem value="employee" className="text-white hover:bg-white/10 rounded-lg">Employee</SelectItem>
                                <SelectItem value="manager" className="text-white hover:bg-white/10 rounded-lg">Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label htmlFor="register-department" className="text-white/70 text-sm font-medium">Department</Label>
                            <div className="relative">
                              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                              <Input
                                id="register-department"
                                type="text"
                                placeholder="Engineering"
                                className="pl-11 h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:bg-white/[0.05] rounded-xl text-sm transition-all duration-200"
                                value={registerForm.department}
                                onChange={(e) =>
                                  setRegisterForm({ ...registerForm, department: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        {formErrors.department && (
                          <p className="text-xs text-red-400">⚠ {formErrors.department}</p>
                        )}

                        {error && (
                          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                            ⚠ {error}
                          </div>
                        )}

                        <Button 
                          type="submit" 
                          className="w-full h-12 mt-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 text-sm" 
                          disabled={isLoading}
                        >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating...
                          </div>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
