import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ArrowRightLeft, DollarSign } from 'lucide-react';
import { Goal } from '../../types/goal';
import { useDepositToGoal } from '../../hooks/useGoals';
import { useCategories } from '../../hooks/useCategories';
import { useAuthStore } from '../../store/useAuthStore';

const depositSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  categoryId: z.string().min(1, 'Please select an expense category'),
  description: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

interface DepositModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ goal, isOpen, onClose }) => {
  const depositMutation = useDepositToGoal();
  const { data: categories, isLoading: isLoadingCategories } = useCategories('EXPENSE');
  const { user } = useAuthStore();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: undefined,
      categoryId: '',
      description: '',
    },
  });

  if (!isOpen || !goal) return null;

  const currencySymbol = user?.currency || 'PLN';

  const onSubmit = (data: DepositFormData) => {
    depositMutation.mutate(
      {
        goalId: goal.id,
        data: {
          amount: data.amount,
          categoryId: data.categoryId,
          description: data.description || `Deposit to goal: ${goal.name}`,
        },
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Failed to make deposit');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gray-800">
            <ArrowRightLeft className="text-blue-600" size={22} />
            <h2 className="text-xl font-bold">Deposit to Goal</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Goal summary header */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Target Goal</span>
              <h3 className="text-base font-bold text-gray-900">{goal.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Current Balance</span>
              <span className="text-sm font-bold text-gray-900">
                {Number(goal.currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} / {Number(goal.targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currencySymbol}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">
                <DollarSign size={18} />
              </div>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold"
                    placeholder="0.00"
                  />
                )}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-gray-400">
                {currencySymbol}
              </div>
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          {/* Expense Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Category (Expense)</label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={isLoadingCategories}
                >
                  <option value="">Select an expense category...</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            <p className="text-xs text-gray-500 mt-1">
              This deposit will automatically register an expense transaction under this category in your main budget.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note / Description (Optional)</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  placeholder={`Deposit to goal: ${goal.name}`}
                />
              )}
            />
          </div>

          {/* Submit */}
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
              disabled={depositMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {depositMutation.isPending ? 'Processing...' : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
