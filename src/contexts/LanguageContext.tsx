'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.products': 'Products',
    'nav.branches': 'Branches',
    'nav.signIn': 'Sign In',
    'nav.bookNow': 'Book Now',
    'nav.dashboard': 'Dashboard',
    'nav.myBookings': 'My Bookings',
    'nav.logout': 'Logout',
    'nav.menu': 'Menu',
    'nav.quickActions': 'Quick Actions',
    'nav.trackBooking': 'Track Booking',
    'nav.locations': 'Our Locations',
    'nav.signInToBook': 'Sign In to Book',
    'branch.select': 'Select Branch',
    'branch.all': 'All Branches',
    'language.english': 'English',
    'language.arabic': 'العربية',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.services': 'الخدمات',
    'nav.products': 'المنتجات',
    'nav.branches': 'الفروع',
    'nav.signIn': 'تسجيل الدخول',
    'nav.bookNow': 'احجز الآن',
    'nav.dashboard': 'لوحة التحكم',
    'nav.myBookings': 'حجوزاتي',
    'nav.logout': 'تسجيل الخروج',
    'nav.menu': 'القائمة',
    'nav.quickActions': 'روابط سريعة',
    'nav.trackBooking': 'تتبع الحجز',
    'nav.locations': 'مواقعنا',
    'nav.signInToBook': 'سجل دخول للحجز',
    'branch.select': 'اختر الفرع',
    'branch.all': 'جميع الفروع',
    'language.english': 'English',
    'language.arabic': 'العربية',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['en', 'ar'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      document.documentElement.lang = savedLanguage;
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
