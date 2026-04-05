import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Mail, MapPin, Phone, LogOut, ShoppingBag, Heart, Edit2, Check, X, LogIn, ShieldCheck } from "lucide-react";
import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

interface UserProfileProps {
  onViewOrders: () => void;
  onViewWishlist: () => void;
}

export default function UserProfile({ onViewOrders, onViewWishlist }: UserProfileProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    phoneNumber: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfileData(data);
          setEditForm({
            displayName: data.displayName || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      });
      return () => unsubscribe();
    } else {
      setProfileData(null);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, editForm);
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
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

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-8">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <User className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900">Welcome Back!</h2>
          <p className="text-slate-500">
            Log in to manage your profile, track your orders, and save your favorite smartphones to your wishlist.
          </p>
        </div>
        <button
          onClick={loginWithGoogle}
          className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <img
                src={user.photoURL || "https://picsum.photos/seed/user/200/200"}
                alt={user.displayName || "User"}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white/10 shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl border-4 border-slate-900">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-black tracking-tight">{profileData?.displayName || user.displayName}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/60 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
                {profileData?.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {profileData.phoneNumber}</span>}
              </div>
            </div>
            <div className="md:ml-auto flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors backdrop-blur-md border border-white/10"
              >
                {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              </button>
              <button
                onClick={logout}
                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-colors backdrop-blur-md border border-red-500/10"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleUpdateProfile}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Shipping Address</label>
                  <textarea
                    rows={3}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border-transparent resize-none"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Save Changes
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                          <p className="text-sm font-bold text-slate-900">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                          <p className="text-sm font-bold text-slate-900">{profileData?.phoneNumber || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping Address</p>
                          <p className="text-sm font-bold text-slate-900 leading-relaxed">
                            {profileData?.address || "No address saved"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={onViewOrders}
                        className="flex items-center justify-between p-6 bg-blue-50 text-blue-600 rounded-3xl hover:bg-blue-100 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-lg">Order History</p>
                            <p className="text-xs font-medium text-blue-600/60">View and track your orders</p>
                          </div>
                        </div>
                        <Check className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button
                        onClick={onViewWishlist}
                        className="flex items-center justify-between p-6 bg-pink-50 text-pink-600 rounded-3xl hover:bg-pink-100 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Heart className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-lg">My Wishlist</p>
                            <p className="text-xs font-medium text-pink-600/60">Manage your saved items</p>
                          </div>
                        </div>
                        <Check className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
