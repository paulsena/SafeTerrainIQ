import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useAppStore } from '../../stores/appStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'What does my risk score mean?',
  'Should I get a professional assessment?',
  'What can I do to reduce my risk?',
];

function getRiskLabel(score: number): string {
  if (score <= 25) return 'low';
  if (score <= 50) return 'moderate';
  if (score <= 75) return 'high';
  return 'critical';
}

function generateLocalResponse(
  question: string,
  location: ReturnType<typeof useAppStore.getState>['location'],
  terrain: ReturnType<typeof useAppStore.getState>['terrain'],
  riskResults: ReturnType<typeof useAppStore.getState>['riskResults'],
): string {
  const q = question.toLowerCase();
  const address = location?.address ?? 'your property';
  const overall = riskResults?.overall ?? 'unknown';
  const scores = riskResults?.scores;
  const slope = terrain?.slope ?? 0;
  const elevation = terrain?.elevation ?? 0;

  const avgScore = scores
    ? Math.round(
        (scores.stability + scores.debris + scores.runoff + scores.susceptibility) / 4,
      )
    : 0;

  // Risk score meaning
  if (q.includes('risk score') || q.includes('what does') || q.includes('mean')) {
    return `Your property at ${address} has an overall risk level of "${overall}" with an average composite score of ${avgScore}/100.

Here is what each category looks like:
- Slope Stability: ${scores?.stability ?? 0}/100 (${getRiskLabel(scores?.stability ?? 0)})
- Debris Flow Risk: ${scores?.debris ?? 0}/100 (${getRiskLabel(scores?.debris ?? 0)})
- Surface Water Runoff: ${scores?.runoff ?? 0}/100 (${getRiskLabel(scores?.runoff ?? 0)})
- Landslide Susceptibility: ${scores?.susceptibility ?? 0}/100 (${getRiskLabel(scores?.susceptibility ?? 0)})

Scores above 50 indicate elevated risk that may warrant professional evaluation. Your terrain sits at approximately ${Math.round(elevation)} ft elevation with a slope of ${slope.toFixed(1)} degrees, both of which factor into the assessment.`;
  }

  // Professional assessment
  if (q.includes('professional') || q.includes('assessment') || q.includes('engineer') || q.includes('hire')) {
    const shouldGet = overall === 'high' || overall === 'critical';
    if (shouldGet) {
      return `Based on your "${overall}" risk classification, I would strongly recommend getting a professional geotechnical assessment. With a composite score of ${avgScore}/100, there are meaningful risk factors at your property that warrant expert evaluation.

A licensed geotechnical engineer can:
- Conduct subsurface borings to assess soil composition
- Perform slope stability analysis with site-specific data
- Recommend engineered solutions like retaining walls or drainage systems
- Provide documentation for insurance or permitting purposes

You can find qualified professionals in the directory below this chat. Blue Ridge Geotechnical Engineers and Appalachian Geological Consultants both have extensive experience with Western North Carolina terrain.`;
    }
    return `With your "${overall}" risk classification and a composite score of ${avgScore}/100, an immediate professional assessment may not be critical, but it is never a bad idea to have a baseline evaluation done, especially if you are planning construction, landscaping changes, or if your property is on a slope.

A geotechnical engineer can provide peace of mind and identify potential issues before they become expensive problems. The professional directory below lists several qualified firms in the Asheville area.`;
  }

  // Reduce risk / mitigation
  if (q.includes('reduce') || q.includes('mitigat') || q.includes('prevent') || q.includes('protect') || q.includes('what can i do')) {
    let advice = `Here are practical steps you can take to reduce terrain risk at ${address}:\n\n`;

    if ((scores?.runoff ?? 0) > 40) {
      advice += `**Drainage Improvements** (your runoff score is ${scores?.runoff}/100):\n- Install French drains to redirect subsurface water\n- Ensure gutters and downspouts direct water away from foundations\n- Grade the landscape to prevent water pooling near structures\n\n`;
    }

    if ((scores?.stability ?? 0) > 40) {
      advice += `**Slope Stabilization** (your stability score is ${scores?.stability}/100):\n- Plant deep-rooted native vegetation on slopes\n- Consider retaining walls for steep sections\n- Avoid removing trees or vegetation on hillsides\n\n`;
    }

    if ((scores?.debris ?? 0) > 40) {
      advice += `**Debris Flow Protection** (your debris score is ${scores?.debris}/100):\n- Keep drainage channels and culverts clear of debris\n- Install deflection walls or berms upslope of structures\n- Monitor for signs of soil creep after heavy rains\n\n`;
    }

    advice += `**General Best Practices:**\n- Monitor foundation cracks and document any changes over time\n- Avoid significant grading or excavation without engineering guidance\n- After heavy storms, inspect your property for new erosion, cracks, or water seepage`;

    return advice;
  }

  // Slope / terrain questions
  if (q.includes('slope') || q.includes('terrain') || q.includes('elevation') || q.includes('steep')) {
    return `Your property has a terrain slope of approximately ${slope.toFixed(1)} degrees at an elevation of ${Math.round(elevation)} feet.

For context:
- Slopes under 10 degrees are generally considered gentle and low-risk
- Slopes between 10-20 degrees are moderate and may require attention
- Slopes above 20 degrees are steep and typically need professional evaluation
- Slopes above 30 degrees are very steep with significant landslide potential

Your slope of ${slope.toFixed(1)} degrees ${
      slope < 10 ? 'falls in the gentle range, which is favorable.'
      : slope < 20 ? 'is in the moderate range. Keep an eye on drainage and erosion.'
      : slope < 30 ? 'is quite steep. Professional assessment is recommended.'
      : 'is very steep and warrants serious attention from a geotechnical professional.'
    }

Elevation also matters because higher-elevation sites in WNC tend to receive more rainfall, which can increase saturation and runoff risk.`;
  }

  // Landslide / Helene
  if (q.includes('landslide') || q.includes('helene') || q.includes('hurricane') || q.includes('storm')) {
    return `Hurricane Helene (2024) caused widespread landslide damage across Western North Carolina, particularly in Buncombe County. The extreme rainfall saturated already-steep terrain, triggering hundreds of debris flows and landslides.

Your property's landslide susceptibility score is ${scores?.susceptibility ?? 0}/100, which factors in proximity to documented Helene-era landslide events, terrain characteristics, and geological conditions.

${(scores?.susceptibility ?? 0) > 50
  ? 'Given your elevated susceptibility score, your property may be in or near an area affected by these events. I would recommend reviewing the landslide map on your report page and consulting with a geotechnical professional about site-specific conditions.'
  : 'Your susceptibility score suggests your property is not in the highest-risk zone, but continued vigilance is important, especially during heavy rain events.'}

Key things to watch after major storms:
- New cracks in the ground or foundations
- Tilting trees, fences, or retaining walls
- Unusual water seepage or springs
- Changes in drainage patterns`;
  }

  // Fallback
  return `That is a great question. Based on your property assessment at ${address}, here is what I can share:

Your overall risk level is "${overall}" with a composite score of ${avgScore}/100. The assessment considers four key factors: slope stability (${scores?.stability ?? 0}), debris flow risk (${scores?.debris ?? 0}), surface water runoff (${scores?.runoff ?? 0}), and landslide susceptibility (${scores?.susceptibility ?? 0}).

${overall === 'low' || overall === 'moderate'
  ? 'Your risk levels are manageable, but staying informed and monitoring your property after major weather events is always wise.'
  : 'Given your elevated risk scores, I would recommend consulting with a geotechnical professional. You can find qualified firms in the directory below.'}

Feel free to ask me more specific questions about your risk scores, what steps you can take to reduce risk, or whether you should seek a professional assessment.`;
}

async function streamGeminiResponse(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  onChunk: (text: string) => void,
  signal: AbortSignal,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('No API key');
  }

  // Convert messages to Gemini format
  const geminiMessages = messages
    .filter((m) => m.content.trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const response = await fetch(
    `/gemini-api/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
      signal,
    },
  );

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullText += text;
            onChunk(fullText);
          }
        } catch {
          // skip unparseable lines
        }
      }
    }
  }

  return fullText;
}

function simulateStreaming(
  text: string,
  onChunk: (text: string) => void,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve) => {
    const words = text.split(' ');
    let current = '';
    let i = 0;

    const interval = setInterval(() => {
      if (signal.aborted || i >= words.length) {
        clearInterval(interval);
        resolve(text);
        return;
      }
      current += (i > 0 ? ' ' : '') + words[i];
      onChunk(current);
      i++;
    }, 30);
  });
}

export default function ChatInterface() {
  const { location, terrain, riskResults } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const buildSystemPrompt = useCallback(() => {
    const scores = riskResults?.scores;
    return `You are a friendly and knowledgeable geotechnical risk expert for SafeTerrainIQ, a tool that assesses terrain-related hazards for properties in Buncombe County, North Carolina. You have access to the following property assessment data:

Property Address: ${location?.address ?? 'Unknown'}
Coordinates: ${location?.coords.lat ?? 0}, ${location?.coords.lng ?? 0}
Terrain Slope: ${terrain?.slope?.toFixed(1) ?? 0} degrees
Elevation: ${Math.round(terrain?.elevation ?? 0)} ft
Stability Index: ${terrain?.stabilityIndex?.toFixed(2) ?? 0}

Risk Scores (0-100):
- Slope Stability: ${scores?.stability ?? 0}
- Debris Flow Risk: ${scores?.debris ?? 0}
- Surface Water Runoff: ${scores?.runoff ?? 0}
- Landslide Susceptibility: ${scores?.susceptibility ?? 0}
- Overall Risk Level: ${riskResults?.overall ?? 'unknown'}

AI Summary: ${riskResults?.aiSummary ?? 'N/A'}

Respond concisely and helpfully. Reference the specific data above when answering. If asked about something outside terrain risk assessment, politely redirect. Use plain language accessible to homeowners, not technical jargon.`;
  }, [location, terrain, riskResults]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      };

      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput('');
      setIsStreaming(true);

      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      const onChunk = (streamedText: string) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: streamedText } : m)),
        );
      };

      try {
        // Build conversation history for API
        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        await streamGeminiResponse(history, buildSystemPrompt(), onChunk, signal);
      } catch {
        // Fallback to local responses
        const localResponse = generateLocalResponse(text, location, terrain, riskResults);
        await simulateStreaming(localResponse, onChunk, signal);
      }

      setIsStreaming(false);
    },
    [isStreaming, messages, buildSystemPrompt, location, terrain, riskResults],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-[400px] bg-deep-slate rounded-xl border border-light-slate/40 overflow-hidden shadow-inner">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 dark-scroll">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <MessageCircle className="w-8 h-8 text-light-slate" />
            <p className="text-gray-400 text-sm">
              Ask questions about your property's risk assessment.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="px-3 py-1.5 text-xs bg-mid-slate text-gray-300 rounded-full border border-light-slate/30 hover:border-sage/40 hover:text-white transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={isStreaming && msg.role === 'assistant' && msg.id === messages[messages.length - 1]?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions (when there are messages) */}
      {messages.length > 0 && !isStreaming && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.filter(
            (q) => !messages.some((m) => m.role === 'user' && m.content === q),
          ).map((q) => (
            <button
              key={q}
              onClick={() => handleSuggestion(q)}
              className="px-2.5 py-1 text-[11px] bg-mid-slate text-gray-400 rounded-full border border-light-slate/20 hover:border-sage/30 hover:text-gray-300 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-light-slate/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your risk assessment..."
            disabled={isStreaming}
            className="flex-1 bg-mid-slate border border-light-slate/40 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sage/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2.5 bg-sage hover:bg-sage-light disabled:opacity-40 disabled:hover:bg-sage text-white rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
