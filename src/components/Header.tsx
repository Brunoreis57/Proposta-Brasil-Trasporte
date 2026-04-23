import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Brasil Transporte" className="h-12 md:h-16" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`font-semibold transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-foreground"
              }`}
            >
              Início
            </Link>
            <Link 
              to="/proposta" 
              className={`font-semibold transition-colors hover:text-primary ${
                isActive("/proposta") ? "text-primary" : "text-foreground"
              }`}
            >
              Criar Proposta
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
