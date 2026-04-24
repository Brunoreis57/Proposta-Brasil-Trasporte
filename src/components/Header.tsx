import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
            <img src={logo} alt="Brasil Transporte" className="h-10 md:h-16 w-auto" />
          </Link>
          
          {/* Desktop Nav */}
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground focus:outline-none"
            onClick={toggleMenu}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-border pt-4 animate-in slide-in-from-top duration-300">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className={`font-semibold text-lg py-2 transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-foreground"
              }`}
            >
              Início
            </Link>
            <Link 
              to="/proposta" 
              onClick={() => setIsMenuOpen(false)}
              className={`font-semibold text-lg py-2 transition-colors hover:text-primary ${
                isActive("/proposta") ? "text-primary" : "text-foreground"
              }`}
            >
              Criar Proposta
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
