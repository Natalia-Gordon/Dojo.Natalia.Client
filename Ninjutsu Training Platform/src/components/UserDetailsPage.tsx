import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  User, 
  Calendar, 
  Trophy, 
  Clock, 
  Flame, 
  Target, 
  Star, 
  Award,
  Sword,
  Shield,
  Eye,
  BookOpen,
  ArrowLeft,
  Edit
} from 'lucide-react';

interface UserDetailsPageProps {
  onBack: () => void;
}

export function UserDetailsPage({ onBack }: UserDetailsPageProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Please log in to view your profile.</p>
            <Button onClick={onBack} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Novice': return 'from-gray-600 to-gray-700';
      case 'Intermediate': return 'from-blue-600 to-blue-700';
      case 'Advanced': return 'from-purple-600 to-purple-700';
      case 'Master': return 'from-red-600 to-red-700';
      default: return 'from-gray-600 to-gray-700';
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

  // Mock technique data for demonstration
  const techniqueCategories = {
    stealth: ['Shadow Walking', 'Silent Movement', 'Camouflage'],
    combat: ['Defensive Rolls', 'Counter Attacks', 'Weapon Handling'],
    meditation: ['Breathing Control', 'Mental Focus', 'Energy Balance']
  };

  const completedByCategory = {
    stealth: user.completedTechniques.filter(t => t.includes('shadow') || t.includes('stealth')).length,
    combat: user.completedTechniques.filter(t => t.includes('combat') || t.includes('rolls')).length,
    meditation: user.completedTechniques.filter(t => t.includes('meditation') || t.includes('focus')).length
  };

  const achievements = [
    { id: 'first-technique', name: 'First Steps', description: 'Complete your first technique', earned: user.completedTechniques.length > 0 },
    { id: 'consistent-learner', name: 'Consistent Learner', description: 'Maintain a 7-day streak', earned: user.streak >= 7 },
    { id: 'technique-master', name: 'Technique Master', description: 'Complete 10 techniques', earned: user.completedTechniques.length >= 10 },
    { id: 'dedicated-student', name: 'Dedicated Student', description: 'Train for 100+ hours', earned: user.totalHours >= 100 }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Platform
          </Button>
          <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24 border-4 border-red-600">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="bg-red-600 text-white text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-2xl text-white font-bold">{user.username}</h2>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                  
                  <Badge className={`bg-gradient-to-r ${getLevelColor(user.level)} text-white px-4 py-2`}>
                    <Star className="w-4 h-4 mr-2" />
                    {user.level} Ninja
                  </Badge>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined {new Date(user.joinDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            {user.level !== 'Master' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Level Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Progress to {nextLevel.next}</span>
                      <span className="text-white">{totalCompleted}/{nextLevel.required}</span>
                    </div>
                    <Progress value={progressToNext} className="h-3" />
                    <p className="text-gray-400 text-sm">
                      Complete {nextLevel.required - totalCompleted} more techniques or courses to advance
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-full mx-auto mb-2">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-2xl text-white font-bold">{user.totalHours}h</p>
                    <p className="text-gray-400 text-sm">Training Time</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-600/20 rounded-full mx-auto mb-2">
                      <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-2xl text-white font-bold">{user.streak}</p>
                    <p className="text-gray-400 text-sm">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Training Progress */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-400" />
                  Training Progress
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your progress across different ninja disciplines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mx-auto mb-3">
                      <Eye className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Stealth</h3>
                    <p className="text-2xl text-purple-400 font-bold">{completedByCategory.stealth}/{techniqueCategories.stealth.length}</p>
                    <p className="text-gray-400 text-sm">Techniques Mastered</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-full mx-auto mb-3">
                      <Sword className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Combat</h3>
                    <p className="text-2xl text-red-400 font-bold">{completedByCategory.combat}/{techniqueCategories.combat.length}</p>
                    <p className="text-gray-400 text-sm">Techniques Mastered</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mx-auto mb-3">
                      <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Meditation</h3>
                    <p className="text-2xl text-blue-400 font-bold">{completedByCategory.meditation}/{techniqueCategories.meditation.length}</p>
                    <p className="text-gray-400 text-sm">Techniques Mastered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  Achievements
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Milestones unlocked on your ninja journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.earned 
                          ? 'bg-yellow-600/10 border-yellow-600/30' 
                          : 'bg-slate-700/50 border-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned ? 'bg-yellow-600' : 'bg-slate-600'
                        }`}>
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${achievement.earned ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {achievement.name}
                          </h4>
                          <p className="text-gray-500 text-sm">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.completedTechniques.slice(-3).map((technique, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white">Completed technique: {technique}</p>
                        <p className="text-gray-400 text-sm">Recently</p>
                      </div>
                    </div>
                  ))}
                  
                  {user.completedTraining.slice(-2).map((training, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white">Completed course: {training}</p>
                        <p className="text-gray-400 text-sm">Recently</p>
                      </div>
                    </div>
                  ))}
                  
                  {user.completedTechniques.length === 0 && user.completedTraining.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No recent activity. Start your ninja training today!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}