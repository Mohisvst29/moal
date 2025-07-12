import React, { useState, useEffect } from 'react';
import { useSupabaseAdmin } from '../hooks/useSupabaseAdmin';
import { MenuSection, MenuItem, SpecialOffer } from '../types/menu';
import { Trash2, Edit, Plus, Save, X, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

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
    addSection,
    updateSection,
    deleteSection,
    addItem,
    updateItem,
    deleteItem,
    addOffer,
    updateOffer,
    deleteOffer
  } = useSupabaseAdmin();

  const [activeTab, setActiveTab] = useState<'sections' | 'items' | 'offers'>('sections');
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');

  // Form states
  const [newSection, setNewSection] = useState<Partial<MenuSection>>({
    title: '',
    icon: '🍽️',
    image: '',
    order_index: 0
  });

  // Image upload states for different types
  const [uploadingImage, setUploadingImage] = useState<{
    section: boolean;
    item: boolean;
    offer: boolean;
  }>({
    section: false,
    item: false,
    offer: false
  });

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    calories: undefined,
    image: '',
    popular: false,
    new: false,
    available: true,
    section_id: '',
    order_index: 0
  });

  const [itemSizes, setItemSizes] = useState<Array<{ size: string; price: number }>>([]);

  const [newOffer, setNewOffer] = useState<Partial<SpecialOffer>>({
    title: '',
    description: '',
    originalPrice: 0,
    offerPrice: 0,
    validUntil: '',
    image: '',
    calories: undefined,
    active: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  // Filter items based on selected section
  const filteredItems = selectedSectionFilter === 'all' 
    ? items 
    : items.filter(item => item.section_id === selectedSectionFilter);

  const handleAddSection = async () => {
    if (!newSection.title) return;
    
    try {
      await addSection(newSection as Omit<MenuSection, 'id' | 'items'>);
      setNewSection({ title: '', icon: '🍽️', image: '', order_index: 0 });
      setShowAddSection(false);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;
    
    try {
      await updateSection(editingSection.id.toString(), editingSection);
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.section_id) return;
    
    try {
      await addItem(newItem as Omit<MenuItem, 'id'>, itemSizes);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        calories: undefined,
        image: '',
        popular: false,
        new: false,
        available: true,
        section_id: selectedSectionFilter !== 'all' ? selectedSectionFilter : '',
        order_index: 0
      });
      setItemSizes([]);
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    
    try {
      await updateItem(editingItem.id.toString(), editingItem, itemSizes);
      setEditingItem(null);
      setItemSizes([]);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleAddOffer = async () => {
    if (!newOffer.title || !newOffer.description || !newOffer.originalPrice || !newOffer.offerPrice || !newOffer.validUntil) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (newOffer.offerPrice >= newOffer.originalPrice) {
      alert('سعر العرض يجب أن يكون أقل من السعر الأصلي');
      return;
    }
    
    try {
      await addOffer(newOffer as Omit<SpecialOffer, 'id'>);
      setNewOffer({
        title: '',
        description: '',
        originalPrice: 0,
        offerPrice: 0,
        validUntil: '',
        image: '',
        calories: undefined,
        active: true
      });
      setShowAddOffer(false);
      alert('تم إضافة العرض بنجاح! ✅');
    } catch (error) {
      console.error('Error adding offer:', error);
      alert('فشل في إضافة العرض. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleUpdateOffer = async () => {
    if (!editingOffer) {
      alert('لا يوجد عرض للتحديث');
      return;
    }
    
    if (!editingOffer.title || !editingOffer.description || !editingOffer.originalPrice || !editingOffer.offerPrice || !editingOffer.validUntil) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (editingOffer.offerPrice >= editingOffer.originalPrice) {
      alert('سعر العرض يجب أن يكون أقل من السعر الأصلي');
      return;
    }
    
    try {
      await updateOffer(editingOffer.id, editingOffer);
      setEditingOffer(null);
      alert('تم تحديث العرض بنجاح! ✅');
    } catch (error) {
      console.error('Error updating offer:', error);
      alert('فشل في تحديث العرض. يرجى المحاولة مرة أخرى.');
    }
  };

  const addSize = () => {
    setItemSizes([...itemSizes, { size: '', price: 0 }]);
  };

  const updateSize = (index: number, field: 'size' | 'price', value: string | number) => {
    const updatedSizes = [...itemSizes];
    updatedSizes[index] = { ...updatedSizes[index], [field]: value };
    setItemSizes(updatedSizes);
  };

  const removeSize = (index: number) => {
    setItemSizes(itemSizes.filter((_, i) => i !== index));
  };

  // Handle image upload
  const handleImageUpload = async (file: File, type: 'section' | 'item' | 'offer', isEditing: boolean = false) => {
    if (!file) return;
    
    console.log('📸 Starting image upload:', { fileName: file.name, fileSize: file.size, type, isEditing });
    
    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('نوع الملف غير مدعوم. يرجى استخدام JPEG, PNG, GIF, أو WebP');
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('حجم الملف كبير جداً. الحد الأقصى 5MB');
      return;
    }
    
    setUploadingImage(prev => ({ ...prev, [type]: true }));
    try {
      const base64Image = await convertImageToBase64(file);
      console.log('✅ Image converted to base64, length:', base64Image.length);
      
      if (type === 'section') {
        if (isEditing && editingSection) {
          setEditingSection({...editingSection, image: base64Image});
          console.log('📝 Updated editing section image');
        } else {
          setNewSection({...newSection, image: base64Image});
          console.log('📝 Updated new section image');
        }
      } else if (type === 'item') {
        if (isEditing && editingItem) {
          setEditingItem({...editingItem, image: base64Image});
          console.log('📝 Updated editing item image');
        } else {
          setNewItem({...newItem, image: base64Image});
          console.log('📝 Updated new item image');
        }
      } else if (type === 'offer') {
        if (isEditing && editingOffer) {
          setEditingOffer({...editingOffer, image: base64Image});
          console.log('📝 Updated editing offer image');
        } else {
          setNewOffer({...newOffer, image: base64Image});
          console.log('📝 Updated new offer image');
        }
      }
      
      alert('تم رفع الصورة بنجاح! ✅');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('فشل في رفع الصورة');
    } finally {
      setUploadingImage(prev => ({ ...prev, [type]: false }));
    }
  };

  // Convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Image upload component
  const ImageUploadComponent = ({ 
    currentImage, 
    onImageUpload, 
    type,
    isEditing = false,
    label = "الصورة"
  }: { 
    currentImage?: string; 
    onImageUpload: (file: File) => void; 
    type: 'section' | 'item' | 'offer';
    isEditing?: boolean;
    label?: string;
  }) => (
    <div className="space-y-2" dir="rtl">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              console.log('📁 File selected:', file.name);
              onImageUpload(file);
            }
          }}
          className="block w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 border border-gray-300 rounded-lg p-2"
          disabled={uploadingImage[type]}
        />
        {uploadingImage[type] && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
            جاري رفع الصورة...
          </div>
        )}
        {currentImage && (
          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-1">معاينة الصورة:</p>
            <img 
              src={currentImage} 
              alt="معاينة الصورة" 
              className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
            />
          </div>
        )}
        <p className="text-xs text-gray-500">
          أنواع الملفات المدعومة: JPG, PNG, GIF, WebP (حد أقصى 5MB)
        </p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-8 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 mb-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h1 className="text-3xl font-bold text-gray-900" dir="rtl">لوحة التحكم</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {loading && <LoadingSpinner />}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" dir="rtl">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'sections'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              dir="rtl"
            >
              الأقسام ({sections.length})
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'items'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              dir="rtl"
            >
              الأصناف ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'offers'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              dir="rtl"
            >
              العروض الخاصة ({offers.length})
            </button>
          </div>

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800" dir="rtl">إدارة الأقسام</h2>
                <button
                  onClick={() => setShowAddSection(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  dir="rtl"
                >
                  <Plus className="w-4 h-4" />
                  إضافة قسم جديد
                </button>
              </div>

              {/* Add Section Form */}
              {showAddSection && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-bold mb-4" dir="rtl">إضافة قسم جديد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم القسم</label>
                      <input
                        type="text"
                        value={newSection.title || ''}
                        onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="مثال: القهوة الساخنة"
                      />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
                      <input
                        type="text"
                        value={newSection.icon || ''}
                        onChange={(e) => setNewSection({...newSection, icon: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="☕"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <ImageUploadComponent
                        currentImage={newSection.image}
                        onImageUpload={(file) => handleImageUpload(file, 'section', false)}
                        type="section"
                        label="صورة القسم"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleAddSection}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      dir="rtl"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setShowAddSection(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      dir="rtl"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Sections List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section) => (
                  <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {editingSection?.id === section.id ? (
                      <div>
                        <input
                          type="text"
                          value={editingSection.title}
                          onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded mb-2"
                          dir="rtl"
                        />
                        <input
                          type="text"
                          value={editingSection.icon}
                          onChange={(e) => setEditingSection({...editingSection, icon: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded mb-2"
                          dir="rtl"
                        />
                        <div className="mb-2">
                          <ImageUploadComponent
                            currentImage={editingSection.image}
                            onImageUpload={(file) => handleImageUpload(file, 'section', true)}
                            type="section"
                            isEditing={true}
                            label="تغيير صورة القسم"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateSection}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-2" dir="rtl">
                          <span className="text-2xl">{section.icon}</span>
                          <h3 className="font-bold">{section.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSection(section)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSection(section.id.toString())}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800" dir="rtl">إدارة الأصناف</h2>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  dir="rtl"
                >
                  <Plus className="w-4 h-4" />
                  إضافة صنف جديد
                </button>
              </div>

              {/* Section Filter */}
              <div className="mb-6" dir="rtl">
                <label className="block text-sm font-medium text-gray-700 mb-2">فلترة حسب القسم</label>
                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="w-full md:w-auto p-3 border border-gray-300 rounded-lg"
                >
                  <option value="all">جميع الأقسام</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.icon} {section.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Item Form */}
              {showAddItem && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-bold mb-4" dir="rtl">إضافة صنف جديد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">اسم الصنف</label>
                      <input
                        type="text"
                        value={newItem.name || ''}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="مثال: قهوة عربي"
                      />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">القسم</label>
                      <select
                        value={newItem.section_id || ''}
                        onChange={(e) => setNewItem({...newItem, section_id: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">اختر القسم</option>
                        {sections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.icon} {section.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                      <input
                        type="number"
                        value={newItem.price || 0}
                        onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">السعرات الحرارية</label>
                      <input
                        type="number"
                        value={newItem.calories || ''}
                        onChange={(e) => setNewItem({...newItem, calories: e.target.value ? Number(e.target.value) : undefined})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="اختياري"
                      />
                    </div>
                  </div>
                  <div className="mt-4" dir="rtl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                    <textarea
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="وصف الصنف (اختياري)"
                    />
                  </div>

                  {/* Sizes */}
                  <div className="mt-4" dir="rtl">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">الأحجام (اختياري)</label>
                      <button
                        onClick={addSize}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        إضافة حجم
                      </button>
                    </div>
                    {itemSizes.map((size, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={size.size}
                          onChange={(e) => updateSize(index, 'size', e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded"
                          placeholder="مثال: كبير"
                        />
                        <input
                          type="number"
                          value={size.price}
                          onChange={(e) => updateSize(index, 'price', Number(e.target.value))}
                          className="w-24 p-2 border border-gray-300 rounded"
                          placeholder="السعر"
                        />
                        <button
                          onClick={() => removeSize(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Image Upload for New Item */}
                  <div className="mt-4">
                    <ImageUploadComponent
                      currentImage={newItem.image}
                      onImageUpload={(file) => handleImageUpload(file, 'item', false)}
                      type="item"
                      label="صورة الصنف"
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleAddItem}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      dir="rtl"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => {
                        setShowAddItem(false);
                        setItemSizes([]);
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      dir="rtl"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {editingItem?.id === item.id ? (
                      <div>
                        <div className="grid grid-cols-1 gap-4">
                          <div dir="rtl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الصنف</label>
                            <input
                              type="text"
                              value={editingItem.name || ''}
                              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded"
                            />
                          </div>
                          <div dir="rtl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                            <textarea
                              value={editingItem.description || ''}
                              onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded"
                              rows={2}
                            />
                          </div>
                          <div dir="rtl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                            <input
                              type="number"
                              value={editingItem.price || 0}
                              onChange={(e) => setEditingItem({...editingItem, price: Number(e.target.value)})}
                              className="w-full p-2 border border-gray-300 rounded"
                            />
                          </div>
                          <div dir="rtl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">السعرات الحرارية</label>
                            <input
                              type="number"
                              value={editingItem.calories || ''}
                              onChange={(e) => setEditingItem({...editingItem, calories: e.target.value ? Number(e.target.value) : undefined})}
                              className="w-full p-2 border border-gray-300 rounded"
                            />
                          </div>
                          
                          {/* Sizes for editing */}
                          <div dir="rtl">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700">الأحجام</label>
                              <button
                                onClick={addSize}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                إضافة حجم
                              </button>
                            </div>
                            {itemSizes.map((size, index) => (
                              <div key={index} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={size.size}
                                  onChange={(e) => updateSize(index, 'size', e.target.value)}
                                  className="flex-1 p-2 border border-gray-300 rounded"
                                  placeholder="الحجم"
                                />
                                <input
                                  type="number"
                                  value={size.price}
                                  onChange={(e) => updateSize(index, 'price', Number(e.target.value))}
                                  className="w-20 p-2 border border-gray-300 rounded"
                                  placeholder="السعر"
                                />
                                <button
                                  onClick={() => removeSize(index)}
                                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4" dir="rtl">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingItem.popular || false}
                                onChange={(e) => setEditingItem({...editingItem, popular: e.target.checked})}
                              />
                              الأكثر طلباً
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingItem.new || false}
                                onChange={(e) => setEditingItem({...editingItem, new: e.target.checked})}
                              />
                              جديد
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingItem.available !== false}
                                onChange={(e) => setEditingItem({...editingItem, available: e.target.checked})}
                              />
                              متاح
                            </label>
                          </div>
                          
                          {/* Image Upload for Editing Item */}
                          <div className="mt-4">
                            <ImageUploadComponent
                              currentImage={editingItem.image}
                              onImageUpload={(file) => handleImageUpload(file, 'item', true)}
                              type="item"
                              isEditing={true}
                              label="تغيير صورة الصنف"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleUpdateItem}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                            dir="rtl"
                          >
                            <Save className="w-4 h-4" />
                            حفظ
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              setItemSizes([]);
                            }}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1"
                            dir="rtl"
                          >
                            <X className="w-4 h-4" />
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-2" dir="rtl">
                          <h3 className="font-bold">{item.name}</h3>
                          <span className="text-amber-600 font-bold">{item.price} ر.س</span>
                        </div>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-2" dir="rtl">{item.description}</p>
                        )}
                        {item.sizes && item.sizes.length > 0 && (
                          <div className="text-xs text-gray-500 mb-2" dir="rtl">
                            أحجام: {item.sizes.length}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setItemSizes(item.sizes || []);
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id.toString())}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800" dir="rtl">إدارة العروض الخاصة</h2>
                <button
                  onClick={() => setShowAddOffer(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  dir="rtl"
                >
                  <Plus className="w-4 h-4" />
                  إضافة عرض جديد
                </button>
              </div>

              {/* Add Offer Form */}
              {showAddOffer && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-bold mb-4" dir="rtl">إضافة عرض جديد</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">عنوان العرض</label>
                      <input
                        type="text"
                        value={newOffer.title || ''}
                        onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="مثال: عرض الإفطار المميز"
                        required
                      />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">صالح حتى</label>
                      <input
                        type="text"
                        value={newOffer.validUntil || ''}
                        onChange={(e) => setNewOffer({...newOffer, validUntil: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="مثال: 31 ديسمبر 2024"
                        required
                      />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأصلي</label>
                      <input
                        type="number"
                        value={newOffer.originalPrice || 0}
                        onChange={(e) => setNewOffer({...newOffer, originalPrice: Number(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="0"
                        min="1"
                        required
                      />
                    </div>
                    <div dir="rtl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">سعر العرض</label>
                      <input
                        type="number"
                        value={newOffer.offerPrice || 0}
                        onChange={(e) => setNewOffer({...newOffer, offerPrice: Number(e.target.value)})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="0"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4" dir="rtl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">وصف العرض</label>
                    <textarea
                      value={newOffer.description || ''}
                      onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      rows={3}
                      placeholder="وصف العرض"
                      required
                    />
                  </div>
                  
                  {/* Image Upload for New Offer */}
                  <div className="mt-4">
                    <ImageUploadComponent
                      currentImage={newOffer.image}
                      onImageUpload={(file) => handleImageUpload(file, 'offer', false)}
                      type="offer"
                      label="صورة العرض"
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleAddOffer}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      dir="rtl"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setShowAddOffer(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      dir="rtl"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Offers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {editingOffer?.id === offer.id ? (
                      <div>
                        <div className="grid grid-cols-1 gap-4">
                          <div dir="rtl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">عنوان العرض</label>
                            <input
                              type="text"
                              value={editingOffer.title || ''}
                              onChange={(e) => setEditingOffer({...editingOffer, title: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded"
                            />
                          </div>
                          <div dir="rtl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                            <textarea
                              value={editingOffer.description || ''}
                              onChange={(e) => setEditingOffer({...editingOffer, description: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div dir="rtl">
                              <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأصلي</label>
                              <input
                                type="number"
                                value={editingOffer.originalPrice || 0}
                                onChange={(e) => setEditingOffer({...editingOffer, originalPrice: Number(e.target.value)})}
                                className="w-full p-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div dir="rtl">
                              <label className="block text-sm font-medium text-gray-700 mb-2">سعر العرض</label>
                              <input
                                type="number"
                                value={editingOffer.offerPrice || 0}
                                onChange={(e) => setEditingOffer({...editingOffer, offerPrice: Number(e.target.value)})}
                                className="w-full p-2 border border-gray-300 rounded"
                              />
                            </div>
                          </div>
                          <div dir="rtl">
                            <label className="block text-sm font-medium text-gray-700 mb-2">صالح حتى</label>
                            <input
                              type="text"
                              value={editingOffer.validUntil || ''}
                              onChange={(e) => setEditingOffer({...editingOffer, validUntil: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded"
                            />
                          </div>
                          
                          {/* Image Upload for Editing Offer */}
                          <div className="mt-4">
                            <ImageUploadComponent
                              currentImage={editingOffer.image}
                              onImageUpload={(file) => handleImageUpload(file, 'offer', true)}
                              type="offer"
                              isEditing={true}
                              label="تغيير صورة العرض"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleUpdateOffer}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                            dir="rtl"
                          >
                            <Save className="w-4 h-4" />
                            حفظ
                          </button>
                          <button
                            onClick={() => setEditingOffer(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1"
                            dir="rtl"
                          >
                            <X className="w-4 h-4" />
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-2" dir="rtl">
                          <h3 className="font-bold">{offer.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-2" dir="rtl">{offer.description}</p>
                        <div className="flex items-center gap-2 mb-2" dir="rtl">
                          <span className="text-gray-400 line-through">{offer.original_price} ر.س</span>
                          <span className="text-green-600 font-bold">{offer.offer_price} ر.س</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2" dir="rtl">صالح حتى: {offer.valid_until}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingOffer(offer)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteOffer(offer.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            title="حذف العرض"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;