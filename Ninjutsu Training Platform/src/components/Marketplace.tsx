import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useProducts, Product } from './ProductContext';
import { useAuth } from './AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, ShoppingCart, Image, Sword, Wrench, Package, User, Check } from 'lucide-react';

export function Marketplace() {
  const { products, addToCart, cart, getUserPurchasedProducts } = useProducts();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const purchasedProducts = user ? getUserPurchasedProducts(user.id) : [];
  const isProductPurchased = (productId: string) => purchasedProducts.some(p => p.id === productId);

  const categories = [
    { id: 'all', name: 'All', icon: Package },
    { id: 'painting', name: 'Digital Art', icon: Image },
    { id: 'weapon', name: 'Weapons', icon: Sword },
    { id: 'tool', name: 'Training Tools', icon: Wrench },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductsByType = (type: string) => {
    if (type === 'all') return filteredProducts;
    return filteredProducts.filter(product => product.type === type || (type === 'tool' && product.type === 'equipment'));
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.product.id === productId);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  if (selectedProduct) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedProduct(null)}
            className="text-gray-400 hover:text-white mb-6"
          >
            ← Back to Marketplace
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ImageWithFallback
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-96 object-cover rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{selectedProduct.name}</h1>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge className={selectedProduct.isDigital ? 'bg-blue-600' : 'bg-purple-600'}>
                    {selectedProduct.isDigital ? 'Digital' : 'Physical'}
                  </Badge>
                  <Badge variant="outline">{selectedProduct.category}</Badge>
                  {isProductPurchased(selectedProduct.id) && (
                    <Badge className="bg-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      Owned
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-red-400">${selectedProduct.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <img
                  src={selectedProduct.teacherAvatar}
                  alt={selectedProduct.teacherName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-400">Sold by</p>
                  <p className="text-white font-medium">{selectedProduct.teacherName}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                <p className="text-gray-400">{selectedProduct.description}</p>
              </div>

              <div className="space-y-2">
                {selectedProduct.inStock ? (
                  <Badge className="bg-green-600">In Stock</Badge>
                ) : (
                  <Badge className="bg-red-600">Out of Stock</Badge>
                )}
              </div>

              <div className="space-y-3">
                {isProductPurchased(selectedProduct.id) ? (
                  <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">You own this {selectedProduct.isDigital ? 'artwork' : 'item'}</span>
                    </div>
                    {selectedProduct.isDigital && (
                      <p className="text-sm text-green-300 mt-2">
                        Download available in your purchases
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {isInCart(selectedProduct.id) ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Added to Cart
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleAddToCart(selectedProduct)}
                        disabled={!selectedProduct.inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Marketplace</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Discover authentic martial arts tools and exclusive digital artwork from master teachers
          </p>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-slate-800/50 border-slate-700 p-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center space-x-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getProductsByType(category.id).map((product) => (
                  <Card
                    key={product.id}
                    className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-red-600/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex flex-col space-y-2">
                        <Badge className={product.isDigital ? 'bg-blue-600' : 'bg-purple-600'}>
                          {product.isDigital ? 'Digital' : 'Physical'}
                        </Badge>
                        {isProductPurchased(product.id) && (
                          <Badge className="bg-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Owned
                          </Badge>
                        )}
                      </div>
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Badge className="bg-red-600">Out of Stock</Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                      <div className="flex items-center space-x-2 mb-4">
                        <img
                          src={product.teacherAvatar}
                          alt={product.teacherName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-400">{product.teacherName}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-red-400">${product.price.toFixed(2)}</span>
                        {isInCart(product.id) ? (
                          <Badge className="bg-green-600">In Cart</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={!product.inStock || isProductPurchased(product.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {isProductPurchased(product.id) ? 'Owned' : 'Add'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {getProductsByType(category.id).length === 0 && (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No products found in this category</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
