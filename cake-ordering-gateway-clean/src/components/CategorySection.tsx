
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';

interface CategorySectionProps {
  categories: Category[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  return (
    <section className="py-16 bg-gradient-to-b from-cake-lightpurple/10 to-transparent">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From traditional birthday cakes to creative custom designs,
            we have something delicious for every celebration.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link 
      to={`/products?category=${category.slug}`} 
      className="group relative overflow-hidden rounded-2xl h-64 hover-lift"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
      
      <img 
        src={category.image} 
        alt={category.name} 
        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
      />
      
      <div className="absolute bottom-0 left-0 w-full p-6 z-20">
        <h3 className="text-white text-xl font-semibold mb-1">{category.name}</h3>
        <p className="text-white/80 text-sm mb-3 line-clamp-2">{category.description}</p>
        
        <div className="flex items-center text-cake-pink opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="text-sm font-medium">View Collection</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default CategorySection;
