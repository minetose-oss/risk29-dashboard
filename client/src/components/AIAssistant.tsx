import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onClose: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Risk29 AI Assistant. I can help you understand your risk scores, analyze market conditions, and provide investment suggestions. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    "What's my current risk level?",
    "Should I rebalance my portfolio?",
    "Explain the liquidity risk",
    "What are the top risks today?",
  ];

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Risk level queries
    if (lowerMessage.includes("risk level") || lowerMessage.includes("current risk")) {
      return "Based on the latest data, your overall risk score is 19/100, which is in the 'Info' range (0-39). This indicates relatively low market risk. The main contributors are Liquidity (50) and Valuation (48). Overall, the market conditions are favorable.";
    }

    // Portfolio queries
    if (lowerMessage.includes("portfolio") || lowerMessage.includes("rebalance")) {
      return "Looking at your portfolio exposure, I recommend monitoring the Liquidity and Valuation categories closely as they have the highest risk scores (50 and 48 respectively). Consider reducing exposure to overvalued assets and maintaining adequate cash reserves. Your current allocation appears balanced, but watch for any category exceeding 60.";
    }

    // Liquidity risk
    if (lowerMessage.includes("liquidity")) {
      return "Liquidity risk (currently at 50) measures the ease of buying/selling assets without significant price impact. Key signals include M2 Money Supply YoY, Fed Balance Sheet, and Treasury Yield Curve. Current status shows moderate liquidity conditions. Monitor central bank policies and money supply growth for changes.";
    }

    // Valuation risk
    if (lowerMessage.includes("valuation")) {
      return "Valuation risk (currently at 48) indicates market pricing levels. High valuations suggest potential overpricing. Key metrics include Shiller P/E Ratio, Market Cap to GDP, and CAPE Ratio. Current readings show elevated valuations, suggesting caution for new positions. Consider value-oriented strategies.";
    }

    // Top risks
    if (lowerMessage.includes("top risk") || lowerMessage.includes("highest risk")) {
      return "The top 3 risk categories right now are:\\n\\n1. **Liquidity (50)**: Moderate money supply conditions\\n2. **Valuation (48)**: Elevated market valuations\\n3. **Macro (24)**: Stable macroeconomic environment\\n\\nFocus on these areas when making investment decisions.";
    }

    // Investment suggestions
    if (lowerMessage.includes("invest") || lowerMessage.includes("buy") || lowerMessage.includes("sell")) {
      return "Based on current risk levels (Overall: 19), market conditions are relatively favorable for investing. However, with Liquidity and Valuation risks elevated, consider:\\n\\n- Dollar-cost averaging instead of lump-sum investing\\n- Diversifying across sectors\\n- Maintaining 10-20% cash reserves\\n- Focusing on quality assets with strong fundamentals\\n\\nAlways align investments with your risk tolerance and time horizon.";
    }

    // Market conditions
    if (lowerMessage.includes("market") || lowerMessage.includes("condition")) {
      return "Current market conditions show low overall risk (19/100). Key observations:\\n\\n✓ Low macro risk (24) - stable economy\\n✓ Low credit risk (11) - healthy credit markets\\n✓ Low technical risk (10) - positive trends\\n⚠️ Moderate liquidity (50) - watch central banks\\n⚠️ Elevated valuations (48) - be selective\\n\\nOverall: Cautiously optimistic environment.";
    }

    // Predictions
    if (lowerMessage.includes("predict") || lowerMessage.includes("forecast") || lowerMessage.includes("future")) {
      return "Based on historical patterns and current trends, the risk forecast for the next 7 days suggests:\\n\\n- Overall risk likely to remain stable (15-25 range)\\n- Liquidity may improve slightly\\n- Valuation concerns may persist\\n\\nNote: These are statistical projections, not guarantees. Monitor daily updates and adjust your strategy accordingly.";
    }

    // Default response
    return "I can help you with:\\n\\n• Risk score analysis\\n• Portfolio recommendations\\n• Market condition insights\\n• Investment suggestions\\n• Risk category explanations\\n\\nTry asking about your current risk level, portfolio strategy, or specific risk categories like liquidity or valuation.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <Card className="w-full md:max-w-2xl h-[90vh] md:h-[600px] bg-zinc-900 border-zinc-800 flex flex-col rounded-t-2xl md:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold">Risk29 AI Assistant</div>
              <div className="text-xs text-zinc-400">Powered by advanced analytics</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-blue-500"
                    : "bg-gradient-to-br from-blue-500 to-purple-500"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`flex-1 max-w-[80%] ${
                  message.role === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-800 text-zinc-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                <div className="text-xs text-zinc-500 mt-1 px-3">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-zinc-800 p-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-zinc-400">Quick questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about your risk dashboard..."
              className="flex-1 bg-zinc-800 border-zinc-700"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
