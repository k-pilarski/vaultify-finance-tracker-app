export interface User {
  id: string;
  email: string;
  name?: string | null;
  currency: 'PLN' | 'EUR' | 'USD';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}
