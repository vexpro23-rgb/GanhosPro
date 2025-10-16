
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lock, Zap, FileDown, TrendingUp } from 'lucide-react';
import { RunRecord } from '../types';
import { getPerformanceAnalysis } from '../services/geminiService';
import toast from 'react-hot-toast';

interface PremiumProps {
  records: RunRecord[];
}

const Premium: React.FC<PremiumProps> = ({ records }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');

    const handleAnalyze = async () => {
        if (records.length < 5) {
            toast.error('Você precisa de pelo menos 5 registros para obter uma análise.');
            return;
        }
        setIsLoading(true);
        setAnalysis('');
        try {
            const result = await getPerformanceAnalysis(records);
            setAnalysis(result);
        } catch (error) {
            console.error('Error getting analysis:', error);
            // Fix: Per coding guidelines, do not ask the user to check their API_KEY.
            toast.error('Falha ao obter análise. Verifique sua conexão e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Create mock data for charts as an example
    const weeklyData = useMemo(() => {
        const data = [
            { name: 'Seg', Lucro: 120, Custo: 40 },
            { name: 'Ter', Lucro: 180, Custo: 60 },
            { name: 'Qua', Lucro: 220, Custo: 75 },
            { name: 'Qui', Lucro: 200, Custo: 70 },
            { name: 'Sex', Lucro: 300, Custo: 90 },
            { name: 'Sáb', Lucro: 450, Custo: 120 },
            { name: 'Dom', Lucro: 350, Custo: 100 },
        ];
        return data;
    }, []);

    const renderFormattedAnalysis = (text: string) => {
        return text.split('\n').map((line, index) => {
            if (line.startsWith('* **') || line.startsWith('**')) {
                return <p key={index} className="font-bold text-lg mt-4 mb-2">{line.replace(/\*/g, '')}</p>;
            }
            if (line.startsWith('*')) {
                return <li key={index} className="ml-4 list-disc">{line.substring(1).trim()}</li>;
            }
            return <p key={index} className="mb-2">{line}</p>;
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <Zap size={40} className="mx-auto text-brand-accent mb-2"/>
                <h1 className="text-3xl font-bold text-brand-primary">GanhosPro Premium</h1>
                <p className="text-gray-400 mt-2">Desbloqueie todo o potencial da sua performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* AI Insights Card */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                    <div className="flex items-center mb-4">
                        <TrendingUp className="text-brand-accent mr-3" size={24} />
                        <h2 className="text-xl font-semibold">Insights com IA</h2>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                        Use o poder da IA Gemini para analisar seu histórico de corridas e receber dicas personalizadas para maximizar seus lucros.
                    </p>
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-brand-accent hover:opacity-90 text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analisando...
                            </>
                        ) : 'Gerar Análise de Performance'}
                    </button>
                    {analysis && (
                        <div className="mt-4 bg-gray-900 p-4 rounded-md text-gray-300 text-sm prose prose-invert max-w-none">
                            {renderFormattedAnalysis(analysis)}
                        </div>
                    )}
                </div>

                {/* Reports Card */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                    <h2 className="text-xl font-semibold mb-4">Relatório Semanal</h2>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }} cursor={{fill: 'rgba(110, 231, 183, 0.1)'}} />
                                <Legend />
                                <Bar dataKey="Lucro" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Custo" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Other Premium Features */}
                 <div className="relative bg-gray-800 p-6 rounded-lg shadow-xl col-span-1 md:col-span-2">
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-lg z-10">
                        <Lock size={48} className="text-brand-accent mb-4"/>
                        <h3 className="text-2xl font-bold text-white">Exclusivo para Assinantes</h3>
                        <p className="text-gray-300 mt-2">Assine o Premium para desbloquear estes recursos.</p>
                         <button className="mt-6 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg">
                            Assinar Agora
                        </button>
                    </div>
                    <div className="blur-sm">
                        <h2 className="text-xl font-semibold mb-4">Mais Recursos Premium</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center p-4 bg-gray-700 rounded-lg">
                                <FileDown className="text-brand-primary mr-3" size={24}/>
                                <div>
                                    <h4 className="font-semibold">Exportação de Dados</h4>
                                    <p className="text-sm text-gray-400">Exporte seu histórico em CSV/PDF.</p>
                                </div>
                            </div>
                            <div className="flex items-center p-4 bg-gray-700 rounded-lg">
                                <TrendingUp className="text-brand-primary mr-3" size={24}/>
                                <div>
                                    <h4 className="font-semibold">Relatórios Mensais/Anuais</h4>
                                    <p className="text-sm text-gray-400">Visão completa de sua performance.</p>
                                </div>
                            </div>
                             <div className="flex items-center p-4 bg-gray-700 rounded-lg">
                                <FileDown className="text-brand-primary mr-3" size={24}/>
                                <div>
                                    <h4 className="font-semibold">Backup em Nuvem</h4>
                                    <p className="text-sm text-gray-400">Seus dados seguros e acessíveis.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

            </div>
        </div>
    );
};

export default Premium;