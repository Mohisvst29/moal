import React, { useState } from 'react';
import { Menu, MessageCircle, Star, Users } from 'lucide-react';
import ReviewModal from './ReviewModal';
import SocialMediaModal from './SocialMediaModal';

interface MenuActionsProps {
  onGoToMenu: () => void;
}

const MenuActions: React.FC<MenuActionsProps> = ({ onGoToMenu }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* زر اذهب للمنيو الآن */}
        <button
          onClick={onGoToMenu}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-semibold"
          dir="rtl"
        >
          <Menu className="w-5 h-5" />
          <span>اذهب للمنيو الآن</span>
        </button>

        {/* زر تابعنا عبر وسائل التواصل */}
        <button
          onClick={() => setShowSocialModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-semibold"
          dir="rtl"
        >
          <Users className="w-5 h-5" />
          <span>تابعنا على السوشيال ميديا</span>
        </button>

        {/* زر اكتب رأيك الآن */}
        <button
          onClick={() => setShowReviewModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-semibold"
          dir="rtl"
        >
          <MessageCircle className="w-5 h-5" />
          <span>اكتب رأيك الآن</span>
        </button>
      </div>

      {/* Modal للتقييمات */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />

      {/* Modal لوسائل التواصل */}
      <SocialMediaModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />
    </>
  );
};

export default MenuActions;