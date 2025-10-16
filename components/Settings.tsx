import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Info, Calculator, Droplet, Zap } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; }> = ({ label, id, value, onChange, placeholder }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
            {label}
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

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const [costPerKm, setCostPerKm] = useState(settings.costPerKm.toString());
  const [activeTab, setActiveTab] = useState('combustion');

  // Calculator states
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [kmPerLiter, setKmPerLiter] = useState('');
  const [chargeCost, setChargeCost] = useState('');
  const [autonomy, setAutonomy] = useState('');

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
    let calculatedCost = 0;
    if (activeTab === 'combustion') {
        const price = parseFloat(pricePerLiter);
        const consumption = parseFloat(kmPerLiter);
        if (isNaN(price) || isNaN(consumption) || price <= 0 || consumption <= 0) {
            toast.error('Por favor, insira valores válidos para preço e consumo.');
            return;
        }
        calculatedCost = price / consumption;
    } else { // electric
        const cost = parseFloat(chargeCost);
        const range = parseFloat(autonomy);
        if (isNaN(cost) || isNaN(range) || cost <= 0 || range <= 0) {
            toast.error('Por favor, insira valores válidos para custo e autonomia.');
            return;
        }
        calculatedCost = cost / range;
    }

    if (calculatedCost > 0) {
        const finalCost = calculatedCost.toFixed(2);
        setCostPerKm(finalCost);
        toast.success(`Custo por KM atualizado para R$ ${finalCost}. Clique em Salvar para confirmar.`);
    }
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
                    onClick={() => setActiveTab('electric')}
                    className={`flex-1 py-2 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'electric' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'}`}
                >
                    <Zap size={16} className="mr-2" /> Elétrico
                </button>
            </div>
            
            {activeTab === 'combustion' ? (
                <div className="animate-fade-in">
                    <InputField label="Preço do Combustível (R$ por litro)" id="pricePerLiter" value={pricePerLiter} onChange={e => setPricePerLiter(e.target.value)} placeholder="Ex: 5.80" />
                    <InputField label="Consumo do Veículo (KM por litro)" id="kmPerLiter" value={kmPerLiter} onChange={e => setKmPerLiter(e.target.value)} placeholder="Ex: 12.5" />
                </div>
            ) : (
                <div className="animate-fade-in">
                    <InputField label="Custo da Recarga Completa (R$)" id="chargeCost" value={chargeCost} onChange={e => setChargeCost(e.target.value)} placeholder="Ex: 40.00" />
                    <InputField label="Autonomia com Carga Completa (KM)" id="autonomy" value={autonomy} onChange={e => setAutonomy(e.target.value)} placeholder="Ex: 350" />
                </div>
            )}
            <button onClick={calculateAndSetCost} className="w-full mt-2 bg-brand-accent hover:opacity-90 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition">
                Calcular e Usar Custo
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