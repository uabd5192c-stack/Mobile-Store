import { useState, useMemo, useEffect } from "react";
import { Search, ShoppingCart, Smartphone, Menu, X, Filter, ChevronRight, Github, Twitter, Facebook, Instagram, Star, MessageCircle, ShoppingBag, DollarSign, Camera, Image as ImageIcon, Package, Plus, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRODUCTS, Product, Order } from "./types";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import SellForm from "./components/SellForm";
import OrderHistory from "./components/OrderHistory";
import ComparisonModal from "./components/ComparisonModal";
import UserProfile from "./components/UserProfile";
import Wishlist from "./components/Wishlist";
import ReviewSection from "./components/ReviewSection";
import Home from "./components/Home";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, onSnapshot, query, where, orderBy } from "firebase/firestore";

const WHATSAPP_NUMBER = "923495205706"; // Updated with user's number

interface CartItem extends Product {
  quantity: number;
}

type ViewMode = "home" | "buy" | "sell" | "orders" | "profile" | "wishlist";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', user.uid), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Order[];
      setOrders(ordersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user]);

  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const isAlreadyIn = prev.find((p) => p.id === product.id);
      if (isAlreadyIn) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        // Limit to 4 products for comparison
        return prev;
      }
      return [...prev, product];
    });
  };

  const brands = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => p.brand)));
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });
  }, [searchQuery, selectedBrand]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOrderPlaced = async (order: any) => {
    if (user) {
      try {
        await addDoc(collection(db, 'orders'), {
          ...order,
          userId: user.uid
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'orders');
      }
    } else {
      const updatedOrders = [order, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem("mobi_orders", JSON.stringify(updatedOrders));
    }
    setCart([]);
    setIsCartOpen(false);
    setViewMode("orders");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900">MOBISTORE</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("home")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  viewMode === "home" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setViewMode("buy")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  viewMode === "buy" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Shop
              </button>
              <button
                onClick={() => setViewMode("sell")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  viewMode === "sell" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <DollarSign className="w-4 h-4" /> Sell
              </button>
              <button
                onClick={() => setViewMode("orders")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  viewMode === "orders" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Package className="w-4 h-4" /> Orders
              </button>
              {user ? (
                <button
                  onClick={() => setViewMode("profile")}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    viewMode === "profile" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <User className="w-4 h-4" /> Profile
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode("profile")}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-blue-600 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setViewMode("profile")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-xs mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for phones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl transition-all outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b overflow-hidden"
          >
            <div className="px-4 py-6 space-y-6">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setViewMode("buy");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    viewMode === "buy" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" /> Buy
                </button>
                <button
                  onClick={() => {
                    setViewMode("sell");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    viewMode === "sell" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> Sell
                </button>
                <button
                  onClick={() => {
                    setViewMode("orders");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    viewMode === "orders" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Package className="w-4 h-4" /> Orders
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for phones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl outline-none"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase px-2">Brands</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !selectedBrand ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    All
                  </button>
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedBrand === brand ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {viewMode === "home" ? (
          <Home 
            onStartShopping={() => setViewMode("buy")} 
            onStartSelling={() => setViewMode("sell")} 
            onViewProduct={(p) => setSelectedProduct(p)} 
          />
        ) : viewMode === "buy" ? (
          <>
            {/* Hero Section */}
            <section className="relative py-12 md:py-24 overflow-hidden bg-slate-900 text-white">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 mix-blend-multiply" />
                <img
                  src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=2000"
                  alt="Hero Background"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold mb-6">
                      New Arrival: iPhone 15 Pro
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
                      The Future in <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                        Your Hands.
                      </span>
                    </h1>
                    <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                      Experience the next generation of smartphones. From cutting-edge AI to pro-level photography, discover the perfect device for your lifestyle.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => {
                          const el = document.getElementById('products');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2"
                      >
                        Shop Now <ChevronRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setViewMode("sell")}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold transition-all border border-white/10 flex items-center gap-2"
                      >
                        Sell Your Phone <DollarSign className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Product Grid Section */}
            <section id="products" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Featured Smartphones
                  </h2>
                  <p className="text-slate-500 mt-2">Handpicked premium devices for you</p>
                </div>

                {/* Desktop Brand Filters */}
                <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                      !selectedBrand ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    All
                  </button>
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                        selectedBrand === brand ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onViewDetails={(p) => setSelectedProduct(p)}
                      whatsappNumber={WHATSAPP_NUMBER}
                      onToggleCompare={toggleCompare}
                      isComparing={!!compareList.find((p) => p.id === product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedBrand(null);
                    }}
                    className="mt-6 text-blue-600 font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </section>

            {/* Request a Phone Section */}
            <section className="py-16 bg-slate-50 border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                      <ImageIcon className="w-4 h-4" /> Custom Request
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                      Can't find what you're <br />
                      <span className="text-blue-600">looking for?</span>
                    </h2>
                    <p className="text-slate-500 text-lg">
                      Upload an image or tell us the model you want. We'll source it for you at the best price.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <button 
                        onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I'm looking for a specific phone model. Can you help me find it?`, "_blank")}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                      >
                        Request via WhatsApp <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I'm looking for this phone. (I have a photo to show you)`, "_blank");
                        }
                      };
                      input.click();
                    }}
                    className="w-full md:w-1/3 aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center group hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer"
                  >
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-10 h-10" />
                    </div>
                    <p className="font-bold text-slate-900 mb-1">Upload Image</p>
                    <p className="text-sm">Send us a photo of the phone you want</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : viewMode === "sell" ? (
          <section className="bg-slate-50 min-h-[60vh] flex items-center">
            <SellForm whatsappNumber={WHATSAPP_NUMBER} />
          </section>
        ) : viewMode === "orders" ? (
          <section className="bg-slate-50 min-h-[60vh]">
            <OrderHistory 
              orders={orders} 
              onBackToShopping={() => setViewMode("buy")} 
            />
          </section>
        ) : viewMode === "profile" ? (
          <section className="bg-slate-50 min-h-[60vh]">
            <UserProfile 
              onViewOrders={() => setViewMode("orders")} 
              onViewWishlist={() => setViewMode("wishlist")} 
            />
          </section>
        ) : (
          <section className="bg-slate-50 min-h-[60vh]">
            <Wishlist 
              onAddToCart={addToCart} 
              onBackToShopping={() => setViewMode("buy")} 
            />
          </section>
        )}

        {/* Newsletter Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Get 10% Off Your First Order
            </h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">
              Subscribe to our newsletter and stay updated with the latest releases and exclusive offers.
            </p>
            <form className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-400/50 transition-all font-medium"
              />
              <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors">
                Join Now
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">MOBISTORE</span>
              </div>
              <p className="text-sm leading-relaxed">
                Your one-stop shop for the latest and greatest in mobile technology. We provide premium devices with worldwide shipping.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Shop All</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Latest Releases</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Special Offers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Shipping Policy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Returns & Refunds</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">Email:</span> hello@mobistore.com
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">Phone:</span> +1 (555) 000-0000
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-500">Address:</span> 123 Tech Avenue, Silicon Valley, CA
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs">
            <p>&copy; 2026 MobiStore Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transition-colors"
              >
                <X className="w-6 h-6 text-slate-900" />
              </button>

              <div className="w-full md:w-1/2 bg-slate-50 p-8 flex items-center justify-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-h-[400px] object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 space-y-8 overflow-y-auto max-h-[80vh] md:max-h-none">
                <div>
                  <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">
                    {selectedProduct.brand}
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 mt-2">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-yellow-700">{selectedProduct.rating}</span>
                    </div>
                    <span className="text-slate-400 text-sm">|</span>
                    <span className="text-slate-500 text-sm">120+ Reviews</span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Screen</p>
                    <p className="text-sm font-bold text-slate-900">{selectedProduct.specs.screen}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Processor</p>
                    <p className="text-sm font-bold text-slate-900">{selectedProduct.specs.processor}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">RAM/Storage</p>
                    <p className="text-sm font-bold text-slate-900">{selectedProduct.specs.ram} / {selectedProduct.specs.storage}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Battery</p>
                    <p className="text-sm font-bold text-slate-900">{selectedProduct.specs.battery}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {selectedProduct.discountPrice ? (
                        <>
                          <span className="text-4xl font-black text-slate-900">
                            ${selectedProduct.discountPrice}
                          </span>
                          <span className="text-sm text-slate-400 line-through font-bold">
                            ${selectedProduct.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-4xl font-black text-slate-900">
                          ${selectedProduct.price}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </button>
                  </div>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I want to buy the ${selectedProduct.name} (${selectedProduct.brand}) priced at $${selectedProduct.discountPrice || selectedProduct.price}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                  >
                    <MessageCircle className="w-5 h-5" /> Buy via WhatsApp
                  </a>
                </div>

                {/* Review Section */}
                <ReviewSection productId={selectedProduct.id} />

                {/* Related Products */}
                <div className="pt-12 border-t border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 mb-6">Related Products</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {PRODUCTS.filter(p => p.brand === selectedProduct.brand && p.id !== selectedProduct.id).slice(0, 2).map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedProduct(p)}
                        className="bg-slate-50 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group"
                      >
                        <img src={p.image} alt={p.name} className="w-full h-24 object-contain mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-blue-600 font-bold">${p.discountPrice || p.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Comparison Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
          >
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {compareList.map((product) => (
                  <div key={product.id} className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/10">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => toggleCompare(product)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {compareList.length < 4 && (
                  <div className="w-12 h-12 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/40">
                    <Plus className="w-5 h-5" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-white font-bold text-sm">{compareList.length} Selected</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Max 4 items</p>
                </div>
                <button
                  onClick={() => setIsComparisonOpen(true)}
                  disabled={compareList.length < 2}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                    compareList.length >= 2 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-900/20' 
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        products={compareList}
        onRemove={(id) => setCompareList(prev => prev.filter(p => p.id !== id))}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        whatsappNumber={WHATSAPP_NUMBER}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Floating WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I have a question about your products.`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl shadow-green-200 flex items-center justify-center group"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold whitespace-nowrap">
          Chat with us
        </span>
      </motion.a>
    </div>
  );
}
