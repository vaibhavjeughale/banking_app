import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Terminal,
  RotateCcw,
  User,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { AIMessage } from '../types';

interface AIAssistantViewProps {
  messages: AIMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  messages,
  onSendMessage,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Summarize my spending this month.',
    'Show my five most recent transactions.',
    'Explain the difference between available balance and ledger balance.',
    'Help me understand a failed simulated transfer.',
    'How can I download my account statement?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handlePromptClick = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">NexaBank AI Assistant</h3>
              <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                Gemini 3.8 Flash Core
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Read-Only Financial Advisor · Isolated Customer Context
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Terminal className="w-3.5 h-3.5 text-teal-500" />
          <span className="hidden sm:inline">5 Tool Functions Active</span>
        </div>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
        <span>
          <strong>Security Enclosure:</strong> The AI assistant has read-only access to your personal accounts. It cannot initiate fund transfers or modify records.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => {
          const isAssistant = m.sender === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isAssistant ? '' : 'ml-auto justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs space-y-2 leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                    : 'bg-teal-600 text-white rounded-br-xs'
                }`}
              >
                {/* Tool calls execution badge */}
                {isAssistant && m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="pb-2 border-b border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>Executed Read-Only Tools ({m.toolCalls.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.toolCalls.map((t, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300"
                        >
                          {t.name}()
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                <div
                  className={`text-[10px] mt-1 ${
                    isAssistant ? 'text-slate-400' : 'text-teal-100'
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span>Analyzing ledger & retrieving banking context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Suggested Prompts & Input Bar */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
        {/* Suggested Prompt Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Suggestions:</span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(p)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 transition disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about spending summaries, balances, transactions, or accounting..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white transition shadow-xs flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
