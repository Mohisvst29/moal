import React, { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review } from '../types/menu';

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-600 mt-2" dir="rtl">جاري تحميل التقييمات...</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-amber-200/50">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-amber-600" />
            <h2 className="text-3xl font-bold text-amber-900" dir="rtl">
              آراء عملائنا الكرام
            </h2>
            <MessageCircle className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600" dir="rtl">
            اكتشف ما يقوله عملاؤنا عن تجربتهم في مقهى موال مراكش
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300"
          >
            {/* اسم العميل والتقييم */}
            <div className="flex justify-between items-start mb-4" dir="rtl">
              <div>
                <h3 className="font-bold text-gray-800">{review.customer_name}</h3>
                <div className="flex gap-1 mt-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="text-amber-600 font-bold text-lg">
                {review.rating}/5
              </div>
            </div>

            {/* التعليق */}
            <p className="text-gray-700 leading-relaxed mb-4" dir="rtl">
              "{review.comment}"
            </p>

            {/* تاريخ التقييم */}
            <div className="text-xs text-gray-500" dir="rtl">
              {new Date(review.created_at).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>

      {/* إحصائيات سريعة */}
      <div className="mt-8 text-center">
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-amber-200/50 inline-block">
          <div className="flex items-center gap-4" dir="rtl">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {reviews.length}+
              </div>
              <div className="text-sm text-gray-600">تقييم</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0'
                }
              </div>
              <div className="text-sm text-gray-600">متوسط التقييم</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;