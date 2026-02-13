import type { ReactNode } from "react";

interface ModalProps {
    title: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ title, open, onClose, children }: ModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            {/* Backdrop click closes the modal */}
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-200">{title}</h2>
                    <button
                        className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        X
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
