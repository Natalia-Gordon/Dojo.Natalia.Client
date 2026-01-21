import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useMembership, MembershipPlan, MembershipTier } from './MembershipContext';
import { useAuth } from './AuthContext';
import { MembershipCheckoutDialog } from './MembershipCheckoutDialog';
import { Check, Crown, Star, Zap, Shield, Calendar, CreditCard, X } from 'lucide-react';

export function Membership() {
  const { user } = useAuth();
  const { membershipPlans, getUserMembership, cancelMembership, getMembershipPayments } = useMembership();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const currentMembership = user ? getUserMembership(user.id) : undefined;
  const paymentHistory = user ? getMembershipPayments(user.id) : [];

  const getTierIcon = (tier: MembershipTier) => {
    switch (tier) {
      case 'free': return Shield;
      case 'basic': return Zap;
      case 'premium': return Star;
      case 'elite': return Crown;
      default: return Shield;
    }
  };

  const getTierColorClass = (color: string) => {
    switch (color) {
      case 'gray': return 'from-gray-600/20 to-gray-800/20 border-gray-600/30';
      case 'blue': return 'from-blue-600/20 to-blue-800/20 border-blue-600/30';
      case 'purple': return 'from-purple-600/20 to-purple-800/20 border-purple-600/30';
      case 'red': return 'from-red-600/20 to-red-800/20 border-red-600/30';
      default: return 'from-gray-600/20 to-gray-800/20 border-gray-600/30';
    }
  };

  const getTierBadgeClass = (color: string) => {
    switch (color) {
      case 'gray': return 'bg-gray-600';
      case 'blue': return 'bg-blue-600';
      case 'purple': return 'bg-purple-600';
      case 'red': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const handleSelectPlan = (plan: MembershipPlan) => {
    if (!user) {
      alert('Please log in to subscribe to a membership plan');
      return;
    }
    if (plan.id === 'free') {
      return; // Free tier doesn't need checkout
    }
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const handleCancelMembership = () => {
    if (!user || !currentMembership) return;
    if (confirm('Are you sure you want to cancel your membership? You will retain access until the end of your billing period.')) {
      cancelMembership(user.id);
    }
  };

  const isCurrentPlan = (planId: MembershipTier) => {
    return currentMembership?.tier === planId;
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">School Membership</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the perfect plan to accelerate your ninjutsu journey and unlock exclusive training content
          </p>
        </div>

        {user && currentMembership && (
          <Card className={`bg-gradient-to-br ${getTierColorClass(membershipPlans.find(p => p.id === currentMembership.tier)?.color || 'gray')} p-6 mb-8`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className={getTierBadgeClass(membershipPlans.find(p => p.id === currentMembership.tier)?.color || 'gray')}>
                    Current Plan
                  </Badge>
                  <h3 className="text-2xl font-bold text-white">
                    {membershipPlans.find(p => p.id === currentMembership.tier)?.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-4 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Expires: {new Date(currentMembership.expiryDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <Badge variant="outline" className={currentMembership.autoRenew ? 'border-green-600 text-green-400' : 'border-yellow-600 text-yellow-400'}>
                    {currentMembership.autoRenew ? 'Auto-renew ON' : 'Auto-renew OFF'}
                  </Badge>
                </div>
              </div>
              {currentMembership.tier !== 'free' && currentMembership.autoRenew && (
                <Button
                  variant="outline"
                  onClick={handleCancelMembership}
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  Cancel Membership
                </Button>
              )}
            </div>
          </Card>
        )}

        <Tabs defaultValue="plans" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-slate-800/50 border-slate-700">
              <TabsTrigger value="plans" className="data-[state=active]:bg-red-600">
                Membership Plans
              </TabsTrigger>
              {user && (
                <TabsTrigger value="billing" className="data-[state=active]:bg-red-600">
                  Billing History
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {membershipPlans.map((plan) => {
                const Icon = getTierIcon(plan.id);
                const isCurrent = isCurrentPlan(plan.id);
                
                return (
                  <Card
                    key={plan.id}
                    className={`bg-gradient-to-br ${getTierColorClass(plan.color)} relative overflow-hidden hover:shadow-xl transition-all duration-300 ${
                      plan.popular ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        MOST POPULAR
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${getTierBadgeClass(plan.color)} rounded-full flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {isCurrent && (
                          <Badge className="bg-green-600">Active</Badge>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-white">${plan.price}</span>
                          <span className="text-gray-400 ml-2">/{plan.billingPeriod}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${
                          isCurrent
                            ? 'bg-gray-600 cursor-not-allowed'
                            : plan.id === 'free'
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : `${getTierBadgeClass(plan.color)} hover:opacity-90`
                        }`}
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isCurrent || plan.id === 'free'}
                      >
                        {isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Default Plan' : 'Subscribe Now'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Card className="bg-slate-800/30 border-slate-700 p-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">All Plans Include:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-medium mb-1">Secure Platform</h4>
                    <p className="text-gray-400 text-sm">Bank-level security for your data</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-medium mb-1">Cancel Anytime</h4>
                    <p className="text-gray-400 text-sm">No long-term commitments</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-medium mb-1">Expert Support</h4>
                    <p className="text-gray-400 text-sm">24/7 assistance from our team</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {user && (
            <TabsContent value="billing">
              {paymentHistory.length === 0 ? (
                <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Payment History</h3>
                  <p className="text-gray-400">
                    Your membership payment history will appear here
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => {
                    const plan = membershipPlans.find(p => p.id === payment.tier);
                    return (
                      <Card key={payment.id} className="bg-slate-800/30 border-slate-700 p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 ${getTierBadgeClass(plan?.color || 'gray')} rounded-full flex items-center justify-center`}>
                              <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-white">{plan?.name} Membership</h3>
                              <p className="text-sm text-gray-400">
                                {new Date(payment.date).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {payment.billingInfo.cardLast4 && (
                                <p className="text-sm text-gray-400">
                                  Card ending in •••• {payment.billingInfo.cardLast4}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={
                              payment.status === 'completed' ? 'bg-green-600' :
                              payment.status === 'pending' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }>
                              {payment.status}
                            </Badge>
                            <span className="text-2xl font-bold text-white">${payment.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {selectedPlan && (
        <MembershipCheckoutDialog
          plan={selectedPlan}
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
        />
      )}
    </div>
  );
}
