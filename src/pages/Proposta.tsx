import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Download, Copy, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Header from "@/components/Header";
import logo from "@/assets/logo.png";
import quemSomos from "@/assets/quem-somos.png";
import missaoVisao from "@/assets/missao-visao.png";
import abrangencia from "@/assets/abrangencia.png";
import servicos from "@/assets/servicos.png";
import frota from "@/assets/frota.png";
import diferenciais from "@/assets/diferenciais.png";
import vamosJuntos from "@/assets/vamos-juntos.png";
import carimbo from "@/assets/carimbo.jpg";

interface ProposalItem {
  id: string;
  veiculo: string;
  origem: string;
  destino: string;
  valorUnitario: string;
  quantidade: string;
  observacoes: string;
}

const Proposta = () => {
  const [items, setItems] = useState<ProposalItem[]>([
    { id: "1", veiculo: "", origem: "", destino: "", valorUnitario: "", quantidade: "1", observacoes: "" },
  ]);
  
  const [clientInfo, setClientInfo] = useState({
    cliente: "",
    cnpj: "",
    data: new Date().toISOString().split('T')[0],
    dataUtilizacaoInicio: "",
    dataUtilizacaoFim: "",
    localUtilizacao: "",
    observacoes: "",
    documentName: "",
  });
  
  const proposalRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const addItem = () => {
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      veiculo: "",
      origem: "",
      destino: "",
      valorUnitario: "",
      quantidade: "1",
      observacoes: "",
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      toast.error("Deve haver pelo menos um item na proposta");
    }
  };

  const duplicateItem = (id: string) => {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    const original = items[idx];
    const newItem: ProposalItem = { ...original, id: (Date.now() + Math.random()).toString() };
    const nextItems = [...items.slice(0, idx + 1), newItem, ...items.slice(idx + 1)];
    setItems(nextItems);
    toast.success("Item duplicado");
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = (valorUnitario: string, quantidade: string) => {
    const valor = parseFloat(valorUnitario.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const qtd = parseInt(quantidade) || 0;
    return valor * qtd;
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => {
      return sum + calculateTotal(item.valorUnitario, item.quantidade);
    }, 0);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const sanitizeFileName = (name: string) => {
    return name
      .replace(/[\\/:*?"<>|]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const generatePDF = async () => {
    if (!proposalRef.current) return;

    try {
      toast.loading("Gerando PDF completo... Isso pode levar alguns segundos");
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pdfRatio = pdfWidth / pdfHeight;

      // Forçar consistência de layout no PDF (mobile e desktop)
      type Unit = { top: number; height: number; isTotal?: boolean };
      const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
      let clonedUnits: Unit[] = [];
      let cloneContainerWidth = 0;
      // Array com todas as imagens na ordem
      const images = [
        logo,
        quemSomos,
        missaoVisao,
        abrangencia,
        servicos,
        frota,
        diferenciais,
      ];

      // Adicionar cada imagem como uma página com fundo preto
      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        
        // Adicionar fundo preto
        pdf.setFillColor(0, 0, 0);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        
        const img = await loadImage(images[i]);
        const imgRatio = img.width / img.height;
        
        let finalWidth, finalHeight, x, y;
        
        // Modo "contain" - mostra a imagem completa, mantendo proporções
        if (imgRatio > pdfRatio) {
          // Imagem proporcionalmente mais larga - ajustar pela largura
          finalWidth = pdfWidth;
          finalHeight = pdfWidth / imgRatio;
          x = 0;
          y = (pdfHeight - finalHeight) / 2;
        } else {
          // Imagem proporcionalmente mais alta - ajustar pela altura
          finalHeight = pdfHeight;
          finalWidth = pdfHeight * imgRatio;
          x = (pdfWidth - finalWidth) / 2;
          y = 0;
        }
        
        pdf.addImage(img, "PNG", x, y, finalWidth, finalHeight);
      }

      // Adicionar a proposta comercial editável com paginação automática
      pdf.addPage();
      
      const proposalCanvas = await html2canvas(proposalRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f5f5f5",
        windowWidth: isMobile ? 1200 : window.innerWidth,
        onclone: (doc) => {
          const el = doc.querySelector('[data-pdf-root]') as HTMLElement | null;
          if (el) {
            // Fixar largura do clone para manter padrão de desktop
            el.style.width = '1200px';
            el.style.maxWidth = '1200px';

            const containerRectClone = el.getBoundingClientRect();
            const buildUnitsFrom = (root: HTMLElement): Unit[] => {
              const out: Unit[] = [];
              const blocks = Array.from(root.querySelectorAll('[data-pdf-block]')) as HTMLElement[];
              blocks.forEach((block) => {
                const hasTable = !!block.querySelector('table');
                if (hasTable) {
                  const table = block.querySelector('table') as HTMLElement | null;
                  if (table) {
                    const thead = table.querySelector('thead') as HTMLElement | null;
                    if (thead) {
                      const rect = thead.getBoundingClientRect();
                      out.push({ top: rect.top - containerRectClone.top, height: rect.height });
                    }
                  }
                  const rows = Array.from(block.querySelectorAll('.pdf-row')) as HTMLElement[];
                  rows.forEach((row) => {
                    const rect = row.getBoundingClientRect();
                    out.push({ top: rect.top - containerRectClone.top, height: rect.height });
                  });
                  const totals = Array.from(block.querySelectorAll('.pdf-total')) as HTMLElement[];
                  totals.forEach((row) => {
                    const rect = row.getBoundingClientRect();
                    out.push({ top: rect.top - containerRectClone.top, height: rect.height, isTotal: true });
                  });
                } else {
                  const rect = block.getBoundingClientRect();
                  out.push({ top: rect.top - containerRectClone.top, height: rect.height });
                }
              });
              return out.sort((a, b) => a.top - b.top);
            };

            clonedUnits = buildUnitsFrom(el);
            cloneContainerWidth = containerRectClone.width;
          }
        }
      });
      const proposalImgData = proposalCanvas.toDataURL("image/png");
      const canvasWidth = proposalCanvas.width;
      const canvasHeight = proposalCanvas.height;
      
      // Margem vertical em mm para evitar corte de conteúdo
      const verticalMargin = 10;
      const usableHeight = pdfHeight - (verticalMargin * 2);
      
      // Altura de página em coordenadas do canvas (px), baseada no ratio do PDF
      const pageHeightInCanvas = (usableHeight * canvasWidth) / pdfWidth;

      // Medidas dos blocos para evitar cortes internos
      const container = proposalRef.current;
      const containerRect = container.getBoundingClientRect();
      const baseWidth = cloneContainerWidth || containerRect.width;
      const scaleFactor = canvasWidth / baseWidth; // html2canvas scale real

      const units: Unit[] = clonedUnits.length ? clonedUnits : (() => {
        const out: Unit[] = [];
        const blocks = Array.from(container.querySelectorAll('[data-pdf-block]')) as HTMLElement[];
        blocks.forEach((block) => {
          const hasTable = !!block.querySelector('table');
          if (hasTable) {
            const table = block.querySelector('table') as HTMLElement | null;
            if (table) {
              const thead = table.querySelector('thead') as HTMLElement | null;
              if (thead) {
                const rect = thead.getBoundingClientRect();
                out.push({ top: rect.top - containerRect.top, height: rect.height });
              }
            }
            const rows = Array.from(block.querySelectorAll('.pdf-row')) as HTMLElement[];
            rows.forEach((row) => {
              const rect = row.getBoundingClientRect();
              out.push({ top: rect.top - containerRect.top, height: rect.height });
            });
            const totals = Array.from(block.querySelectorAll('.pdf-total')) as HTMLElement[];
            totals.forEach((row) => {
              const rect = row.getBoundingClientRect();
              out.push({ top: rect.top - containerRect.top, height: rect.height, isTotal: true });
            });
          } else {
            const rect = block.getBoundingClientRect();
            out.push({ top: rect.top - containerRect.top, height: rect.height });
          }
        });
        return out.sort((a, b) => a.top - b.top);
      })();
      
      units.sort((a, b) => a.top - b.top);
      
      // Construir segmentos de corte respeitando limites de blocos/linhas
      const segments: { start: number; height: number }[] = [];
      let pageStart = 0; // início da página atual no canvas
      let pageLimit = pageStart + pageHeightInCanvas; // limite máximo da página atual
      
      // Zona de segurança extra para o total (em mm)
      const totalSafeZoneMm = 20;
      const totalSafeZoneCanvas = (totalSafeZoneMm * canvasWidth) / pdfWidth;
      
      for (let i = 0; i < units.length; i++) {
        const unitTopCanvas = units[i].top * scaleFactor;
        const unitBottomCanvas = (units[i].top + units[i].height) * scaleFactor;
        const unitHeightCanvas = units[i].height * scaleFactor;
        const isTotal = !!units[i].isTotal;
      
        const tooCloseForTotal = isTotal && (pageLimit - unitBottomCanvas) < totalSafeZoneCanvas;
      
        if (unitBottomCanvas <= pageLimit && !tooCloseForTotal) {
          // cabe na página atual, segue
          continue;
        } else {
          // se o bloco/linha é maior que a página, dividir internamente
          if (unitHeightCanvas > pageHeightInCanvas) {
            // fecha a página atual antes do bloco, se houver conteúdo
            if (pageStart < unitTopCanvas) {
              segments.push({ start: pageStart, height: unitTopCanvas - pageStart });
            }
            // dividir o bloco em várias páginas
            let bigStart = unitTopCanvas;
            let remaining = unitHeightCanvas;
            while (remaining > 0) {
              const take = Math.min(pageHeightInCanvas, remaining);
              segments.push({ start: bigStart, height: take });
              bigStart += take;
              remaining -= take;
            }
            pageStart = bigStart;
            pageLimit = pageStart + pageHeightInCanvas;
          } else {
            // iniciar nova página exatamente no início do bloco/linha
            segments.push({ start: pageStart, height: unitTopCanvas - pageStart });
            pageStart = unitTopCanvas;
            pageLimit = pageStart + pageHeightInCanvas;
          }
        }
      }
      
      // adicionar o restante do conteúdo
      if (pageStart < canvasHeight) {
        segments.push({ start: pageStart, height: canvasHeight - pageStart });
      }
      
      // Adicionar cada segmento como página do PDF com margem vertical
      segments.forEach((seg, idx) => {
        if (idx > 0) pdf.addPage();
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = seg.height;
        const tempCtx = tempCanvas.getContext('2d');
      
        if (tempCtx) {
          tempCtx.drawImage(
            proposalCanvas,
            0, seg.start, canvasWidth, seg.height,
            0, 0, canvasWidth, seg.height
          );
          const pageImgData = tempCanvas.toDataURL('image/png');
          const imgHeight = (pdfWidth * seg.height) / canvasWidth;
          pdf.addImage(pageImgData, 'PNG', 0, verticalMargin, pdfWidth, imgHeight);
        }
      });
      // Paginação por blocos e linhas aplicada acima.

      // Adicionar página final com fundo preto
      pdf.addPage();
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      const finalImg = await loadImage(vamosJuntos);
      const finalImgRatio = finalImg.width / finalImg.height;
      
      let finalWidth, finalHeight;
      if (finalImgRatio > pdfRatio) {
        // Imagem mais larga - ajustar pela largura
        finalWidth = pdfWidth;
        finalHeight = pdfWidth / finalImgRatio;
        pdf.addImage(finalImg, "PNG", 0, (pdfHeight - finalHeight) / 2, finalWidth, finalHeight);
      } else {
        // Imagem mais alta - ajustar pela altura
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * finalImgRatio;
        pdf.addImage(finalImg, "PNG", (pdfWidth - finalWidth) / 2, 0, finalWidth, finalHeight);
      }

      pdf.save(`${sanitizeFileName(clientInfo.documentName?.trim() || `Proposta Comercial — ${clientInfo.cliente || 'Cliente'}`)}.pdf`);
      toast.dismiss();
      toast.success("PDF gerado com sucesso! Todas as páginas foram incluídas");
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao gerar PDF. Tente novamente");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-2">
            CRIAR PROPOSTA COMERCIAL
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para gerar sua proposta
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Informações do Cliente</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome do Cliente</label>
              <Input
                value={clientInfo.cliente}
                onChange={(e) => setClientInfo({...clientInfo, cliente: e.target.value})}
                placeholder="Digite o nome do cliente"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">CNPJ</label>
              <Input
                value={clientInfo.cnpj}
                onChange={(e) => setClientInfo({...clientInfo, cnpj: e.target.value})}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data</label>
              <Input
                type="date"
                value={clientInfo.data}
                onChange={(e) => setClientInfo({...clientInfo, data: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Local de Utilização</label>
              <Input
                value={clientInfo.localUtilizacao}
                onChange={(e) => setClientInfo({...clientInfo, localUtilizacao: e.target.value})}
                placeholder="Digite o local de utilização"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Utilização - Início</label>
              <Input
                type="date"
                value={clientInfo.dataUtilizacaoInicio}
                onChange={(e) => setClientInfo({...clientInfo, dataUtilizacaoInicio: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Utilização - Fim</label>
              <Input
                type="date"
                value={clientInfo.dataUtilizacaoFim}
                onChange={(e) => setClientInfo({...clientInfo, dataUtilizacaoFim: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Observações</label>
            <Textarea
              value={clientInfo.observacoes}
              onChange={(e) => setClientInfo({...clientInfo, observacoes: e.target.value})}
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Nome do Documento (PDF)</label>
            <Input
              value={clientInfo.documentName}
              onChange={(e) => setClientInfo({...clientInfo, documentName: e.target.value})}
              placeholder="Ex: Proposta Comercial — Cliente XYZ"
            />
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Itens da Proposta</h2>
            <div className="flex items-center gap-3">
              <Button onClick={addItem} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Item
              </Button>
              <div className="px-2 py-1 text-xs font-semibold rounded bg-neutral-200 text-neutral-800">
                {items.length} itens
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="p-4 bg-muted rounded-lg space-y-4">
                <div className="grid md:grid-cols-12 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Veículo</label>
                    <Input
                      value={item.veiculo}
                      onChange={(e) => updateItem(item.id, "veiculo", e.target.value)}
                      placeholder="Ex: Van Executiva"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium mb-2 block">Origem</label>
                    <Input
                      value={item.origem}
                      onChange={(e) => updateItem(item.id, "origem", e.target.value)}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium mb-2 block">Destino</label>
                    <Input
                      value={item.destino}
                      onChange={(e) => updateItem(item.id, "destino", e.target.value)}
                      placeholder="Ex: Rio de Janeiro"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Valor Unitário</label>
                    <Input
                      value={item.valorUnitario}
                      onChange={(e) => updateItem(item.id, "valorUnitario", e.target.value)}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium mb-2 block">Qtd</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => updateItem(item.id, "quantidade", e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => duplicateItem(item.id)}
                      aria-label="Duplicar item"
                      title="Duplicar item"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remover item"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Observações do Item</label>
                  <Textarea
                    value={item.observacoes}
                    onChange={(e) => updateItem(item.id, "observacoes", e.target.value)}
                    placeholder="Observações específicas deste item (opcional)"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end mb-8">
          <Button onClick={generatePDF} size="lg" className="gap-2">
            <Download className="w-5 h-5" />
            Baixar PDF
          </Button>
        </div>

        {/* PDF Preview */}
        <div ref={proposalRef} data-pdf-root className="bg-neutral-100 p-4 md:p-8 lg:p-12 rounded-lg shadow-xl w-full max-w-full overflow-x-hidden mx-auto" style={{ maxWidth: '1200px' }}>
          <div className="mb-8" data-pdf-block>
            <div className="flex justify-end items-start mb-8 pb-6 border-b-4 border-primary">
              <div className="text-right text-sm">
                <p className="font-bold text-neutral-800">Data: {new Date(clientInfo.data).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 md:p-6 lg:p-8 rounded-xl mb-6 border-l-4 md:border-l-8 border-primary shadow-lg">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-neutral-900 mb-3 tracking-tight break-words">
                PROPOSTA COMERCIAL
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-neutral-700">
                {clientInfo.cliente && (
                  <p className="text-sm md:text-lg lg:text-xl font-bold break-words">Cliente: {clientInfo.cliente}</p>
                )}
                {clientInfo.cnpj && (
                  <p className="text-sm md:text-lg lg:text-xl font-bold break-words">CNPJ: {clientInfo.cnpj}</p>
                )}
                {clientInfo.localUtilizacao && (
                  <p className="text-sm md:text-base lg:text-lg font-semibold col-span-1 md:col-span-2 break-words">Local de Utilização: {clientInfo.localUtilizacao}</p>
                )}
                {(clientInfo.dataUtilizacaoInicio || clientInfo.dataUtilizacaoFim) && (
                  <p className="text-sm md:text-base lg:text-lg font-semibold col-span-1 md:col-span-2 break-words">
                    Período de Utilização: {clientInfo.dataUtilizacaoInicio ? new Date(clientInfo.dataUtilizacaoInicio).toLocaleDateString('pt-BR') : '___'} até {clientInfo.dataUtilizacaoFim ? new Date(clientInfo.dataUtilizacaoFim).toLocaleDateString('pt-BR') : '___'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8 overflow-x-auto" data-pdf-block>
            <table className="w-full border-collapse shadow-xl overflow-hidden rounded-xl min-w-[600px]">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-2 md:p-4 text-left font-black border-2 border-primary text-xs md:text-base">VEÍCULO</th>
                  <th className="p-2 md:p-4 text-left font-black border-2 border-primary text-xs md:text-base">ORIGEM</th>
                  <th className="p-2 md:p-4 text-left font-black border-2 border-primary text-xs md:text-base">DESTINO</th>
                  <th className="p-2 md:p-4 text-left font-black border-2 border-primary text-xs md:text-base">QTD</th>
                  <th className="p-2 md:p-4 text-left font-black border-2 border-primary text-xs md:text-base">VALOR UNIT.</th>
                  <th className="p-2 md:p-4 text-left font-black border-2 border-primary text-xs md:text-base">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const total = calculateTotal(item.valorUnitario, item.quantidade);
                  return (
                    <>
                      <tr key={item.id} className="bg-white border-b-2 border-neutral-200 pdf-row">
                        <td className="p-2 md:p-4 border-2 border-neutral-200 text-neutral-800 text-xs md:text-base break-words">{item.veiculo || "-"}</td>
                        <td className="p-2 md:p-4 border-2 border-neutral-200 text-neutral-800 text-xs md:text-base break-words">{item.origem || "-"}</td>
                        <td className="p-2 md:p-4 border-2 border-neutral-200 text-neutral-800 text-xs md:text-base break-words">{item.destino || "-"}</td>
                        <td className="p-2 md:p-4 border-2 border-neutral-200 text-neutral-800 text-xs md:text-base">{item.quantidade}</td>
                        <td className="p-2 md:p-4 border-2 border-neutral-200 text-neutral-800 text-xs md:text-base whitespace-nowrap">{item.valorUnitario || "R$ 0,00"}</td>
                        <td className="p-2 md:p-4 font-bold border-2 border-neutral-200 text-neutral-900 text-xs md:text-base whitespace-nowrap">{formatCurrency(total)}</td>
                      </tr>
                      {item.observacoes && (
                        <tr key={`${item.id}-obs`} className="bg-neutral-50 pdf-row">
                          <td colSpan={6} className="p-2 md:p-3 border-2 border-neutral-200 text-xs md:text-sm text-neutral-700 break-words">
                            <span className="font-semibold">Obs:</span> {item.observacoes}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-800 pdf-total">
                   <td colSpan={5} className="p-2 md:p-4 text-right font-black border-2 border-neutral-800 text-white text-xs md:text-base">
                     VALOR TOTAL:
                   </td>
                   <td className="p-2 md:p-4 font-black text-base md:text-2xl text-primary border-2 border-neutral-800 bg-white whitespace-nowrap">
                     {formatCurrency(calculateGrandTotal())}
                   </td>
                 </tr>
               </tfoot>
            </table>
          </div>

          {clientInfo.observacoes && (
            <div className="mb-6 bg-white p-4 md:p-6 rounded-xl border-l-4 border-primary shadow-md" data-pdf-block>
              <h3 className="font-black text-lg md:text-xl mb-3 text-neutral-900 break-words">Observações:</h3>
              <p className="text-xs md:text-sm whitespace-pre-line text-neutral-700 leading-relaxed break-words">{clientInfo.observacoes}</p>
            </div>
          )}

          <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t-4 border-primary text-xs md:text-sm" data-pdf-block>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-left">
                <p className="font-black text-neutral-900 text-sm md:text-base mb-2 break-words">
                  MZ GROOUP - Soluções Inteligentes em Transporte Executivo e Logística para Eventos
                </p>
                <p className="text-neutral-700 text-xs md:text-sm break-words">CNPJ: 35.274.028/0001-00</p>
                <p className="text-neutral-700 text-xs md:text-sm break-words">E-mail: mtzilmann@gmail.com</p>
              </div>
              <div className="flex-shrink-0">
                <img src={carimbo} alt="Carimbo MZ Transportes" className="h-16 md:h-20 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </main>
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          variant="default"
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 rounded-full shadow-lg z-50"
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default Proposta;
