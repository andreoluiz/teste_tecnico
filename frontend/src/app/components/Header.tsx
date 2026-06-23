import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import {
  LayoutDashboard,
  FlaskConical,
  Package,
  ShoppingCart,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  History,
} from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { key: "insumos", label: "Insumos", icon: FlaskConical, path: "/insumos" },
    { key: "estoque", label: "Estoque", icon: Package, path: "/estoque" },
    { key: "vendas", label: "Vendas", icon: ShoppingCart, path: "/vendas" },
    { key: "clientes", label: "Clientes", icon: BookOpen, path: "/clientes" },
    { key: "movimentacoes", label: "Movimentações", icon: History, path: "/movimentacoes" },
  ];

  const currentPath = location.pathname;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">S</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">SIGE</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-xl mx-auto">
          {navItems.map(({ key, label, icon: Icon, path }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={key}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Desktop User / Logout */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 w-[180px]">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <User className="size-3.5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700 truncate flex-1" title={userEmail}>
              {userEmail || "Carregando..."}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
          >
            <LogOut className="size-3.5" />
            <span>Sair</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 md:hidden transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 py-3 space-y-3">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ key, label, icon: Icon, path }) => {
              const isActive = currentPath === path;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(path);
                  }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              );
            })}
          </nav>
          
          <div className="h-px bg-gray-100 my-2" />

          <div className="flex items-center justify-between px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User className="size-3.5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700 max-w-[180px] truncate">{userEmail || "Carregando..."}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
