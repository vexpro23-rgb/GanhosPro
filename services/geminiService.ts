
import { GoogleGenAI } from "@google/genai";
import { RunRecord } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder check. The environment variable is expected to be set in the execution environment.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function formatRecordsForPrompt(records: RunRecord[]): string {
    return records.map(r => 
        `Data: ${r.date}, Ganhos: R$${r.totalEarnings.toFixed(2)}, KM: ${r.kmDriven}, Horas: ${r.hoursWorked?.toFixed(1) || 'N/A'}`
    ).join('\n');
}

export const getPerformanceAnalysis = async (records: RunRecord[]): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const formattedData = formatRecordsForPrompt(records);

    const prompt = `
        Você é um analista financeiro especialista em otimizar ganhos para motoristas de aplicativo.
        Analise os seguintes dados de corridas de um motorista e forneça insights acionáveis.

        **Dados:**
        ${formattedData}

        **Sua Tarefa:**
        1.  **Resumo de Performance:** Calcule e apresente o total de ganhos, a média de ganhos por dia e o lucro líquido médio por KM.
        2.  **Identifique os Dias Mais Rentáveis:** Com base nos dados, aponte quais dias da semana ou datas foram mais lucrativos.
        3.  **Sugestões de Melhoria:** Ofereça 2-3 dicas práticas e específicas para este motorista aumentar seus lucros. Por exemplo, focar em horários de pico se os dados sugerirem, ou otimizar rotas para reduzir KM por ganho.
        4.  **Conclusão:** Termine com uma nota de encorajamento.

        Seja claro, conciso e use formatação markdown com títulos e listas para facilitar a leitura.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Não foi possível se comunicar com a API do Gemini. Verifique sua chave de API e a conexão.");
    }
};
