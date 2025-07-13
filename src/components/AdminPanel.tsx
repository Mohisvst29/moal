import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, Upload, Star, Check, Eye } from 'lucide-react';
import { useSupabaseAdmin } from '../hooks/useSupabaseAdmin';
import { MenuSection, MenuItem, SpecialOffer, Review } from '../types/menu';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const {
    sections,
    items,
    offers,
    loading,
    error,
    fetchData,
    setError,
    addSection,
    updateSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem,
    addOffer,
    updateOffer,
    deleteOffer,
    uploadImage,
    fetchReviews,
    approveReview,
    deleteReview
  } = useSupabaseAdmin();

  const [activeTab, setActiveTab] = useState<'sections' | 'items' | 'offers' | 'reviews'>('sections');
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Form states
  const [sectionForm, setSectionForm] = useState({
    title: '',
    icon: '',
    image: '',
    order_index: 0
  });

  const [itemForm, setItemForm] = useState({
    section_id: '',
    name: '',
    description: '',
    price: 0,
    calories: 0,
    image: '',
    popular: false,
    new: false,
    available: true,
    order_index: 0
  });

  const [itemSizes, setItemSizes] = useState<Array<{ size: string; price: number }>>([]);

  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    originalPrice: 0,
    offerPrice: 0,
    validUntil: '',
    image: '',
    calories: 0,
    active: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (activeTab === 'reviews') {
        loadReviews();
      }
    }
  }, [isOpen, activeTab, fetchData]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const reviewsData = await fetchReviews();
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    try {
      await approveReview(reviewId);
      await loadReviews(); // Refresh reviews
    } catch (err) {
      console.error('Error approving review:', err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      try {
        await deleteReview(reviewId);
        await loadReviews(); // Refresh reviews
      } catch (err) {
        console.error('Error deleting review:', err);
      }
    }
  };

  const resetForms = () => {
    setSectionForm({ title: '', icon: '', image: '', order_index: 0 });
    setItemForm({
      section_id: '',
      name: '',
      description: '',
      price: 0,
      calories: 0,
      image: '',
      popular: false,
      new: false,
      available: true,
      order_index: 0
    });
    setItemSizes([]);
    setOfferForm({
      title: '',
      description: '',
      originalPrice: 0,
      offerPrice: 0,
      validUntil: '',
      image: '',
      calories: 0,
      active: true
    });
    setEditingSection(null);
    setEditingItem(null);
    setEditingOffer(null);
    setShowAddSection(false);
    setShowAddItem(false);
    setShowAddOffer(false);
  };

  const handleImageUpload = async (file: File, formType: 'section' | 'item' | 'offer') => {
    try {
      const imageUrl = await uploadImage(file);
      
      if (formType === 'section') {
        setSectionForm(prev => ({ ...prev, image: imageUrl }));
      } else if (formType === 'item') {
        setItemForm(prev => ({ ...prev, image: imageUrl }));
      } else if (formType === 'offer') {
        setOfferForm(prev => ({ ...prev, image: imageUrl }));
      }
    } catch (err: any) {
      setError(err.message || 'فشل في رفع الصورة');
    }
  };

  const handleSaveSection = async () => {
    try {
      if (editingSection) {
        await updateSection(editingSection.id.toString(), sectionForm);
      } else {
        await addSection(sectionForm);
      }
      resetForms();
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ القسم');
    }
  };

  const handleSaveItem = async () => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id.toString(), itemForm, itemSizes);
      } else {
        await addItem(itemForm, itemSizes);
      }
      resetForms();
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ العنصر');
    }
  };

  const handleSaveOffer = async () => {
    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, offerForm);
      } else {
        await addOffer(offerForm);
      }
      resetForms();
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ العرض');
    }
  };

  const addSize = () => {
    setItemSizes([...itemSizes, { size: '', price: 0 }]);
  };

  const updateSize = (index: number, field: 'size' | 'price', value: string | number) => {
    const newSizes = [...itemSizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setItemSizes(newSizes);
  };

  const removeSize = (index: number) => {
    setItemSizes(itemSizes.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800" dir="rtl">لوحة التحكم</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200" dir="rtl">
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'sections' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
          >
            الأقسام ({sections.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'items' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
          >
            الأصناف ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'offers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
          >
            العروض الخاصة ({offers.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'reviews' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
          >
            التقييمات ({reviews.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" dir="rtl">
              {error}
              <button onClick={() => setError(null)} className="float-left">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex justify-between items-center mb-6" dir="rtl">
                <h3 className="text-xl font-bold">إدارة التقييمات</h3>
                <button
                  onClick={loadReviews}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  تحديث
                </button>
              </div>

              {loadingReviews ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2" dir="rtl">جاري تحميل التقييمات...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500" dir="rtl">لا توجد تقييمات حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className={`border rounded-lg p-4 ${
                        review.approved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3" dir="rtl">
                        <div>
                          <h4 className="font-bold text-gray-800">{review.customer_name}</h4>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                className={`w-4 h-4 ${
                                  index < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 mr-2">({review.rating}/5)</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!review.approved && (
                            <button
                              onClick={() => handleApproveReview(review.id)}
                              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                              title="موافقة على التقييم"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {review.approved && (
                            <span className="bg-green-500 text-white p-2 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                            title="حذف التقييم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3" dir="rtl">"{review.comment}"</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500" dir="rtl">
                        <span>
                          {new Date(review.created_at).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          review.approved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {review.approved ? 'معتمد' : 'في انتظار الموافقة'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div>
              <div className="flex justify-between items-center mb-6" dir="rtl">
                <h3 className="text-xl font-bold">إدارة الأقسام</h3>
                <button
                  onClick={() => setShowAddSection(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة قسم جديد
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2" dir="rtl">جاري تحميل الأقسام...</p>
                </div>
              ) : sections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500" dir="rtl">لا توجد أقسام حتى الآن</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3" dir="rtl">
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <span>{section.icon}</span>
                            <span>{section.title}</span>
                          </h4>
                          <p className="text-sm text-gray-600">ترتيب: {section.order_index}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingSection(section);
                              setSectionForm({
                                title: section.title,
                                icon: section.icon,
                                image: section.image || '',
                                order_index: section.order_index
                              });
                            }}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSection(section.id.toString())}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {section.image && (
                        <img src={section.image} alt={section.title} className="w-full h-32 object-cover rounded" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit Section Form */}
              {(showAddSection || editingSection) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4" dir="rtl">
                      {editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
                    </h3>
                    
                    <div className="space-y-4" dir="rtl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم القسم</label>
                        <input
                          type="text"
                          value={sectionForm.title}
                          onChange={(e) => setSectionForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="أدخل اسم القسم"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
                        <input
                          type="text"
                          value={sectionForm.icon}
                          onChange={(e) => setSectionForm(prev => ({ ...prev, icon: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="مثال: ☕"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة</label>
                        <input
                          type="text"
                          value={sectionForm.image}
                          onChange={(e) => setSectionForm(prev => ({ ...prev, image: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="رابط الصورة (اختياري)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب العرض</label>
                        <input
                          type="number"
                          value={sectionForm.order_index}
                          onChange={(e) => setSectionForm(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveSection}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        disabled={loading}
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                      <button
                        onClick={resetForms}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <div className="flex justify-between items-center mb-6" dir="rtl">
                <h3 className="text-xl font-bold">إدارة الأصناف</h3>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة صنف جديد
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2" dir="rtl">جاري تحميل الأصناف...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500" dir="rtl">لا توجد أصناف حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start" dir="rtl">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{item.name}</h4>
                          <p className="text-gray-600">{item.description}</p>
                          <p className="text-blue-600 font-semibold">{item.price} ر.س</p>
                          {item.calories && <p className="text-gray-500 text-sm">{item.calories} كالوري</p>}
                          <div className="flex gap-2 mt-2">
                            {item.popular && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">شائع</span>}
                            {item.new && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">جديد</span>}
                            {!item.available && <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">غير متاح</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setItemForm({
                                section_id: item.section_id || '',
                                name: item.name,
                                description: item.description || '',
                                price: item.price,
                                calories: item.calories || 0,
                                image: item.image || '',
                                popular: item.popular || false,
                                new: item.new || false,
                                available: item.available !== false,
                                order_index: item.order_index || 0
                              });
                              setItemSizes((item as any).sizes || []);
                            }}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id.toString())}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div>
              <div className="flex justify-between items-center mb-6" dir="rtl">
                <h3 className="text-xl font-bold">إدارة العروض الخاصة</h3>
                <button
                  onClick={() => setShowAddOffer(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة عرض جديد
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2" dir="rtl">جاري تحميل العروض...</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500" dir="rtl">لا توجد عروض خاصة حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start" dir="rtl">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{offer.title}</h4>
                          <p className="text-gray-600">{offer.description}</p>
                          <div className="flex gap-4 mt-2">
                            <p className="text-gray-500 line-through">{offer.original_price} ر.س</p>
                            <p className="text-green-600 font-semibold">{offer.offer_price} ر.س</p>
                          </div>
                          <p className="text-blue-600 text-sm">ساري حتى: {offer.valid_until}</p>
                          {!offer.active && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">غير نشط</span>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingOffer(offer);
                              setOfferForm({
                                title: offer.title,
                                description: offer.description,
                                originalPrice: offer.original_price,
                                offerPrice: offer.offer_price,
                                validUntil: offer.valid_until,
                                image: offer.image || '',
                                calories: offer.calories || 0,
                                active: offer.active
                              });
                            }}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteOffer(offer.id)}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;