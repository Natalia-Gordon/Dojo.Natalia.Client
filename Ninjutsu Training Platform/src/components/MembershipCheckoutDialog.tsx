import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAuth } from './AuthContext';
import { useMembership, MembershipPlan } from './MembershipContext';
import { CreditCard, Mail, User, CheckCircle, Calendar } from 'lucide-react';

interface MembershipCheckoutDialogProps {
  plan: MembershipPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipCheckoutDialog({ plan, open, onOpenChange }: MembershipCheckoutDialogProps) {
  const { user } = useAuth();
  const { subscribeToPlan } = useMembership();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [billingInfo, setBillingInfo] = useState({
    name: user?.username || '',
    email: user?.email || ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Process membership payment
    subscribeToPlan(user.id, user.username, plan.id, {
      ...billingInfo,
      ...paymentInfo
    });
    setStep('success');
  };

  const handleClose = () => {
    setStep('details');
    setBillingInfo({
      name: user?.username || '',
      email: user?.email || ''
    });
    setPaymentInfo({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    });
    onOpenChange(false);
  };

  const getExpiryDate = () => {
    const now = new Date();
    now.setFullYear(now.getFullYear() + 1);
    return now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Subscribe to {plan.name}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete your membership subscription
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 my-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{plan.name} Membership</h3>
                  <p className="text-sm text-gray-400">{plan.billingPeriod} subscription</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-400">${plan.price}</p>
                  <p className="text-sm text-gray-400">per {plan.billingPeriod === 'monthly' ? 'month' : 'year'}</p>
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Billing Period:</span>
                  <span className="text-white capitalize">{plan.billingPeriod}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Next Billing Date:</span>
                  <span className="text-white">{getExpiryDate()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Auto-renewal:</span>
                  <Badge className="bg-green-600">Enabled</Badge>
                </div>
              </div>
            </div>

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </Label>
                <Input
                  id="name"
                  value={billingInfo.name}
                  onChange={(e) => setBillingInfo({ ...billingInfo, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={billingInfo.email}
                  onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  By subscribing, you agree to our terms of service and privacy policy. 
                  You can cancel your membership at any time.
                </p>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Payment Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter your payment information securely
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 my-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Amount:</span>
                <span className="text-2xl font-bold text-red-400">${plan.price}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-gray-300 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Card Number</span>
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  maxLength={19}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-gray-300">Name on Card</Label>
                <Input
                  id="cardName"
                  value={paymentInfo.cardName}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-gray-300">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    maxLength={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-gray-300">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-300 font-medium mb-1">Secure Payment</p>
                  <p className="text-green-200">Your payment information is encrypted and secure</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-slate-600"
                  onClick={() => setStep('details')}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                  Subscribe Now
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <DialogTitle className="text-2xl text-white mb-2">Welcome to {plan.name}!</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Your membership is now active
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 space-y-3">
                <h3 className="text-lg font-medium text-white mb-3">Membership Details</h3>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white font-medium">{plan.name}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Billing:</span>
                  <span className="text-white">${plan.price} / {plan.billingPeriod}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Next billing date:</span>
                  <span className="text-white">{getExpiryDate()}</span>
                </div>
                
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Status:</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 mb-2">
                      You now have access to all {plan.name} features! Start exploring:
                    </p>
                    <ul className="space-y-1 text-blue-200">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleClose}>
                Start Training
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
