import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, Users, Star, CheckCircle, ArrowLeft, Play, BookOpen, Target, Award, ChevronRight, HelpCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from './AuthContext';
import { ScheduleHelpDialog } from './ScheduleHelpDialog';
import { MyScheduledSessions } from './MyScheduledSessions';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'video': return <Play className="w-4 h-4" />;
    case 'practice': return <Target className="w-4 h-4" />;
    case 'meditation': return <BookOpen className="w-4 h-4" />;
    case 'theory': return <BookOpen className="w-4 h-4" />;
    case 'technique': return <Star className="w-4 h-4" />;
    case 'assessment': return <Award className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner': return 'bg-green-600';
    case 'Intermediate': return 'bg-yellow-600';
    case 'Advanced': return 'bg-orange-600';
    case 'Expert': return 'bg-red-600';
    default: return 'bg-blue-600';
  }
};

export function TrainingModules() {
  const { user, updateUserProgress } = useAuth();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const modules = [
    {
      id: 1,
      title: 'Foundation of Shadows',
      level: 'Beginner',
      duration: '4 weeks',
      students: 1247,
      rating: 4.9,
      progress: 75,
      description: 'Learn the basic principles of stealth, meditation, and fundamental movements.',
      image: 'https://images.unsplash.com/photo-1540202404-3b67d6e12f54?w=400&h=300&fit=crop&crop=center',
      lessons: 12,
      completed: 9,
      lessonsData: [
        { id: 1, title: 'Introduction to Ninjutsu', duration: '15 min', completed: true, type: 'video' },
        { id: 2, title: 'Basic Stance and Posture', duration: '20 min', completed: true, type: 'practice' },
        { id: 3, title: 'Breathing Techniques', duration: '18 min', completed: true, type: 'meditation' },
        { id: 4, title: 'Silent Walking Basics', duration: '25 min', completed: true, type: 'practice' },
        { id: 5, title: 'Mental Focus Training', duration: '22 min', completed: true, type: 'meditation' },
        { id: 6, title: 'Basic Hand Positions', duration: '30 min', completed: true, type: 'technique' },
        { id: 7, title: 'Shadow Movement Theory', duration: '20 min', completed: true, type: 'theory' },
        { id: 8, title: 'Basic Stealth Patterns', duration: '35 min', completed: true, type: 'practice' },
        { id: 9, title: 'Environmental Awareness', duration: '28 min', completed: true, type: 'theory' },
        { id: 10, title: 'First Kata Practice', duration: '40 min', completed: false, type: 'practice', current: true },
        { id: 11, title: 'Integration Exercise', duration: '30 min', completed: false, type: 'assessment' },
        { id: 12, title: 'Module Assessment', duration: '45 min', completed: false, type: 'assessment' }
      ]
    },
    {
      id: 2,
      title: 'Weapons of the Night',
      level: 'Intermediate',
      duration: '6 weeks',
      students: 856,
      rating: 4.8,
      progress: 40,
      description: 'Master traditional ninja weapons including shuriken, katana, and kusarigama.',
      image: 'https://images.unsplash.com/photo-1541087061-1da8e1a862a4?w=400&h=300&fit=crop&crop=center',
      lessons: 18,
      completed: 7,
      lessonsData: [
        { id: 1, title: 'Weapon Safety & Ethics', duration: '20 min', completed: true, type: 'theory' },
        { id: 2, title: 'Shuriken Fundamentals', duration: '30 min', completed: true, type: 'technique' },
        { id: 3, title: 'Throwing Techniques', duration: '45 min', completed: true, type: 'practice' },
        { id: 4, title: 'Katana Grip & Stance', duration: '25 min', completed: true, type: 'technique' },
        { id: 5, title: 'Basic Sword Forms', duration: '40 min', completed: true, type: 'practice' },
        { id: 6, title: 'Defensive Positions', duration: '35 min', completed: true, type: 'technique' },
        { id: 7, title: 'Chain Weapon Basics', duration: '30 min', completed: true, type: 'technique' },
        { id: 8, title: 'Kusarigama Introduction', duration: '40 min', completed: false, type: 'technique', current: true },
        { id: 9, title: 'Advanced Throwing', duration: '35 min', completed: false, type: 'practice' },
        { id: 10, title: 'Weapon Combinations', duration: '50 min', completed: false, type: 'practice' },
        { id: 11, title: 'Combat Applications', duration: '45 min', completed: false, type: 'practice' },
        { id: 12, title: 'Stealth with Weapons', duration: '40 min', completed: false, type: 'technique' },
        { id: 13, title: 'Improvised Weapons', duration: '30 min', completed: false, type: 'theory' },
        { id: 14, title: 'Weapon Maintenance', duration: '25 min', completed: false, type: 'theory' },
        { id: 15, title: 'Advanced Combinations', duration: '60 min', completed: false, type: 'practice' },
        { id: 16, title: 'Sparring Basics', duration: '45 min', completed: false, type: 'practice' },
        { id: 17, title: 'Final Challenge', duration: '90 min', completed: false, type: 'assessment' },
        { id: 18, title: 'Master Assessment', duration: '120 min', completed: false, type: 'assessment' }
      ]
    },
    {
      id: 3,
      title: 'Art of Invisibility',
      level: 'Advanced',
      duration: '8 weeks',
      students: 423,
      rating: 5.0,
      progress: 15,
      description: 'Advanced stealth techniques, environmental camouflage, and silent movement.',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop&crop=center',
      lessons: 24,
      completed: 3,
      lessonsData: [
        { id: 1, title: 'Stealth Psychology', duration: '25 min', completed: true, type: 'theory' },
        { id: 2, title: 'Shadow Analysis', duration: '30 min', completed: true, type: 'theory' },
        { id: 3, title: 'Basic Camouflage', duration: '40 min', completed: true, type: 'technique' },
        { id: 4, title: 'Environmental Blending', duration: '45 min', completed: false, type: 'practice', current: true },
        { id: 5, title: 'Movement in Darkness', duration: '35 min', completed: false, type: 'practice' },
        // ... more lessons would be here
      ]
    },
    {
      id: 4,
      title: 'Mental Discipline',
      level: 'All Levels',
      duration: '3 weeks',
      students: 2134,
      rating: 4.9,
      progress: 100,
      description: 'Develop focus, mindfulness, and mental resilience through meditation and breathing.',
      image: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=400&h=300&fit=crop&crop=center',
      lessons: 9,
      completed: 9,
      lessonsData: [
        { id: 1, title: 'Foundations of Mental Training', duration: '20 min', completed: true, type: 'theory' },
        { id: 2, title: 'Basic Meditation Posture', duration: '15 min', completed: true, type: 'meditation' },
        { id: 3, title: 'Breath Control Techniques', duration: '25 min', completed: true, type: 'meditation' },
        { id: 4, title: 'Focus and Concentration', duration: '30 min', completed: true, type: 'meditation' },
        { id: 5, title: 'Mindfulness in Movement', duration: '35 min', completed: true, type: 'practice' },
        { id: 6, title: 'Stress Response Control', duration: '40 min', completed: true, type: 'meditation' },
        { id: 7, title: 'Advanced Breathing', duration: '30 min', completed: true, type: 'meditation' },
        { id: 8, title: 'Mental Resilience', duration: '45 min', completed: true, type: 'theory' },
        { id: 9, title: 'Integration & Mastery', duration: '60 min', completed: true, type: 'assessment' }
      ]
    },
    {
      id: 5,
      title: 'Parkour & Movement',
      level: 'Intermediate',
      duration: '5 weeks',
      students: 698,
      rating: 4.7,
      progress: 0,
      description: 'Modern movement techniques inspired by traditional ninja traversal methods.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
      lessons: 15,
      completed: 0,
      lessonsData: [
        { id: 1, title: 'Movement Philosophy', duration: '20 min', completed: false, type: 'theory', current: true },
        { id: 2, title: 'Basic Conditioning', duration: '30 min', completed: false, type: 'practice' },
        { id: 3, title: 'Wall Running Basics', duration: '45 min', completed: false, type: 'practice' },
        { id: 4, title: 'Precision Jumping', duration: '40 min', completed: false, type: 'practice' },
        { id: 5, title: 'Climbing Techniques', duration: '50 min', completed: false, type: 'practice' },
        { id: 6, title: 'Balance Training', duration: '35 min', completed: false, type: 'practice' },
        { id: 7, title: 'Vaulting Methods', duration: '40 min', completed: false, type: 'practice' },
        { id: 8, title: 'Flow and Transition', duration: '45 min', completed: false, type: 'practice' },
        { id: 9, title: 'Urban Navigation', duration: '60 min', completed: false, type: 'practice' },
        { id: 10, title: 'Silent Landing', duration: '30 min', completed: false, type: 'technique' },
        { id: 11, title: 'Speed Training', duration: '40 min', completed: false, type: 'practice' },
        { id: 12, title: 'Advanced Combinations', duration: '55 min', completed: false, type: 'practice' },
        { id: 13, title: 'Obstacle Courses', duration: '75 min', completed: false, type: 'practice' },
        { id: 14, title: 'Real-World Application', duration: '90 min', completed: false, type: 'practice' },
        { id: 15, title: 'Movement Mastery', duration: '120 min', completed: false, type: 'assessment' }
      ]
    },
    {
      id: 6,
      title: 'Master\'s Path',
      level: 'Expert',
      duration: '12 weeks',
      students: 89,
      rating: 4.9,
      progress: 0,
      description: 'The ultimate challenge combining all aspects of ninjutsu for true mastery.',
      image: 'https://images.unsplash.com/photo-1544992503-7ad5ac882d5d?w=400&h=300&fit=crop&crop=center',
      lessons: 36,
      completed: 0,
      lessonsData: [
        { id: 1, title: 'The Way of the Shadow Master', duration: '60 min', completed: false, type: 'theory', current: true },
        // ... more lessons would be here
      ]
    }
  ];





  const handleModuleAction = (module: any) => {
    if (module.progress === 100) {
      // Review mode - show all lessons
      setSelectedModule(module.id);
    } else if (module.progress > 0) {
      // Continue mode - find current lesson
      const currentLesson = module.lessonsData?.find((lesson: any) => lesson.current) || 
                           module.lessonsData?.find((lesson: any) => !lesson.completed);
      setSelectedModule(module.id);
      if (currentLesson) {
        setSelectedLesson(currentLesson.id);
      }
    } else {
      // Start mode - begin with first lesson
      setSelectedModule(module.id);
      if (module.lessonsData?.[0]) {
        setSelectedLesson(module.lessonsData[0].id);
      }
    }
  };

  const getCurrentModule = () => {
    return modules.find(m => m.id === selectedModule);
  };

  const getCurrentLesson = () => {
    const module = getCurrentModule();
    return module?.lessonsData?.find((lesson: any) => lesson.id === selectedLesson);
  };

  const markLessonComplete = (lessonId: number) => {
    // In a real app, this would update the backend
    console.log(`Lesson ${lessonId} completed`);
    setSelectedLesson(null);
    setSelectedModule(null);
  };

  if (selectedLesson && selectedModule) {
    return <LessonView 
      lesson={getCurrentLesson()} 
      module={getCurrentModule()}
      onComplete={markLessonComplete}
      onBack={() => setSelectedLesson(null)}
    />;
  }

  if (selectedModule) {
    return <ModuleDetailView 
      module={getCurrentModule()}
      onBack={() => setSelectedModule(null)}
      onLessonSelect={setSelectedLesson}
    />;
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Training Modules</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Structured learning paths designed to guide you from novice to master ninja
          </p>
        </div>

        {user && user.userType === 'student' && <MyScheduledSessions />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module) => (
            <Card key={module.id} className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-red-600/50 transition-all duration-300 group">
              <div className="relative">
                <ImageWithFallback 
                  src={module.image}
                  alt={module.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  className={`absolute top-4 left-4 text-white ${getLevelColor(module.level)}`}
                >
                  {module.level}
                </Badge>
                {module.progress === 100 && (
                  <div className="absolute top-4 right-4 bg-green-600 rounded-full p-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-2">{module.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{module.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{module.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{module.rating}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      Progress: {module.completed}/{module.lessons} lessons
                    </span>
                    <span className="text-sm text-gray-400">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>

                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  variant={module.progress > 0 ? "default" : "outline"}
                  onClick={() => handleModuleAction(module)}
                >
                  {module.progress === 100 ? 'Review' : module.progress > 0 ? 'Continue' : 'Start Module'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleDetailView({ module, onBack, onLessonSelect }: any) {
  if (!module) return null;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <Card className="bg-slate-800/50 border-slate-700">
                <ImageWithFallback 
                  src={module.image}
                  alt={module.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-6">
                  <Badge className={`mb-3 ${module.level === 'Beginner' ? 'bg-green-600' : 
                                              module.level === 'Intermediate' ? 'bg-yellow-600' :
                                              module.level === 'Advanced' ? 'bg-orange-600' : 'bg-red-600'}`}>
                    {module.level}
                  </Badge>
                  <h1 className="text-2xl font-bold text-white mb-3">{module.title}</h1>
                  <p className="text-gray-400 mb-4">{module.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Duration:</span>
                      <span>{module.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Students:</span>
                      <span>{module.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rating:</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{module.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm text-gray-400">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="lg:w-2/3">
              <Tabs defaultValue="lessons" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                  <TabsTrigger value="lessons">Lessons</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="lessons" className="mt-6">
                  <div className="space-y-3">
                    {module.lessonsData?.map((lesson: any, index: number) => (
                      <Card 
                        key={lesson.id} 
                        className={`bg-slate-800/30 border-slate-700 hover:border-slate-600 transition-all cursor-pointer ${
                          lesson.completed ? 'opacity-75' : lesson.current ? 'border-red-600/50' : ''
                        }`}
                        onClick={() => onLessonSelect(lesson.id)}
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              lesson.completed ? 'bg-green-600' : lesson.current ? 'bg-red-600' : 'bg-slate-600'
                            }`}>
                              {lesson.completed ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : (
                                <span className="text-sm text-white">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-gray-400">{getTypeIcon(lesson.type)}</div>
                              <div>
                                <h3 className="text-white font-medium">{lesson.title}</h3>
                                <p className="text-sm text-gray-400">{lesson.duration}</p>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="overview" className="mt-6">
                  <Card className="bg-slate-800/30 border-slate-700 p-6">
                    <h3 className="text-xl font-bold text-white mb-4">What You'll Learn</h3>
                    <div className="space-y-4 text-gray-300">
                      <p>This comprehensive module covers the fundamental aspects of {module.title.toLowerCase()}.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">Skills Covered:</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            {module.lessonsData?.slice(0, 5).map((lesson: any) => (
                              <li key={lesson.id}>• {lesson.title}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">Prerequisites:</h4>
                          <p className="text-sm text-gray-400">
                            {module.level === 'Beginner' ? 'No prior experience required' : 
                             module.level === 'Intermediate' ? 'Complete Foundation modules first' : 
                             'Advanced knowledge of basic techniques required'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonView({ lesson, module, onComplete, onBack }: any) {
  const { user } = useAuth();
  if (!lesson || !module) return null;

  const lessonContent = {
    video: {
      title: "Watch and Learn",
      content: "This video lesson covers the essential concepts and demonstrations you need to master this technique."
    },
    practice: {
      title: "Practice Session",
      content: "Follow along with the guided practice session. Focus on proper form and technique."
    },
    meditation: {
      title: "Meditation Practice",
      content: "Find a quiet space and follow the guided meditation to develop your mental discipline."
    },
    theory: {
      title: "Theoretical Knowledge",
      content: "Study the principles and philosophy behind this aspect of ninjutsu training."
    },
    technique: {
      title: "Technique Training",
      content: "Learn and practice the specific movements and applications of this technique."
    },
    assessment: {
      title: "Assessment Challenge",
      content: "Demonstrate your mastery of the skills learned in this module."
    }
  };

  const currentContent = lessonContent[lesson.type as keyof typeof lessonContent] || lessonContent.theory;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {module.title}
          </Button>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  {getTypeIcon(lesson.type)} 
                  <span>{lesson.type}</span>
                </div>
                <span>• {lesson.duration}</span>
                <span>• {module.title}</span>
              </div>
            </div>
            <Badge className="bg-slate-700 text-white">
              Lesson {lesson.id} of {module.lessons}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <div className="aspect-video bg-slate-900 rounded-t-lg flex items-center justify-center border-b border-slate-700">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                    {getTypeIcon(lesson.type)}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{currentContent.title}</h3>
                  <p className="text-gray-400">{currentContent.content}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Ready to continue your training?
                  </div>
                  <Button 
                    onClick={() => onComplete(lesson.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            {user && user.userType === 'student' && (
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-600/30 p-6">
                <h3 className="font-bold text-white mb-3 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  <span>Need Help?</span>
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Struggling with this lesson? Schedule a one-on-one session with a teacher.
                </p>
                <ScheduleHelpDialog
                  type="training"
                  itemId={module.id.toString()}
                  itemTitle={module.title}
                  lessonTitle={lesson.title}
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Request Teacher Help
                  </Button>
                </ScheduleHelpDialog>
              </Card>
            )}

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="font-bold text-white mb-4">Lesson Notes</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <p>• Focus on proper breathing throughout the exercise</p>
                <p>• Maintain awareness of your surroundings</p>
                <p>• Practice slowly at first, speed comes with mastery</p>
                <p>• Remember the principles of balance and center</p>
              </div>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="font-bold text-white mb-4">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Module Progress</span>
                  <span className="text-white">{module.progress}%</span>
                </div>
                <Progress value={module.progress} className="h-2" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}