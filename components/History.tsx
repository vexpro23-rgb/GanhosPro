import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RunRecord, AppSettings } from '../types';
import { Trash2, Edit, Calendar, DollarSign, Route, TrendingUp } from 'lucide-react';

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

  const handleEdit = (record: RunRecord) => {
    navigate('/', { state: { record: record } });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar este registro?')) {
      deleteRecord(id);
    }
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


  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6 text-brand-primary">Histórico de Corridas</h1>

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
          const profitPerKm = record.kmDriven > 0 ? netProfit / record.kmDriven : 0;

          return (
            <div key={record.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between animate-fade-in">
              <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <Calendar size={16} className="text-gray-400 mr-2" />
                    <span className="font-bold text-lg">{new Date(record.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center">
                        <DollarSign size={14} className={`mr-2 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span>Lucro: <span className={`font-semibold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                    </div>
                     <div className="flex items-center">
                        <TrendingUp size={14} className={`mr-2 ${profitPerKm >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
                        <span>R$/KM: <span className={`font-semibold ${profitPerKm >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{profitPerKm.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                    </div>
                     <div className="flex items-center">
                        <DollarSign size={14} className="mr-2 text-gray-400" />
                        <span>Bruto: <span className="font-semibold">{record.totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                    </div>
                    <div className="flex items-center">
                        <Route size={14} className="mr-2 text-yellow-400" />
                        <span>KM: <span className="font-semibold">{record.kmDriven}</span></span>
                    </div>
                  </div>
              </div>
              <div className="flex items-center mt-4 sm:mt-0 sm:ml-4 space-x-2">
                <button onClick={() => handleEdit(record)} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-transform transform hover:scale-110" aria-label="Editar">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(record.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-transform transform hover:scale-110" aria-label="Deletar">
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
