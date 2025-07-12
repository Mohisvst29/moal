Here's the fixed version with all missing closing brackets added:

```typescript
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
    addItem: addMenuItem,
    updateItem: updateMenuItem,
    deleteItem: deleteMenuItem,
    addOffer: addSpecialOffer,
    updateOffer: updateSpecialOffer,
    deleteOffer: deleteSpecialOffer
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
    fetchData();
  }, []);

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
      await addMenuItem(newItem as Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>, itemSizes);
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
      await updateMenuItem(editingItem.id, editingItem, itemSizes);
      setEditingItem(null);
      setItemSizes([]);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleAddOffer = async () => {
    if (!newOffer.title || !newOffer.description) return;
    
    try {
      await addSpecialOffer(newOffer as Omit<SpecialOffer, 'id' | 'created_at' | 'updated_at'>);
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
      await updateSpecialOffer(editingOffer.id, editingOffer);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-8 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 mb-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
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
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
```