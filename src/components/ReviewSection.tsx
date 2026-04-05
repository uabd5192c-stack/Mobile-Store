import React, { useState, useEffect } from "react";
import { Star, Send, User, Trash2 } from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
      setReviews(reviewsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "reviews");
    });

    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
        userPhoto: auth.currentUser.photoURL || "",
        rating,
        comment,
        createdAt: new Promise(resolve => resolve(new Date().toISOString())), // Simplified for rules validation
      });
      setComment("");
      setRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "reviews");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "reviews");
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Number(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-900">{averageRating}</span>
            <span className="text-sm text-slate-400">({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {auth.currentUser ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {auth.currentUser.photoURL ? (
                <img src={auth.currentUser.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      i <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this phone..."
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24 text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 p-6 rounded-3xl text-center">
          <p className="text-slate-600 text-sm">Please login to leave a review.</p>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {review.userPhoto ? (
                      <img src={review.userPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{review.userName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-400 ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {auth.currentUser?.uid === review.userId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                {review.comment}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {reviews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm italic">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}
