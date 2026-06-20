import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Utilitário de requisição HTTP que injeta automaticamente o token JWT
 * de autenticação do Supabase nas chamadas para a API do Backend.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  console.log(`[apiFetch] Endpoint: ${endpoint} | Sessão ativa: ${!!session} | Token presente: ${!!token}`);

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn(`[apiFetch] Atenção: Nenhum token de acesso foi encontrado para o endpoint ${endpoint}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.warn(`[apiFetch] Erro 401 detectado no endpoint ${endpoint}. Efetuando logout e redirecionando...`);
    await supabase.auth.signOut();
    sessionStorage.setItem("session_expired", "true");
    window.location.href = "/";
    throw new Error("Sessão expirada. Redirecionando...");
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro na requisição à API");
  }

  return data;
}

