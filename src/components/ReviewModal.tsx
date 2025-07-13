import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || rating === 0 || !comment.trim()) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          customer_name: customerName.trim(),
          rating,
          comment: comment.trim(),
          approved: false // سيتم مراجعته من قبل الإدارة
        }]);

      if (error) {
        console.error('Error submitting review:', error);
        alert('حدث خطأ في إرسال التقييم. يرجى المحاولة مرة أخرى.');
      } else {
        setSubmitted(true);
        // إعادة تعيين النموذج
        setCustomerName('');
        setRating(0);
        setComment('');
        
        // إغلاق النافذة بعد 3 ثوان
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('حدث خطأ في إرسال التقييم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setRating(0);
    setComment('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800" dir="rtl">
              اكتب رأيك في مقهى موال مراكش
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {submitted ? (
            /* رسالة النجاح */
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2" dir="rtl">
                شكراً لك!
              </h3>
              <p className="text-green-600" dir="rtl">
                تم إرسال تقييمك بنجاح. سيتم مراجعته ونشره قريباً.
              </p>
            </div>
          ) : (
            /* نموذج التقييم */
            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
              {/* اسم العميل */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="أدخل اسمك"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* التقييم */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التقييم
                </label>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 transition-colors ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-1">
                  {rating === 0 && 'اختر تقييمك'}
                  {rating === 1 && 'ضعيف'}
                  {rating === 2 && 'مقبول'}
                  {rating === 3 && 'جيد'}
                  {rating === 4 && 'ممتاز'}
                  {rating === 5 && 'رائع'}
                </p>
              </div>

              {/* التعليق */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رأيك وتعليقك
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={4}
                  placeholder="شاركنا رأيك في تجربتك مع مقهى موال مراكش..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* زر الإرسال */}
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    إرسال التقييم
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;