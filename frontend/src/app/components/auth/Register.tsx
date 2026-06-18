import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { registerUser } from "../../services/auth";
import type { RegisterFormData, ApiError, Role } from "../../types/auth";

export function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    nome: "",
    email: "",
    senha: "",
    confirmSenha: "",
    role: "VENDEDOR",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Validation functions
  const validateName = (nome: string): string | undefined => {
    if (!nome) return "Nome é obrigatório";
    if (nome.length < 3) return "Nome deve ter no mínimo 3 caracteres";
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email é obrigatório";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Email inválido";
    return undefined;
  };

  const validatePassword = (senha: string): string | undefined => {
    if (!senha) return "Senha é obrigatória";
    if (senha.length < 6) return "Senha deve ter no mínimo 6 caracteres";
    return undefined;
  };

  const validateConfirmPassword = (confirmSenha: string, senha: string): string | undefined => {
    if (!confirmSenha) return "Confirmação de senha é obrigatória";
    if (confirmSenha !== senha) return "As senhas não coincidem";
    return undefined;
  };

  const validateRole = (role: string): string | undefined => {
    if (!role) return "Selecione um cargo";
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    const nameError = validateName(formData.nome);
    if (nameError) newErrors.nome = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.senha);
    if (passwordError) newErrors.senha = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.confirmSenha, formData.senha);
    if (confirmPasswordError) newErrors.confirmSenha = confirmPasswordError;

    const roleError = validateRole(formData.role);
    if (roleError) newErrors.role = roleError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await registerUser({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        role: formData.role,
      });

      if (response.success) {
        setSuccessMessage("Usuário cadastrado com sucesso! Redirecionando...");
        
        // Reset form
        setFormData({
          nome: "",
          email: "",
          senha: "",
          confirmSenha: "",
          role: "VENDEDOR",
        });

        // Here you would typically redirect to login or dashboard
        console.log("Registration successful:", response);
      }
    } catch (error) {
      const apiError = error as ApiError;
      setErrorMessage(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    
    // Clear global messages
    setSuccessMessage("");
    setErrorMessage("");
  };

  const roleOptions: { value: Role; label: string }[] = [
    { value: "ADMIN", label: "Administrador" },
    { value: "GERENTE", label: "Gerente" },
    { value: "VENDEDOR", label: "Vendedor" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <span className="text-white text-2xl font-bold">SIGE</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Criar conta</h1>
          <p className="text-gray-600 mt-2">Preencha os dados para criar sua conta</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="João Silva"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                aria-invalid={!!errors.nome}
                disabled={isLoading}
              />
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-invalid={!!errors.email}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  aria-invalid={!!errors.senha}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="text-sm text-red-600">{errors.senha}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmSenha">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmSenha}
                  onChange={(e) => handleInputChange("confirmSenha", e.target.value)}
                  aria-invalid={!!errors.confirmSenha}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.confirmSenha && (
                <p className="text-sm text-red-600">{errors.confirmSenha}</p>
              )}
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value as Role)}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="role"
                  aria-invalid={!!errors.role}
                >
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Criar conta
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2026 SIGE - Sistema Integrado de Gestão Empresarial
        </p>
      </div>
    </div>
  );
}
