import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BookOpen, Download, Search, Scroll, Video, FileText, Star, Clock, Eye, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from './AuthContext';
import { LoginDialog } from './LoginDialog';

export function ResourceLibrary() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const resources = [
    {
      id: 1,
      title: 'Ancient Scrolls of the Shadow Clan',
      type: 'scroll',
      difficulty: 'Expert',
      author: 'Master Hanzo',
      description: 'Historical documents detailing the secret techniques of the legendary Shadow Clan.',
      downloadCount: 2341,
      rating: 4.9,
      duration: '45 min read',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center',
      tags: ['History', 'Advanced Techniques', 'Shadow Arts']
    },
    {
      id: 2,
      title: 'Meditation and Mind Control',
      type: 'video',
      difficulty: 'Beginner',
      author: 'Sensei Akira',
      description: 'Learn the fundamentals of ninja meditation and mental discipline.',
      downloadCount: 5627,
      rating: 4.8,
      duration: '32 min video',
      image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=300&h=200&fit=crop&crop=center',
      tags: ['Meditation', 'Mental Training', 'Beginner']
    },
    {
      id: 3,
      title: 'Complete Weapon Mastery Guide',
      type: 'guide',
      difficulty: 'Intermediate',
      author: 'Master Kenji',
      description: 'Comprehensive guide covering all traditional ninja weapons and their applications.',
      downloadCount: 3854,
      rating: 4.7,
      duration: '78 min read',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop&crop=center',
      tags: ['Weapons', 'Combat', 'Traditional Arts']
    },
    {
      id: 4,
      title: 'Stealth Movement Techniques',
      type: 'video',
      difficulty: 'Intermediate',
      author: 'Ninja Master Yuki',
      description: 'Visual demonstration of advanced stealth and movement techniques.',
      downloadCount: 4123,
      rating: 5.0,
      duration: '28 min video',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center',
      tags: ['Stealth', 'Movement', 'Practical Training']
    },
    {
      id: 5,
      title: 'Philosophy of the Ninja Way',
      type: 'scroll',
      difficulty: 'All Levels',
      author: 'Elder Matsuo',
      description: 'Ancient wisdom on the philosophical foundations of ninjutsu.',
      downloadCount: 1876,
      rating: 4.6,
      duration: '25 min read',
      image: 'https://images.unsplash.com/photo-1544992503-7ad5ac882d5d?w=300&h=200&fit=crop&crop=center',
      tags: ['Philosophy', 'Wisdom', 'Cultural Heritage']
    },
    {
      id: 6,
      title: 'Modern Parkour for Ninjas',
      type: 'guide',
      difficulty: 'Advanced',
      author: 'Sensei Taro',
      description: 'Adapting traditional ninja movement to modern urban environments.',
      downloadCount: 2967,
      rating: 4.4,
      duration: '52 min read',
      image: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=300&h=200&fit=crop&crop=center',
      tags: ['Modern Training', 'Parkour', 'Urban Skills']
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scroll': return Scroll;
      case 'video': return Video;
      case 'guide': return FileText;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scroll': return 'bg-amber-600';
      case 'video': return 'bg-blue-600';
      case 'guide': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'border-green-500';
      case 'Intermediate': return 'border-yellow-500';
      case 'Advanced': return 'border-orange-500';
      case 'Expert': return 'border-red-500';
      default: return 'border-blue-500';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || resource.difficulty === filterDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Resource Library</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Access ancient wisdom and modern training materials to deepen your understanding
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-48 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="scroll">Ancient Scrolls</SelectItem>
              <SelectItem value="video">Video Lessons</SelectItem>
              <SelectItem value="guide">Training Guides</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-full md:w-48 bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource, index) => {
            const TypeIcon = getTypeIcon(resource.type);
            const isLocked = !user && index >= 3; // Show only first 3 resources for non-logged users
            
            return (
              <Card
                key={resource.id}
                className={`bg-slate-800/50 border-slate-700 overflow-hidden hover:border-red-600/50 transition-all duration-300 group ${getDifficultyColor(resource.difficulty)} ${isLocked ? 'relative opacity-60' : ''}`}
              >
                <div className="relative">
                  <ImageWithFallback 
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge 
                    className={`absolute top-4 left-4 text-white ${getTypeColor(resource.type)}`}
                  >
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="absolute top-4 right-4 bg-black/60 border-white/30 text-white"
                  >
                    {resource.difficulty}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-1">by {resource.author}</p>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{resource.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloadCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{resource.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isLocked ? (
                      <LoginDialog>
                        <Button className="flex-1" variant="outline">
                          <Lock className="w-4 h-4 mr-2" />
                          Login to Access
                        </Button>
                      </LoginDialog>
                    ) : (
                      <>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Lock Overlay for Non-logged Users */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <div className="text-center p-4">
                      <Lock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-white font-medium mb-1">Premium Resource</p>
                      <p className="text-gray-400 text-sm">Login to access exclusive content</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No resources found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterDifficulty('all');
              }}
              variant="outline"
              className="mt-4 border-slate-600 text-white hover:bg-slate-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}