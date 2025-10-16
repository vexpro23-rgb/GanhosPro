
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Calendar, DollarSign, Route as RouteIcon } from 'lucide-react';
import { RunRecord, AppSettings } from '../types';

interface HistoryProps {
    records: RunRecord[];
    addOrUpdateRecord: (record: RunRecord) => void;
    deleteRecord: (id: string) => void;
    settings: AppSettings;
}

const History: React.FC<HistoryProps> = ({ records, deleteRecord, settings }) => {
    const navigate = useNavigate();

    const handleEdit = (record: RunRecord) => {
        navigate('/', { state: { record } });
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja apagar este registro?')) {
            deleteRecord(id);
        }
    };

    // Show last 15 days, sorted by most recent date
    const sortedRecords = [...records]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 15);

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6 text-brand-primary">Histórico (Últimos 15 dias)</h1>
            {sortedRecords.length === 0 ? (
                <div className="text-center text-gray-400 bg-gray-800 p-6 rounded-lg">
                    <p>Nenhum registro encontrado.</p>
                    <p className="text-sm mt-2">Comece adicionando um registro na tela de Início.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {sortedRecords.map(record => {
                        const carCost = record.kmDriven * settings.costPerKm;
                        const grossProfit = record.totalEarnings - (record.additionalCosts || 0);
                        const netProfit = grossProfit - carCost;

                        return (
                            <li key={record.id} className="bg-gray-800 p-4 rounded-lg shadow-lg flex justify-between items-center">
                                <div className="flex-grow">
                                    <div className="flex items-center text-sm text-gray-400 mb-2">
                                        <Calendar size={14} className="mr-2" />
                                        <span>{new Date(record.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-300 ml-4">
                                            <DollarSign size={12} className="mr-1 text-green-500"/> {record.totalEarnings.toFixed(2)}
                                            <RouteIcon size={12} className="ml-3 mr-1 text-blue-400"/> {record.kmDriven} km
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2 ml-4">
                                    <button onClick={() => handleEdit(record)} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(record.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default History;
