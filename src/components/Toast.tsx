import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; kind: ToastKind }

const ToastContext = createContext<((message: string, kind?: ToastKind) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = ++idRef.current;
    setToasts(t => [...t.slice(-2), { id, message, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="ui-toast-stack" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="ui-toast">
            {t.kind === 'success' && <CheckCircle2 size={16} color="#34d399" />}
            {t.kind === 'error' && <AlertCircle size={16} color="#f87171" />}
            {t.kind === 'info' && <Info size={16} color="#93c5fd" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? ((message: string) => console.info(message));
}
