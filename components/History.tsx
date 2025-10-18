import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RunRecord, AppSettings } from '../types';
import { Trash2, Calendar, Route, FileDown, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


interface HistoryProps {
  records: RunRecord[];
  deleteRecord: (id: string) => void;
  settings: AppSettings;
}

const History: React.FC<HistoryProps> = ({ records, deleteRecord, settings }) => {
  const navigate = useNavigate();

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  const handleViewDetails = (record: RunRecord) => {
    navigate('/', { state: { record: record } });
  };

  const handleDelete = (id: string, recordDate: string) => {
    toast((t) => (
        <div className="flex flex-col items-center text-center p-2">
            <h3 className="font-bold text-lg mb-2 text-red-400">Confirmar Exclusão</h3>
            <p className="text-sm mb-4">
                Tem certeza que deseja apagar o registro do dia {new Date(recordDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}?
                <br/>
                <span className="font-bold">Esta ação não pode ser desfeita.</span>
            </p>
            <div className="flex w-full space-x-2">
                 <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => {
                        deleteRecord(id);
                        toast.dismiss(t.id);
                        toast.success('Registro apagado com sucesso!');
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                    Confirmar
                </button>
            </div>
        </div>
    ), {
        duration: Infinity,
    });
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.error('Não há registros para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Data',
      'Ganhos Totais (R$)',
      'KM Rodados',
      'Horas Trabalhadas',
      'Custos Adicionais (R$)',
      'Lucro Líquido (R$)'
    ];

    const rows = sortedRecords.map(record => {
      const carCost = record.kmDriven * settings.costPerKm;
      const netProfit = record.totalEarnings - (record.additionalCosts || 0) - carCost;
      return [
        record.id,
        record.date,
        record.totalEarnings.toFixed(2),
        record.kmDriven.toFixed(2),
        record.hoursWorked?.toFixed(2) || '0.00',
        record.additionalCosts?.toFixed(2) || '0.00',
        netProfit.toFixed(2)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = `historico_ganhospro_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Exportação para CSV iniciada!');
  };

  const totalEarnings = useMemo(() => records.reduce((sum, r) => sum + r.totalEarnings, 0), [records]);
  const totalKm = useMemo(() => records.reduce((sum, r) => sum + r.kmDriven, 0), [records]);
  const totalNetProfit = useMemo(() => {
    return records.reduce((sum, r) => {
      const carCost = r.kmDriven * settings.costPerKm;
      const additionalCosts = r.additionalCosts || 0;
      const netProfit = r.totalEarnings - additionalCosts - carCost;
      return sum + netProfit;
    }, 0);
  }, [records, settings.costPerKm]);

  const handleExportPDF = () => {
    if (records.length === 0) {
      toast.error('Não há registros para exportar.');
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Relatório de Corridas - GanhosPro', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // Summary
    const summaryY = 32;
    doc.text(`Lucro Líquido Total: ${totalNetProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, summaryY);
    doc.text(`Ganhos Totais: ${totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, summaryY + 7);
    doc.text(`KM Rodados Totais: ${totalKm.toFixed(1)} km`, 14, summaryY + 14);

    // Table
    const tableColumns = ["Data", "Ganhos (R$)", "KM", "Custos (R$)", "Lucro Líquido (R$)"];
    const tableRows = sortedRecords.map(record => {
      const carCost = record.kmDriven * settings.costPerKm;
      const additionalCosts = record.additionalCosts || 0;
      const totalCosts = carCost + additionalCosts;
      const netProfit = record.totalEarnings - totalCosts;

      return [
        new Date(record.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        record.totalEarnings.toFixed(2),
        record.kmDriven.toFixed(1),
        totalCosts.toFixed(2),
        netProfit.toFixed(2),
      ];
    });

    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      const text = `Gerado em ${new Date().toLocaleDateString('pt-BR')} | Página ${i} de ${pageCount}`;
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.text(text, textOffset, doc.internal.pageSize.height - 10);
    }

    // Save
    const filename = `relatorio_ganhospro_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    toast.success('Exportação para PDF iniciada!');
  };

  if (records.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-10">
        <Calendar size={48} className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Nenhum registro encontrado</h2>
        <p className="mt-2">Comece a adicionar suas corridas na tela de Início.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">Histórico de Corridas</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            aria-label="Exportar para PDF"
          >
            <FileText size={18} />
            <span>PDF</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-brand-secondary hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            aria-label="Exportar para CSV"
          >
            <FileDown size={18} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-400">Lucro Líquido Total</p>
            <p className={`text-2xl font-bold ${totalNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalNetProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-400">Ganhos Totais</p>
            <p className="text-2xl font-bold text-brand-primary">{totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-400">KM Rodados Totais</p>
            <p className="text-2xl font-bold text-yellow-400">{totalKm.toFixed(1)} km</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedRecords.map((record) => {
          const carCost = record.kmDriven * settings.costPerKm;
          const netProfit = record.totalEarnings - (record.additionalCosts || 0) - carCost;
          
          return (
            <div 
                key={record.id} 
                className="bg-gray-800 rounded-lg shadow-md transition-all duration-300 overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700/50"
                onClick={() => handleViewDetails(record)}
            >
                <div className="flex items-center gap-4">
                    <Calendar size={24} className="text-gray-400 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-lg text-white">{new Date(record.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        <p className="flex items-center text-sm text-gray-400">
                            <Route size={14} className="mr-1.5" /> {record.kmDriven.toFixed(1)} km
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Lucro Líquido</p>
                        <p className={`font-bold text-lg ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(record.id, record.date); }} 
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-transform transform hover:scale-110" 
                        aria-label="Deletar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;