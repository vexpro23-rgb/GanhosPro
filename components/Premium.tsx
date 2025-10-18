import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Crown, Zap, BarChart2, Unlock, Loader2, MessageSquare, ArrowLeft, BrainCircuit, CalendarDays, Calculator, FileBarChart2, User, Bot } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { RunRecord, AppSettings } from '../types';
import { analyzeRecords, getChatFollowUp, getIntelligentReportAnalysis } from '../services/geminiService';

interface PremiumProps {
  records: RunRecord[];
  settings: AppSettings;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
  setSettings: (settings: AppSettings) => void;
}

type ActiveTool = 'menu' | 'insights' | 'reports' | 'periodic';
type PeriodType = 'weekly' | 'monthly' | 'annual';

const Premium: React.FC<PremiumProps> = ({ records, settings, isPremium, setIsPremium, setSettings }) => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<ActiveTool>('menu');

  // States for Insights Tool
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // States for Reports Tool
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportInsight, setReportInsight] = useState('');
  const [reportConfig, setReportConfig] = useState({
    startDate: records.length > 0 ? [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date : new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    metric: 'netProfit'
  });

  // State for Periodic Tool
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');


  useEffect(() => {
    if(activeTool === 'insights') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatLoading, activeTool]);

  const handleUpgrade = () => {
    setIsPremium(true);
    toast.success('Parabéns! Você agora é um usuário Premium.');
  };

  // --- Insights Tool Logic ---
  const handleAnalyze = async () => {
    if (records.length < 3) {
      toast.error('Você precisa de pelo menos 3 registros para uma análise significativa.');
      return;
    }
    setIsInsightsLoading(true);
    setAnalysis('');
    setChatHistory([]);
    try {
      const result = await analyzeRecords(records, settings);
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing records:", error);
      toast.error('Ocorreu um erro ao analisar seus dados. Tente novamente.');
    } finally {
      setIsInsightsLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const question = chatInput;
    const newHistory = [...chatHistory, { role: 'user' as const, parts: [{ text: question }] }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await getChatFollowUp(analysis, newHistory, question);
      setChatHistory(prev => [...prev, { role: 'model' as const, parts: [{ text: response }] }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Erro ao obter resposta. Tente novamente.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Reports Tool Logic ---
  const handleGenerateReport = async () => {
    if (!reportConfig.startDate || !reportConfig.endDate) {
      toast.error("Por favor, selecione um período de datas.");
      return;
    }
    setIsReportLoading(true);
    setReportData([]);
    setReportInsight('');

    const start = new Date(reportConfig.startDate);
    const end = new Date(reportConfig.endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    const filteredRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      recordDate.setUTCHours(0, 0, 0, 0);
      return recordDate >= start && recordDate <= end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (filteredRecords.length === 0) {
      toast.error("Nenhum registro encontrado para o período selecionado.");
      setIsReportLoading(false);
      return;
    }

    const metricsInfo: { [key: string]: { label: string; unit: string } } = {
        netProfit: { label: 'Lucro Líquido', unit: 'R$' },
        profitPerKm: { label: 'Lucro por KM', unit: 'R$/KM' },
        grossEarnings: { label: 'Ganhos Brutos', unit: 'R$' },
        grossEarningsPerKm: { label: 'R$/KM Bruto', unit: 'R$/KM' },
    };

    const data = filteredRecords.map(r => {
        const carCost = r.kmDriven * settings.costPerKm;
        const netProfit = r.totalEarnings - (r.additionalCosts || 0) - carCost;
        let value;
        switch (reportConfig.metric) {
            case 'profitPerKm': value = r.kmDriven > 0 ? netProfit / r.kmDriven : 0; break;
            case 'grossEarnings': value = r.totalEarnings; break;
            case 'grossEarningsPerKm': value = r.kmDriven > 0 ? r.totalEarnings / r.kmDriven : 0; break;
            default: value = netProfit;
        }
        return {
            date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }),
            value: parseFloat(value.toFixed(2)),
        };
    });

    setReportData(data);
    
    try {
        const reportForAI = data.map(d => ({ ...d, metric: reportConfig.metric, unit: metricsInfo[reportConfig.metric].unit }));
        const insight = await getIntelligentReportAnalysis(reportForAI, metricsInfo[reportConfig.metric].label);
        setReportInsight(insight);
    } catch(e) {
        toast.error('Não foi possível gerar o insight da IA.');
    } finally {
        setIsReportLoading(false);
    }
  };

    // --- Periodic Analysis Tool Logic ---
  const periodicData = useMemo(() => {
    const getPeriodKey = (dateStr: string, period: PeriodType): string => {
        const date = new Date(dateStr);
        date.setUTCHours(12); // Avoid timezone issues
        if (period === 'weekly') {
            const firstDay = new Date(date.setDate(date.getDate() - date.getUTCDay()));
            return `W${firstDay.toISOString().slice(0, 10)}`;
        }
        if (period === 'monthly') {
            return date.toISOString().slice(0, 7); // YYYY-MM
        }
        return date.getUTCFullYear().toString(); // YYYY
    };

    const sortedRecords = [...records].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const aggregated = sortedRecords.reduce((acc, record) => {
        const key = getPeriodKey(record.date, periodType);
        if (!acc[key]) {
            acc[key] = { key, totalEarnings: 0, totalCosts: 0, kmDriven: 0 };
        }
        const carCost = record.kmDriven * settings.costPerKm;
        acc[key].totalEarnings += record.totalEarnings;
        acc[key].totalCosts += carCost + (record.additionalCosts || 0);
        acc[key].kmDriven += record.kmDriven;
        return acc;
    }, {} as any);
    
    return Object.values(aggregated).map((item: any) => {
        const netProfit = item.totalEarnings - item.totalCosts;
        let label = '';
        if (periodType === 'weekly') {
            const date = new Date(item.key.substring(1));
            label = `Semana ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
        } else if (periodType === 'monthly') {
            const [year, month] = item.key.split('-');
            label = `${month}/${year.slice(2)}`;
        } else {
            label = item.key;
        }
        return {
            name: label,
            ganhos: parseFloat(item.totalEarnings.toFixed(2)),
            custos: parseFloat(item.totalCosts.toFixed(2)),
            lucroLiquido: parseFloat(netProfit.toFixed(2)),
            lucroPorKm: item.kmDriven > 0 ? parseFloat((netProfit / item.kmDriven).toFixed(2)) : 0,
        }
    });

  }, [records, settings, periodType]);


  const renderHeader = (title: string, icon?: React.ReactNode) => (
    <div className="flex items-center mb-4">
      {activeTool !== 'menu' && (
        <button onClick={() => setActiveTool('menu')} className="p-2 rounded-full hover:bg-gray-700 mr-2">
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className={`text-2xl font-bold text-center flex-grow flex items-center justify-center ${activeTool === 'menu' ? 'text-yellow-400' : 'text-brand-primary'}`}>
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h1>
      {activeTool !== 'menu' && <div className="w-8"></div>} {/* Spacer */}
    </div>
  );

  const renderMenu = () => (
    <>
      {renderHeader('GanhosPro Premium', <Crown/>)}
      <p className="text-center text-gray-300 mb-8">
        Escolha uma ferramenta abaixo para turbinar sua análise.
      </p>
      <div className="space-y-4">
        <div onClick={() => setActiveTool('insights')} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-transparent hover:border-brand-primary">
          <div className="flex items-center mb-2">
            <BrainCircuit size={24} className="text-brand-accent mr-3" />
            <h2 className="text-xl font-semibold">Insights com IA</h2>
          </div>
          <p className="text-gray-400 text-sm">Receba uma análise completa sobre sua performance geral e converse com a IA para tirar dúvidas.</p>
        </div>
        <div onClick={() => setActiveTool('reports')} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-transparent hover:border-brand-primary">
          <div className="flex items-center mb-2">
            <FileBarChart2 size={24} className="text-brand-accent mr-3" />
            <h2 className="text-xl font-semibold">Relatórios Inteligentes</h2>
          </div>
          <p className="text-gray-400 text-sm">Crie relatórios personalizados com filtros, visualize em gráficos e receba um feedback rápido da IA.</p>
        </div>
         <div onClick={() => setActiveTool('periodic')} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-transparent hover:border-brand-primary">
          <div className="flex items-center mb-2">
            <CalendarDays size={24} className="text-brand-accent mr-3" />
            <h2 className="text-xl font-semibold">Análise Periódica</h2>
          </div>
          <p className="text-gray-400 text-sm">Compare seus ganhos, custos e lucros em gráficos semanais, mensais ou anuais.</p>
        </div>
        <div onClick={() => navigate('/settings')} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-transparent hover:border-brand-primary">
          <div className="flex items-center mb-2">
            <Calculator size={24} className="text-brand-accent mr-3" />
            <h2 className="text-xl font-semibold">Custo por KM Preciso</h2>
          </div>
          <p className="text-gray-400 text-sm">Acesse os Ajustes para usar a calculadora unificada e descobrir seu custo real por KM.</p>
        </div>
      </div>
    </>
  );

  const renderInsightsTool = () => (
    <div className="animate-fade-in-up">
      {renderHeader('Insights com IA', <BrainCircuit/>)}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <button
          onClick={handleAnalyze}
          disabled={isInsightsLoading}
          className="w-full bg-brand-accent hover:opacity-90 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInsightsLoading ? <Loader2 className="animate-spin mr-2" /> : <Zap size={20} className="mr-2"/>}
          {isInsightsLoading ? 'Analisando...' : 'Analisar meus ganhos'}
        </button>
        {analysis && (
          <div className="mt-6 bg-gray-900/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-brand-primary">Resultado da Análise:</h3>
            <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{analysis}</div>
          </div>
        )}
      </div>
      {analysis && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-xl">
          <h3 className="text-lg font-semibold mb-3 text-center text-yellow-400">Converse sobre a Análise</h3>
          <div className="h-64 overflow-y-auto bg-gray-900/50 rounded-lg p-3 space-y-4 mb-3">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 animate-fade-in-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-brand-secondary' : 'bg-gray-600'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-200'}`}>
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-end gap-2 animate-fade-in-up">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-600">
                  <Bot size={18} />
                </div>
                <div className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-sm">
                    <Loader2 className="animate-spin w-4 h-4"/>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pergunte algo sobre o relatório..."
              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
              disabled={isChatLoading}
            />
            <button type="submit" className="bg-brand-secondary hover:bg-emerald-700 text-white p-2.5 rounded-lg disabled:opacity-50" disabled={isChatLoading || !chatInput.trim()}>
              <MessageSquare size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
  
  const renderReportsTool = () => (
     <div className="animate-fade-in-up">
        {renderHeader('Relatórios Inteligentes', <FileBarChart2/>)}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Início</label>
                    <input type="date" id="startDate" value={reportConfig.startDate} onChange={e => setReportConfig(p => ({...p, startDate: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-brand-primary focus:outline-none"/>
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">Fim</label>
                    <input type="date" id="endDate" value={reportConfig.endDate} onChange={e => setReportConfig(p => ({...p, endDate: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-brand-primary focus:outline-none"/>
                </div>
            </div>
            <div>
                 <label htmlFor="metric" className="block text-sm font-medium text-gray-300 mb-1">Métrica</label>
                 <select id="metric" value={reportConfig.metric} onChange={e => setReportConfig(p => ({...p, metric: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-brand-primary focus:outline-none">
                    <option value="netProfit">Lucro Líquido por Dia</option>
                    <option value="profitPerKm">Lucro por KM</option>
                    <option value="grossEarnings">Ganhos Brutos por Dia</option>
                    <option value="grossEarningsPerKm">R$/KM Bruto</option>
                 </select>
            </div>
            <button
                onClick={handleGenerateReport}
                disabled={isReportLoading}
                className="w-full bg-brand-accent hover:opacity-90 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isReportLoading ? <Loader2 className="animate-spin mr-2" /> : <BarChart2 size={20} className="mr-2"/>}
                Gerar Relatório
            </button>
        </div>

        {isReportLoading && <div className="text-center mt-6"><Loader2 className="animate-spin mx-auto w-8 h-8 text-brand-primary" /></div>}
        
        {reportData.length > 0 && !isReportLoading && (
            <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-xl animate-fade-in-up">
                <h3 className="font-bold text-lg mb-4 text-brand-primary text-center">Resultado do Relatório</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <BarChart data={reportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="date" stroke="#a0aec0" fontSize={12} />
                            <YAxis stroke="#a0aec0" fontSize={12} tickFormatter={(value) => `R$${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4a5568', color: '#f9fafb' }}
                                labelStyle={{ color: '#10b981' }}
                                formatter={(value) => [`${Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`,'Valor']}
                             />
                            <Bar dataKey="value" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {reportInsight && (
                    <div className="mt-4 bg-gray-900/50 p-3 rounded-lg">
                         <p className="text-sm text-gray-300 text-center">{reportInsight}</p>
                    </div>
                )}
            </div>
        )}
     </div>
  );

  const renderPeriodicTool = () => {
    const totals = periodicData.reduce((acc, item) => {
        acc.ganhos += item.ganhos;
        acc.custos += item.custos;
        acc.lucroLiquido += item.lucroLiquido;
        return acc;
    }, { ganhos: 0, custos: 0, lucroLiquido: 0 });

    return (
        <div className="animate-fade-in-up">
            {renderHeader('Análise Periódica', <CalendarDays/>)}
            <div className="bg-gray-800 p-4 rounded-lg shadow-xl mb-4">
                <div className="flex justify-center bg-gray-700/50 rounded-lg p-1">
                    {(['Semanal', 'Mensal', 'Anual'] as const).map(p => {
                        const value = p.toLowerCase().replace('á', 'a').replace('^a-z', '') as PeriodType;
                        return (
                             <button key={p} onClick={() => setPeriodType(value)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${periodType === value ? 'bg-brand-primary text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}>
                                {p}
                            </button>
                        )
                    })}
                </div>
            </div>

            {periodicData.length === 0 ? (
                 <div className="text-center text-gray-400 mt-10 bg-gray-800 p-6 rounded-lg">
                    <BarChart2 size={48} className="mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Dados Insuficientes</h2>
                    <p className="mt-2">Não há registros suficientes para gerar uma análise {periodType}.</p>
                </div>
            ) : (
                <>
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-gray-800 p-2 rounded-lg"><p className="text-xs text-blue-400">Ganhos</p><p className="font-bold text-sm">{totals.ganhos.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p></div>
                    <div className="bg-gray-800 p-2 rounded-lg"><p className="text-xs text-yellow-400">Custos</p><p className="font-bold text-sm">{totals.custos.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p></div>
                    <div className="bg-gray-800 p-2 rounded-lg"><p className="text-xs text-green-400">Lucro</p><p className="font-bold text-sm">{totals.lucroLiquido.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p></div>
                </div>

                <div className="space-y-6">
                    {/* Graph 1 */}
                    <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
                        <h3 className="font-semibold text-base mb-4 text-brand-primary text-center">Ganhos Brutos vs. Custos Totais</h3>
                        <div className="w-full h-60">
                            <ResponsiveContainer>
                                <BarChart data={periodicData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} />
                                    <YAxis stroke="#a0aec0" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                                    <Bar dataKey="ganhos" fill="#2563eb" name="Ganhos" />
                                    <Bar dataKey="custos" fill="#f59e0b" name="Custos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     {/* Graph 2 */}
                    <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
                        <h3 className="font-semibold text-base mb-4 text-brand-primary text-center">Evolução do Lucro Líquido</h3>
                        <div className="w-full h-60">
                            <ResponsiveContainer>
                                <BarChart data={periodicData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} />
                                    <YAxis stroke="#a0aec0" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} formatter={(value) => `${Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`} />
                                    <Bar dataKey="lucroLiquido" name="Lucro Líquido">
                                        {periodicData.map((entry, index) => (
                                            <rect key={`cell-${index}`} fill={entry.lucroLiquido >= 0 ? '#10b981' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     {/* Graph 3 */}
                    <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
                        <h3 className="font-semibold text-base mb-4 text-brand-primary text-center">Desempenho de Lucro por KM (R$)</h3>
                        <div className="w-full h-60">
                           <ResponsiveContainer>
                                <BarChart data={periodicData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} />
                                    <YAxis stroke="#a0aec0" fontSize={11} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} formatter={(value) => `${Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}`} />
                                    <Bar dataKey="lucroPorKm" name="Lucro/KM" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
  };
  

  return (
    <div className="max-w-md mx-auto text-white">
      {!isPremium ? (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-center mb-4 text-yellow-400 flex items-center justify-center">
                <Crown className="mr-2" /> GanhosPro Premium
            </h1>
            <p className="text-center text-gray-300 mb-8">
                Desbloqueie todo o potencial do app e maximize seus lucros.
            </p>
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
                <h2 className="text-xl font-semibold mb-4 text-brand-primary">Vantagens Premium</h2>
                <ul className="space-y-3 text-gray-300 text-left">
                <li className="flex items-start">
                    <BarChart2 className="w-5 h-5 mr-3 mt-1 text-green-400 flex-shrink-0" />
                    <span><span className="font-semibold text-white">Registros Ilimitados:</span> Salve seu histórico sem se preocupar com limites.</span>
                </li>
                 <li className="flex items-start">
                    <CalendarDays className="w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0" />
                    <span><span className="font-semibold text-white">Análise Periódica:</span> Compare seus resultados por semana, mês ou ano.</span>
                </li>
                <li className="flex items-start">
                    <BrainCircuit className="w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0" />
                    <span><span className="font-semibold text-white">Insights com IA:</span> Receba análises completas e converse com a IA.</span>
                </li>
                <li className="flex items-start">
                    <FileBarChart2 className="w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0" />
                    <span><span className="font-semibold text-white">Relatórios Inteligentes:</span> Crie relatórios personalizados com gráficos.</span>
                </li>
                <li className="flex items-start">
                    <Calculator className="w-5 h-5 mr-3 mt-1 text-yellow-400 flex-shrink-0" />
                    <span><span className="font-semibold text-white">Custo por KM Preciso:</span> Calcule seu custo real com base em todos os seus gastos.</span>
                </li>
                </ul>
            </div>
            <p className="text-lg mb-4">Atualize para o Premium por um pagamento único.</p>
            <button
                onClick={handleUpgrade}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105 w-full text-lg"
            >
                <Unlock className="mr-2" /> Fazer Upgrade Agora
            </button>
        </div>
      ) : (
        <>
            {activeTool === 'menu' && renderMenu()}
            {activeTool === 'insights' && renderInsightsTool()}
            {activeTool === 'reports' && renderReportsTool()}
            {activeTool === 'periodic' && renderPeriodicTool()}
        </>
      )}
    </div>
  );
};

export default Premium;