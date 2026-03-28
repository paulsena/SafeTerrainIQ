import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-light-slate flex items-center justify-center mt-1">
          <Brain className="w-4 h-4 text-sage" />
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-sage text-white rounded-2xl rounded-br-sm'
            : 'bg-mid-slate text-gray-200 rounded-2xl rounded-bl-sm'
        }`}
      >
        {content}
        {isStreaming && (
          <motion.span
            className="inline-block w-1.5 h-4 bg-sage ml-0.5 align-middle rounded-sm"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}
