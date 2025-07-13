import React from 'react';
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, Music } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="text-white py-12 relative z-20" style={{ background: `linear-gradient(to right, #c4a484, #b8956f)` }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* معلومات التواصل */}
          <div className="text-center md:text-right" dir="rtl">
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4" />
                <span>المدينة المنورة - حي النبلاء</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4" />
                <a href="https://wa.me/966567833138" className="hover:text-amber-200 transition-colors">
                  +966567833138
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                <span>marrakechmawal@gmail.com</span>
              </div>
            </div>
          </div>

          {/* أوقات العمل */}
          <div className="text-center" dir="rtl">
            <h3 className="text-xl font-bold mb-4">أوقات العمل</h3>
            <div className="space-y-2">
              <p className="text-2xl font-bold" style={{ color: '#f4d03f' }}>مفتوح 24 ساعة</p>
              <p style={{ color: '#f7dc6f' }}>جميع أيام الأسبوع</p>
            </div>
          </div>

          {/* وسائل التواصل الاجتماعي */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4" dir="rtl">تابعنا</h3>
            <div className="flex justify-center md:justify-start gap-3 flex-wrap">
              <a 
                href="https://www.instagram.com/mwal_marakish/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/cafemwalmarakish/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/mwal_marakish" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                title="X (Twitter)"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@mwal_marakish" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                title="TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
                </svg>
              </a>
              <a 
                href="https://www.snapchat.com/@mwalmarakis2024" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors bg-yellow-400/20"
                title="Snapchat"
              >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p style={{ color: '#f4d03f' }} dir="rtl">
            © 2024 مقهى موال مراكش - جميع الحقوق محفوظة
          </p>
          <p className="text-sm mt-2" style={{ color: '#f7dc6f' }} dir="rtl">
            تجربة قهوة أصيلة بنكهة مغربية في قلب المدينة المنورة
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;