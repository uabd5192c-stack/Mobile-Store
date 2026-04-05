import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ShoppingBag, Trash2, Smartphone, ArrowRight, X } from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { PRODUCTS, Product } from "../types";

interface WishlistProps {
  onAddToCart: (product: Product) => void;
  onBackToShopping: () => void;
}

export default function Wishlist({ onAddToCart, onBackToShopping }: WishlistProps) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const productIds = snapshot.docs.map(doc => doc.id);
      const items = PRODUCTS.filter(p => productIds.includes(p.id));
      setWishlistItems(items);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/wishlist`);
    });

    return () => unsubscribe();
  }, []);

  const removeFromWishlist = async (productId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/wishlist/${productId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-pink-50 text-pink-400 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Your wishlist is empty</h2>
        <p className="text-slate-500">
          Save your favorite smartphones here to keep track of them and buy them later!
        </p>
        <button
          onClick={onBackToShopping}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 mx-auto"
        >
          <ShoppingBag className="w-5 h-5" /> Start Exploring
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">My Wishlist</h2>
        <span className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-sm font-bold">
          {wishlistItems.length} Items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {wishlistItems.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product.id}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="flex gap-6 p-6">
                <div className="w-32 h-32 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.brand}</p>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xl font-black text-slate-900 mt-1">${product.price}</p>
                  </div>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
