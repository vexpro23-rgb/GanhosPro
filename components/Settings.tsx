
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Save, Info, Calculator, Droplet, Zap, Blend, PlusCircle, Car, Wrench, Shield, FileText, Route, Crown } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  isPremium: boolean;
}

const InputField: React.FC<{ icon?: React.ReactNode; label: string; helper?: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; }> = ({ icon, label, helper, id, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="flex items-center text-sm font-medium text-gray-300 mb-2">
            {icon}
            <span className={icon ? "ml-2" : ""}>{label}</span>
            {helper && <span className="ml-1 text-xs text-gray-400">({helper})</span>}
        </label>
        <input
            id={id}
            type="number"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            step="0.01"
            min="0"
        />
    </div>
);

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, isPremium }) => {
  const navigate = useNavigate();
  const [costPerKm, setCostPerKm] = useState(settings.costPerKm.toString());
  const [activeTab, setActiveTab] = useState('combustion');

  // Fuel calculator states
  const [refuelCost, setRefuelCost] = useState('');
  const [kmOnRefuel, setKmOnRefuel] = useState('');
  const [chargeCost, setChargeCost] = useState('');
  const [autonomy, setAutonomy] = useState('');
  const [totalGasolineCost, setTotalGasolineCost] = useState('');
  const [totalElectricCost, setTotalElectricCost] = useState('');
  const [totalKmDriven, setTotalKmDriven] = useState('');
  
  // Advanced calculator states
  const [advancedCosts, setAdvancedCosts] = useState({
    vehicle: '',
    maintenance: '',
    insurance: '',
    taxes: '',
    others: '',
    monthlyKm: ''
  });

  const handleAdvancedCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAdvancedCosts(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    const cost = parseFloat(costPerKm);
    if (isNaN(cost) || cost < 0) {
      toast.error('Por favor, insira um valor válido para o custo por KM.');
      return;
    }
    setSettings({ costPerKm: cost });
    toast.success('Configurações salvas!');
  };

  const calculateAndSetCost = () => {
    let fuelCostPerKm = 0;
    const refuelCostVal = parseFloat(refuelCost);
    const kmOnRefuelVal = parseFloat(kmOnRefuel);
    const chargeCostVal = parseFloat(chargeCost);
    const autonomyVal = parseFloat(autonomy);
    const totalGasolineCostVal = parseFloat(totalGasolineCost);
    const totalElectricCostVal = parseFloat(totalElectricCost);
    const totalKmDrivenVal = parseFloat(totalKmDriven);

    if (activeTab === 'combustion' && refuelCostVal > 0 && kmOnRefuelVal > 0) {
        fuelCostPerKm = refuelCostVal / kmOnRefuelVal;
    } else if (activeTab === 'electric' && chargeCostVal >= 0 && autonomyVal > 0) {
        fuelCostPerKm = chargeCostVal / autonomyVal;
    } else if (activeTab === 'hybrid' && (totalGasolineCostVal >= 0 && totalElectricCostVal >= 0) && totalKmDrivenVal > 0) {
        fuelCostPerKm = (totalGasolineCostVal + totalElectricCostVal) / totalKmDrivenVal;
    }
    
    let advancedCostPerKm = 0;
    if (isPremium) {
        const { vehicle, maintenance, insurance, taxes, others, monthlyKm: kmString } = advancedCosts;
        const monthlyKm = parseFloat(kmString) || 0;
        const anyAdvancedCostFilled = (parseFloat(vehicle) || 0) > 0 || (parseFloat(maintenance) || 0) > 0 || (parseFloat(insurance) || 0) > 0 || (parseFloat(taxes) || 0) > 0 || (parseFloat(others) || 0) > 0;

        if (anyAdvancedCostFilled && monthlyKm <= 0) {
            toast.error('A "Média de KMs Rodados" é obrigatória ao adicionar outros custos.');
            return;
        }

        if (monthlyKm > 0) {
            const totalMonthlyAdvancedCost = 
              (parseFloat(vehicle) || 0) +
              (parseFloat(maintenance) || 0) +
              (parseFloat(insurance) || 0) +
              ((parseFloat(taxes) || 0) / 12) +
              (parseFloat(others) || 0);
            
            advancedCostPerKm = totalMonthlyAdvancedCost / monthlyKm;
        }
    }
    
    const totalCost = fuelCostPerKm + advancedCostPerKm;

    if (totalCost <= 0 && fuelCostPerKm <= 0 && advancedCostPerKm <= 0) {
        toast.error('Preencha os campos de pelo menos uma das seções da calculadora para obter um resultado.');
        return;
    }
    
    const finalCost = totalCost.toFixed(2);
    setCostPerKm(finalCost);
    toast.success(`Custo por KM atualizado para R$ ${finalCost}. Clique em Salvar para confirmar.`);
  };


  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6 text-brand-primary">Ajustes</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
        <label htmlFor="costPerKm" className="block text-sm font-medium text-gray-300 mb-2">
          Custo por KM (R$)
        </label>
        <input
          id="costPerKm"
          type="number"
          value={costPerKm}
          onChange={(e) => setCostPerKm(e.target.value)}
          placeholder="Ex: 0.75"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          step="0.01"
          min="0"
        />
        <button onClick={handleSave} className="w-full mt-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105">
          <Save size={20} className="mr-2" />
          Salvar
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
            <h2 className="text-lg font-semibold text-center mb-4 flex items-center justify-center">
                <Calculator size={20} className="mr-2 text-brand-accent" />
                Não sabe seu custo? Calcule aqui!
            </h2>
            <div className="flex border-b border-gray-700 mb-4">
                <button 
                    onClick={() => setActiveTab('combustion')} 
                    className={`flex-1 py-2 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'combustion' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    <Droplet size={16} className="mr-2" /> Combustão
                </button>
                <button 
                    onClick={() => setActiveTab('hybrid')}
                    className={`flex-1 py-2 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'hybrid' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    <Blend size={16} className="mr-2" /> Híbrido
                </button>
                <button 
                    onClick={() => setActiveTab('electric')}
                    className={`flex-1 py-2 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'electric' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    <Zap size={16} className="mr-2" /> Elétrico
                </button>
            </div>
            
            <div className="animate-fade-in">
                {activeTab === 'combustion' && (
                    <>
                        <div className="bg-gray-700/50 p-3 rounded-lg text-xs text-center text-gray-300 mb-4">
                        Use os dados do seu último abastecimento para um cálculo preciso.
                        </div>
                        <InputField label="Valor do Abastecimento (R$)" id="refuelCost" value={refuelCost} onChange={e => setRefuelCost(e.target.value)} placeholder="Ex: 250.00" />
                        <InputField label="KM Rodados" id="kmOnRefuel" value={kmOnRefuel} onChange={e => setKmOnRefuel(e.target.value)} placeholder="Ex: 450" />
                    </>
                )}
                
                {activeTab === 'electric' && (
                    <>
                        <InputField label="Custo da Recarga Completa (R$)" id="chargeCost" value={chargeCost} onChange={e => setChargeCost(e.target.value)} placeholder="Ex: 40.00" />
                        <InputField label="Autonomia com Carga Completa (KM)" id="autonomy" value={autonomy} onChange={e => setAutonomy(e.target.value)} placeholder="Ex: 350" />
                    </>
                )}

                {activeTab === 'hybrid' && (
                    <>
                        <InputField label="Gasto Total com Combustível (R$)" id="totalGasolineCost" value={totalGasolineCost} onChange={e => setTotalGasolineCost(e.target.value)} placeholder="Ex: 350.00" />
                        <InputField label="Gasto Total com Eletricidade (R$)" id="totalElectricCost" value={totalElectricCost} onChange={e => setTotalElectricCost(e.target.value)} placeholder="Ex: 80.00" />
                        <InputField label="Total de KM Rodados" id="totalKmDriven" value={totalKmDriven} onChange={e => setTotalKmDriven(e.target.value)} placeholder="Ex: 1200" />
                    </>
                )}
            </div>

            {isPremium ? (
                <div className="animate-fade-in">
                    <hr className="border-gray-600 my-6" />
                    <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center">
                        <PlusCircle size={20} className="mr-2 text-brand-accent" />
                        Adicionar Custos Fixos e Variáveis
                    </h3>
                    <div className="space-y-4">
                        <InputField icon={<Car size={18}/>} label="Parcela ou Aluguel" id="vehicle" value={advancedCosts.vehicle} onChange={handleAdvancedCostChange} placeholder="Ex: 1500" helper="mensal"/>
                        <InputField icon={<Wrench size={18}/>} label="Manutenção" id="maintenance" value={advancedCosts.maintenance} onChange={handleAdvancedCostChange} placeholder="Ex: 300" helper="média mensal"/>
                        <InputField icon={<Shield size={18}/>} label="Seguro" id="insurance" value={advancedCosts.insurance} onChange={handleAdvancedCostChange} placeholder="Ex: 250" helper="mensal"/>
                        <InputField icon={<FileText size={18}/>} label="Impostos e Licenciamento" id="taxes" value={advancedCosts.taxes} onChange={handleAdvancedCostChange} placeholder="Ex: 1800" helper="anual"/>
                        <InputField icon={<PlusCircle size={18}/>} label="Outros Custos" id="others" value={advancedCosts.others} onChange={handleAdvancedCostChange} placeholder="Ex: 100" helper="média mensal"/>
                        <hr className="border-gray-600 my-2" />
                        <InputField icon={<Route size={18}/>} label="Média de KMs Rodados" id="monthlyKm" value={advancedCosts.monthlyKm} onChange={handleAdvancedCostChange} placeholder="Ex: 5000" helper="por mês"/>
                    </div>
                </div>
            ) : (
                <div className="mt-6 bg-gray-900/50 p-4 rounded-lg text-center">
                    <p className="font-bold text-yellow-300 flex items-center justify-center"><Crown size={18} className="mr-2"/> Função Premium</p>
                    <p className="text-sm text-gray-300 mt-2 mb-3">
                    Tenha um cálculo completo adicionando custos de manutenção, seguro e mais para um R$/KM ultra preciso.
                    </p>
                    <button onClick={() => navigate('/premium')} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                        Desbloquear com Premium
                    </button>
                </div>
            )}


            <button onClick={calculateAndSetCost} className="w-full mt-6 bg-brand-accent hover:opacity-90 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition">
                {isPremium ? 'Calcular Custo Total e Usar' : 'Calcular Custo e Usar'}
            </button>
      </div>

      <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg text-sm flex items-start">
        <Info size={18} className="mr-3 mt-1 flex-shrink-0" />
        <div>
          <strong className="font-bold">Como calcular seu custo por KM?</strong>
          <p className="mt-1">
            Some seus custos mensais com combustível, manutenção, seguro, depreciação e impostos. Divida o total pela quantidade de KMs que você roda em um mês para obter uma estimativa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
