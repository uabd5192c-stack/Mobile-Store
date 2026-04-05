import React from "react";
import { motion } from "motion/react";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag, Smartphone, ExternalLink, Banknote } from "lucide-react";
import { Order } from "../types";

interface OrderHistoryProps {
  orders: Order[];
  onBackToShopping: () => void;
}

const statusConfig = {
  Pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  Processing: { icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
  Shipped: { icon: Truck, color: "text-purple-500", bg: "bg-purple-50" },
  Delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  Cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

export default function OrderHistory({ orders, onBackToShopping }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">No orders yet</h2>
        <p className="text-slate-500">
          You haven't placed any orders. Start exploring our latest smartphones and find the perfect one for you!
        </p>
        <button
          onClick={onBackToShopping}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 mx-auto"
        >
          <ShoppingBag className="w-5 h-5" /> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Orders</h2>
        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold">
          {orders.length} Orders
        </span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const config = statusConfig[order.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order #{order.id}</p>
                  <p className="text-sm font-medium text-slate-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} ${config.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">{order.status}</span>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900">${item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {order.status === "Shipped" && order.trackingNumber && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Truck className="w-4 h-4" />
                        <span className="text-sm font-bold">Tracking Information</span>
                      </div>
                      {order.carrier && (
                        <span className="text-xs font-bold text-slate-400 uppercase">{order.carrier}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Tracking Number</p>
                        <p className="text-sm font-mono font-bold text-slate-900">{order.trackingNumber}</p>
                      </div>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors"
                        >
                          Track Package <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-50 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Banknote className="w-4 h-4" />
                      <span>Payment: {order.paymentMethod}</span>
                    </div>
                  </div>
                  {order.shipping && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Truck className="w-4 h-4" />
                        <span>{order.shipping.method}</span>
                      </div>
                      <span className="font-medium text-slate-900">
                        {order.shipping.price === 0 ? 'FREE' : `$${order.shipping.price}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-400 uppercase">Total Amount</p>
                    <p className="text-2xl font-black text-slate-900">${order.total}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
