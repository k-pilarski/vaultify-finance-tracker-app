import React from 'react';
import { useCategories, useDeleteCategory } from '../../hooks/useCategories';
import { 
  Wallet, Utensils, Car, Home, ShoppingBag, 
  Coffee, Heart, TrendingUp, Film, Laptop, Trash2
} from 'lucide-react';
import { TransactionType } from '../../types/category';

const ICONS: Record<string, React.ElementType> = {
  Wallet, Utensils, Car, Home, ShoppingBag, 
  Coffee, Heart, TrendingUp, Film, Laptop
};

interface CategoryListProps {
  type?: TransactionType;
}

export const CategoryList: React.FC<CategoryListProps> = ({ type }) => {
  const { data: categories, isLoading, error } = useCategories(type);
  const deleteCategory = useDeleteCategory();

  if (isLoading) return <div className="text-gray-500 py-4">Loading categories...</div>;
  if (error) return <div className="text-red-500 py-4">Error loading categories.</div>;
  if (!categories || categories.length === 0) return <div className="text-gray-500 py-4">No categories found.</div>;

  const handleDelete = (id: string, isDefault: boolean) => {
    if (isDefault) return;
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate(id, {
        onError: (err: any) => {
          alert(err.response?.data?.error || "Failed to delete category");
        }
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const IconComponent = ICONS[category.icon] || Wallet;
        
        return (
          <div
            key={category.id}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-white shadow-sm transition-all duration-200 pr-2"
            style={{ backgroundColor: category.color }}
          >
            <IconComponent size={16} />
            <span className="font-medium text-sm">{category.name}</span>
            
            {!category.isDefault ? (
              <button
                onClick={() => handleDelete(category.id, category.isDefault)}
                disabled={deleteCategory.isPending}
                className="ml-1 p-1 rounded-full bg-black/10 hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Delete category"
              >
                <Trash2 size={14} />
              </button>
            ) : (
              <div className="ml-1 w-6 h-6" /> /* Spacer for default categories to align nicely */
            )}
          </div>
        );
      })}
    </div>
  );
};
