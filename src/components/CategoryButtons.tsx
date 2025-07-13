import React, { memo } from 'react';
import { MenuSection } from '../types/menu';

interface CategoryButtonsProps {
  sections: MenuSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const CategoryButtons: React.FC<CategoryButtonsProps> = memo(({ sections, activeSection, onSectionChange }) => {
  console.log('CategoryButtons received sections:', {
    count: sections.length,
    sections: sections.map(s => ({ id: s.id, title: s.title, itemsCount: s.items?.length || 0 }))
  });
  
  if (!sections || sections.length === 0) {
    return null; // إخفاء الرسالة لتسريع التحميل
  }

  return (
    <div className="category-grid grid gap-3 mb-8" style={{ willChange: 'transform' }}>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id.toString())}
          className={`p-4 rounded-xl border-2 transition-transform duration-150 ${
            activeSection === section.id.toString()
              ? 'text-white shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:shadow-lg hover:scale-105'
          }`}
          style={activeSection === section.id.toString()
            ? { background: `linear-gradient(to right, #d4a574, #c49660)`, borderColor: '#d4a574' }
            : { borderColor: '#d4a57450' }
          }
          aria-label={`قسم ${section.title}`}
        >
          <div className="text-2xl mb-2">{section.icon}</div>
          <div className="text-sm font-bold" dir="rtl">
            {section.title}
          </div>
        </button>
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // تحسين إعادة الرسم
  return prevProps.sections.length === nextProps.sections.length && 
         prevProps.activeSection === nextProps.activeSection;
});

CategoryButtons.displayName = 'CategoryButtons';

export default CategoryButtons;