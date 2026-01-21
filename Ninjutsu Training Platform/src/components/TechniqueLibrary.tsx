import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { VideoPlayer } from './VideoPlayer';
import { LoginDialog } from './LoginDialog';
import { useAuth } from './AuthContext';
import { ScheduleHelpDialog } from './ScheduleHelpDialog';
import { Search, BookOpen, Zap, Shield, Sword, Wind, Eye, Target, ArrowLeft, CheckCircle, Circle, Clock, Trophy, PlayCircle, AlertTriangle, Lightbulb, Lock, HelpCircle } from 'lucide-react';

export function TechniqueLibrary() {
  const { user, updateUserProgress } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<number | null>(null);
  const [practiceProgress, setPracticeProgress] = useState<Record<number, number[]>>(
    user ? {
      1: [1, 2, 3], // Shadow Walking - 3 of 4 steps completed
      4: [1, 2, 3, 4, 5], // Defensive Rolls - All 5 steps completed (Mastered)
      5: [1, 2, 3, 4], // Wall Running - 4 of 7 steps completed
      6: [1, 2], // Environmental Awareness - 2 of 3 steps completed
    } : {}
  );

  const categories = [
    { id: 'stealth', name: 'Stealth', icon: Wind, color: 'bg-blue-600' },
    { id: 'combat', name: 'Combat', icon: Sword, color: 'bg-red-600' },
    { id: 'defense', name: 'Defense', icon: Shield, color: 'bg-green-600' },
    { id: 'movement', name: 'Movement', icon: Zap, color: 'bg-yellow-600' },
    { id: 'awareness', name: 'Awareness', icon: Eye, color: 'bg-purple-600' },
    { id: 'precision', name: 'Precision', icon: Target, color: 'bg-orange-600' },
  ];

  const techniques = [
    {
      id: 1,
      name: 'Shadow Walking',
      category: 'stealth',
      difficulty: 'Beginner',
      description: 'Move silently by placing feet heel-to-toe and controlling breathing.',
      steps: 4,
      masteryLevel: 'Practiced',
      unlocked: true,
      stepDetails: [
        { 
          id: 1, 
          title: 'Foot Placement Basics', 
          description: 'Learn proper heel-to-toe foot positioning for silent movement',
          duration: '15 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1698764475676-647cffc57ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVhbHRoJTIwbW92ZW1lbnQlMjBzaGFkb3d8ZW58MXx8fHwxNzU5MjE5MjEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'The foundation of silent movement begins with proper foot placement. Place your heel down first, then slowly roll your foot forward to the toe. This distributes your weight gradually and minimizes ground contact noise. Practice on different surfaces to understand how pressure affects sound.',
          keyPoints: ['Heel-to-toe rolling motion', 'Gradual weight distribution', 'Surface awareness'],
          commonMistakes: ['Flat-footed steps', 'Too much speed', 'Inconsistent rhythm']
        },
        { 
          id: 2, 
          title: 'Weight Distribution', 
          description: 'Master weight transfer between steps for balance and silence',
          duration: '20 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1512928735464-5cc10b1eb091?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaW5qYSUyMHRyYWluaW5nJTIwbWFydGlhbCUyMGFydHN8ZW58MXx8fHwxNzU5MjE5MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Proper weight distribution is crucial for maintaining balance while moving silently. Keep your center of gravity low and transfer weight smoothly from one foot to the other. Your supporting leg should bear most weight while the moving leg tests the ground ahead.',
          keyPoints: ['Low center of gravity', 'Smooth weight transitions', 'Testing ground before full commitment'],
          commonMistakes: ['Rushing weight transfer', 'Standing too upright', 'Not testing ground first']
        },
        { 
          id: 3, 
          title: 'Breathing Control', 
          description: 'Coordinate breathing with movement to maintain stealth and focus',
          duration: '25 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1571905302875-1f8616f63be5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwYXdhcmVuZXNzJTIwZm9jdXN8ZW58MXx8fHwxNzU5MjE5MjI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Controlled breathing is essential for silent movement. Breathe slowly and deeply through your nose to minimize sound. Synchronize your breathing with your steps - inhale as you lift your foot, exhale as you place it down. This rhythm helps maintain calm and control.',
          keyPoints: ['Nasal breathing only', 'Rhythm with steps', 'Deep, controlled breaths'],
          commonMistakes: ['Mouth breathing', 'Holding breath', 'Irregular breathing patterns']
        },
        { 
          id: 4, 
          title: 'Silent Movement Integration', 
          description: 'Combine all elements for seamless, silent walking technique',
          duration: '30 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1698764475676-647cffc57ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVhbHRoJTIwbW92ZW1lbnQlMjBzaGFkb3d8ZW58MXx8fHwxNzU5MjE5MjEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Now integrate all learned elements into fluid, silent movement. Combine proper foot placement, weight distribution, and breathing control. Start slowly and gradually increase speed while maintaining silence. Practice in various environments and lighting conditions.',
          keyPoints: ['Fluid integration', 'Speed progression', 'Environmental adaptation'],
          commonMistakes: ['Moving too fast too soon', 'Forgetting breathing', 'Not adapting to environment']
        }
      ]
    },
    {
      id: 2,
      name: 'Smoke Bomb Deployment',
      category: 'stealth',
      difficulty: 'Intermediate',
      description: 'Create visual distractions using traditional smoke bombs.',
      steps: 6,
      masteryLevel: 'Novice',
      unlocked: true,
      stepDetails: [
        { 
          id: 1, 
          title: 'Smoke Bomb Construction', 
          description: 'Learn to craft traditional smoke bombs using safe, effective materials',
          duration: '45 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1636925785440-1d295ff6286c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMHNtb2tlJTIwZ3JlbmFkZXxlbnwxfHx8fDE3NTkyMTk3MDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Traditional ninja smoke bombs use simple but effective materials. Combine potassium nitrate (saltpeter), charcoal powder, and sulfur in a 6:3:1 ratio. Wrap the mixture in rice paper or cloth, securing with natural twine. Always work in well-ventilated areas and store completed bombs in dry conditions. Modern training versions can use safer alternatives like corn starch and baking soda.',
          keyPoints: ['6:3:1 ratio for traditional mix', 'Rice paper wrapping', 'Proper ventilation during construction', 'Dry storage conditions'],
          commonMistakes: ['Incorrect ratios causing poor smoke', 'Tight wrapping preventing ignition', 'Wet storage degrading materials', 'Working in confined spaces']
        },
        { 
          id: 2, 
          title: 'Deployment Timing', 
          description: 'Master when to deploy smoke bombs for maximum tactical advantage',
          duration: '30 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1649878974659-8b333e9f52fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9rZSUyMGJvbWIlMjB0YWN0aWNhbCUyMHRyYWluaW5nfGVufDF8fHx8MTc1OTIxOTY5OHww&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Timing is crucial for effective smoke bomb deployment. Deploy during moments of distraction or when enemies are focused elsewhere. Consider the 3-5 second delay before full smoke generation. Use during retreat, not advance, as smoke can obscure your own vision. Deploy when you have a clear escape route planned and when wind conditions favor your movement.',
          keyPoints: ['3-5 second deployment delay', 'Use during distraction moments', 'Deploy for retreat, not advance', 'Ensure escape route is ready'],
          commonMistakes: ['Deploying too early or late', 'Using during advance movements', 'No planned escape route', 'Ignoring wind direction']
        },
        { 
          id: 3, 
          title: 'Wind Direction Assessment', 
          description: 'Read environmental conditions to predict smoke behavior',
          duration: '20 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1526812919332-0feb7e2a7f80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kJTIwZGlyZWN0aW9uJTIwd2VhdGhlciUyMGFzc2Vzc21lbnR8ZW58MXx8fHwxNzU5MjE5NzA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Proper wind assessment prevents smoke from working against you. Test wind direction by dropping light materials like grass or dust. Observe how smoke from small fires behaves. Account for wind speed - light winds spread smoke effectively, while strong winds disperse it too quickly. Indoor environments have different air current patterns that must be considered.',
          keyPoints: ['Test with light materials first', 'Observe natural smoke patterns', 'Light winds are optimal', 'Indoor air currents differ'],
          commonMistakes: ['Not testing wind beforehand', 'Deploying in wrong wind', 'Ignoring indoor air patterns', 'Underestimating wind speed effects']
        },
        { 
          id: 4, 
          title: 'Escape Route Planning', 
          description: 'Plan your movements before deploying smoke for maximum effectiveness',
          duration: '25 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1653361774259-77082d5e3015?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWN0aWNhbCUyMGVzY2FwZSUyMHJvdXRlJTIwcGxhbm5pbmd8ZW58MXx8fHwxNzU5MjE5NzEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Always plan your escape route before deploying smoke. Identify at least two alternative paths in case the primary route becomes blocked. Consider obstacles, terrain, and potential hiding spots along the route. Practice the route in advance if possible. Remember that you\'ll also be partially blinded by your own smoke, so rely on memory and counting steps.',
          keyPoints: ['Minimum two escape routes', 'Memorize obstacle locations', 'Practice routes in advance', 'Count steps for navigation'],
          commonMistakes: ['Single escape route only', 'Not memorizing obstacles', 'No route practice', 'Relying on vision in smoke']
        },
        { 
          id: 5, 
          title: 'Multiple Bomb Tactics', 
          description: 'Advanced techniques using multiple smoke bombs for complex scenarios',
          duration: '35 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1544505853-4d5c7aa51f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9rZSUyMHRhY3RpY2FsJTIwZGl2ZXJzaW9ufGVufDF8fHx8MTc1OTIxOTcxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Multiple smoke bombs create larger diversions and multiple escape options. Deploy bombs in sequence, not simultaneously, to extend the confusion period. Use decoy deployments to mislead pursuers about your actual escape direction. Space bombs strategically to create corridors of concealment. Consider using different colored smoke for additional confusion in daylight operations.',
          keyPoints: ['Sequential deployment timing', 'Decoy placement strategy', 'Strategic spacing for corridors', 'Different colors for daylight'],
          commonMistakes: ['Simultaneous deployment', 'No decoy strategy', 'Poor spacing creating gaps', 'Single color limitation']
        },
        { 
          id: 6, 
          title: 'Combat Integration', 
          description: 'Seamlessly integrate smoke bombs into active combat scenarios',
          duration: '40 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1649878974659-8b333e9f52fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21iYXQlMjB0cmFpbmluZyUyMHNtb2tlJTIwc2NyZWVufGVufDF8fHx8MTc1OTIxOTcxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Combat integration requires split-second decision making and flawless execution. Use smoke to break line of sight during disadvantageous engagements. Deploy while moving to avoid becoming a stationary target. Combine with other distraction techniques like thrown objects or noise makers. Practice deployment while under stress to ensure muscle memory activation during real scenarios.',
          keyPoints: ['Break line of sight quickly', 'Deploy while moving', 'Combine with other distractions', 'Stress training for muscle memory'],
          commonMistakes: ['Becoming stationary during deployment', 'Single distraction method', 'No stress practice', 'Poor timing with combat rhythm']
        }
      ]
    },
    {
      id: 3,
      name: 'Katana Quick Draw',
      category: 'combat',
      difficulty: 'Advanced',
      description: 'Lightning-fast sword drawing technique for surprise attacks.',
      steps: 8,
      masteryLevel: 'Not Started',
      unlocked: false,
      stepDetails: [
        { id: 1, title: 'Sword Grip Fundamentals', description: 'Proper katana holding technique', duration: '30 min' },
        { id: 2, title: 'Scabbard Position', description: 'Optimal sheath positioning for quick draw', duration: '25 min' },
        { id: 3, title: 'Draw Motion Basics', description: 'Basic unsheathing movement', duration: '35 min' },
        { id: 4, title: 'Speed Development', description: 'Increase draw speed through repetition', duration: '45 min' },
        { id: 5, title: 'Target Acquisition', description: 'Combine draw with immediate striking', duration: '40 min' },
        { id: 6, title: 'Multiple Angle Draws', description: 'Quick draw from various positions', duration: '50 min' },
        { id: 7, title: 'Combat Scenarios', description: 'Apply quick draw in simulated combat', duration: '60 min' },
        { id: 8, title: 'Mastery Integration', description: 'Flawless execution under pressure', duration: '90 min' }
      ]
    },
    {
      id: 4,
      name: 'Defensive Rolls',
      category: 'defense',
      difficulty: 'Beginner',
      description: 'Absorb impact and maintain mobility through proper rolling technique.',
      steps: 5,
      masteryLevel: 'Mastered',
      unlocked: true,
      stepDetails: [
        { 
          id: 1, 
          title: 'Basic Roll Form', 
          description: 'Learn proper shoulder roll technique for safe impact absorption',
          duration: '20 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1529630218527-7df22fc2d4ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJ0aWFsJTIwYXJ0cyUyMGRlZmVuc2UlMjByb2xsfGVufDF8fHx8MTc1OTIxOTIxOHww&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'The basic shoulder roll is fundamental to defensive movement. Start in a crouch, place one hand on the ground, and roll diagonally across your back from shoulder to opposite hip. Keep your chin tucked and maintain a curved spine throughout the movement.',
          keyPoints: ['Diagonal roll pattern', 'Curved spine', 'Tucked chin'],
          commonMistakes: ['Rolling straight back', 'Flat back', 'Head up during roll']
        },
        { 
          id: 2, 
          title: 'Impact Absorption', 
          description: 'Distribute force across the body to minimize injury',
          duration: '25 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1512928735464-5cc10b1eb091?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaW5qYSUyMHRyYWluaW5nJTIwbWFydGlhbCUyMGFydHN8ZW58MXx8fHwxNzU5MjE5MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Effective impact absorption spreads force across multiple contact points. Use the soft parts of your body - shoulder, back, and hip - to absorb impact. Avoid contact with spine, elbows, or knees. The roll should feel smooth and controlled, not jarring.',
          keyPoints: ['Soft tissue contact', 'Force distribution', 'Smooth transitions'],
          commonMistakes: ['Hard surface contact', 'Single point impact', 'Tense muscles during roll']
        },
        { 
          id: 3, 
          title: 'Direction Control', 
          description: 'Master rolling in multiple directions for tactical advantage',
          duration: '30 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1529630218527-7df22fc2d4ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJ0aWFsJTIwYXJ0cyUyMGRlZmVuc2UlMjByb2xsfGVufDF8fHx8MTc1OTIxOTIxOHww&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Practice rolling forward, backward, and to both sides. Each direction requires slight modifications to hand placement and body positioning. Forward rolls need momentum, backward rolls require careful weight distribution, and side rolls need precise shoulder engagement.',
          keyPoints: ['Multi-directional capability', 'Adapted hand placement', 'Direction-specific techniques'],
          commonMistakes: ['Same technique for all directions', 'Poor momentum control', 'Inconsistent form']
        },
        { 
          id: 4, 
          title: 'Recovery Speed', 
          description: 'Develop quick return to fighting stance after rolling',
          duration: '25 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1512928735464-5cc10b1eb091?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaW5qYSUyMHRyYWluaW5nJTIwbWFydGlhbCUyMGFydHN8ZW58MXx8fHwxNzU5MjE5MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Fast recovery is crucial for maintaining defensive capability. As you complete the roll, use momentum to spring into a ready stance. Plant your feet wide for stability and bring hands up to guard position. Practice until the transition becomes automatic.',
          keyPoints: ['Momentum utilization', 'Stable stance', 'Automatic transition'],
          commonMistakes: ['Slow recovery', 'Poor foot placement', 'Forgotten guard position']
        },
        { 
          id: 5, 
          title: 'Combat Application', 
          description: 'Implement rolling techniques during active combat scenarios',
          duration: '35 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1529630218527-7df22fc2d4ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJ0aWFsJTIwYXJ0cyUyMGRlZmVuc2UlMjByb2xsfGVufDF8fHx8MTc1OTIxOTIxOHww&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Apply defensive rolls in simulated combat situations. Use rolls to evade attacks, change position, or create distance. Practice rolling under pressure and in constrained spaces. Combine with other defensive techniques for maximum effectiveness.',
          keyPoints: ['Combat timing', 'Evasion tactics', 'Space awareness'],
          commonMistakes: ['Poor timing', 'Telegraphing movement', 'Not considering environment']
        }
      ]
    },
    {
      id: 5,
      name: 'Wall Running',
      category: 'movement',
      difficulty: 'Intermediate',
      description: 'Scale vertical surfaces using momentum and proper foot placement.',
      steps: 7,
      masteryLevel: 'Practiced',
      unlocked: true,
      stepDetails: [
        { 
          id: 1, 
          title: 'Approach Speed', 
          description: 'Build proper momentum for effective wall contact',
          duration: '30 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1628714357044-944ea91b13fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJrb3VyJTIwd2FsbCUyMHJ1bm5pbmd8ZW58MXx8fHwxNzU5MjE5MjIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Proper approach speed is critical for successful wall running. Start with a controlled sprint at about 70% of your maximum speed. Too slow and you won\'t have enough momentum; too fast and you\'ll lose control. Focus on consistent acceleration toward the wall.',
          keyPoints: ['70% maximum speed', 'Controlled acceleration', 'Consistent pace'],
          commonMistakes: ['Too much speed', 'Inconsistent approach', 'Last-second hesitation']
        },
        { 
          id: 2, 
          title: 'First Step Technique', 
          description: 'Master the initial wall contact and push-off mechanics',
          duration: '35 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1628714357044-944ea91b13fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJrb3VyJTIwd2FsbCUyMHJ1bm5pbmd8ZW58MXx8fHwxNzU5MjE5MjIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'The first step determines your entire wall run. Plant your foot on the wall at approximately 45 degrees, using the ball of your foot for maximum grip. Push off immediately while driving your opposite knee upward for momentum.',
          keyPoints: ['45-degree foot angle', 'Ball of foot contact', 'Immediate push-off'],
          commonMistakes: ['Flat foot contact', 'Delayed push-off', 'Wrong angle approach']
        },
        { 
          id: 3, 
          title: 'Foot Placement', 
          description: 'Optimize foot positioning on vertical surfaces for maximum efficiency',
          duration: '40 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1628714357044-944ea91b13fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJrb3VyJTIwd2FsbCUyMHJ1bm5pbmd8ZW58MXx8fHwxNzU5MjE5MjIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Each foot placement should be deliberate and precise. Aim for textured surfaces or slight protrusions when possible. Keep your feet pointing slightly upward to maintain grip. The contact should be brief but powerful.',
          keyPoints: ['Precise placement', 'Textured surface preference', 'Brief powerful contact'],
          commonMistakes: ['Random foot placement', 'Too long contact time', 'Downward pointing feet']
        },
        { 
          id: 4, 
          title: 'Multiple Steps', 
          description: 'Chain multiple wall steps together for extended runs',
          duration: '45 min',
          videoThumbnail: 'https://images.unsplash.com/photo-1628714357044-944ea91b13fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJrb3VyJTIwd2FsbCUyMHJ1bm5pbmd8ZW58MXx8fHwxNzU5MjE5MjIxfDA&ixlib=rb-4.1.0&q=80&w=1080',
          explanation: 'Chaining steps requires rhythm and momentum conservation. Each step should flow into the next without pause. Maintain forward lean and keep your center of gravity close to the wall. Use arm movements to help maintain balance and momentum.',
          keyPoints: ['Rhythmic flow', 'Momentum conservation', 'Forward lean maintenance'],
          commonMistakes: ['Pausing between steps', 'Leaning away from wall', 'Poor arm coordination']
        }
      ]
    },
    {
      id: 6,
      name: 'Environmental Awareness',
      category: 'awareness',
      difficulty: 'Beginner',
      description: 'Heighten senses to detect threats and opportunities.',
      steps: 3,
      masteryLevel: 'Practiced',
      unlocked: true,
      stepDetails: [
        { id: 1, title: 'Sensory Training', description: 'Enhance hearing, sight, and smell', duration: '40 min' },
        { id: 2, title: 'Threat Assessment', description: 'Quickly identify potential dangers', duration: '35 min' },
        { id: 3, title: 'Opportunity Recognition', description: 'Spot advantageous positions and routes', duration: '45 min' }
      ]
    },
    {
      id: 7,
      name: 'Shuriken Mastery',
      category: 'precision',
      difficulty: 'Advanced',
      description: 'Accurate throwing star techniques for various distances.',
      steps: 10,
      masteryLevel: 'Not Started',
      unlocked: false,
      stepDetails: [
        { id: 1, title: 'Shuriken Grip', description: 'Proper holding technique for accuracy', duration: '25 min' },
        { id: 2, title: 'Stance and Balance', description: 'Optimal throwing stance', duration: '30 min' },
        { id: 3, title: 'Short Range Accuracy', description: 'Precision at 3-5 meters', duration: '35 min' },
        { id: 4, title: 'Medium Range Throws', description: 'Accurate throws at 6-10 meters', duration: '40 min' },
        { id: 5, title: 'Long Range Techniques', description: 'Precision at 11-15 meters', duration: '45 min' },
        { id: 6, title: 'Moving Target Practice', description: 'Hit targets in motion', duration: '50 min' },
        { id: 7, title: 'Multiple Projectile', description: 'Throw multiple shuriken rapidly', duration: '55 min' },
        { id: 8, title: 'Curved Trajectories', description: 'Ricochet and indirect throws', duration: '60 min' },
        { id: 9, title: 'Combat Application', description: 'Use shuriken during engagement', duration: '65 min' },
        { id: 10, title: 'Master Precision', description: 'Flawless accuracy under pressure', duration: '90 min' }
      ]
    },
    {
      id: 8,
      name: 'Pressure Point Strikes',
      category: 'combat',
      difficulty: 'Expert',
      description: 'Target specific nerve points to disable opponents.',
      steps: 12,
      masteryLevel: 'Not Started',
      unlocked: false,
      stepDetails: [
        { id: 1, title: 'Anatomy Study', description: 'Learn human nerve point locations', duration: '60 min' },
        { id: 2, title: 'Finger Positioning', description: 'Precise finger and hand placement', duration: '45 min' },
        { id: 3, title: 'Strike Force Control', description: 'Apply exact pressure for effect', duration: '50 min' },
        { id: 4, title: 'Upper Body Points', description: 'Target neck, shoulder, and arm points', duration: '55 min' },
        { id: 5, title: 'Lower Body Points', description: 'Target leg and torso pressure points', duration: '55 min' },
        { id: 6, title: 'Temporary Disable', description: 'Non-permanent incapacitation techniques', duration: '60 min' },
        { id: 7, title: 'Pain Compliance', description: 'Control through strategic pressure', duration: '50 min' },
        { id: 8, title: 'Multiple Point Strikes', description: 'Combine multiple pressure points', duration: '65 min' },
        { id: 9, title: 'Defense Integration', description: 'Use during defensive scenarios', duration: '70 min' },
        { id: 10, title: 'Speed Application', description: 'Rapid pressure point targeting', duration: '75 min' },
        { id: 11, title: 'Combat Scenarios', description: 'Apply under combat stress', duration: '80 min' },
        { id: 12, title: 'Master Precision', description: 'Instant incapacitation mastery', duration: '120 min' }
      ]
    }
  ];

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'Mastered': return 'bg-green-600';
      case 'Practiced': return 'bg-blue-600';
      case 'Novice': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'border-green-500';
      case 'Intermediate': return 'border-yellow-500';
      case 'Advanced': return 'border-orange-500';
      case 'Expert': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const filteredTechniques = techniques.filter(technique =>
    technique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    technique.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTechniquesByCategory = (categoryId: string) => {
    return filteredTechniques.filter(technique => technique.category === categoryId);
  };

  const getCompletedSteps = (techniqueId: number) => {
    return practiceProgress[techniqueId] || [];
  };

  const calculateProgress = (techniqueId: number, totalSteps: number) => {
    const completed = getCompletedSteps(techniqueId);
    return Math.round((completed.length / totalSteps) * 100);
  };

  const getMasteryLevel = (techniqueId: number, totalSteps: number) => {
    const completed = getCompletedSteps(techniqueId);
    if (completed.length === 0) return 'Not Started';
    if (completed.length === totalSteps) return 'Mastered';
    if (completed.length >= totalSteps * 0.7) return 'Practiced';
    return 'Novice';
  };

  const markStepComplete = (techniqueId: number, stepId: number) => {
    if (!user) return;
    
    const currentProgress = practiceProgress[techniqueId] || [];
    if (!currentProgress.includes(stepId)) {
      const updatedProgress = [...currentProgress, stepId];
      setPracticeProgress(prev => ({
        ...prev,
        [techniqueId]: updatedProgress
      }));
      
      // Check if technique is completed
      const technique = techniques.find(t => t.id === techniqueId);
      if (technique && updatedProgress.length === technique.stepDetails.length) {
        updateUserProgress(`technique-${techniqueId}`);
      }
    }
  };

  const getButtonText = (technique: any) => {
    const completedSteps = getCompletedSteps(technique.id);
    const masteryLevel = getMasteryLevel(technique.id, technique.steps);
    
    if (!technique.unlocked) return 'Locked';
    if (masteryLevel === 'Mastered') return 'Review Practice';
    if (completedSteps.length === 0) return 'Begin Practice';
    return 'Continue Practice';
  };

  const getCurrentStep = (techniqueId: number, totalSteps: number) => {
    const completed = getCompletedSteps(techniqueId);
    return completed.length < totalSteps ? completed.length + 1 : totalSteps;
  };

  if (selectedTechnique !== null) {
    const technique = techniques.find(t => t.id === selectedTechnique);
    if (!technique) return null;

    const completedSteps = getCompletedSteps(technique.id);
    const progress = calculateProgress(technique.id, technique.steps);
    const masteryLevel = getMasteryLevel(technique.id, technique.steps);
    const currentStep = getCurrentStep(technique.id, technique.steps);

    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedTechnique(null)}
              className="text-white hover:text-red-500 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Technique Library
            </Button>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{technique.name}</h1>
                  <p className="text-gray-400 mb-4">{technique.description}</p>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{technique.difficulty}</Badge>
                    <Badge className={`text-white ${getMasteryColor(masteryLevel)}`}>
                      {masteryLevel}
                    </Badge>
                    {masteryLevel === 'Mastered' && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm">Mastered</span>
                      </div>
                    )}
                  </div>
                </div>
                {user && user.userType === 'student' && (
                  <ScheduleHelpDialog
                    type="technique"
                    itemId={technique.id.toString()}
                    itemTitle={technique.name}
                  >
                    <Button variant="outline" className="ml-4 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Request Help
                    </Button>
                  </ScheduleHelpDialog>
                )}
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Practice Progress</span>
                  <span className="text-sm text-gray-400">
                    {completedSteps.length} of {technique.steps} steps completed
                  </span>
                </div>
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-sm text-gray-500">{progress}% complete</p>
              </div>

              <Separator className="mb-8" />

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Practice Steps</h2>
                
                {technique.stepDetails.map((step) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = step.id === currentStep && !isCompleted;
                  
                  return (
                    <Card
                      key={step.id}
                      className={`p-6 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-900/20 border-green-600'
                          : isCurrent
                          ? 'bg-blue-900/20 border-blue-600'
                          : 'bg-slate-800/30 border-slate-700'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Step Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              ) : isCurrent ? (
                                <Clock className="w-6 h-6 text-blue-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <h3 className={`text-lg font-medium ${
                                isCompleted
                                  ? 'text-green-300'
                                  : isCurrent
                                  ? 'text-blue-300'
                                  : 'text-white'
                              }`}>
                                Step {step.id}: {step.title}
                              </h3>
                              <p className={`text-sm ${
                                isCompleted
                                  ? 'text-green-400'
                                  : isCurrent
                                  ? 'text-blue-400'
                                  : 'text-gray-400'
                              }`}>
                                {step.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <PlayCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-gray-400">{step.duration}</span>
                          </div>
                        </div>

                        {/* Video Player */}
                        {step.videoThumbnail && (
                          <div className="w-full">
                            <VideoPlayer
                              thumbnail={step.videoThumbnail}
                              title={step.title}
                              duration={step.duration}
                              className="w-full max-w-md mx-auto"
                            />
                          </div>
                        )}

                        {/* Detailed Explanation */}
                        {(isCurrent || isCompleted) && step.explanation && (
                          <div className="space-y-4">
                            <Separator />
                            
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-white flex items-center space-x-2">
                                <BookOpen className="w-4 h-4" />
                                <span>Detailed Instructions</span>
                              </h4>
                              <p className="text-sm text-gray-300 leading-relaxed">
                                {step.explanation}
                              </p>
                            </div>

                            {step.keyPoints && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-green-400 flex items-center space-x-2">
                                  <Lightbulb className="w-4 h-4" />
                                  <span>Key Points</span>
                                </h5>
                                <ul className="text-sm text-gray-300 space-y-1">
                                  {step.keyPoints.map((point, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <span className="text-green-400 mt-1.5 w-1 h-1 bg-green-400 rounded-full flex-shrink-0"></span>
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {step.commonMistakes && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-orange-400 flex items-center space-x-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>Common Mistakes</span>
                                </h5>
                                <ul className="text-sm text-gray-300 space-y-1">
                                  {step.commonMistakes.map((mistake, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <span className="text-orange-400 mt-1.5 w-1 h-1 bg-orange-400 rounded-full flex-shrink-0"></span>
                                      <span>{mistake}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2">
                            {isCompleted && (
                              <Badge variant="outline" className="text-green-500 border-green-500">
                                ✓ Completed
                              </Badge>
                            )}
                            {isCurrent && (
                              <Badge variant="outline" className="text-blue-500 border-blue-500">
                                Current Step
                              </Badge>
                            )}
                          </div>
                          
                          {isCurrent && (
                            <Button
                              size="sm"
                              onClick={() => markStepComplete(technique.id, step.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Mark Complete
                            </Button>
                          )}
                          
                          {isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                            >
                              Review Step
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {masteryLevel === 'Mastered' && (
                <div className="mt-8 p-6 bg-green-900/20 border border-green-600 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Trophy className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold text-green-300">Technique Mastered!</h3>
                  </div>
                  <p className="text-green-400">
                    Congratulations! You have completed all steps for {technique.name}. 
                    You can continue to review individual steps or practice the complete technique.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-green-500 text-green-400 hover:bg-green-600 hover:text-white"
                  >
                    Practice Full Technique
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Technique Library</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Master the ancient arts through detailed technique breakdowns and guided practice
          </p>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search techniques..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <Tabs defaultValue="stealth" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-slate-800/50 border-slate-700 p-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center space-x-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getTechniquesByCategory(category.id).map((technique, index) => {
                  const completedSteps = user ? getCompletedSteps(technique.id) : [];
                  const progress = user ? calculateProgress(technique.id, technique.steps) : 0;
                  const masteryLevel = user ? getMasteryLevel(technique.id, technique.steps) : 'Locked';
                  const isLocked = !user && index >= 2; // Show only first 2 techniques per category for non-logged users
                  
                  return (
                    <Card
                      key={technique.id}
                      className={`bg-slate-800/50 border-slate-700 p-6 hover:border-red-600/50 transition-all duration-300 ${
                        (!technique.unlocked || isLocked) ? 'opacity-60' : ''
                      } ${getDifficultyColor(technique.difficulty)} ${isLocked ? 'relative' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                            <span>{technique.name}</span>
                            {(!technique.unlocked || isLocked) && <Lock className="w-4 h-4 text-yellow-500" />}
                            {masteryLevel === 'Mastered' && (
                              <Trophy className="w-4 h-4 text-green-500" />
                            )}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {technique.difficulty}
                            </Badge>
                            <Badge className={`text-xs text-white ${getMasteryColor(masteryLevel)}`}>
                              {masteryLevel}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {technique.description}
                      </p>

                      {technique.unlocked && !isLocked && completedSteps.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">Progress</span>
                            <span className="text-xs text-gray-400">
                              {completedSteps.length}/{technique.steps}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <BookOpen className="w-4 h-4" />
                          <span>{technique.steps} steps</span>
                        </div>
                        {technique.unlocked && masteryLevel === 'Practiced' && (
                          <span className="text-xs text-blue-400">Next: Step {getCurrentStep(technique.id, technique.steps)}</span>
                        )}
                      </div>

                      {isLocked ? (
                        <LoginDialog>
                          <Button className="w-full" variant="outline">
                            <Lock className="w-4 h-4 mr-2" />
                            Login to Access
                          </Button>
                        </LoginDialog>
                      ) : (
                        <Button
                          className="w-full"
                          variant={technique.unlocked ? "default" : "secondary"}
                          disabled={!technique.unlocked}
                          onClick={() => technique.unlocked && setSelectedTechnique(technique.id)}
                        >
                          {getButtonText(technique)}
                        </Button>
                      )}
                      
                      {/* Lock Overlay for Non-logged Users */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                          <div className="text-center p-4">
                            <Lock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-white font-medium mb-1">Premium Technique</p>
                            <p className="text-gray-400 text-sm">Login to access advanced training</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}