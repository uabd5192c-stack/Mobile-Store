import React from "react";
import { Star, ShoppingCart, Info, Plus, Check, Heart } from "lucide-react";
import { Product } from "../types";
import { motion } from "motion/react";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";

export interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  whatsappNumber: string;
  onToggleCompare: (product: Product) => void;
  isComparing: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails, whatsappNumber, onToggleCompare, isComparing }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsInWishlist(false);
      return;
    }

    const wishlistRef = doc(db, 'users', user.uid, 'wishlist', product.id);
    const unsubscribe = onSnapshot(wishlistRef, (doc) => {
      setIsInWishlist(doc.exists());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/wishlist/${product.id}`);
    });

    return () => unsubscribe();
  }, [product.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to add items to your wishlist.");
      return;
    }

    const wishlistRef = doc(db, 'users', user.uid, 'wishlist', product.id);
    try {
      if (isInWishlist) {
        await deleteDoc(wishlistRef);
      } else {
        await setDoc(wishlistRef, {
          userId: user.uid,
          productId: product.id,
          addedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/wishlist/${product.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group bg-white rounded-2xl border ${isComparing ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xl' : 'border-slate-100'} overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discountPrice && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse">
              Sale -{Math.round((1 - product.discountPrice / product.price) * 100)}%
            </div>
          )}
          <button
            onClick={() => onToggleCompare(product)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              isComparing ? 'bg-blue-600 text-white' : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-white'
            }`}
          >
            {isComparing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {isComparing ? 'Comparing' : 'Compare'}
          </button>
          <button
            onClick={toggleWishlist}
            className={`p-2 rounded-lg shadow-sm transition-all ${
              isInWishlist ? 'bg-pink-500 text-white' : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-pink-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-white' : ''}`} />
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {product.rating}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mt-1 h-10">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-black text-slate-900">
                  ${product.discountPrice}
                </span>
                <span className="text-sm text-slate-400 line-through font-bold">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-2xl font-black text-slate-900">
                ${product.price}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAddToCart(product)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Add to Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=Hi, I want to buy the ${product.name} priced at $${product.price}.`, "_blank")}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Buy Now
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-4">
          <span>
            {product.stock ? (
              <span className={product.stock < 5 ? "text-orange-500" : "text-green-500"}>
                {product.stock < 5 ? `Only ${product.stock} left` : "In Stock"}
              </span>
            ) : (
              "In Stock"
            )}
          </span>
          <span>Free Shipping</span>
        </div>

        <button
          onClick={() => onViewDetails(product)}
          className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
        >
          <Info className="w-3.5 h-3.5" /> View Details
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
