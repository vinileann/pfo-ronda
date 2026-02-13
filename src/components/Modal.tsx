import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative bg-secundaria rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-primaria/30">
        <button
          onClick={onClose}
          className="sticky top-0 right-0 float-right m-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors z-10"
        >
          <X className="w-6 h-6 text-red-400" />
        </button>
        <div className="p-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
