import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MenuSection, MenuItem, SpecialOffer } from '../types/menu';

export const useSupabaseAdmin = () => {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching all admin data...');
      
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('menu_sections')
        .select('*')
        .order('order_index');
      
      if (sectionsError) throw sectionsError;
      console.log('📋 Sections fetched:', sectionsData?.length || 0);
      setSections(sectionsData || []);
      
      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          sizes:menu_item_sizes(
            id,
            size,
            price
          )
        `)
        .order('order_index');
      
      if (itemsError) throw itemsError;
      console.log('🍽️ Items fetched:', itemsData?.length || 0);
      console.log('📏 Items with sizes:', itemsData?.filter(item => item.sizes && item.sizes.length > 0).length || 0);
      setItems(itemsData || []);
      
      // Fetch offers
      const { data: offersData, error: offersError } = await supabase
        .from('special_offers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (offersError) throw offersError;
      console.log('🎁 Offers fetched:', offersData?.length || 0);
      setOffers(offersData || []);
      
      console.log('✅ All admin data fetched successfully');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  // إضافة دالة setError للتصدير
  const setErrorMessage = (message: string | null) => {
    setError(message);
  };

  // دالة لتحويل الصورة إلى Base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // دالة للتحقق من صحة رابط الصورة
  const validateImageUrl = (url: string): boolean => {
    if (!url) return true; // فارغ مقبول
    
    // التحقق من Base64
    if (url.startsWith('data:image/')) return true;
    
    // التحقق من URL صحيح
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // إضافة قسم جديد
  const addSection = async (section: Omit<MenuSection, 'id' | 'items'>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('➕ Adding new section:', section);
      
      // التحقق من صحة الصورة
      if (section.image && !validateImageUrl(section.image)) {
        console.warn('Invalid image URL, proceeding without image');
        section.image = '';
      }
      
      const { data, error } = await supabase
        .from('menu_sections')
        .insert([{
          title: section.title,
          icon: section.icon,
          image: section.image || '',
          order_index: section.order_index || 0
        }])
        .select();

      if (error) {
        console.error('❌ Error adding section:', error);
        throw new Error(`فشل في إضافة القسم: ${error.message}`);
      }
      
      console.log('✅ Section added successfully:', data);
      await fetchData(); // Refresh data
      return data;
    } catch (err: any) {
      console.error('❌ Add section failed:', err);
      setError(err.message || 'فشل في إضافة القسم');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // تحديث قسم
  const updateSection = async (id: string, updates: Partial<MenuSection>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('✏️ Updating section:', id, updates);
      
      // التحقق من صحة الصورة
      if (updates.image && !validateImageUrl(updates.image)) {
        throw new Error('رابط الصورة غير صحيح');
      }

      const { data, error } = await supabase
        .from('menu_sections')
        .update({
          title: updates.title,
          icon: updates.icon,
          image: updates.image,
          order_index: updates.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Error updating section:', error);
        throw error;
      }
      
      console.log('✅ Section updated successfully:', data);
      await fetchData(); // Refresh data
      return data;
    } catch (err: any) {
      console.error('❌ Update section failed:', err);
      setError(err.message || 'فشل في تحديث القسم');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // حذف قسم
  const deleteSection = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting section:', id);

      const { error } = await supabase
        .from('menu_sections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting section:', error);
        throw error;
      }
      
      console.log('✅ Section deleted successfully');
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error('❌ Delete section failed:', err);
      setError(err.message || 'فشل في حذف القسم');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // إضافة عنصر جديد
  const addMenuItem = async (item: Omit<MenuItem, 'id'>, sizes?: Array<{ size: string; price: number }>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('➕ Adding new menu item:', item);
      console.log('🔍 Item sizes to add:', JSON.stringify(sizes, null, 2));
      
      // التحقق من صحة الصورة
      if (item.image && !validateImageUrl(item.image)) {
        console.warn('Invalid image URL, proceeding without image');
        item.image = '';
      }

      // التحقق من البيانات المطلوبة
      if (!item.name || item.name.trim() === '') {
        throw new Error('يجب إدخال اسم الصنف');
      }
      
      if (!item.section_id) {
        throw new Error('يجب اختيار القسم أولاً');
      }
      
      if (!item.price || item.price <= 0) {
        throw new Error('يجب إدخال سعر صحيح');
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          section_id: item.section_id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          calories: item.calories || null,
          image: item.image || '',
          popular: item.popular || false,
          new: item.new || false,
          available: item.available !== false,
          order_index: item.order_index || 0
        }])
        .select();

      if (error) {
        console.error('❌ Error adding menu item:', error);
        throw new Error(`فشل في إضافة الصنف: ${error.message}`);
      }

      const newItem = data[0];
      console.log('✅ New item created with ID:', newItem.id);

      // إضافة الأحجام إذا كانت موجودة
      if (sizes && sizes.length > 0) {
        console.log('📏 Adding sizes for item:', newItem.id);
        const sizesData = sizes.map(size => ({
          item_id: newItem.id,
          size: size.size,
          price: size.price
        }));
        console.log('📊 Sizes data to insert:', JSON.stringify(sizesData, null, 2));

        const { error: sizesError } = await supabase
          .from('menu_item_sizes')
          .insert(sizesData);

        if (sizesError) {
          console.error('❌ Error adding sizes:', sizesError);
          throw new Error(`فشل في إضافة الأحجام: ${sizesError.message}`);
        }
        console.log('✅ All sizes added successfully to database');
        
        // التحقق من الحفظ
        const { data: savedSizes, error: checkError } = await supabase
          .from('menu_item_sizes')
          .select('*')
          .eq('item_id', newItem.id);
          
        if (checkError) {
          console.error('❌ Error checking saved sizes:', checkError);
        } else {
          console.log('🔍 Verified saved sizes:', JSON.stringify(savedSizes, null, 2));
        }
      }

      console.log('🎉 Menu item with sizes added successfully');
      await fetchData(); // Refresh data
      return newItem;
    } catch (err: any) {
      console.error('❌ Add menu item failed:', err);
      setError(err.message || 'فشل في إضافة العنصر');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // تحديث عنصر
  const updateMenuItem = async (id: string, updates: Partial<MenuItem>, sizes?: Array<{ size: string; price: number }>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('✏️ Updating menu item:', id, updates);
      console.log('📏 Sizes to update:', JSON.stringify(sizes, null, 2));
      
      // التحقق من صحة الصورة
      if (updates.image && !validateImageUrl(updates.image)) {
        console.warn('Invalid image URL, proceeding without image');
        updates.image = '';
      }

      const { data, error } = await supabase
        .from('menu_items')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          calories: updates.calories,
          image: updates.image,
          popular: updates.popular,
          new: updates.new,
          available: updates.available,
          order_index: updates.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Error updating menu item:', error);
        throw error;
      }

      // تحديث الأحجام
      if (sizes !== undefined) {
        console.log('🔄 Updating sizes for item:', id);
        // حذف الأحجام القديمة
        const { error: deleteError } = await supabase
          .from('menu_item_sizes')
          .delete()
          .eq('item_id', id);

        if (deleteError) {
          console.error('❌ Error deleting old sizes:', deleteError);
          throw deleteError;
        }
        console.log('🗑️ Old sizes deleted successfully');

        // إضافة الأحجام الجديدة
        if (sizes && sizes.length > 0) {
          const sizesData = sizes.map(size => ({
            item_id: id,
            size: size.size,
            price: size.price
          }));
          console.log('📊 New sizes data to insert:', JSON.stringify(sizesData, null, 2));

          const { error: sizesError } = await supabase
            .from('menu_item_sizes')
            .insert(sizesData);

          if (sizesError) {
            console.error('❌ Error updating sizes:', sizesError);
            throw sizesError;
          }
          console.log('✅ New sizes added successfully to database');
          
          // التحقق من الحفظ
          const { data: savedSizes, error: checkError } = await supabase
            .from('menu_item_sizes')
            .select('*')
            .eq('item_id', id);
            
          if (checkError) {
            console.error('❌ Error checking saved sizes:', checkError);
          } else {
            console.log('🔍 Verified updated sizes:', JSON.stringify(savedSizes, null, 2));
          }
        }
      }

      console.log('🎉 Menu item with sizes updated successfully');
      await fetchData(); // Refresh data
      return data;
    } catch (err: any) {
      console.error('❌ Update menu item failed:', err);
      setError(err.message || 'فشل في تحديث العنصر');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // حذف عنصر
  const deleteMenuItem = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting menu item:', id);

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting menu item:', error);
        throw error;
      }
      
      console.log('✅ Menu item deleted successfully');
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error('❌ Delete menu item failed:', err);
      setError(err.message || 'فشل في حذف العنصر');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // إضافة عرض خاص
  const addSpecialOffer = async (offer: Omit<SpecialOffer, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('➕ Adding new special offer:', offer);
      
      const { data, error } = await supabase
        .from('special_offers')
        .insert([{
          title: offer.title,
          description: offer.description,
          original_price: offer.originalPrice,
          offer_price: offer.offerPrice,
          valid_until: offer.validUntil,
          image: offer.image || '',
          calories: offer.calories || null,
          active: true
        }])
        .select();

      if (error) {
        console.error('❌ Error adding special offer:', error);
        throw error;
      }
      
      console.log('✅ Special offer added successfully:', data);
      await fetchData(); // Refresh data
      return data;
    } catch (err: any) {
      console.error('❌ Add special offer failed:', err);
      setError(`فشل في إضافة العرض: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // تحديث عرض خاص
  const updateSpecialOffer = async (id: string, updates: Partial<SpecialOffer>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('✏️ Updating special offer:', id, updates);
      

      const { data, error } = await supabase
        .from('special_offers')
        .update({
          title: updates.title,
          description: updates.description,
          original_price: updates.originalPrice,
          offer_price: updates.offerPrice,
          valid_until: updates.validUntil,
          image: updates.image,
          calories: updates.calories,
          active: updates.active !== false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Error updating special offer:', error);
        throw error;
      }
      
      console.log('✅ Special offer updated successfully:', data);
      await fetchData(); // Refresh data
      return data;
    } catch (err: any) {
      console.error('❌ Update special offer failed:', err);
      setError(`فشل في تحديث العرض: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // حذف عرض خاص
  const deleteSpecialOffer = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting special offer:', id);

      const { error } = await supabase
        .from('special_offers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting special offer:', error);
        throw error;
      }
      
      console.log('✅ Special offer deleted successfully');
      await fetchData(); // Refresh data
    } catch (err: any) {
      console.error('❌ Delete special offer failed:', err);
      setError(err.message || 'فشل في حذف العرض');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // دالة مساعدة لرفع الصور
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // التحقق من نوع الملف
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('نوع الملف غير مدعوم. يرجى استخدام JPEG, PNG, GIF, أو WebP');
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى 5MB');
      }

      // تحويل إلى Base64
      const base64 = await convertImageToBase64(file);
      return base64;
    } catch (err: any) {
      console.error('❌ Image upload failed:', err);
      throw new Error(err.message || 'فشل في رفع الصورة');
    }
  };

  return {
    sections,
    items,
    offers,
    loading,
    error,
    fetchData,
    setError: setErrorMessage,
    // Section operations
    addSection,
    updateSection,
    deleteSection,
    // Menu item operations
    addItem: addMenuItem,
    updateItem: updateMenuItem,
    deleteItem: deleteMenuItem,
    // Special offer operations
    addOffer: addSpecialOffer,
    updateOffer: updateSpecialOffer,
    deleteOffer: deleteSpecialOffer,
    // Image operations
    uploadImage,
    convertImageToBase64,
    validateImageUrl
  };
};