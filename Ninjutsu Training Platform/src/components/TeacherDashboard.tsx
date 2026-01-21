import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar } from './ui/avatar';
import { useAuth } from './AuthContext';
import { useTrainingSessions, TrainingSession } from './TrainingSessionContext';
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, User, BookOpen, Target } from 'lucide-react';

export function TeacherDashboard() {
  const { user } = useAuth();
  const { getPendingSessions, getTeacherSessions, approveSession, rejectSession } = useTrainingSessions();
  const [activeTab, setActiveTab] = useState('pending');

  if (!user || user.userType !== 'teacher') {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <p className="text-gray-400">Access denied. Teacher account required.</p>
          </Card>
        </div>
      </div>
    );
  }

  const pendingSessions = getPendingSessions();
  const approvedSessions = getTeacherSessions(user.id);

  const handleApprove = (sessionId: string) => {
    approveSession(sessionId, user.id, user.username, user.avatar);
  };

  const handleReject = (sessionId: string) => {
    rejectSession(sessionId);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderSessionCard = (session: TrainingSession, showActions: boolean = false) => (
    <Card key={session.id} className="bg-slate-800/30 border-slate-700 p-6 hover:border-red-600/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src={session.studentAvatar} 
            alt={session.studentName}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
          />
          <div>
            <h3 className="text-white font-medium">{session.studentName}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              {session.type === 'technique' ? (
                <Target className="w-3 h-3" />
              ) : (
                <BookOpen className="w-3 h-3" />
              )}
              <span>{session.type === 'technique' ? 'Technique' : 'Training Module'}</span>
            </div>
          </div>
        </div>
        <Badge className={`${
          session.status === 'approved' ? 'bg-green-600' :
          session.status === 'pending' ? 'bg-yellow-600' :
          'bg-red-600'
        } text-white`}>
          {session.status}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-1">Training Focus</h4>
          <p className="text-white">{session.itemTitle}</p>
          {session.lessonTitle && (
            <p className="text-sm text-gray-400 mt-1">Lesson: {session.lessonTitle}</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-1 flex items-center space-x-1">
            <MessageSquare className="w-3 h-3" />
            <span>Student Message</span>
          </h4>
          <p className="text-gray-300 text-sm">{session.message}</p>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(session.preferredDate)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{session.preferredTime}</span>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex space-x-2 pt-4 border-t border-slate-700">
          <Button
            onClick={() => handleApprove(session.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={() => handleReject(session.id)}
            variant="outline"
            className="flex-1 border-red-600 text-red-400 hover:bg-red-600/10"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Decline
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-xl text-gray-400">
            Manage training sessions and help students on their ninja journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-white">{pendingSessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Scheduled Sessions</p>
                <p className="text-3xl font-bold text-white">{approvedSessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold text-white">
                  {new Set([...pendingSessions, ...approvedSessions].map(s => s.studentId)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="pending" className="data-[state=active]:bg-red-600">
              Pending Requests ({pendingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-red-600">
              My Scheduled Sessions ({approvedSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingSessions.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Pending Requests</h3>
                <p className="text-gray-400">
                  You're all caught up! New training requests will appear here.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingSessions.map(session => renderSessionCard(session, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            {approvedSessions.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Scheduled Sessions</h3>
                <p className="text-gray-400">
                  Approve pending requests to schedule training sessions with students.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {approvedSessions.map(session => renderSessionCard(session, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
