export interface User {
  username: string;
  password?: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    role: string;
    name: string;
  };
}

export interface AppState {
  currentUser: User | null;
  isLoading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
}
