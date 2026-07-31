import React from 'react';
import { 
  Target, PiggyBank, Home, Car, Laptop, Plane, 
  ShieldCheck, Heart, ShoppingBag, Trophy, Wallet, 
  GraduationCap, Building, Gift, Sparkles, TrendingUp,
  Utensils, Coffee, Film, Calendar, Trash2, PlusCircle
} from 'lucide-react';
import { Goal } from '../../types/goal';
import { useDeleteGoal } from '../../hooks/useGoals';
import { useAuthStore } from '../../store/useAuthStore';

const ICONS: Record<string, React.ElementType> = {
  Target, PiggyBank, Home, Car, Laptop, Plane, 
  ShieldCheck, Heart, ShoppingBag, Trophy, Wallet, 
  GraduationCap, Building, Gift, Sparkles, TrendingUp,
  Utensils, Coffee, Film
};

interface GoalCardProps {
  goal: Goal;
  onDeposit: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onDeposit }) => {
  const deleteGoalMutation = useDeleteGoal();
  const { user } = useAuthStore();

  const IconComponent = ICONS[goal.icon] || Target;

  const currentAmount = Number(goal.currentAmount);
  const targetAmount = Number(goal.targetAmount);
  
  const percentage = Math.min(100, Math.max(0, targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0));
  const remaining = Math.max(0, targetAmount - currentAmount);

  const calculateDaysLeft = (deadlineStr: string): number => {
    const deadlineDate = new Date(deadlineStr);
    const now = new Date();
    // Normalize to midnight for clean day calculations
    deadlineDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = goal.deadline ? calculateDaysLeft(goal.deadline) : null;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete goal "${goal.name}"?`)) {
      deleteGoalMutation.mutate(goal.id);
    }
  };

  const currencySymbol = user?.currency || 'PLN';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-xl text-white shadow-sm flex items-center justify-center"
              style={{ backgroundColor: goal.color }}
            >
              <IconComponent size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">{goal.name}</h3>
              {daysLeft !== null && (
                <div className="flex items-center gap-1.5 text-xs mt-0.5 text-gray-500 font-medium">
                  <Calendar size={13} className="text-gray-400" />
                  {daysLeft > 0 ? (
                    <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                  ) : daysLeft === 0 ? (
                    <span className="text-amber-600 font-semibold">Due today</span>
                  ) : (
                    <span className="text-red-500 font-semibold">{Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'day' : 'days'} overdue</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleteGoalMutation.isPending}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete goal"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Amounts */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Balance</span>
            <span className="text-xs font-medium text-gray-500">Target: {targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currencySymbol}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-base font-semibold text-gray-500">{currencySymbol}</span>
            </span>
            <span className="text-sm font-bold text-blue-600">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden p-0.5 border border-gray-100">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              percentage >= 100 
                ? 'bg-emerald-500' 
                : 'bg-blue-600'
            }`}
            style={{ 
              width: `${percentage}%`,
              backgroundColor: percentage < 100 ? goal.color : undefined 
            }}
          />
        </div>

        {/* Remaining info */}
        <div className="flex justify-between text-xs text-gray-500 mb-6 font-medium bg-gray-50 px-3 py-2 rounded-lg">
          <span>Remaining needed:</span>
          <span className="font-semibold text-gray-700">
            {remaining > 0 
              ? `${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currencySymbol}`
              : 'Goal Reached! 🎉'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <button
        onClick={() => onDeposit(goal)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow active:scale-[0.99]"
      >
        <PlusCircle size={18} />
        <span>Deposit</span>
      </button>
    </div>
  );
};
