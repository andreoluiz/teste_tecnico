// TypeScript interfaces for authentication

export interface LoginFormData {
  email: string;
  senha: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  nome: string;
  email: string;
  senha: string;
  confirmSenha: string;
  role: "ADMIN" | "GERENTE" | "VENDEDOR";
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export type Role = "ADMIN" | "GERENTE" | "VENDEDOR";
