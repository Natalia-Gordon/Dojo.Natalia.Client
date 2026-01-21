import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import { Download, Package, ShoppingBag, Calendar, Image as ImageIcon } from 'lucide-react';

export function MyPurchases() {
  const { user } = useAuth();
  const { getUserOrders, getUserPurchasedProducts } = useProducts();

  if (!user) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <p className="text-gray-400">Please log in to view your purchases</p>
          </Card>
        </div>
      </div>
    );
  }

  const orders = getUserOrders(user.id);
  const purchasedProducts = getUserPurchasedProducts(user.id);
  const digitalArt = purchasedProducts.filter(p => p.isDigital && p.type === 'painting');
  const physicalItems = purchasedProducts.filter(p => !p.isDigital);

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Purchases</h1>
          <p className="text-xl text-gray-400">
            View your order history and owned digital content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-white">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Digital Art Owned</p>
                <p className="text-3xl font-bold text-white">{digitalArt.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Physical Items</p>
                <p className="text-3xl font-bold text-white">{physicalItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="digital-art" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="digital-art" className="data-[state=active]:bg-red-600">
              Digital Art ({digitalArt.length})
            </TabsTrigger>
            <TabsTrigger value="physical" className="data-[state=active]:bg-red-600">
              Physical Items ({physicalItems.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-red-600">
              Order History ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="digital-art" className="mt-6">
            {digitalArt.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
                <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Digital Art Yet</h3>
                <p className="text-gray-400 mb-6">
                  Browse the marketplace to discover exclusive artwork from master teachers
                </p>
                <Button className="bg-red-600 hover:bg-red-700">
                  Browse Marketplace
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {digitalArt.map((product) => (
                  <Card key={product.id} className="bg-slate-800/50 border-slate-700 overflow-hidden group">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <img
                          src={product.teacherAvatar}
                          alt={product.teacherName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-400">{product.teacherName}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Download High-Res
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="physical" className="mt-6">
            {physicalItems.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Physical Items Yet</h3>
                <p className="text-gray-400 mb-6">
                  Browse martial arts tools and equipment in the marketplace
                </p>
                <Button className="bg-red-600 hover:bg-red-700">
                  Browse Marketplace
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {physicalItems.map((product) => (
                  <Card key={product.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-purple-600">Physical</Badge>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center space-x-2">
                        <img
                          src={product.teacherAvatar}
                          alt={product.teacherName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-400">by {product.teacherName}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {orders.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Orders Yet</h3>
                <p className="text-gray-400 mb-6">
                  Your purchase history will appear here
                </p>
                <Button className="bg-red-600 hover:bg-red-700">
                  Start Shopping
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-slate-800/30 border-slate-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-white">Order #{order.id}</h3>
                          <Badge className="bg-green-600">Completed</Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-red-400">${order.total.toFixed(2)}</span>
                    </div>

                    <div className="space-y-3 mb-4 pb-4 border-b border-slate-700">
                      {order.items.map(item => (
                        <div key={item.product.id} className="flex items-center space-x-4">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded border border-slate-700"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                          </div>
                          <span className="text-white font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 text-sm text-gray-400">
                      <p><span className="font-medium text-white">Billing Name:</span> {order.billingInfo.name}</p>
                      <p><span className="font-medium text-white">Email:</span> {order.billingInfo.email}</p>
                      {order.billingInfo.address && (
                        <p><span className="font-medium text-white">Address:</span> {order.billingInfo.address}, {order.billingInfo.city}, {order.billingInfo.zipCode}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
