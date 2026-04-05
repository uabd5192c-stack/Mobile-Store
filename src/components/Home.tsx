import React from "react";
import { motion } from "motion/react";
import { Smartphone, ShieldCheck, Zap, Globe, ChevronRight, Star, ArrowRight, ShoppingBag, DollarSign } from "lucide-react";
import { Product, PRODUCTS } from "../types";

interface HomeProps {
  onStartShopping: () => void;
  onStartSelling: () => void;
  onViewProduct: (product: Product) => void;
}

export default function Home({ onStartShopping, onStartSelling, onViewProduct }: HomeProps) {
  const featuredProducts = PRODUCTS.slice(0, 3);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 mix-blend-multiply" />
          <img
            src="https://images.unsplash.com/photo-1556656793-062ff987b50d?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold mb-6">
                <Zap className="w-4 h-4" /> Pakistan's #1 Mobile Marketplace
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
                Upgrade Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Digital Life.
                </span>
              </h1>
              <p className="text-xl text-slate-300 mt-8 leading-relaxed max-w-xl">
                Buy the latest smartphones at unbeatable prices or sell your old device for instant cash. Trusted by thousands across the country.
              </p>
              <div className="flex flex-wrap gap-6 mt-12">
                <button 
                  onClick={onStartShopping}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-2xl shadow-blue-900/40 flex items-center gap-3 group"
                >
                  Start Shopping <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onStartSelling}
                  className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold transition-all border border-white/10 flex items-center gap-3"
                >
                  Sell Your Device <DollarSign className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 hidden md:block">
          <div className="grid grid-cols-3 gap-8 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
            <div className="text-center space-y-1">
              <p className="text-3xl font-black text-white">50k+</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Happy Customers</p>
            </div>
            <div className="text-center space-y-1 border-x border-white/10">
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Genuine Products</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl font-black text-white">24h</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fast Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Why Shop With Us?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">We provide the best service in the industry with a focus on quality and customer satisfaction.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Secure Payments", desc: "Your transactions are protected with industry-leading security protocols.", color: "blue" },
            { icon: Zap, title: "Instant Delivery", desc: "Get your new phone delivered to your doorstep within 24 hours.", color: "orange" },
            { icon: Globe, title: "Global Warranty", desc: "All our devices come with official brand warranty for complete peace of mind.", color: "green" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 group"
            >
              <div className={`w-16 h-16 bg-${feature.color}-50 text-${feature.color}-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Featured Deals</h2>
              <p className="text-slate-500">Handpicked premium devices at exclusive prices.</p>
            </div>
            <button 
              onClick={onStartShopping}
              className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
            >
              View All Products <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => onViewProduct(product)}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-lg group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden bg-slate-100 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {product.discountPrice && (
                    <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                      Save ${product.price - product.discountPrice}
                    </div>
                  )}
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{product.brand}</p>
                    <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-slate-900">${product.discountPrice || product.price}</p>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-slate-900 font-bold">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sell CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Turn Your Old Phone <br />
                Into <span className="text-blue-400">Instant Cash.</span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed">
                Don't let your old device gather dust. Get a fair price and instant payment within 24 hours. We buy all major brands.
              </p>
              <button 
                onClick={onStartSelling}
                className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center gap-3"
              >
                Get a Quote Now <DollarSign className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20">
                  <DollarSign className="w-12 h-12" />
                </div>
                <p className="text-2xl font-black">Best Prices Paid</p>
                <p className="text-slate-400">Guaranteed market rates</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
