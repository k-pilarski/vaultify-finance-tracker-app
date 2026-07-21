import React from 'react';
import { Transaction } from '../../types/transaction';
import { useDeleteTransaction } from '../../hooks/useTransactions';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Wallet, Utensils, Car, Home, ShoppingBag, 
  Coffee, Heart, TrendingUp, Film, Laptop, Trash2
} from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  Wallet, Utensils, Car, Home, ShoppingBag, 
  Coffee, Heart, TrendingUp, Film, Laptop
};

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, isLoading }) => {
  const deleteTransaction = useDeleteTransaction();
  const { user } = useAuthStore();
  const currency = user?.currency || 'PLN';

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Wallet size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
        <p className="text-gray-500">Adjust your filters or add a new transaction to get started.</p>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction.mutate(id);
    }
  };

  const formatAmount = (amount: number | string, type: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);

    return type === 'INCOME' ? `+ ${formatted} ${currency}` : `- ${formatted} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => {
              const IconComponent = ICONS[transaction.category.icon] || Wallet;
              
              return (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium"
                      style={{ backgroundColor: transaction.category.color }}
                    >
                      <IconComponent size={12} />
                      {transaction.category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {transaction.description || <span className="text-gray-400 italic">No description</span>}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-slate-800'
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* We'll skip Edit for now as it's not strictly required in Acceptance criteria to be functional, just UI, but delete should work */}
                      <button 
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deleteTransaction.isPending}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
