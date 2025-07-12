Here's the fixed version with the missing closing brackets and proper syntax:

```typescript
import React, { useState, useEffect } from 'react';
import { useSupabaseAdmin } from '../hooks/useSupabaseAdmin';
import { MenuSection, MenuItem, SpecialOffer } from '../types/menu';
import { Trash2, Edit, Plus, Save, X, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AdminPanel: React.FC = () => {
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
    refreshData
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
    original_price: 0,
    offer_price: 0,
    valid_until: '',
    image: '',
    calories: undefined,
    active: true
  });

  useEffect(() => {
    refreshData();
  }, []); // Added missing closing bracket and array dependency

  // Filter items based on selected section
  const filteredItems = selectedSectionFilter === 'all' 
    ? items 
    : items.filter(item => item.section_id === selectedSectionFilter);

  const handleAddSection = async () => {
    if (!newSection.title) return;
    
    try {
      await addSection(newSection as Omit<MenuSection, 'id' | 'created_at' | 'updated_at'>);
      setNewSection({ title: '', icon: '🍽️', image: '', order_index: 0 });
      setShowAddSection(false);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;
    
    try {
      await updateSection(editingSection.id, editingSection);
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.section_id) return;
    
    try {
      console.log('Adding item with sizes:', { newItem, itemSizes });
      await addItem(newItem as Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>, itemSizes);
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
      console.log('Updating item with sizes:', { editingItem, itemSizes });
      await updateItem(editingItem.id, editingItem, itemSizes);
      setEditingItem(null);
      setItemSizes([]);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleAddOffer = async () => {
    if (!newOffer.title || !newOffer.description) return;
    
    try {
      await addOffer(newOffer as Omit<SpecialOffer, 'id' | 'created_at' | 'updated_at'>);
      setNewOffer({
        title: '',
        description: '',
        original_price: 0,
        offer_price: 0,
        valid_until: '',
        image: '',
        calories: undefined,
        active: true
      });
      setShowAddOffer(false);
    } catch (error) {
      console.error('Error adding offer:', error);
    }
  };

  const handleUpdateOffer = async () => {
    if (!editingOffer) return;
    
    try {
      await updateOffer(editingOffer.id, editingOffer);
      setEditingOffer(null);
    } catch (error) {
      console.error('Error updating offer:', error);
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">لوحة التحكم</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
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
          >
            العروض الخاصة ({offers.length})
          </button>
        </div>

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">إدارة الأقسام</h2>
              <button
                onClick={() => setShowAddSection(true)}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة قسم جديد
              </button>
            </div>

            {/* Add Section Form */}
            {showAddSection && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">إضافة قسم جديد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم القسم *
                    </label>
                    <input
                      type="text"
                      value={newSection.title || ''}
                      onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="مثال: المشروبات الساخنة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأيقونة
                    </label>
                    <input
                      type="text"
                      value={newSection.icon || ''}
                      onChange={(e) => setNewSection({ ...newSection, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="🍽️"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الصورة
                    </label>
                    <input
                      type="url"
                      value={newSection.image || ''}
                      onChange={(e) => setNewSection({ ...newSection, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ترتيب العرض
                    </label>
                    <input
                      type="number"
                      value={newSection.order_index || 0}
                      onChange={(e) => setNewSection({ ...newSection, order_index: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddSection}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    حفظ
                  </button>
                  <button
                    onClick={() => setShowAddSection(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Sections List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => (
                <div key={section.id} className="bg-white p-6 rounded-lg shadow-md">
                  {editingSection?.id === section.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingSection.title}
                        onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={editingSection.icon}
                        onChange={(e) => setEditingSection({ ...editingSection, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <input
                        type="url"
                        value={editingSection.image || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="رابط الصورة"
                      />
                      <input
                        type="number"
                        value={editingSection.order_index}
                        onChange={(e) => setEditingSection({ ...editingSection, order_index: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateSection}
                          className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          حفظ
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{section.icon}</span>
                          <h3 className="text-lg font-semibold">{section.title}</h3>
                        </div>
                        <span className="text-sm text-gray-500">#{section.order_index}</span>
                      </div>
                      {section.image && (
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-32 object-cover rounded-md mb-4"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSection(section)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          تعديل
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
                              deleteSection(section.id);
                            }
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          حذف
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">إدارة الأصناف</h2>
              <button
                onClick={() => {
                  setNewItem({
                    ...newItem,
                    section_id: selectedSectionFilter !== 'all' ? selectedSectionFilter : ''
                  });
                  setShowAddItem(true);
                }}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة صنف جديد
              </button>
            </div>

            {/* Section Filter */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-3">فلترة حسب القسم</h3>
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
                    className={`px-4 py-2 rounded-lg transition-colors ${
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
                <p className="text-sm text-gray-600 mt-2">
                  عرض أصناف: {sections.find(s => s.id.toString() === selectedSectionFilter)?.title}
                </p>
              )}
            </div>

            {/* Add Item Form */}
            {showAddItem && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">إضافة صنف جديد</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      القسم *
                    </label>
                    <select
                      value={newItem.section_id || ''}
                      onChange={(e) => setNewItem({ ...newItem, section_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم الصنف *
                    </label>
                    <input
                      type="text"
                      value={newItem.name || ''}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="مثال: شاي أحمر"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوصف
                    </label>
                    <textarea
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows={3}
                      placeholder="وصف الصنف..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر الأساسي *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price || 0}
                      onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعرات الحرارية
                    </label>
                    <input
                      type="number"
                      value={newItem.calories || ''}
                      onChange={(e) => setNewItem({ ...newItem, calories: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الصورة
                    </label>
                    <input
                      type="url"
                      value={newItem.image || ''}
                      onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Item Sizes */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold">أحجام الصنف</h4>
                    <button
                      onClick={addSize}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      إضافة حجم
                    </button>
                  </div>
                  
                  {itemSizes.length === 0 ? (
                    <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-md">
                      <p className="mb-2">لا توجد أحجام مضافة. يمكنك إضافة أحجام مختلفة مثل:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li><strong>للشاي:</strong> صغير (5 ريال)، وسط (7 ريال)، كبير (10 ريال)</li>
                        <li><strong>للبيتزا:</strong> شخصية (15 ريال)، وسط (25 ريال)، كبيرة (35 ريال)</li>
                        <li><strong>للقهوة:</strong> صغير (8 ريال)، وسط (12 ريال)، كبير (16 ريال)</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {itemSizes.map((size, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={size.size}
                            onChange={(e) => updateSize(index, 'size', e.target.value)}
                            placeholder="اسم الحجم (مثل: صغير)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={size.price}
                            onChange={(e) => updateSize(index, 'price', parseFloat(e.target.value))}
                            placeholder="السعر"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => removeSize(index)}
                            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newItem.popular || false}
                        onChange={(e) => setNewItem({ ...newItem, popular: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">الأكثر طلباً</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newItem.new || false}
                        onChange={(e) => setNewItem({ ...newItem, new: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">جديد</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newItem.available !== false}
                        onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">متاح</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddItem}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    حفظ
                  </button>
                  <button
                    onClick={() => {
                      setShowAddItem(false);
                      setItemSizes([]);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const section = sections.find(s => s.id === item.section_id);
                return (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
                    {editingItem?.id === item.id ? (
                      <div className="space-y-4">
                        <select
                          value={editingItem.section_id || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, section_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="">اختر القسم</option>
                          {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                              {section.icon} {section.title}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-