import React, { useState } from 'react';
import { User, Lock, Coffee, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // محاكاة تأخير تسجيل الدخول
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === 'Mm' && password === 'Mm123@#') {
      onLogin();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 font-['Tajawal'] flex items-center justify-center p-4">
      {/* خلفية فيديو */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black">
          <iframe
            src="https://www.youtube.com/embed/Nu8kIIL-CDA?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=Nu8kIIL-CDA&start=0"
            className="w-full h-full object-cover"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* شعار المقهى */}
        <div className="text-center mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-amber-200/50">
            <img 
              src="/mar.png" 
              alt="موال مراكش" 
              className="h-24 mx-auto mb-4 drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold mb-2" dir="rtl" style={{ color: '#87512f' }}>
              مقهى موال مراكش
            </h1>
            <p className="text-lg" dir="rtl" style={{ color: '#b8956f' }}>
              تجربة قهوة أصيلة بنكهة مغربية
            </p>
          </div>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-amber-200/50">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2" dir="rtl">
              تسجيل الدخول
            </h2>
            <p className="text-gray-600" dir="rtl">
              أدخل بياناتك للوصول إلى المنيو
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            {/* حقل اسم المستخدم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  placeholder="أدخل اسم المستخدم"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* معلومات إضافية */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500" dir="rtl">
              للحصول على بيانات الدخول، يرجى التواصل مع الإدارة
            </p>
          </div>
        </div>

        {/* معلومات التواصل */}
        <div className="mt-6 text-center">
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-amber-200/50">
            <p className="text-sm text-gray-600 mb-2" dir="rtl">
              للمساعدة أو الاستفسارات
            </p>
            <a 
              href="https://wa.me/966567833138" 
              className="text-amber-600 hover:text-amber-700 font-medium"
              dir="rtl"
            >
              📱 +966567833138
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;