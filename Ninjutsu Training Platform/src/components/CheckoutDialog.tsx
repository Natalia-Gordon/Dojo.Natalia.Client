import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { CreditCard, MapPin, Mail, User, CheckCircle } from 'lucide-react';

interface CheckoutDialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ children, open, onOpenChange }: CheckoutDialogProps) {
  const { user } = useAuth();
  const { cart, getCartTotal, createOrder } = useProducts();
  const [step, setStep] = useState<'billing' | 'payment' | 'success'>('billing');
  const [billingInfo, setBillingInfo] = useState({
    name: user?.username || '',
    email: user?.email || '',
    address: '',
    city: '',
    zipCode: '',
    country: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const cartTotal = getCartTotal();

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Process payment (in real app, this would call a payment API)
    createOrder(user.id, user.username, billingInfo);
    setStep('success');
  };

  const handleClose = () => {
    setStep('billing');
    setBillingInfo({
      name: user?.username || '',
      email: user?.email || '',
      address: '',
      city: '',
      zipCode: '',
      country: ''
    });
    setPaymentInfo({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'billing' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Billing Information</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter your billing details to complete your purchase
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBillingSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
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
                    <span>Email</span>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-300 flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Address</span>
                </Label>
                <Input
                  id="address"
                  value={billingInfo.address}
                  onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-300">City</Label>
                  <Input
                    id="city"
                    value={billingInfo.city}
                    onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-gray-300">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={billingInfo.zipCode}
                    onChange={(e) => setBillingInfo({ ...billingInfo, zipCode: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-gray-300">Country</Label>
                  <Input
                    id="country"
                    value={billingInfo.country}
                    onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between text-xl font-bold mb-4">
                  <span className="text-white">Total:</span>
                  <span className="text-red-400">${cartTotal.toFixed(2)}</span>
                </div>
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

            <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-4">
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

              <div className="pt-4 border-t border-slate-700 space-y-3">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-red-400">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600"
                    onClick={() => setStep('billing')}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    Complete Purchase
                  </Button>
                </div>
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
                <DialogTitle className="text-2xl text-white mb-2">Purchase Successful!</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Thank you for your purchase. Your order has been confirmed.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 space-y-3">
              <h3 className="text-lg font-medium text-white mb-3">Order Summary</h3>
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.product.name} x{item.quantity}</span>
                  <span className="text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-slate-700 pt-3 flex justify-between font-bold">
                <span className="text-white">Total:</span>
                <span className="text-red-400">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <p className="text-sm text-gray-400 text-center">
                Your digital items are now available in your purchases. 
                Physical items will be shipped to your billing address.
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleClose}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
