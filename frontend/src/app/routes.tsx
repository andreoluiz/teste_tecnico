import { createBrowserRouter } from "react-router-dom";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Dashboard } from "./components/dashboard/Dashboard";
import { EstoquePage } from "./components/estoque/EstoquePage";
import { InsumosPage } from "./components/insumos/InsumosPage";
import { VendasPage } from "./components/vendas/VendasPage";

export const router = createBrowserRouter([
  { path: "/", Component: Login },
  { path: "/register", Component: Register },
  { path: "/dashboard", Component: Dashboard },
  { path: "/estoque", Component: EstoquePage },
  { path: "/insumos", Component: InsumosPage },
  { path: "/vendas", Component: VendasPage },
]);
