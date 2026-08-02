import React, { useState } from 'react';
import { 
  Target, PlusCircle, TrendingUp, PiggyBank, CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useGoals } from '../hooks/useGoals';
import { Goal } from '../types/goal';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { DepositModal } from '../components/goals/DepositModal';
import { Navbar } from '../components/layout/Navbar';

export const GoalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: goals, isLoading } = useGoals();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedDepositGoal, setSelectedDepositGoal] = useState<Goal | null>(null);

  const currencySymbol = user?.currency || 'PLN';

  // Calculate overall stats
  const totalTarget = goals?.reduce((acc, g) => acc + Number(g.targetAmount), 0) || 0;
  const totalCurrent = goals?.reduce((acc, g) => acc + Number(g.currentAmount), 0) || 0;
  const totalRemaining = Math.max(0, totalTarget - totalCurrent);
  const completedGoals = goals?.filter((g) => Number(g.currentAmount) >= Number(g.targetAmount)).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <Target className="text-blue-600" size={28} />
              Financial Goals & Savings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Set savings targets, track progress, and deposit funds seamlessly.
            </p>
          </div>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            <PlusCircle size={19} />
            <span>New Goal</span>
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <PiggyBank size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Saved</span>
              <span className="text-xl font-bold text-gray-900">
                {totalCurrent.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currencySymbol}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Target size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Targets</span>
              <span className="text-xl font-bold text-gray-900">
                {totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currencySymbol}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Remaining Need</span>
              <span className="text-xl font-bold text-gray-900">
                {totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currencySymbol}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Goals Reached</span>
              <span className="text-xl font-bold text-gray-900">
                {completedGoals} / {goals?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 h-64 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-xl mb-4 w-3/4" />
                <div className="h-6 bg-gray-200 rounded mb-2 w-1/2" />
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-10 bg-gray-200 rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDeposit={(g) => setSelectedDepositGoal(g)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
              <Target size={40} />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-gray-900">No Financial Goals Yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Start saving for your dreams today! Create your first goal to track progress and deposit funds automatically.
              </p>
            </div>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-md"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      <DepositModal
        goal={selectedDepositGoal}
        isOpen={!!selectedDepositGoal}
        onClose={() => setSelectedDepositGoal(null)}
      />
    </div>
  );
};
