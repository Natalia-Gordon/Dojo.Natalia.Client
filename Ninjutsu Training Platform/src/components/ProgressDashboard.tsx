import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, Target, Zap, Clock, Award, Star, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from './AuthContext';

export function ProgressDashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-20 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <h2 className="text-3xl font-bold text-white mb-4">Progress Dashboard</h2>
          <p className="text-gray-400">Please log in to view your training progress.</p>
        </div>
      </div>
    );
  }
  const stats = [
    {
      title: 'Training Hours',
      value: user.totalHours.toString(),
      change: '+12%',
      icon: Clock,
      color: 'text-blue-400'
    },
    {
      title: 'Techniques Mastered',
      value: user.completedTechniques.length.toString(),
      change: `+${user.completedTechniques.length}`,
      icon: Target,
      color: 'text-green-400'
    },
    {
      title: 'Current Level',
      value: user.level,
      change: `${user.completedTechniques.length + user.completedTraining.length} completed`,
      icon: Award,
      color: 'text-purple-400'
    },
    {
      title: 'Current Streak',
      value: user.streak.toString(),
      change: 'Days',
      icon: Zap,
      color: 'text-orange-400'
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Shadow Walker',
      description: 'Complete 50 stealth training sessions',
      progress: 100,
      unlocked: true,
      rarity: 'Common',
      icon: '🥷'
    },
    {
      id: 2,
      title: 'Blade Master',
      description: 'Master 10 different weapon techniques',
      progress: 70,
      unlocked: false,
      rarity: 'Rare',
      icon: '⚔️'
    },
    {
      id: 3,
      title: 'Mind Over Matter',
      description: 'Complete 100 meditation sessions',
      progress: 85,
      unlocked: false,
      rarity: 'Uncommon',
      icon: '🧘'
    },
    {
      id: 4,
      title: 'Legendary Ninja',
      description: 'Reach the highest rank in all categories',
      progress: 25,
      unlocked: false,
      rarity: 'Legendary',
      icon: '👑'
    }
  ];

  const skillProgress = [
    { name: 'Stealth', level: 8, progress: 75, maxLevel: 10 },
    { name: 'Combat', level: 6, progress: 45, maxLevel: 10 },
    { name: 'Defense', level: 7, progress: 60, maxLevel: 10 },
    { name: 'Movement', level: 9, progress: 90, maxLevel: 10 },
    { name: 'Awareness', level: 5, progress: 30, maxLevel: 10 },
    { name: 'Precision', level: 4, progress: 20, maxLevel: 10 }
  ];

  const recentActivity = [
    {
      date: '2025-08-13',
      activity: 'Completed Shadow Walking technique',
      type: 'technique',
      points: 150
    },
    {
      date: '2025-08-12',
      activity: 'Finished Foundation of Shadows module',
      type: 'module',
      points: 500
    },
    {
      date: '2025-08-11',
      activity: 'Unlocked Blade Master achievement progress',
      type: 'achievement',
      points: 100
    },
    {
      date: '2025-08-10',
      activity: 'Practiced meditation for 30 minutes',
      type: 'training',
      points: 75
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'border-gray-500';
      case 'Uncommon': return 'border-green-500';
      case 'Rare': return 'border-blue-500';
      case 'Epic': return 'border-purple-500';
      case 'Legendary': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'technique': return Target;
      case 'module': return Award;
      case 'achievement': return Trophy;
      case 'training': return Zap;
      default: return Star;
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Progress Dashboard</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Track your journey from novice to master ninja
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-slate-700 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="bg-slate-800/50 border-slate-700 mb-8">
            <TabsTrigger value="skills" className="data-[state=active]:bg-red-600">Skills</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-red-600">Achievements</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-red-600">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="skills">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Skill Progression</span>
                </h3>
                <div className="space-y-6">
                  {skillProgress.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{skill.name}</span>
                        <span className="text-gray-400 text-sm">Level {skill.level}/{skill.maxLevel}</span>
                      </div>
                      <Progress value={skill.progress} className="h-3" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Rank Progression</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">忍</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-white mb-2">Chunin</h4>
                    <p className="text-gray-400 mb-4">Mid-level ninja with proven skills</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress to Jounin</span>
                        <span className="text-white">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`bg-slate-800/50 border-slate-700 p-6 ${
                    achievement.unlocked ? 'border-green-500' : getRarityColor(achievement.rarity)
                  }`}
                >
                  <div className="text-center space-y-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
                      <Badge className={`mt-1 ${getRarityColor(achievement.rarity)} border`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                    </div>
                    {achievement.unlocked && (
                      <Badge className="bg-green-600 text-white">
                        <Trophy className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className="p-2 bg-red-600/20 rounded-lg">
                        <ActivityIcon className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.activity}</p>
                        <p className="text-gray-400 text-sm">{activity.date}</p>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        +{activity.points} XP
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}