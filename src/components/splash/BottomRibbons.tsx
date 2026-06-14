import Image from 'next/image';
import { SubcategoryItem } from '@/types/splash';

interface BottomRibbonsProps {
  subcategories: SubcategoryItem[];
}

export default function BottomRibbons({ subcategories }: BottomRibbonsProps) {
  // Split into 3 ribbons
  const ribbon1 = subcategories.slice(0, 5);
  const ribbon2 = subcategories.slice(5, 10);
  const ribbon3 = subcategories.slice(10, 15);

  // Duplicate for seamless scroll
  const displayRibbon1 = [...ribbon1, ...ribbon1];
  const displayRibbon2 = [...ribbon2, ...ribbon2];
  const displayRibbon3 = [...ribbon3, ...ribbon3];

  return (
    <div className="w-full mb-10 flex flex-col gap-5 overflow-hidden">
      {/* Ribbon 1: Moving Left */}
      <div className="flex gap-4 animate-marquee-left">
        {displayRibbon1.map((sub, index) => (
          <div
            key={`${sub.id}-${index}`}
            className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/20 shadow-sm flex-shrink-0"
          >
            <Image
              src={`/images/subCategories/${sub.image}`}
              alt={sub.titleAr}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 h-7 bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {sub.titleAr}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ribbon 2: Moving Right */}
      <div className="flex gap-4 animate-marquee-right">
        {displayRibbon2.map((sub, index) => (
          <div
            key={`${sub.id}-${index}`}
            className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/20 shadow-sm flex-shrink-0"
          >
            <Image
              src={`/images/subCategories/${sub.image}`}
              alt={sub.titleAr}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 h-7 bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {sub.titleAr}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ribbon 3: Moving Left */}
      <div className="flex gap-4 animate-marquee-left">
        {displayRibbon3.map((sub, index) => (
          <div
            key={`${sub.id}-${index}`}
            className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/20 shadow-sm flex-shrink-0"
          >
            <Image
              src={`/images/subCategories/${sub.image}`}
              alt={sub.titleAr}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 h-7 bg-yellow-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {sub.titleAr}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
