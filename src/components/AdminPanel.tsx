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
  }, [isOpen, activeTab]);

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

          {/* Other tabs content remains the same... */}
          {activeTab !== 'reviews' && (
            <div className="text-center py-8">
              <p className="text-gray-500" dir="rtl">محتوى التبويبات الأخرى...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;