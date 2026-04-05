import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Smartphone, Check, Minus } from "lucide-react";
import { Product } from "../types";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemove: (id: string) => void;
}

export default function ComparisonModal({ isOpen, onClose, products, onRemove }: ComparisonModalProps) {
  const specs = [
    { key: "screen", label: "Display" },
    { key: "processor", label: "Processor" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "battery", label: "Battery" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Compare Products</h2>
                <p className="text-sm text-slate-500">Side-by-side specifications comparison</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[800px] p-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-1/4 p-4 text-left bg-slate-50/50 rounded-tl-2xl">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Features</span>
                      </th>
                      {products.map((product) => (
                        <th key={product.id} className="p-4 text-center bg-white border-l border-slate-50 min-w-[200px]">
                          <div className="space-y-4">
                            <div className="relative aspect-[4/5] w-32 mx-auto rounded-xl overflow-hidden bg-slate-50">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              <button
                                onClick={() => onRemove(product.id)}
                                className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{product.brand}</p>
                              <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                              <p className="text-lg font-black text-slate-900 mt-1">${product.price}</p>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {specs.map((spec) => (
                      <tr key={spec.key} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-500 text-sm">
                          {spec.label}
                        </td>
                        {products.map((product) => (
                          <td key={product.id} className="p-4 text-center text-sm text-slate-900 font-medium border-l border-slate-50">
                            {(product.specs as any)[spec.key] || <Minus className="w-4 h-4 mx-auto text-slate-300" />}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-500 text-sm">
                        Rating
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="p-4 text-center border-l border-slate-50">
                          <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                            <Check className="w-4 h-4" /> {product.rating}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
