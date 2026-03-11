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
            <div className="absolute inset-0" onClick={onClose} />
            <div className="beauty-glass relative w-full max-w-xl rounded-2xl p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-rose-50">{title}</h2>
                    <button
                        className="rounded-lg px-2 py-1 text-rose-100/75 hover:bg-white/10"
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
