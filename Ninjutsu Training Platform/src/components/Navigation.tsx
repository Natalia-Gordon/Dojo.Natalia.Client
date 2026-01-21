import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sword, Target, TrendingUp, BookOpen, Home, LogIn, GraduationCap, ShoppingBag, ShoppingCart, Store, Crown } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { LoginDialog } from './LoginDialog';
import { UserProfile } from './UserProfile';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const { user } = useAuth();
  const { cart } = useProducts();
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, requiresAuth: false },
    { id: 'training', label: 'Training', icon: Target, requiresAuth: true, userTypes: ['student'] },
    { id: 'techniques', label: 'Techniques', icon: Sword, requiresAuth: false },
    { id: 'progress', label: 'Progress', icon: TrendingUp, requiresAuth: true, userTypes: ['student'] },
    { id: 'resources', label: 'Resources', icon: BookOpen, requiresAuth: false },
    { id: 'membership', label: 'Membership', icon: Crown, requiresAuth: false },
    { id: 'marketplace', label: 'Shop', icon: ShoppingBag, requiresAuth: false },
    { id: 'teacher-dashboard', label: 'Dashboard', icon: GraduationCap, requiresAuth: true, userTypes: ['teacher'] },
    { id: 'teacher-shop', label: 'My Shop', icon: Store, requiresAuth: true, userTypes: ['teacher'] },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-red-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">忍</span>
            </div>
            <span className="text-white font-bold text-lg">Ninjutsu Dojo</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map(({ id, label, icon: Icon, requiresAuth, userTypes }) => {
              // Check if item should be shown based on user type
              if (userTypes && user && !userTypes.includes(user.userType)) {
                return null;
              }
              
              const isDisabled = requiresAuth && !user;
              
              return (
                <Button
                  key={id}
                  variant={activeSection === id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => !isDisabled && setActiveSection(id)}
                  disabled={isDisabled}
                  className={`flex items-center space-x-2 ${
                    activeSection === id 
                      ? 'bg-red-800/50 text-white border-red-600' 
                      : isDisabled
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : 'text-gray-300 hover:text-white hover:bg-red-800/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              );
            })}
            
            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection('cart')}
              className={`relative flex items-center space-x-2 ${
                activeSection === 'cart'
                  ? 'bg-red-800/50 text-white border-red-600'
                  : 'text-gray-300 hover:text-white hover:bg-red-800/30'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {cart.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
                  {cart.length}
                </Badge>
              )}
            </Button>

            {/* Auth Section */}
            <div className="ml-4 flex items-center space-x-2">
              {user ? (
                <UserProfile 
                  onNavigateToProfile={() => setActiveSection('profile')}
                  onNavigateToPurchases={() => setActiveSection('purchases')}
                />
              ) : (
                <LoginDialog>
                  <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                    <LogIn className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                </LoginDialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}