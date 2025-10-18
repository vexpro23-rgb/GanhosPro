
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DollarSign, Route, Clock, Wrench, Calculator, Save, Info, Edit, ArrowLeft } from 'lucide-react';
import { RunRecord, AppSettings, CalculationResult } from '../types';

interface DashboardProps {
  records: RunRecord[];
  settings: AppSettings;
  addOrUpdateRecord: (record: RunRecord) => void;
  deleteRecord: (id: string) => void;
  isPremium: boolean;
}

const InputField: React.FC<{ icon: React.ReactNode; label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; type?: string; }> = ({ icon, label, id, value, onChange, placeholder, type = "number" }) => (
    <div className="mb-4">
        <label htmlFor={id} className="flex items-center text-sm font-medium text-gray-300 mb-2">
            {icon}
            <span className="ml-2">{label}</span>
        </label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            step="0.01"
            min="0"
        />
    </div>
);

const ResultCard: React.FC<{ title: string; value: string; color: string; }> = ({ title, value, color }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ records, settings, addOrUpdateRecord, deleteRecord, isPremium }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const recordFromState = location.state?.record as RunRecord | undefined;

    const [isDetailsView, setIsDetailsView] = useState(!!recordFromState);
    const [id, setId] = useState(recordFromState?.id || crypto.randomUUID());
    const [date, setDate] = useState(recordFromState?.date || new Date().toISOString().split('T')[0]);
    const [totalEarnings, setTotalEarnings] = useState(recordFromState?.totalEarnings?.toString() || '');
    const [kmDriven, setKmDriven] = useState(recordFromState?.kmDriven?.toString() || '');
    const [hoursWorked, setHoursWorked] = useState(recordFromState?.hoursWorked?.toString() || '');
    const [additionalCosts, setAdditionalCosts] = useState(recordFromState?.additionalCosts?.toString() || '');
    const [result, setResult] = useState<CalculationResult | null>(null);

    const performCalculation = () => {
        const earnings = parseFloat(totalEarnings);
        const km = parseFloat(kmDriven);
        const hours = hoursWorked ? parseFloat(hoursWorked) : 0;
        const costs = additionalCosts ? parseFloat(additionalCosts) : 0;

        if (isNaN(earnings) || isNaN(km) || km <= 0) {
            if (!recordFromState) { // Only toast if it's a manual calculation
              toast.error('Ganhos Totais e KM Rodados são obrigatórios e KM deve ser maior que zero.');
            }
            return;
        }

        const carCost = km * settings.costPerKm;
        const grossProfit = earnings - costs;
        const netProfit = grossProfit - carCost;
        const profitPerKm = netProfit / km;
        const profitPerHour = hours > 0 ? netProfit / hours : 0;
        const grossEarningsPerKm = earnings / km;

        setResult({
            totalEarnings: earnings,
            grossEarningsPerKm,
            grossProfit,
            carCost,
            netProfit,
            profitPerKm,
            profitPerHour
        });
    };

    const handleCalculateClick = () => {
        const recordToOverwrite = records.find(r => r.date === date && r.id !== id);

        if (recordToOverwrite) {
             toast((t) => (
                <div className="flex flex-col items-center text-center p-2">
                    <h3 className="font-bold text-lg mb-2 text-yellow-400">Aviso de Sobrescrita</h3>
                    <p className="text-sm mb-4">
                        Já existe um registro para {new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.
                        Deseja continuar? O registro antigo será substituído ao salvar.
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
                                performCalculation();
                                toast.dismiss(t.id);
                            }}
                            className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            ), {
                duration: Infinity,
            });
        } else {
            performCalculation();
        }
    };
    
    useEffect(() => {
        if(recordFromState){
            performCalculation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordFromState]);


    const handleSave = () => {
        if (!result) {
            toast.error('Calcule os resultados antes de salvar.');
            return;
        }

        const isUpdating = records.some(r => r.id === id);
        const recordToOverwrite = records.find(r => r.date === date && r.id !== id);

        if (!isPremium && !isUpdating && !recordToOverwrite && records.length >= 15) {
            toast((t) => (
                <div className="flex flex-col items-center text-center p-2">
                    <h3 className="font-bold text-lg mb-2 text-brand-primary">Limite Gratuito Atingido</h3>
                    <p className="text-sm mb-4">
                        Você atingiu o limite de 15 registros. Para continuar, apague um registro antigo ou assine o Premium para registros ilimitados.
                    </p>
                    <div className="flex w-full space-x-2">
                         <button
                            onClick={() => {
                                navigate('/history');
                                toast.dismiss(t.id);
                            }}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                            Ver Histórico
                        </button>
                        <button
                            onClick={() => {
                                navigate('/premium');
                                toast.dismiss(t.id);
                            }}
                            className="flex-1 bg-brand-accent hover:opacity-90 text-gray-900 font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                            Ir para Premium
                        </button>
                    </div>
                </div>
            ), {
                duration: 10000,
            });
            return;
        }

        if (recordToOverwrite) {
            deleteRecord(recordToOverwrite.id);
        }
        
        const record: RunRecord = {
            id,
            date,
            totalEarnings: parseFloat(totalEarnings),
            kmDriven: parseFloat(kmDriven),
            hoursWorked: hoursWorked ? parseFloat(hoursWorked) : undefined,
            additionalCosts: additionalCosts ? parseFloat(additionalCosts) : undefined,
        };

        addOrUpdateRecord(record);
        
        let successMessage: string;
        if (recordToOverwrite) {
             successMessage = 'Registro sobrescrito com sucesso!';
        } else if (isUpdating) {
            successMessage = 'Registro atualizado!';
        } else {
            successMessage = 'Registro salvo com sucesso!';
        }

        toast.success(successMessage);
        navigate('/history');
    };

    const handleReset = () => {
        setId(crypto.randomUUID());
        setDate(new Date().toISOString().split('T')[0]);
        setTotalEarnings('');
        setKmDriven('');
        setHoursWorked('');
        setAdditionalCosts('');
        setResult(null);
        setIsDetailsView(false);
        navigate('/', { state: {}, replace: true });
    };

    const formattedResults = useMemo(() => {
      if (!result) return null;
      return {
        totalEarnings: result.totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        grossEarningsPerKm: result.grossEarningsPerKm.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        grossProfit: result.grossProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        carCost: result.carCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        netProfit: result.netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        profitPerKm: result.profitPerKm.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        profitPerHour: result.profitPerHour.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      }
    }, [result]);

    const renderResultView = (isDetails: boolean) => (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in-up">
            <h2 className="text-xl font-semibold text-center mb-4">
                {isDetails ? `Detalhes de ${new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : 'Resumo do Dia'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-gray-900/50 p-4 rounded-lg shadow-md text-center">
                    <p className="text-base font-medium text-gray-300">Lucro Líquido</p>
                    <p className={`text-4xl font-bold ${result!.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formattedResults!.netProfit}</p>
                </div>
                <ResultCard title="Lucro/KM" value={formattedResults!.profitPerKm} color={result!.profitPerKm >= 0 ? 'text-green-400' : 'text-red-400'} />
                <ResultCard title="Lucro/Hora" value={formattedResults!.profitPerHour} color={result!.profitPerHour >= 0 ? 'text-green-400' : 'text-red-400'} />
                <ResultCard title="Ganho Bruto" value={formattedResults!.totalEarnings} color="text-blue-400" />
                <ResultCard title="Custo do Carro" value={formattedResults!.carCost} color="text-yellow-400" />
                 <div className="col-span-2">
                    <ResultCard title="R$/KM Bruto" value={formattedResults!.grossEarningsPerKm} color="text-indigo-400" />
                </div>
            </div>
             {isDetails ? (
                <>
                    <button onClick={() => setIsDetailsView(false)} className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105">
                        <Edit size={20} className="mr-2"/>
                        Editar Registro
                    </button>
                    <button onClick={() => navigate('/history')} className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition">
                        <ArrowLeft size={20} className="mr-2" />
                        Voltar ao Histórico
                    </button>
                </>
             ) : (
                <>
                    <button onClick={handleSave} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105">
                        <Save size={20} className="mr-2"/>
                        {recordFromState ? 'Atualizar Registro' : 'Salvar Registro'}
                    </button>
                    <button onClick={handleReset} className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition">
                        <Calculator size={20} className="mr-2" />
                        Fazer Novo Cálculo
                    </button>
                </>
             )}
        </div>
    );

    return (
        <div className="max-w-md mx-auto">
             <h1 className="text-2xl font-bold text-center mb-6 text-brand-primary">
                 {isDetailsView ? 'Detalhes do Registro' : (result ? 'Seu Resultado' : (recordFromState ? 'Editar Registro' : 'Calculadora Diária'))}
            </h1>

            {settings.costPerKm === 0 && (
                <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg relative mb-4 text-sm flex items-start" role="alert">
                    <Info size={18} className="mr-3 mt-1 flex-shrink-0" />
                    <div>
                        <strong className="font-bold">Atenção!</strong>
                        <span className="block sm:inline ml-1">Seu custo por KM está definido como 0. Vá para a tela de <button onClick={() => navigate('/settings')} className="font-bold underline">Ajustes</button> para configurar e obter cálculos precisos.</span>
                    </div>
                </div>
            )}
            
            {result && !isDetailsView ? renderResultView(false) : null}
            {result && isDetailsView ? renderResultView(true) : null}

            {!result && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6 animate-fade-in-up">
                    <InputField icon={<DollarSign size={18}/>} label="Ganhos Totais (R$)" id="totalEarnings" value={totalEarnings} onChange={e => setTotalEarnings(e.target.value)} placeholder="Ex: 250.50" />
                    <InputField icon={<Route size={18}/>} label="KM Rodados" id="kmDriven" value={kmDriven} onChange={e => setKmDriven(e.target.value)} placeholder="Ex: 180" />
                    <InputField icon={<Clock size={18}/>} label="Horas Trabalhadas (Opcional)" id="hoursWorked" value={hoursWorked} onChange={e => setHoursWorked(e.target.value)} placeholder="Ex: 8.5" />
                    <InputField icon={<Wrench size={18}/>} label="Custos Adicionais (Opcional)" id="additionalCosts" value={additionalCosts} onChange={e => setAdditionalCosts(e.target.value)} placeholder="Ex: 25 (água, balas)" />
                    <div className="mb-4">
                        <label htmlFor="date" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                            <span className="ml-2">Data</span>
                        </label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:outline-none transition" />
                    </div>
                    <button onClick={handleCalculateClick} className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105">
                        <Calculator size={20} className="mr-2"/>
                        Calcular
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
