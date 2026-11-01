export type TransactionType = 'income' | 'fixed_expense' | 'variable_expense' | 'savings';

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  color: string;
  initials: string;
  monthlyIncome?: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  memberId: string; // member id or 'common'
  status: 'cleared' | 'pending';
  isRecurring: boolean;
  notes?: string;
}

export interface CategoryBudget {
  id: string;
  name: string;
  budgetedAmount: number;
  iconName: string;
  color: string;
  type: 'needs' | 'wants' | 'savings'; // 50/30/20 standard
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  category: string;
  color: string;
}

export interface MonthSummary {
  totalIncome: number;
  totalFixed: number;
  totalVariable: number;
  totalSavings: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
}
