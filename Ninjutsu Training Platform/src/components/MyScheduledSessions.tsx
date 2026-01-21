import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from './AuthContext';
import { useTrainingSessions } from './TrainingSessionContext';
import { Calendar, Clock, User, BookOpen, Target, MessageSquare } from 'lucide-react';

export function MyScheduledSessions() {
  const { user } = useAuth();
  const { getStudentSessions } = useTrainingSessions();

  if (!user || user.userType !== 'student') return null;

  const sessions = getStudentSessions(user.id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (sessions.length === 0) {
    return (
      <Card className="bg-slate-800/30 border-slate-700 p-8 text-center mb-8">
        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-white mb-2">No Scheduled Sessions</h3>
        <p className="text-gray-400 text-sm">
          Request help on any training module or technique to schedule a session with a teacher.
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700 p-6 mb-8">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-red-400" />
        <span>My Scheduled Sessions</span>
      </h3>
      
      <div className="space-y-4">
        {sessions.map(session => (
          <div 
            key={session.id} 
            className="bg-slate-900/30 border border-slate-700 rounded-lg p-4 hover:border-red-600/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={session.teacherAvatar} 
                  alt={session.teacherName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-red-600"
                />
                <div>
                  <p className="text-white font-medium">{session.teacherName}</p>
                  <p className="text-sm text-gray-400">Master Teacher</p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">
                Approved
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                {session.type === 'technique' ? (
                  <Target className="w-4 h-4 text-red-400" />
                ) : (
                  <BookOpen className="w-4 h-4 text-red-400" />
                )}
                <span className="text-white font-medium">{session.itemTitle}</span>
              </div>
              {session.lessonTitle && (
                <p className="text-sm text-gray-400 ml-6">Lesson: {session.lessonTitle}</p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-400 ml-6">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(session.preferredDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{session.preferredTime}</span>
                </div>
              </div>

              <div className="ml-6 mt-2">
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>Your request: {session.message}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
