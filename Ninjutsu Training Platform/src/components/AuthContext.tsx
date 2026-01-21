import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  level: 'Novice' | 'Intermediate' | 'Advanced' | 'Master';
  avatar: string;
  completedTechniques: string[];
  completedTraining: string[];
  totalHours: number;
  streak: number;
  userType: 'student' | 'teacher';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, email: string, password: string, userType: 'student' | 'teacher') => boolean;
  updateUserProgress: (techniqueId: string, trainingId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demonstration
const sampleUsers: (User & { password: string })[] = [
  {
    id: '1',
    username: 'ShadowMaster',
    email: 'shadow@ninjutsu.com',
    password: 'shadow123',
    joinDate: '2024-01-15',
    level: 'Advanced',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    completedTechniques: ['shadow-walking', 'defensive-rolls'],
    completedTraining: ['stealth-fundamentals', 'basic-combat'],
    totalHours: 156,
    streak: 12,
    userType: 'student'
  },
  {
    id: '2',
    username: 'NinjaNovice',
    email: 'novice@ninjutsu.com',
    password: 'novice123',
    joinDate: '2026-01-01',
    level: 'Novice',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    completedTechniques: [],
    completedTraining: [],
    totalHours: 15,
    streak: 3,
    userType: 'student'
  },
  {
    id: '3',
    username: 'SilentBlade',
    email: 'blade@ninjutsu.com',
    password: 'blade456',
    joinDate: '2024-03-08',
    level: 'Intermediate',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b35c?w=150&h=150&fit=crop&crop=face',
    completedTechniques: ['smoke-bomb-deployment'],
    completedTraining: ['stealth-fundamentals'],
    totalHours: 89,
    streak: 7,
    userType: 'student'
  },
  {
    id: '4',
    username: 'MasterTakeshi',
    email: 'takeshi@ninjutsu.com',
    password: 'teacher123',
    joinDate: '2020-05-10',
    level: 'Master',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
    completedTechniques: [],
    completedTraining: [],
    totalHours: 2500,
    streak: 365,
    userType: 'teacher'
  },
  {
    id: '5',
    username: 'SenseiHana',
    email: 'hana@ninjutsu.com',
    password: 'teacher456',
    joinDate: '2019-08-22',
    level: 'Master',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    completedTechniques: [],
    completedTraining: [],
    totalHours: 3200,
    streak: 420,
    userType: 'teacher'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = sampleUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ninjutsu_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ninjutsu_user');
  };

  const register = (username: string, email: string, password: string, userType: 'student' | 'teacher' = 'student'): boolean => {
    // Check if username already exists
    if (sampleUsers.find(u => u.username === username)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      joinDate: new Date().toISOString().split('T')[0],
      level: userType === 'teacher' ? 'Master' : 'Novice',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      completedTechniques: [],
      completedTraining: [],
      totalHours: userType === 'teacher' ? 1000 : 0,
      streak: 0,
      userType
    };

    sampleUsers.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('ninjutsu_user', JSON.stringify(newUser));
    return true;
  };

  const updateUserProgress = (techniqueId: string, trainingId?: string) => {
    if (!user) return;

    const updatedUser = { ...user };
    
    if (techniqueId && !updatedUser.completedTechniques.includes(techniqueId)) {
      updatedUser.completedTechniques.push(techniqueId);
      updatedUser.totalHours += 2; // Add 2 hours for technique completion
    }
    
    if (trainingId && !updatedUser.completedTraining.includes(trainingId)) {
      updatedUser.completedTraining.push(trainingId);
      updatedUser.totalHours += 5; // Add 5 hours for training completion
      updatedUser.streak += 1;
    }

    // Level progression based on completed techniques and training
    const totalCompleted = updatedUser.completedTechniques.length + updatedUser.completedTraining.length;
    if (totalCompleted >= 10 && updatedUser.level === 'Novice') {
      updatedUser.level = 'Intermediate';
    } else if (totalCompleted >= 20 && updatedUser.level === 'Intermediate') {
      updatedUser.level = 'Advanced';
    } else if (totalCompleted >= 35 && updatedUser.level === 'Advanced') {
      updatedUser.level = 'Master';
    }

    setUser(updatedUser);
    localStorage.setItem('ninjutsu_user', JSON.stringify(updatedUser));
    
    // Update the sample users array for persistence
    const userIndex = sampleUsers.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      sampleUsers[userIndex] = { ...sampleUsers[userIndex], ...updatedUser };
    }
  };

  // Check for stored user on component mount
  useState(() => {
    try {
      const storedUser = localStorage.getItem('ninjutsu_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      localStorage.removeItem('ninjutsu_user');
    }
  });

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUserProgress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}