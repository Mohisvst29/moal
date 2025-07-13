import { useState, useEffect } from 'react';
import { useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { menuSections as fallbackMenuSections, specialOffers as fallbackSpecialOffers } from '../data/menuData';

interface DatabaseMenuSection {
  id: string;
  title: string;
  icon: string;
  image?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface DatabaseMenuItem {
  id: string;
  section_id: string;
  name: string;
  description?: string;
  price: number;
  calories?: number;
  image?: string;
  popular: boolean;
  new: boolean;
  available: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  sizes?: DatabaseMenuItemSize[];
}

interface DatabaseMenuItemSize {
  id: string;
  item_id: string;
  size: string;
  price: number;
  created_at: string;
}

interface DatabaseSpecialOffer {
  id: string;
  title: string;
  description: string;
  original_price: number;
  offer_price: number;
  valid_until: string;
  image?: string;
  calories?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSupabaseMenu = () => {
  const [menuSections, setMenuSections] = useState<DatabaseMenuSection[]>([]);
  const [menuItems, setMenuItems] = useState<DatabaseMenuItem[]>([]);
  const [specialOffers, setSpecialOffers] = useState<DatabaseSpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // التحقق من اتصال Supabase
  const checkSupabaseConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // التحقق من متغيرات البيئة
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('❌ Supabase environment variables not found');
        setIsSupabaseConnected(false);
        return false;
      }
      
      // اختبار الاتصال
      try {
        const { data, error } = await supabase.from('menu_sections').select('id').limit(1);
        
        if (error) {
          console.error('❌ Supabase connection failed:', error);
          setIsSupabaseConnected(false);
          return false;
        }
        
        console.log('✅ Supabase connected successfully');
        setIsSupabaseConnected(true);
        return true;
      } catch (fetchError) {
        console.warn('⚠️ Supabase fetch failed (network/config issue):', fetchError);
        setIsSupabaseConnected(false);
        return false;
      }
      
    } catch (err) {
      console.warn('⚠️ Supabase connection error:', err);
      setIsSupabaseConnected(false);
      return false;
    }
  };

  // جلب أقسام المنيو
  const fetchMenuSections = async () => {
    try {
      console.log('📋 Fetching menu sections...');
      try {
        const { data, error } = await supabase
          .from('menu_sections')
          .select('*')
          .order('order_index');

        if (error) throw error;
        
        console.log(`✅ Menu sections fetched: ${data?.length || 0} sections`);
        setMenuSections(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('⚠️ Menu sections fetch failed:', fetchError);
        throw fetchError;
      }
      
    } catch (err) {
      console.warn('⚠️ Error fetching menu sections:', err);
      throw err;
    }
  };

  // جلب عناصر المنيو مع الأحجام
  const fetchMenuItems = async () => {
    try {
      console.log('🍽️ Fetching menu items...');
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select(`
            *,
            sizes:menu_item_sizes(
              id,
              size,
              price
            )
          `)
          .eq('available', true)
          .order('order_index');

        if (error) throw error;
        
        console.log(`✅ Menu items fetched: ${data?.length || 0} items`);
        console.log('Items with sizes:', data?.filter(item => item.sizes && item.sizes.length > 0).length);
        setMenuItems(data || []);
        return data || [];
      } catch (fetchError) {
        console.warn('⚠️ Menu items fetch failed:', fetchError);
        throw fetchError;
      }
      
    } catch (err) {
      console.warn('⚠️ Error fetching menu items:', err);
      throw err;
    }
  };

  // جلب العروض الخاصة
  const fetchSpecialOffers = async () => {
    try {
      console.log('🎁 Fetching special offers...');
      
      // التحقق من اتصال Supabase أولاً
      if (!isSupabaseConnected) {
        console.log('⚠️ Supabase not connected, skipping special offers fetch');
        return [];
      }
      
      const { data, error } = await supabase
        .from('special_offers')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`✅ Special offers fetched: ${data?.length || 0} offers`);
      setSpecialOffers(data || []);
      return data || [];
    } catch (err) {
      console.warn('⚠️ Error fetching special offers:', err);
      // لا نرمي الخطأ، بل نستخدم البيانات الافتراضية
      setSpecialOffers([]);
      return [];
    }
  };

  // تحويل البيانات لتتوافق مع الواجهة الحالية
  const getFormattedMenuSections = useMemo(() => {
    console.log(`🔄 Formatting menu sections - Supabase connected: ${isSupabaseConnected}, sections count: ${menuSections.length}`);
    
    // استخدام البيانات من Supabase إذا كانت متاحة، وإلا استخدم البيانات الافتراضية
    const sectionsToUse = isSupabaseConnected && menuSections.length > 0 ? menuSections : fallbackMenuSections.map(section => ({
      id: section.id.toString(),
      title: section.title,
      icon: section.icon,
      image: section.items[0]?.image || '',
      order_index: section.order_index || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const itemsToUse = isSupabaseConnected && menuItems.length > 0 ? menuItems : fallbackMenuSections.flatMap(section => 
      section.items.map(item => ({
        id: item.id.toString(),
        section_id: section.id.toString(),
        name: item.name,
        description: item.description || '',
        price: item.price,
        calories: item.calories || 0,
        image: item.image || '',
        popular: item.popular || false,
        new: item.new || false,
        available: item.available !== false,
        order_index: item.order_index || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sizes: item.sizes?.map(size => ({
          id: `${item.id}-${size.size}`,
          item_id: item.id.toString(),
          size: size.size,
          price: size.price,
          created_at: new Date().toISOString()
        }))
      }))
    );
    
    return sectionsToUse.map(section => {
      const sectionItems = itemsToUse
        .filter(item => item.section_id === section.id && item.available)
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          calories: item.calories,
          image: item.image,
          popular: item.popular,
          new: item.new,
          available: item.available,
          order_index: item.order_index,
          created_at: item.created_at,
          updated_at: item.updated_at,
          sizes: item.sizes?.map(size => ({
            size: size.size,
            price: size.price
          }))
        }));

      console.log(`📋 Section "${section.title}": ${sectionItems.length} items`);
      
      return {
        id: section.id,
        title: section.title,
        icon: section.icon,
        image: section.image,
        items: sectionItems
      };
    });
  }, [menuSections, menuItems, isSupabaseConnected]);

  const getFormattedSpecialOffers = useMemo(() => {
    console.log(`🔄 Formatting special offers - Supabase connected: ${isSupabaseConnected}, offers count: ${specialOffers.length}`);
    
    // استخدام البيانات من Supabase إذا كانت متاحة، وإلا استخدم البيانات الافتراضية
    const offersToUse = isSupabaseConnected && specialOffers.length > 0 ? specialOffers : fallbackSpecialOffers.map(offer => ({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      original_price: offer.originalPrice,
      offer_price: offer.offerPrice,
      valid_until: offer.validUntil,
      image: offer.image || '',
      calories: offer.calories || 0,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    return offersToUse
      .filter(offer => offer.active)
      .map(offer => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        originalPrice: offer.original_price,
        offerPrice: offer.offer_price,
        validUntil: offer.valid_until,
        image: offer.image,
        calories: offer.calories
      }));
  }, [specialOffers, isSupabaseConnected]);

  // دمج العروض الخاصة مع أقسام المنيو
  const allSections = useMemo(() => {
    const sections = [...getFormattedMenuSections];
    
    // إضافة قسم العروض الخاصة إذا كانت موجودة
    if (getFormattedSpecialOffers && getFormattedSpecialOffers.length > 0) {
      const offersAsItems = getFormattedSpecialOffers.map(offer => ({
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

  useEffect(() => {
    // تحميل فوري للبيانات المحلية أولاً
    if (!dataLoaded) {
      console.log('🚀 Loading fallback data immediately...');
      setLoading(false); // إظهار البيانات المحلية فوراً
      setDataLoaded(true);
      
      // ثم محاولة تحميل بيانات Supabase في الخلفية
      loadSupabaseDataInBackground();
    }
  }, []);

  const loadSupabaseDataInBackground = async () => {
    try {
      console.log('🔄 Loading Supabase data in background...');
      const connected = await checkSupabaseConnection();
      
      if (connected) {
        console.log('📡 Loading data from Supabase...');
        const results = await Promise.allSettled([
          fetchMenuSections(),
          fetchMenuItems(),
          fetchSpecialOffers()
        ]);
        
        const failedOperations = results.filter(result => result.status === 'rejected');
        if (failedOperations.length > 0) {
          console.warn('⚠️ Some Supabase operations failed, keeping fallback data');
          setIsSupabaseConnected(false);
        } else {
          console.log('✅ Supabase data loaded successfully');
        }
      }
    } catch (err) {
      console.warn('⚠️ Background Supabase loading failed:', err);
      setIsSupabaseConnected(false);
    }
  };

  useEffect(() => {    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🚀 Starting data load...');
        const connected = await checkSupabaseConnection();
        
        if (connected) {
          console.log('📡 Loading data from Supabase...');
          try {
            const results = await Promise.allSettled([
              fetchMenuSections(),
              fetchMenuItems(),
              fetchSpecialOffers()
            ]);
            
            // التحقق من نتائج العمليات
            const failedOperations = results.filter(result => result.status === 'rejected');
            if (failedOperations.length > 0) {
              console.warn('⚠️ Some Supabase operations failed, using fallback data');
              setError('فشل في تحميل بعض البيانات من الخادم، تم استخدام البيانات المحلية');
              setIsSupabaseConnected(false);
            } else {
              console.log('✅ All data loaded successfully from Supabase');
            }
          } catch (supabaseError) {
            console.warn('⚠️ Supabase data loading failed, using fallback data:', supabaseError);
            setError('فشل في تحميل البيانات من الخادم، تم استخدام البيانات المحلية');
            setIsSupabaseConnected(false);
          }
        } else {
          console.log('⚠️ Supabase not connected, using fallback data');
          setError('لا يمكن الاتصال بقاعدة البيانات، تم استخدام البيانات المحلية');
        }
      } catch (err) {
        console.error('❌ Failed to load data:', err);
        setError('حدث خطأ في تحميل البيانات، تم استخدام البيانات المحلية');
        setIsSupabaseConnected(false);
      } finally {
        setDataLoaded(true);
        setLoading(false);
        console.log('🏁 Data loading completed');
      }
    };

    loadData();
  }, [dataLoaded]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🚀 Starting data load...');
        const connected = await checkSupabaseConnection();
        
        if (connected) {
          console.log('📡 Loading data from Supabase...');
          try {
            const results = await Promise.allSettled([
              fetchMenuSections(),
              fetchMenuItems(),
              fetchSpecialOffers()
            ]);
            
            // التحقق من نتائج العمليات
            const failedOperations = results.filter(result => result.status === 'rejected');
            if (failedOperations.length > 0) {
              console.warn('⚠️ Some Supabase operations failed, using fallback data');
              setError('فشل في تحميل بعض البيانات من الخادم، تم استخدام البيانات المحلية');
              setIsSupabaseConnected(false);
            } else {
              console.log('✅ All data loaded successfully from Supabase');
            }
          } catch (supabaseError) {
            console.warn('⚠️ Supabase data loading failed, using fallback data:', supabaseError);
            setError('فشل في تحميل البيانات من الخادم، تم استخدام البيانات المحلية');
            setIsSupabaseConnected(false);
          }
        } else {
          console.log('⚠️ Supabase not connected, using fallback data');
          setError('لا يمكن الاتصال بقاعدة البيانات، تم استخدام البيانات المحلية');
        }
      } catch (err) {
        console.error('❌ Failed to load data:', err);
        setError('حدث خطأ في تحميل البيانات، تم استخدام البيانات المحلية');
        setIsSupabaseConnected(false);
      } finally {
        setDataLoaded(true);
        setLoading(false);
        console.log('🏁 Data loading completed');
      }
    };

    if (!dataLoaded) {
      loadData();
    }
  }, [dataLoaded]);
  // التأكد من إرجاع البيانات دائماً
  const finalMenuSections = getFormattedMenuSections;
  const finalSpecialOffers = getFormattedSpecialOffers;

  console.log('Final data check:', {
    menuSectionsCount: finalMenuSections.length,
    specialOffersCount: finalSpecialOffers.length,
    isSupabaseConnected,
    loading
  });

  return {
    menuSections: finalMenuSections,
    specialOffers: finalSpecialOffers,
    loading,
    error,
    isSupabaseConnected,
    refreshData: async () => {
      if (isSupabaseConnected) {
        console.log('🔄 Refreshing data...');
        setDataLoaded(false);
        try {
          await Promise.all([fetchMenuSections(), fetchMenuItems(), fetchSpecialOffers()]);
          setDataLoaded(true);
        } catch (err) {
          console.error('❌ Error refreshing data:', err);
          setDataLoaded(true);
        }
      }
    }
  };
};