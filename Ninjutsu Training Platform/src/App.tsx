import { useState } from 'react';
import { Hero } from './components/Hero';
import { TrainingModules } from './components/TrainingModules';
import { TechniqueLibrary } from './components/TechniqueLibrary';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ResourceLibrary } from './components/ResourceLibrary';
import { UserDetailsPage } from './components/UserDetailsPage';
import { TeacherDashboard } from './components/TeacherDashboard';
import { Marketplace } from './components/Marketplace';
import { ShoppingCart } from './components/ShoppingCart';
import { MyPurchases } from './components/MyPurchases';
import { TeacherShop } from './components/TeacherShop';
import { Membership } from './components/Membership';
import { Navigation } from './components/Navigation';
import { AuthProvider } from './components/AuthContext';
import { TrainingSessionProvider } from './components/TrainingSessionContext';
import { ProductProvider } from './components/ProductContext';
import { MembershipProvider } from './components/MembershipContext';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  const renderSection = () => {
    switch (activeSection) {
      case 'training':
        return <TrainingModules />;
      case 'techniques':
        return <TechniqueLibrary />;
      case 'progress':
        return <ProgressDashboard />;
      case 'resources':
        return <ResourceLibrary />;
      case 'profile':
        return <UserDetailsPage onBack={() => setActiveSection('home')} />;
      case 'teacher-dashboard':
        return <TeacherDashboard />;
      case 'marketplace':
        return <Marketplace />;
      case 'cart':
        return <ShoppingCart />;
      case 'purchases':
        return <MyPurchases />;
      case 'teacher-shop':
        return <TeacherShop />;
      case 'membership':
        return <Membership />;
      default:
        return <Hero />;
    }
  };

  return (
    <AuthProvider>
      <MembershipProvider>
        <TrainingSessionProvider>
          <ProductProvider>
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
              <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
              {renderSection()}
            </div>
          </ProductProvider>
        </TrainingSessionProvider>
      </MembershipProvider>
    </AuthProvider>
  );
}