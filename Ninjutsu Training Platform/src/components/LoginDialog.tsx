import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { useAuth } from './AuthContext';
import { User, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LoginDialogProps {
  children: React.ReactNode;
}

export function LoginDialog({ children }: LoginDialogProps) {
  const { login, register } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(loginForm.username, loginForm.password);
    
    if (success) {
      setIsOpen(false);
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Invalid username or password');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegisterError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = register(registerForm.username, registerForm.email, registerForm.password);
    
    if (success) {
      setIsOpen(false);
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
    } else {
      setRegisterError('Username already exists');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-center">Enter the Dojo</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Sign in to your account or create a new one to access your ninja training
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="login" className="data-[state=active]:bg-red-600">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-red-600">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="bg-slate-800/50 border-slate-700">
              <form onSubmit={handleLogin} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-white">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <Alert className="border-red-600 bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-400">Demo Accounts:</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>ShadowMaster / shadow123</div>
                    <div>SilentBlade / blade456</div>
                  </div>
                </div>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="bg-slate-800/50 border-slate-700">
              <form onSubmit={handleRegister} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-white">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-white">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                {registerError && (
                  <Alert className="border-red-600 bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {registerError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}