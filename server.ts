import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Gemini AI financial analysis
  app.post("/api/ai-analysis", async (req, res) => {
    try {
      const { dataSummary, month } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY가 서버에 설정되어 있지 않습니다. 설정 메뉴에서 API 키를 입력해 주세요." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
당신은 (주) LX MMA 재무팀의 수석 자금담당 어드바이저입니다.
아래는 ${month || '당월'} 각 은행별·통화별 외화예금 잔액 및 외화환산손익, 환차손익 데이터 요약입니다:

${JSON.stringify(dataSummary, null, 2)}

이 데이터를 바탕으로 재무팀 경영진 보고 및 자금 관리 목적의 전문적인 '월간 외화손익 분석 및 환위험 관리 리포트'를 작성해 주세요.
다음 항목을 포함하여 마크다운 형식으로 작성해주세요:
1. **총괄 요약 (Executive Summary)**: 전체 환산손익 및 환차손익 현황 요약 (원화 기준)
2. **통화별/은행별 주요 손익 요인 분석**: 이익 또는 손실이 크게 발생한 주요 통화 및 은행 분석 (USD, EUR, JPY 등)
3. **환율 변동 리스크 진단**: 기말환율과 장부지가의 격차 및 환율 변동성에 따른 리스크 요인
4. **재무팀 실행 권고사항 (Actionable Recommendations)**: 헤지 전략, 통화별 외화예금 운용 방향 등 자금담당자 실무 팁

전문적이고 실무적인 재무 용어를 사용하되, 명확하고 정돈된 톤으로 작성해 주세요.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error.message || "AI 분석 생성 중 오류가 발생했습니다." });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
