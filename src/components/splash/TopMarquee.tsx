import Image from 'next/image';
import { CategoryItem } from '@/types/splash';

interface TopMarqueeProps {
  categories: CategoryItem[];
}

export default function TopMarquee({ categories }: TopMarqueeProps) {
  // Duplicate categories for seamless scroll
  const displayCategories = [...categories, ...categories];

  return (
    <div className="w-full mt-8 overflow-hidden">
      <div className="flex gap-4 animate-marquee-right">
        {displayCategories.map((category, index) => (
          <div
            key={`${category.id}-${index}`}
            className="relative w-64 h-40 rounded-2xl overflow-hidden border border-white/20 shadow-md flex-shrink-0"
          >
            <Image
              src={`/images/mainCategories/${category.image}`}
              alt={category.titleAr}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-end p-4">
              <span className="text-white font-bold text-base">
                {category.titleAr}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
