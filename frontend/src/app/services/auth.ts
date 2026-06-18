// API service layer for authentication

import type { LoginFormData, RegisterFormData, LoginResponse, RegisterResponse, ApiError } from "../types/auth";

const API_BASE_URL = "http://localhost:3000";

/**
 * Login user
 * POST /auth/login
 */
export async function loginUser(
  credentials: Pick<LoginFormData, "email" | "senha">
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        senha: credentials.senha,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        error: "Login Failed",
        message: data.message || "Email ou senha inválidos",
        statusCode: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if ((error as ApiError).statusCode) {
      throw error;
    }
    
    // Network or other errors
    throw {
      error: "Network Error",
      message: "Não foi possível conectar ao servidor",
      statusCode: 0,
    } as ApiError;
  }
}

/**
 * Register new user
 * POST /usuarios
 */
export async function registerUser(
  userData: Omit<RegisterFormData, "confirmSenha">
): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        role: userData.role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        error: "Registration Failed",
        message: data.message || "Erro ao criar usuário",
        statusCode: response.status,
      } as ApiError;
    }

    return data;
  } catch (error) {
    if ((error as ApiError).statusCode) {
      throw error;
    }
    
    // Network or other errors
    throw {
      error: "Network Error",
      message: "Não foi possível conectar ao servidor",
      statusCode: 0,
    } as ApiError;
  }
}
