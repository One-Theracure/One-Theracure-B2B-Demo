import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function RedFlagAlert({ title, body, onAck }: { title: string; body: string; onAck?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative rounded-xl border-2 border-red-400 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20 p-3 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-md"
        >
          <AlertTriangle className="h-5 w-5 text-white" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide">
            Clinical red flag
          </div>
          <div className="mt-1 text-sm font-bold text-red-900 dark:text-red-200">{title}</div>
          <p className="text-xs text-red-800 dark:text-red-300 mt-1 leading-relaxed">{body}</p>
        </div>
        {onAck && (
          <button
            onClick={onAck}
            className="flex-shrink-0 px-2.5 py-1 rounded-md bg-white text-red-700 text-xs font-semibold border border-red-300 hover:bg-red-50"
          >
            Acknowledge
          </button>
        )}
      </div>
    </motion.div>
  );
}
