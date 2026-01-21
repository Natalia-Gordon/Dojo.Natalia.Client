import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Zap, Shield, Eye, Wind } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  const principles = [
    { icon: Zap, title: 'Speed', description: 'Swift movement and lightning reflexes' },
    { icon: Shield, title: 'Defense', description: 'Protection through knowledge and skill' },
    { icon: Eye, title: 'Awareness', description: 'Heightened perception and mindfulness' },
    { icon: Wind, title: 'Stealth', description: 'Move like the wind, unseen and unheard' },
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&crop=center"
          alt="Traditional Japanese dojo with morning light"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 bg-red-800/80 text-white border-red-600">
              Ancient Wisdom • Modern Training
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Master the Art of
              <span className="block text-red-400">Ninjutsu</span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              Discover the ancient secrets of the ninja through structured training, traditional techniques, 
              and mindful practice. Begin your journey from novice to master.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
                Begin Training
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Principles Section */}
      <div className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">The Four Pillars</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Master these fundamental principles to unlock the true power of ninjutsu
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((principle, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 p-6 hover:border-red-600/50 transition-all duration-300 group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <principle.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{principle.title}</h3>
                  <p className="text-gray-400">{principle.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-red-900/20 to-slate-900/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Your Journey Begins Now
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of students who have discovered their inner ninja through our comprehensive training program.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12">
            Start Your Training
          </Button>
        </div>
      </div>
    </div>
  );
}