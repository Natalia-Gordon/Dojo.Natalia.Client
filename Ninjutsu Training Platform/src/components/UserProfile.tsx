import { useAuth } from './AuthContext';
import { useMembership } from './MembershipContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { User, LogOut, Calendar, Trophy, Clock, Flame, Target, Star, ShoppingBag, Crown } from 'lucide-react';

interface UserProfileProps {
  onNavigateToProfile?: () => void;
  onNavigateToPurchases?: () => void;
}

export function UserProfile({ onNavigateToProfile, onNavigateToPurchases }: UserProfileProps) {
  const { user, logout } = useAuth();
  const { getUserMembership, membershipPlans } = useMembership();

  if (!user) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Novice': return 'bg-gray-600';
      case 'Intermediate': return 'bg-blue-600';
      case 'Advanced': return 'bg-purple-600';
      case 'Master': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getNextLevelRequirements = (level: string, completed: number) => {
    switch (level) {
      case 'Novice': return { next: 'Intermediate', required: 10 };
      case 'Intermediate': return { next: 'Advanced', required: 20 };
      case 'Advanced': return { next: 'Master', required: 35 };
      case 'Master': return { next: 'Grandmaster', required: 50 };
      default: return { next: 'Intermediate', required: 10 };
    }
  };

  const totalCompleted = user.completedTechniques.length + user.completedTraining.length;
  const nextLevel = getNextLevelRequirements(user.level, totalCompleted);
  const progressToNext = Math.min((totalCompleted / nextLevel.required) * 100, 100);

  const userMembership = getUserMembership(user.id);
  const membershipPlan = membershipPlans.find(p => p.id === userMembership?.tier);

  const getMembershipBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-600';
      case 'basic': return 'bg-blue-600';
      case 'premium': return 'bg-purple-600';
      case 'elite': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-red-600">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="bg-red-600 text-white">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-slate-900 border-slate-700" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-3 p-2">
            {/* User Header */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-red-600">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="bg-red-600 text-white">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-medium">{user.username}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${getLevelColor(user.level)} text-white text-xs`}>
                    {user.level}
                  </Badge>
                  {membershipPlan && membershipPlan.id !== 'free' && (
                    <Badge className={`${getMembershipBadgeColor(membershipPlan.id)} text-white text-xs flex items-center space-x-1`}>
                      <Crown className="w-3 h-3" />
                      <span>{membershipPlan.name}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-slate-800/50 border-slate-700 p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{user.totalHours}h</p>
                    <p className="text-gray-400 text-xs">Training Time</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-3">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{user.streak}</p>
                    <p className="text-gray-400 text-xs">Day Streak</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{user.completedTechniques.length}</p>
                    <p className="text-gray-400 text-xs">Techniques</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-3">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{user.completedTraining.length}</p>
                    <p className="text-gray-400 text-xs">Courses</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Level Progress */}
            {user.level !== 'Master' && (
              <Card className="bg-slate-800/50 border-slate-700 p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm font-medium">Progress to {nextLevel.next}</span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {totalCompleted}/{nextLevel.required}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressToNext}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            )}

            {/* Join Date */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <DropdownMenuItem 
          className="text-white hover:bg-slate-700 cursor-pointer"
          onClick={onNavigateToProfile}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="text-white hover:bg-slate-700 cursor-pointer"
          onClick={onNavigateToPurchases}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          <span>My Purchases</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-700" />
        
        <DropdownMenuItem 
          className="text-red-400 hover:bg-red-900/20 cursor-pointer"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}