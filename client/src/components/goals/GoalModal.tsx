import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Target, PiggyBank, Home, Car, Laptop, Plane, 
  ShieldCheck, Heart, ShoppingBag, Trophy, Wallet, 
  GraduationCap, Building, Gift, Sparkles, TrendingUp,
  Utensils, Coffee, Film, X 
} from 'lucide-react';
import { useCreateGoal } from '../../hooks/useGoals';

const ICONS: Record<string, React.ElementType> = {
  Target, PiggyBank, Home, Car, Laptop, Plane, 
  ShieldCheck, Heart, ShoppingBag, Trophy, Wallet, 
  GraduationCap, Building, Gift, Sparkles, TrendingUp,
  Utensils, Coffee, Film
};

const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#8B5CF6', // violet-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#EAB308', // yellow-500
  '#EF4444', // red-500
  '#06B6D4', // cyan-500
  '#6366F1', // indigo-500
  '#D946EF', // fuchsia-500
  '#22C55E', // green-500
  '#64748B', // slate-500
];

const goalFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.string().optional(),
  color: z.string().min(1, 'Please select a color'),
  icon: z.string().min(1, 'Please select an icon'),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose }) => {
  const createGoalMutation = useCreateGoal();

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      targetAmount: undefined,
      deadline: '',
      color: COLORS[0],
      icon: 'Target',
    },
  });

  const selectedColor = watch('color');
  const selectedIconName = watch('icon');
  const SelectedIcon = ICONS[selectedIconName] || Target;

  if (!isOpen) return null;

  const onSubmit = (data: GoalFormData) => {
    const payload = {
      name: data.name,
      targetAmount: data.targetAmount,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      color: data.color,
      icon: data.icon,
    };

    createGoalMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: (err: any) => {
        alert(err.response?.data?.error || 'Failed to create financial goal');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Create Financial Goal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Preview Badge */}
          <div className="flex justify-center mb-2">
            <div 
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white shadow-sm transition-colors duration-200"
              style={{ backgroundColor: selectedColor }}
            >
              <SelectedIcon size={20} />
              <span className="font-semibold">{watch('name') || 'Goal Name'}</span>
            </div>
          </div>

          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Vacation Fund, New Car"
                />
              )}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
            <Controller
              name="targetAmount"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              )}
            />
            {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount.message}</p>}
          </div>

          {/* Optional Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Deadline (Optional)</label>
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              )}
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${field.value === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => field.onChange(color)}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Icon</label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-6 gap-2.5 max-h-36 overflow-y-auto p-1 border border-gray-100 rounded-lg">
                  {Object.entries(ICONS).map(([name, IconComponent]) => (
                    <button
                      key={name}
                      type="button"
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                        field.value === name ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => field.onChange(name)}
                    >
                      <IconComponent size={20} />
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createGoalMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {createGoalMutation.isPending ? 'Saving...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
