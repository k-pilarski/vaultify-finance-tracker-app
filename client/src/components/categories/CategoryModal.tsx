import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Wallet, Utensils, Car, Home, ShoppingBag, 
  Coffee, Heart, TrendingUp, Film, Laptop, X 
} from 'lucide-react';
import { useCreateCategory } from '../../hooks/useCategories';
import { TransactionType } from '../../types/category';

const ICONS: Record<string, React.ElementType> = {
  Wallet, Utensils, Car, Home, ShoppingBag, 
  Coffee, Heart, TrendingUp, Film, Laptop
};

const COLORS = [
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#EAB308', // yellow-500
  '#22C55E', // green-500
  '#10B981', // emerald-500
  '#06B6D4', // cyan-500
  '#3B82F6', // blue-500
  '#6366F1', // indigo-500
  '#8B5CF6', // violet-500
  '#D946EF', // fuchsia-500
  '#EC4899', // pink-500
  '#64748B', // slate-500
];

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().min(1, "Please select a color"),
  icon: z.string().min(1, "Please select an icon"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const createCategory = useCreateCategory();
  
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      color: COLORS[0],
      icon: 'Wallet',
    }
  });

  const selectedColor = watch('color');
  const selectedIconName = watch('icon');
  const SelectedIcon = ICONS[selectedIconName] || Wallet;

  if (!isOpen) return null;

  const onSubmit = (data: CategoryFormData) => {
    createCategory.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: (err: any) => {
        alert(err.response?.data?.error || "Failed to create category");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">New Category</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Preview Badge */}
          <div className="flex justify-center mb-4">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-sm transition-colors duration-200"
              style={{ backgroundColor: selectedColor }}
            >
              <SelectedIcon size={18} />
              <span className="font-medium">{watch('name') || 'Category Name'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Groceries"
                />
              )}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="EXPENSE"
                      checked={field.value === 'EXPENSE'}
                      onChange={() => field.onChange('EXPENSE')}
                      className="text-blue-500"
                    />
                    <span>Expense</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="INCOME"
                      checked={field.value === 'INCOME'}
                      onChange={() => field.onChange('INCOME')}
                      className="text-blue-500"
                    />
                    <span>Income</span>
                  </label>
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${field.value === color ? 'border-gray-800' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => field.onChange(color)}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(ICONS).map(([name, IconComponent]) => (
                    <button
                      key={name}
                      type="button"
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                        field.value === name ? 'bg-gray-200 shadow-inner' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => field.onChange(name)}
                    >
                      <IconComponent size={24} className={field.value === name ? 'text-gray-800' : 'text-gray-500'} />
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCategory.isPending}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCategory.isPending ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
