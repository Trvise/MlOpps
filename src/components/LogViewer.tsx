import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface LogViewerProps {
  logs: string[];
  title?: string;
}

export const LogViewer = ({ logs, title = 'Console Output' }: LogViewerProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex items-center gap-2 flex-shrink-0">
        <Terminal className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-slate-300">{title}</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto font-mono text-sm bg-black/20 min-h-0">
        <AnimatePresence>
          {logs.length === 0 ? (
            <div className="text-slate-500 italic">Waiting for logs...</div>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-300 mb-1 flex gap-2"
              >
                <span className="text-slate-600 select-none">[{String(index + 1).padStart(2, '0')}]</span>
                <span>{log}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

