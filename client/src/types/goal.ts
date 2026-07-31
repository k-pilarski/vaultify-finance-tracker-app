export interface Goal {
  id: string;
  name: string;
  targetAmount: number | string;
  currentAmount: number | string;
  deadline?: string | null;
  color: string;
  icon: string;
  userId: string;
  createdAt: string;
}

export interface CreateGoalData {
  name: string;
  targetAmount: number;
  deadline?: string | null;
  color: string;
  icon: string;
}

export interface DepositToGoalData {
  amount: number;
  categoryId: string;
  description?: string;
}
