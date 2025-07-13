import React from 'react';
import { X, Instagram, Facebook, Twitter, Music } from 'lucide-react';

interface SocialMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialMediaModal: React.FC<SocialMediaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/mwal_marakish/',
      color: 'from-pink-500 to-purple-600',
      description: 'تابعنا على انستقرام'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/cafemwalmarakish/',
      color: 'from-blue-600 to-blue-700',
      description: 'تابعنا على فيسبوك'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://x.com/mwal_marakish',
      color: 'from-blue-400 to-blue-500',
      description: 'تابعنا على تويتر'
    },
    {
      name: 'TikTok',
      icon: Music,
      url: 'https://www.tiktok.com/@mwal_marakish',
      color: 'from-black to-gray-800',
      description: 'تابعنا على تيك توك'
    },
    {
      name: 'Snapchat',
      icon: () => (
        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
      ),
      url: 'https://www.snapchat.com/@mwalmarakis2024',
      color: 'from-yellow-400 to-yellow-500',
      description: 'تابعنا على سناب شات'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800" dir="rtl">
              تابعنا على وسائل التواصل
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* وصف */}
          <p className="text-gray-600 text-center mb-6" dir="rtl">
            تابعنا على حساباتنا في وسائل التواصل الاجتماعي لتبقى على اطلاع بآخر العروض والأخبار
          </p>

          {/* أزرار وسائل التواصل */}
          <div className="space-y-3">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full bg-gradient-to-r ${social.color} text-white p-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 font-semibold`}
                  dir="rtl"
                >
                  <IconComponent className="w-6 h-6" />
                  <span>{social.description}</span>
                </a>
              );
            })}
          </div>

          {/* معلومات إضافية */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500" dir="rtl">
              🎁 تابعنا واحصل على عروض حصرية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaModal;