import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useProducts } from './ProductContext';
import { useAuth } from './AuthContext';
import { CheckoutDialog } from './CheckoutDialog';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

export function ShoppingCart() {
  const { cart, updateCartQuantity, removeFromCart, getCartTotal } = useProducts();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const cartTotal = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>
          <Card className="bg-slate-800/50 border-slate-700 p-16 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-6">
              Browse the marketplace to find amazing products from our master teachers
            </p>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => window.location.hash = '#marketplace'}
            >
              Browse Marketplace
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Shopping Cart</h1>
          <Badge className="bg-red-600 text-white text-lg px-4 py-2">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id} className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg border border-slate-700"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">by {item.product.teacherName}</p>
                        <Badge className={item.product.isDigital ? 'bg-blue-600' : 'bg-purple-600'}>
                          {item.product.isDigital ? 'Digital' : 'Physical'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="border-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="border-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-xl font-bold text-red-400">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total</span>
                    <span className="text-red-400">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {user ? (
                <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    <CartIcon className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </CheckoutDialog>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 text-center">
                    Please log in to complete your purchase
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Log In to Checkout
                  </Button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="space-y-2 text-sm text-gray-400">
                  <p>✓ Secure checkout</p>
                  <p>✓ Instant digital delivery</p>
                  <p>✓ 30-day money-back guarantee</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
