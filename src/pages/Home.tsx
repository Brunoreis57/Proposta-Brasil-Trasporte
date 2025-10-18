import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import logo from "@/assets/logo.png";
import quemSomos from "@/assets/quem-somos.png";
import missaoVisao from "@/assets/missao-visao.png";
import abrangencia from "@/assets/abrangencia.png";
import servicos from "@/assets/servicos.png";
import frota from "@/assets/frota.png";
import diferenciais from "@/assets/diferenciais.png";
import vamosJuntos from "@/assets/vamos-juntos.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <img src={logo} alt="MZ Grooup" className="mx-auto mb-8 w-64 md:w-80" />
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6">
              Soluções Inteligentes em Transporte
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Executivo e Logística para Eventos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/proposta">
                <Button size="lg" className="w-full sm:w-auto text-lg gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <FileText className="w-5 h-5" />
                  Criar Proposta Comercial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quem Somos */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <img 
            src={quemSomos} 
            alt="Quem Somos" 
            className="w-full max-w-5xl mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Missão e Visão */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <img 
            src={missaoVisao} 
            alt="Missão e Visão" 
            className="w-full max-w-5xl mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Abrangência Nacional */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <img 
            src={abrangencia} 
            alt="Abrangência Nacional" 
            className="w-full max-w-5xl mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Serviços */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <img 
            src={servicos} 
            alt="Serviços" 
            className="w-full max-w-5xl mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Frota Modernizada */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <img 
            src={frota} 
            alt="Frota Modernizada" 
            className="w-full max-w-5xl mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <img 
            src={diferenciais} 
            alt="Diferenciais MZ Grooup" 
            className="w-full max-w-5xl mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-foreground via-foreground to-primary/20">
        <div className="container mx-auto px-4">
          <img 
            src={vamosJuntos} 
            alt="Vamos Juntos" 
            className="w-full max-w-5xl mx-auto rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 MZ GROOUP - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
