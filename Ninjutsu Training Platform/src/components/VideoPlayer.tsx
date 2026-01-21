import { useState } from 'react';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VideoPlayerProps {
  thumbnail: string;
  title: string;
  duration: string;
  className?: string;
}

export function VideoPlayer({ thumbnail, title, duration, className = '' }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Simulate auto-hide controls after a few seconds when playing
    if (!isPlaying) {
      setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group cursor-pointer ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
      onClick={togglePlay}
    >
      {/* Video Thumbnail */}
      <div className="aspect-video relative">
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Dark overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        
        {/* Play/Pause Overlay */}
        {(!isPlaying || showControls) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              className={`rounded-full bg-red-600/80 hover:bg-red-600 text-white w-16 h-16 ${
                isPlaying ? 'opacity-80' : 'opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>
        )}
        
        {/* Progress indicator when playing */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div className="h-full bg-red-600 w-1/3 transition-all duration-1000 ease-linear"></div>
          </div>
        )}
        
        {/* Controls */}
        {showControls && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <span className="text-sm bg-black/60 px-2 py-1 rounded">
                {duration}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Video Title */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black/60 backdrop-blur-sm rounded px-3 py-2">
          <h4 className="text-white text-sm font-medium">{title}</h4>
        </div>
      </div>
    </div>
  );
}