import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select } from './ui/select';
import { useAuth } from './AuthContext';
import { useProducts, Product, ProductType } from './ProductContext';
import { Plus, Edit, Trash2, Package, DollarSign, TrendingUp, Image as ImageIcon } from 'lucide-react';

export function TeacherShop() {
  const { user } = useAuth();
  const { getTeacherProducts, addProduct, updateProduct, deleteProduct, getTeacherSales } = useProducts();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'painting' as ProductType,
    image: '',
    inStock: true,
    isDigital: true,
    category: ''
  });

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

  const myProducts = getTeacherProducts(user.id);
  const mySales = getTeacherSales(user.id);
  const totalRevenue = mySales.reduce((sum, order) => {
    const teacherItems = order.items.filter(item => item.product.teacherId === user.id);
    return sum + teacherItems.reduce((itemSum, item) => itemSum + (item.product.price * item.quantity), 0);
  }, 0);
  const totalSold = mySales.reduce((sum, order) => {
    const teacherItems = order.items.filter(item => item.product.teacherId === user.id);
    return sum + teacherItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      type: formData.type,
      teacherId: user.id,
      teacherName: user.username,
      teacherAvatar: user.avatar,
      image: formData.image || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop',
      inStock: formData.inStock,
      isDigital: formData.isDigital,
      category: formData.category || (formData.type === 'painting' ? 'Digital Art' : formData.type === 'weapon' ? 'Weapons' : 'Training Tools')
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      addProduct(productData);
    }

    setFormData({
      name: '',
      description: '',
      price: '',
      type: 'painting',
      image: '',
      inStock: true,
      isDigital: true,
      category: ''
    });
    setAddDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      type: product.type,
      image: product.image,
      inStock: product.inStock,
      isDigital: product.isDigital,
      category: product.category || ''
    });
    setAddDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      type: 'painting',
      image: '',
      inStock: true,
      isDigital: true,
      category: ''
    });
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Shop</h1>
            <p className="text-xl text-gray-400">Manage your products and track sales</p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingProduct ? 'Update your product details' : 'Create a new product for your shop'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-300">Product Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                      required
                    >
                      <option value="painting">Digital Art</option>
                      <option value="weapon">Weapon</option>
                      <option value="tool">Training Tool</option>
                      <option value="equipment">Equipment</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-300">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-gray-300">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category (Optional)</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Watercolor, Steel Weapons, etc."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDigital}
                      onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                    />
                    <span className="text-gray-300">Digital Product</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                    />
                    <span className="text-gray-300">In Stock</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-slate-600"
                    onClick={() => {
                      setAddDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Products</p>
                <p className="text-3xl font-bold text-white">{myProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Items Sold</p>
                <p className="text-3xl font-bold text-white">{totalSold}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-red-600/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="products" className="data-[state=active]:bg-red-600">
              My Products ({myProducts.length})
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-red-600">
              Sales History ({mySales.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {myProducts.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Products Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start selling by adding your first product
                </p>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Product
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map((product) => (
                  <Card key={product.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4 flex flex-col space-y-2">
                        <Badge className={product.isDigital ? 'bg-blue-600' : 'bg-purple-600'}>
                          {product.isDigital ? 'Digital' : 'Physical'}
                        </Badge>
                        {!product.inStock && (
                          <Badge className="bg-red-600">Out of Stock</Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-red-400">${product.price.toFixed(2)}</span>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-slate-600"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            {mySales.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700 p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Sales Yet</h3>
                <p className="text-gray-400">
                  Your sales history will appear here once customers start purchasing your products
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {mySales.map((order) => {
                  const teacherItems = order.items.filter(item => item.product.teacherId === user.id);
                  const orderTotal = teacherItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                  
                  return (
                    <Card key={order.id} className="bg-slate-800/30 border-slate-700 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white font-medium">Order #{order.id}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className="bg-green-600">Completed</Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-400">Customer: {order.userName}</p>
                        {teacherItems.map(item => (
                          <div key={item.product.id} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.product.name} x{item.quantity}</span>
                            <span className="text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-700 pt-3 flex justify-between">
                        <span className="text-white font-medium">Your Revenue:</span>
                        <span className="text-red-400 font-bold">${orderTotal.toFixed(2)}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
