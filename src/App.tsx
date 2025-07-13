import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ShoppingCart, ArrowRight, Settings } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import CategoryButtons from './components/CategoryButtons';
import MenuSection from './components/MenuSection';
import SpecialOffers from './components/SpecialOffers';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import MenuActions from './components/MenuActions';
import ReviewsSection from './components/ReviewsSection';
import ReviewModal from './components/ReviewModal';
import SocialMediaModal from './components/SocialMediaModal';
import { useSupabaseMenu } from './hooks/useSupabaseMenu';
import { useCart } from './hooks/useCart';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['home']);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  
  const { 
    menuSections, 
    specialOffers, 
    loading, 
    error,
    isSupabaseConnected,
    refreshData
  } = useSupabaseMenu();
  
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    tableNumber,
    setTableNumber,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart
  } = useCart();

  // تحسين الأداء بتأخير تحميل الفيديو
  const [showVideo, setShowVideo] = useState(false);
  
  useEffect(() => {
    if (activeSection === 'home') {
      const timer = setTimeout(() => setShowVideo(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowVideo(false);
    }
  }, [activeSection]);

  const backgroundVideos = [
    { id: "Nu8kIIL-CDA", title: "إعلان القهوة التجاري" },
    { id: "T3AHBe0I0yc", title: "أجواء مقهى موال مراكش" }
  ];

  // دمج العروض الخاصة مع أقسام المنيو
  const allSections = useMemo(() => {
    const sections = [...menuSections];
    
    // إضافة قسم العروض الخاصة إذا كانت موجودة
    if (specialOffers && specialOffers.length > 0) {
      const offersAsItems = specialOffers.map(offer => ({
        id: `offer-${offer.id}`,
        name: offer.title,
        description: offer.description,
        price: offer.offerPrice,
        image: offer.image,
        popular: true,
        new: true,
        available: true,
        originalPrice: offer.originalPrice,
        isOffer: true,
        calories: offer.calories
      }));
      
      sections.unshift({
        id: 'special-offers',
        title: 'العروض الخاصة',
        icon: '🎁',
        items: offersAsItems
      });
    }
    
    return sections;
  }, [menuSections, specialOffers]);

  const currentSection = allSections.find(section => section.id.toString() === activeSection);

  // دالة فتح لوحة التحكم
  const handleAdminClick = useCallback(() => {
    if (isAdminLoggedIn) {
      setIsAdminOpen(true);
    } else {
      setShowLoginModal(true);
    }
  }, [isAdminLoggedIn]);

  // دالة تسجيل الدخول للأدمن
  const handleAdminLogin = useCallback(() => {
    setIsAdminLoggedIn(true);
    setShowLoginModal(false);
    setIsAdminOpen(true);
  }, []);

  // تحسين دالة تغيير القسم
  const handleSectionChange = useCallback((sectionId: string) => {
    setNavigationHistory(prev => [...prev, sectionId]);
    setActiveSection(sectionId);
  }, []);

  // دالة العودة للصفحة السابقة
  const handleGoBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // إزالة الصفحة الحالية
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setActiveSection(previousPage);
    }
  }, [navigationHistory]);

  // دالة العودة للصفحة الرئيسية
  const handleGoHome = useCallback(() => {
    setNavigationHistory(['home']);
    setActiveSection('home');
  }, []);

  // إضافة console.log لتتبع البيانات
  console.log('App State:', {
    loading,
    isSupabaseConnected,
    allSectionsCount: allSections.length,
    specialOffersCount: specialOffers.length,
    activeSection,
    currentSection: currentSection ? currentSection.title : 'Not found'
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 font-['Tajawal']">
      {/* Video Background */}
      {activeSection === 'home' && showVideo && (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${backgroundVideos[currentVideoIndex].id}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${backgroundVideos[currentVideoIndex].id}&start=0`}
              className="w-full h-full object-cover"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60"></div>
          
          {/* Video controls */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            {backgroundVideos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentVideoIndex 
                    ? 'bg-amber-500 scale-125' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      
      <Header />
      
      {/* تنبيه الأخطاء */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 relative z-30">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm" dir="rtl">
                ⚠️ {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* تنبيه نجاح الاتصال */}
      {isSupabaseConnected && !error && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 relative z-30">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm" dir="rtl">
                ✅ تم ربط المنيو بقاعدة البيانات بنجاح - جميع التعديلات ستُحفظ تلقائياً
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* أزرار ثابتة */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-3">
        {/* زر السلة */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          style={{ background: `linear-gradient(to right, #c4a484, #b8956f)` }}
        >
          <ShoppingCart className="w-5 h-5" />
          {getTotalItems() > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {getTotalItems()}
            </span>
          )}
        </button>
        
        {/* زر لوحة التحكم */}
        <button
          onClick={handleAdminClick}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          title="لوحة التحكم"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {activeSection === 'home' ? (
          <>
            {/* رسالة الترحيب */}
            <div className="text-center mb-12">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border" style={{ borderColor: '#87512f50' }}>
                <h2 className="text-3xl font-bold mb-4" dir="rtl" style={{ color: '#87512f' }}>
                  أهلاً وسهلاً بكم في موال مراكش
                </h2>
                <p className="text-gray-800 text-lg leading-relaxed max-w-3xl mx-auto" dir="rtl">
                  استمتعوا بتجربة قهوة استثنائية في أجواء مغربية أصيلة. نقدم لكم أجود أنواع القهوة والمشروبات 
                  والحلويات المغربية التقليدية في قلب المدينة المنورة
                </p>
              </div>
            </div>

            {/* الأزرار الرئيسية */}
            <div className="text-center mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* زر العروض الخاصة */}
                <button
                  onClick={() => handleSectionChange('special-offers')}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg"
                  dir="rtl"
                >
                  <span className="text-2xl">🎁</span>
                  <span>العروض الخاصة</span>
                </button>

                {/* زر اذهب للمنيو الآن */}
                <button
                  onClick={() => handleSectionChange('menu-categories')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg"
                  dir="rtl"
                >
                  <span className="text-2xl">🍽️</span>
                  <span>اذهب للمنيو الآن</span>
                </button>

                {/* زر تابعنا على السوشيال ميديا */}
                <button
                  onClick={() => setShowSocialModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg"
                  dir="rtl"
                >
                  <span className="text-2xl">📱</span>
                  <span>تابعنا على السوشيال ميديا</span>
                </button>

                {/* زر اكتب رأيك الآن */}
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-lg"
                  dir="rtl"
                >
                  <span className="text-2xl">⭐</span>
                  <span>اكتب رأيك الآن</span>
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewsSection />
          </>
        ) : activeSection === 'menu-categories' ? (
          <div>
            {/* Back Button */}
            <div className="mb-6">
              <div className="flex gap-3">
                {navigationHistory.length > 1 && (
                  <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg"
                    style={{ color: '#87512f' }}
                    dir="rtl"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>السابق</span>
                  </button>
                )}
                <button
                  onClick={handleGoHome}
                  className="flex items-center gap-2 transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg"
                  style={{ color: '#87512f' }}
                  dir="rtl"
                >
                  <span>🏠</span>
                  <span>الرئيسية</span>
                </button>
              </div>
            </div>

            {/* Category Selection */}
            <div className="text-center mb-8">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-amber-200/50">
                <h2 className="text-3xl font-bold mb-4" dir="rtl" style={{ color: '#87512f' }}>
                  اختر القسم المطلوب
                </h2>
                <p className="text-gray-600" dir="rtl">
                  اختر من الأقسام التالية لتصفح المنيو
                </p>
              </div>
            </div>

            {/* Category Buttons */}
            <CategoryButtons
              sections={menuSections}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </div>
        ) : activeSection === 'special-offers' ? (
          <div>
            {/* Back Button */}
            <div className="mb-6">
              <div className="flex gap-3">
                {navigationHistory.length > 1 && (
                  <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg"
                    style={{ color: '#87512f' }}
                    dir="rtl"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>السابق</span>
                  </button>
                )}
                <button
                  onClick={handleGoHome}
                  className="flex items-center gap-2 transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg"
                  style={{ color: '#87512f' }}
                  dir="rtl"
                >
                  <span>🏠</span>
                  <span>الرئيسية</span>
                </button>
              </div>
            </div>

            {/* Special Offers Section */}
            <SpecialOffers
              offers={specialOffers}
              onAddToCart={addToCart}
            />
          </div>
        ) : (
          <div>
            {/* Back Button */}
            <div className="mb-6">
              <div className="flex gap-3">
                {navigationHistory.length > 1 && (
                  <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg"
                    style={{ color: '#87512f' }}
                    dir="rtl"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>السابق</span>
                  </button>
                )}
                <button
                  onClick={handleGoHome}
                  className="flex items-center gap-2 transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg"
                  style={{ color: '#87512f' }}
                  dir="rtl"
                >
                  <span>🏠</span>
                  <span>الرئيسية</span>
                </button>
              </div>
            </div>

            {/* Current Section */}
            {currentSection && (
              <MenuSection
                title={currentSection.title}
                items={currentSection.items}
                icon={currentSection.icon}
                onAddToCart={addToCart}
              />
            )}
            
            {/* إذا لم يتم العثور على القسم */}
            {!currentSection && (
              <div className="text-center py-12">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border" style={{ borderColor: '#87512f50' }}>
                  <h2 className="text-2xl font-bold mb-4" dir="rtl" style={{ color: '#87512f' }}>
                    القسم غير موجود ({activeSection})
                  </h2>
                  <p className="text-gray-600 mb-4" dir="rtl">
                    لم يتم العثور على هذا القسم في المنيو. الأقسام المتاحة: {allSections.length}
                  </p>
                  <button
                    onClick={handleGoHome}
                    className="text-white px-6 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: '#87512f' }}
                    dir="rtl"
                  >
                    الرئيسية
                  </button>
                </div>
                <div className="mt-4 text-xs text-gray-500" dir="rtl">
                  <p>معلومات التشخيص:</p>
                  <p>أقسام المنيو: {menuSections.length}</p>
                  <p>العروض الخاصة: {specialOffers.length}</p>
                  <p>إجمالي الأقسام: {allSections.length}</p>
                  <p>Supabase متصل: {isSupabaseConnected ? 'نعم' : 'لا'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* إضافة المتغيرات المطلوبة */}
      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />

      {/* Social Media Modal */}
      <SocialMediaModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />

      <Footer />

      {/* Cart */}
      <div className="relative z-50">
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          tableNumber={tableNumber}
          setTableNumber={setTableNumber}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          getTotalPrice={getTotalPrice}
          clearCart={clearCart}
        />
      </div>

      {/* Admin Panel */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Login Modal for Admin */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleAdminLogin}
      />
    </div>
  );
}

export default App;