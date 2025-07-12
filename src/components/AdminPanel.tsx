import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Flame } from 'lucide-react';
import { useSupabaseAdmin } from '../hooks/useSupabaseAdmin';
import { MenuItem, MenuSection, SpecialOffer } from '../types/menu';
import LoadingSpinner from './LoadingSpinner';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemSize {
  size: string;
  price: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const {
    sections,
    items,
    offers,
    loading,
    error,
    addSection,
    updateSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem,
    addOffer,
    updateOffer,
    deleteOffer,
    fetchData,
    uploadImage
  } = useSupabaseAdmin();

  const [activeTab, setActiveTab] = useState<'sections' | 'items' | 'offers'>('sections');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [editingSection, setEditingSection] = useState<Partial<MenuSection> | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [editingOffer, setEditingOffer] = useState<Partial<SpecialOffer> | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [itemSizes, setItemSizes] = useState<ItemSize[]>([]);

  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Admin panel opened, fetching data...');
      fetchData();
    }
  }, [isOpen, fetchData]);
  
  useEffect(() => {
    if (editingItem && editingItem.sizes) {
      console.log('Loading sizes for editing:', editingItem.sizes);
      setItemSizes(editingItem.sizes);
    } else if (!editingItem) {
      setItemSizes([]);
    }
  }, [editingItem]);

  if (!isOpen) return null;

  // فلترة الأصناف حسب القسم المختار
  const filteredItems = selectedSectionFilter === 'all' 
    ? items 
    : items.filter(item => item.section_id === selectedSectionFilter);

  // الحصول على اسم القسم
  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? `${section.icon} ${section.title}` : 'قسم غير معروف';
  };
  const handleImageUpload = async (file: File, type: 'section' | 'item' | 'offer') => {
    try {
      setImageUploadError('');
      const imageUrl = await uploadImage(file);
      
      if (type === 'section' && editingSection) {
        setEditingSection({ ...editingSection, image: imageUrl });
      } else if (type === 'item' && editingItem) {
        setEditingItem({ ...editingItem, image: imageUrl });
      } else if (type === 'offer' && editingOffer) {
        setEditingOffer({ ...editingOffer, image: imageUrl });
      }
      
      setImagePreview(imageUrl);
    } catch (err: any) {
      setImageUploadError(err.message);
    }
  };

  const handleSaveSection = async () => {
    if (!editingSection || !editingSection.title) return;
    
    try {
      if (editingSection.id) {
        await updateSection(editingSection.id.toString(), editingSection);
      } else {
        await addSection(editingSection);
      }
      setEditingSection(null);
      setImagePreview('');
    } catch (err) {
      console.error('Error saving section:', err);
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem || !editingItem.name || !editingItem.section_id) return;
    
    try {
      console.log('Saving item with sizes:', itemSizes);
      const itemWithSizes = { ...editingItem, sizes: itemSizes };
      console.log('Complete item data:', itemWithSizes);
      
      if (editingItem.id) {
        await updateItem(editingItem.id.toString(), itemWithSizes);
      } else {
        await addItem(itemWithSizes);
      }
      setEditingItem(null);
      setItemSizes([]);
      setImagePreview('');
      console.log('✅ Item saved successfully');
    } catch (err) {
      console.error('Error saving item:', err);
      alert('حدث خطأ في حفظ الصنف: ' + (err as Error).message);
    }
  };

  const handleSaveOffer = async () => {
    if (!editingOffer || !editingOffer.title) return;
    
    try {
      if (editingOffer.id) {
        await updateOffer(editingOffer.id.toString(), editingOffer);
      } else {
        await addOffer(editingOffer);
      }
      setEditingOffer(null);
      setImagePreview('');
    } catch (err) {
      console.error('Error saving offer:', err);
    }
  };

  const addSize = () => {
    const newSizes = [...itemSizes, { size: '', price: 0 }];
    setItemSizes(newSizes);
    console.log('Added new size, total sizes:', newSizes.length);
  };

  const updateSize = (index: number, field: 'size' | 'price', value: string | number) => {
    console.log('Updating size at index:', index, 'field:', field, 'value:', value);
    const newSizes = [...itemSizes];
    if (newSizes[index]) {
      newSizes[index] = { ...newSizes[index], [field]: value };
    }
    setItemSizes(newSizes);
    console.log('Updated sizes:', newSizes);
  };

  const removeSize = (index: number) => {
    console.log('Removing size at index:', index, 'from', itemSizes.length, 'sizes');
    const newSizes = itemSizes.filter((_, i) => i !== index);
    setItemSizes(newSizes);
    console.log('Remaining sizes:', newSizes.length);
  };

  const ImageUploadSection = ({ type, currentImage }: { type: 'section' | 'item' | 'offer', currentImage?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">الصورة</label>
      
      {/* رفع صورة من الجهاز */}
      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-1">رفع صورة من الجهاز:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageUpload(file, type);
            }
          }}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          disabled={loading}
        />
      </div>

      {/* أو رابط الصورة */}
      <div className="mb-3">
        <label className="block text-xs text-gray-600 mb-1">أو أدخل رابط الصورة:</label>
        <input
          type="url"
          value={currentImage || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (type === 'section' && editingSection) {
              setEditingSection({ ...editingSection, image: value });
            } else if (type === 'item' && editingItem) {
              setEditingItem({ ...editingItem, image: value });
            } else if (type === 'offer' && editingOffer) {
              setEditingOffer({ ...editingOffer, image: value });
            }
            setImagePreview(value);
          }}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          placeholder="https://example.com/image.jpg"
          disabled={loading}
        />
      </div>

      {/* معاينة الصورة */}
      {(imagePreview || currentImage) && (
        <div className="mt-2">
          <img
            src={imagePreview || currentImage}
            alt="معاينة"
            className="w-32 h-32 object-cover rounded-lg border"
            onError={() => setImageUploadError('رابط الصورة غير صحيح')}
            onLoad={() => setImageUploadError('')}
          />
        </div>
      )}
      
      {imageUploadError && (
        <p className="text-red-500 text-sm mt-1">{imageUploadError}</p>
      )}
    </div>
  );

  if (loading && !sections.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-50 rounded-lg w-full max-w-6xl h-[90vh] overflow-y-auto p-6" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
          <button
            onClick={onClose}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="max-w-7xl mx-auto">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setActiveTab('sections')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'sections'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:text-amber-500'
                }`}
              >
                الأقسام ({sections.length})
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'items'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:text-amber-500'
                }`}
              >
                الأصناف ({items.length})
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'offers'
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-600 hover:text-amber-500'
                }`}
              >
                العروض الخاصة ({offers.length})
              </button>
            </div>
          </div>

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">إدارة الأقسام</h2>
                <button
                  onClick={() => setEditingSection({ 
                    title: '', 
                    icon: '🍽️', 
                    image: '', 
                    order_index: sections.length 
                  })}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة قسم جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{section.icon}</span>
                        <h3 className="font-semibold">{section.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSection(section)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSection(section.id.toString())}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {section.image && (
                      <img
                        src={section.image}
                        alt={section.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">إدارة الأصناف</h2>
                <button
                  onClick={() => {
                    setEditingItem({ 
                      name: '', 
                      description: '', 
                      price: 0, 
                      calories: 0,
                      image: '', 
                      popular: false, 
                      new: false, 
                      available: true, 
                      order_index: items.length,
                      section_id: ''
                    });
                    setItemSizes([]);
                  }}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة صنف جديد
                </button>
              </div>

              {/* فلتر الأقسام */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">فلترة الأصناف حسب القسم:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSectionFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedSectionFilter === 'all'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    جميع الأصناف ({items.length})
                  </button>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSectionFilter(section.id.toString())}
                          section_id: selectedSectionFilter !== 'all' ? selectedSectionFilter : ''
                        selectedSectionFilter === section.id.toString()
                          ? 'bg-amber-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {section.icon} {section.title} ({items.filter(item => item.section_id === section.id).length})
                    </button>
                  ))}
                </div>
                {selectedSectionFilter !== 'all' && (
                  <div className="mt-3 text-sm text-gray-600">
                    عرض أصناف قسم: <strong>{getSectionName(selectedSectionFilter)}</strong>
                  </div>
                )}
              </div>
              {/* عرض الأصناف المفلترة */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg" dir="rtl">
                    {selectedSectionFilter === 'all' 
                      ? 'لا توجد أصناف مضافة بعد' 
                      : `لا توجد أصناف في قسم ${getSectionName(selectedSectionFilter)}`
                    }
                  </p>
                  <button
                    onClick={() => {
                      setEditingItem({ 
                        name: '', 
                        description: '', 
                        price: 0, 
                        calories: 0,
                        image: '', 
                        popular: false, 
                        new: false, 
                        available: true, 
                        order_index: items.length,
                        section_id: selectedSectionFilter !== 'all' ? selectedSectionFilter : ''
                      });
                      setItemSizes([]);
                    }}
                    className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    إضافة صنف جديد
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-xs text-gray-500">{getSectionName(item.section_id)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setItemSizes(item.sizes || []);
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id.toString())}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-amber-600">{item.price} ر.س</span>
                      {item.calories && item.calories > 0 && (
                        <div className="flex items-center gap-1 text-orange-600 text-sm">
                          <Flame className="w-3 h-3" />
                          <span>{item.calories} كالوري</span>
                        </div>
                      )}
                    </div>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                    )}
                    {item.sizes && item.sizes.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-1">الأحجام:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.sizes.map((size, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {size.size}: {size.price} ر.س
                          </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      {item.popular && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">شائع</span>
                      )}
                      {item.new && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">جديد</span>
                      )}
                      {!item.available && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">غير متوفر</span>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">إدارة العروض الخاصة</h2>
                <button
                  onClick={() => setEditingOffer({ 
                    title: '', 
                    description: '', 
                    originalPrice: 0, 
                    offerPrice: 0, 
                    calories: 0,
                    validUntil: '', 
                    image: '', 
                    active: true 
                  })}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة عرض جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{offer.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingOffer(offer)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteOffer(offer.id.toString())}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{offer.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="line-through text-gray-500 text-sm">{offer.originalPrice} ر.س</span>
                        <span className="font-bold text-red-600 mr-2">{offer.offerPrice} ر.س</span>
                      </div>
                      {offer.calories && offer.calories > 0 && (
                        <div className="flex items-center gap-1 text-orange-600 text-sm">
                          <Flame className="w-3 h-3" />
                          <span>{offer.calories} كالوري</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">صالح حتى: {offer.validUntil}</p>
                    {offer.image && (
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        offer.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.active ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Section Modal */}
          {editingSection && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">
                  {editingSection.id ? 'تعديل القسم' : 'إضافة قسم جديد'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم القسم</label>
                    <input
                      type="text"
                      value={editingSection.title || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
                    <input
                      type="text"
                      value={editingSection.icon || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, icon: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      disabled={loading}
                    />
                  </div>
                  
                  <ImageUploadSection type="section" currentImage={editingSection.image} />
                </div>
                
                <div className="flex gap-3 mt-6" dir="rtl">
                  <button
                    onClick={handleSaveSection}
                    disabled={loading}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingSection(null);
                      setImagePreview('');
                      setImageUploadError('');
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Item Modal */}
          {editingItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">
                  {editingItem.id ? 'تعديل الصنف' : 'إضافة صنف جديد'}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">القسم *</label>
                      <select
                        value={editingItem.section_id || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, section_id: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        disabled={loading}
                        required
                      >
                        <option value="">اختر القسم</option>
                        {sections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.icon} {section.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم الصنف *</label>
                      <input
                        type="text"
                        value={editingItem.name || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        disabled={loading}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                      <textarea
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        rows={3}
                        disabled={loading}
                        placeholder="وصف مختصر للصنف (اختياري)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأساسي (ر.س) *</label>
                      <input
                        type="number"
                        value={editingItem.price || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        disabled={loading}
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">السعرات الحرارية</label>
                      <input
                        type="number"
                        value={editingItem.calories || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, calories: Number(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                        disabled={loading}
                        min="0"
                        placeholder="0 (اختياري)"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ImageUploadSection type="item" currentImage={editingItem.image} />
                    
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingItem.popular || false}
                          onChange={(e) => setEditingItem({ ...editingItem, popular: e.target.checked })}
                          className="mr-2"
                          disabled={loading}
                        />
                        الأكثر طلباً
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingItem.new || false}
                          onChange={(e) => setEditingItem({ ...editingItem, new: e.target.checked })}
                          className="mr-2"
                          disabled={loading}
                        />
                        جديد
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingItem.available !== false}
                          onChange={(e) => setEditingItem({ ...editingItem, available: e.target.checked })}
                          className="mr-2"
                          disabled={loading}
                        />
                        متوفر
                      </label>
                    </div>

                    {/* إدارة الأحجام */}
                    <div className="lg:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">الأحجام والأسعار</label>
                        <button
                          type="button"
                          onClick={addSize}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                          disabled={loading}
                        >
                          <Plus className="w-4 h-4" />
                          إضافة حجم
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {itemSizes.map((size, index) => (
                          <div key={`size-${index}`} className="bg-gray-50 p-3 rounded-lg border">
                            <div className="flex gap-3 items-center">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-600 mb-1" dir="rtl">اسم الحجم</label>
                                <input
                                  type="text"
                                  placeholder="مثل: كاسة، براد صغير، صغير (6 قطع)"
                                  value={size.size || ''}
                                  onChange={(e) => updateSize(index, 'size', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-right"
                                  dir="rtl"
                                  disabled={loading}
                                />
                              </div>
                              <div className="w-32">
                                <label className="block text-xs text-gray-600 mb-1" dir="rtl">السعر (ر.س)</label>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={size.price || ''}
                                  onChange={(e) => updateSize(index, 'price', Number(e.target.value))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                  min="0"
                                  step="0.01"
                                  disabled={loading}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-600 opacity-0">حذف</label>
                                <button
                                  type="button"
                                  onClick={() => removeSize(index)}
                                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                                  disabled={loading}
                                  title="حذف الحجم"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        </div>
                      
                      {itemSizes.length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-gray-500 text-sm" dir="rtl">
                            لا توجد أحجام مضافة. اضغط "إضافة حجم" لإضافة حجم جديد
                          </p>
                          <p className="text-gray-400 text-xs mt-1" dir="rtl">
                            إذا لم تضف أحجام، سيتم استخدام السعر الأساسي فقط
                          </p>
                        </div>
                      )}
                      
                      {/* أمثلة للأحجام */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-200" dir="rtl">
                        <p className="font-medium mb-1">أمثلة للأحجام:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="font-medium text-blue-800">للشاي:</p>
                            <p>• كاسة واحدة</p>
                            <p>• براد صغير (2-3 أكواب)</p>
                            <p>• براد وسط (4-5 أكواب)</p>
                            <p>• براد كبير (6-8 أكواب)</p>
                          </div>
                          <div>
                            <p className="font-medium text-blue-800">للبيتزا:</p>
                            <p>• صغير (6 قطع)</p>
                            <p>• وسط (8 قطع)</p>
                            <p>• كبير (12 قطعة)</p>
                            <p>• عائلي (16 قطعة)</p>
                          </div>
                          <div>
                            <p className="font-medium text-blue-800">للقهوة:</p>
                            <p>• صغير</p>
                            <p>• وسط</p>
                            <p>• كبير</p>
                            <p>• إكسترا لارج</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6" dir="rtl">
                  <button
                    onClick={handleSaveItem}
                    disabled={loading}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setItemSizes([]);
                      setImagePreview('');
                      setImageUploadError('');
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Offer Modal */}
          {editingOffer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">
                  {editingOffer.id ? 'تعديل العرض' : 'إضافة عرض جديد'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان العرض</label>
                    <input
                      type="text"
                      value={editingOffer.title || ''}
                      onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وصف العرض</label>
                    <textarea
                      value={editingOffer.description || ''}
                      onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأصلي (ر.س)</label>
                    <input
                      type="number"
                      value={editingOffer.originalPrice || 0}
                      onChange={(e) => setEditingOffer({ ...editingOffer, originalPrice: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      disabled={loading}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">سعر العرض (ر.س)</label>
                    <input
                      type="number"
                      value={editingOffer.offerPrice || 0}
                      onChange={(e) => setEditingOffer({ ...editingOffer, offerPrice: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      disabled={loading}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">السعرات الحرارية</label>
                    <input
                      type="number"
                      value={editingOffer.calories || 0}
                      onChange={(e) => setEditingOffer({ ...editingOffer, calories: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      disabled={loading}
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ انتهاء العرض</label>
                    <input
                      type="text"
                      value={editingOffer.validUntil || ''}
                      onChange={(e) => setEditingOffer({ ...editingOffer, validUntil: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="مثل: 31 ديسمبر 2024"
                      disabled={loading}
                    />
                  </div>
                  
                  <ImageUploadSection type="offer" currentImage={editingOffer.image} />
                </div>
                
                <div className="flex gap-3 mt-6" dir="rtl">
                  <button
                    onClick={handleSaveOffer}
                    disabled={loading}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingOffer(null);
                      setImagePreview('');
                      setImageUploadError('');
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;