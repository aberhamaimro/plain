import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { DocumentAnalysis } from '../types';
import { askFollowUpApi, ChatMessage } from '../services/api';

interface FollowUpChatProps {
  analysis: DocumentAnalysis;
  language: string;
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({ analysis, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick questions depending on document type
  const suggestedQuestions = [
    'Can they legally send this to collections immediately?',
    'What happens if I miss the first deadline?',
    'How do I dispute this charge without paying a fee?',
    'Can you explain the main red flag in one simple sentence?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    setInput('');
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const answer = await askFollowUpApi({
        message: question,
        history: messages,
        analysis,
        language,
      });

      setMessages([...newHistory, { role: 'assistant', content: answer }]);
    } catch (err: any) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'I apologize, but I had trouble answering that question. Please try asking again in a different way.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12">
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md shadow-stone-200/40 p-5 sm:p-7 space-y-4">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Ask a Follow-Up Question
              </h3>
              <p className="text-xs text-stone-500">
                Full context of your {analysis.document_type} is active in this chat
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>

        {/* Suggested Quick Questions if chat is empty */}
        {messages.length === 0 && (
          <div className="space-y-2 py-2">
            <p className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              Popular questions about this document:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-stone-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.length > 0 && (
          <div className="max-h-80 overflow-y-auto space-y-3.5 pr-1 py-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-teal-800 text-white font-medium rounded-tr-xs'
                      : 'bg-stone-50 border border-stone-200/80 text-stone-800 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Copy button on assistant answers */}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyMessage(msg.content, idx)}
                      className="absolute bottom-2 right-2 p-1 rounded-md bg-white border border-stone-200 text-stone-400 opacity-0 group-hover:opacity-100 hover:text-stone-800 transition-all shadow-2xs"
                      title="Copy message"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-stone-500 py-2">
                <div className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-2 rounded-2xl">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-800" />
                  <span>Reviewing document context...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about this document in ${language}...`}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 rounded-2xl bg-teal-800 text-white hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
