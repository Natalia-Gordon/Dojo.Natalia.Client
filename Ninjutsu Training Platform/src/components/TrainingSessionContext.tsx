import { createContext, useContext, useState, ReactNode } from 'react';

export interface TrainingSession {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  teacherId?: string;
  teacherName?: string;
  teacherAvatar?: string;
  type: 'technique' | 'training';
  itemId: string;
  itemTitle: string;
  lessonTitle?: string;
  message: string;
  preferredDate: string;
  preferredTime: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface TrainingSessionContextType {
  sessions: TrainingSession[];
  requestHelp: (session: Omit<TrainingSession, 'id' | 'status' | 'createdAt'>) => void;
  approveSession: (sessionId: string, teacherId: string, teacherName: string, teacherAvatar: string) => void;
  rejectSession: (sessionId: string) => void;
  getStudentSessions: (studentId: string) => TrainingSession[];
  getPendingSessions: () => TrainingSession[];
  getTeacherSessions: (teacherId: string) => TrainingSession[];
}

const TrainingSessionContext = createContext<TrainingSessionContextType | undefined>(undefined);

// Sample sessions data
const initialSessions: TrainingSession[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'ShadowMaster',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    teacherId: '3',
    teacherName: 'MasterTakeshi',
    teacherAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
    type: 'training',
    itemId: '2',
    itemTitle: 'Weapons of the Night',
    lessonTitle: 'Kusarigama Introduction',
    message: 'Need help with chain weapon basics. Finding it difficult to coordinate the chain movement.',
    preferredDate: '2026-01-15',
    preferredTime: '14:00',
    status: 'approved',
    createdAt: '2026-01-08T10:00:00Z'
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'SilentBlade',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b35c?w=150&h=150&fit=crop&crop=face',
    type: 'technique',
    itemId: '1',
    itemTitle: 'Shadow Walking',
    message: 'Struggling with breathing control while maintaining silent movement.',
    preferredDate: '2026-01-12',
    preferredTime: '16:00',
    status: 'pending',
    createdAt: '2026-01-09T14:30:00Z'
  },
  {
    id: '3',
    studentId: '1',
    studentName: 'ShadowMaster',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    teacherId: '4',
    teacherName: 'SenseiHana',
    teacherAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    type: 'technique',
    itemId: '5',
    itemTitle: 'Wall Running',
    message: 'Need guidance on chaining multiple wall steps together effectively.',
    preferredDate: '2026-01-20',
    preferredTime: '10:00',
    status: 'approved',
    createdAt: '2026-01-07T09:15:00Z'
  }
];

export function TrainingSessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<TrainingSession[]>(initialSessions);

  const requestHelp = (sessionData: Omit<TrainingSession, 'id' | 'status' | 'createdAt'>) => {
    const newSession: TrainingSession = {
      ...sessionData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [...prev, newSession]);
  };

  const approveSession = (sessionId: string, teacherId: string, teacherName: string, teacherAvatar: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId
        ? { ...session, status: 'approved', teacherId, teacherName, teacherAvatar }
        : session
    ));
  };

  const rejectSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId
        ? { ...session, status: 'rejected' }
        : session
    ));
  };

  const getStudentSessions = (studentId: string) => {
    return sessions.filter(session => 
      session.studentId === studentId && session.status === 'approved'
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getPendingSessions = () => {
    return sessions.filter(session => session.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getTeacherSessions = (teacherId: string) => {
    return sessions.filter(session => 
      session.teacherId === teacherId && session.status === 'approved'
    ).sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime());
  };

  return (
    <TrainingSessionContext.Provider value={{
      sessions,
      requestHelp,
      approveSession,
      rejectSession,
      getStudentSessions,
      getPendingSessions,
      getTeacherSessions
    }}>
      {children}
    </TrainingSessionContext.Provider>
  );
}

export function useTrainingSessions() {
  const context = useContext(TrainingSessionContext);
  if (context === undefined) {
    throw new Error('useTrainingSessions must be used within a TrainingSessionProvider');
  }
  return context;
}
