import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

export default function TitleBar() {
    
    // Funciones seguras
    const handleMinimize = () => appWindow.minimize();
    const handleMaximize = () => appWindow.toggleMaximize();
    const handleClose = () => appWindow.close();

    return (
        <div 
            data-tauri-drag-region 
            className="h-10 bg-slate-900/50 backdrop-blur-md flex justify-between items-center select-none px-4 relative z-50 border-b border-pink-500/20"
        >
            <div className="flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                    Live Beauty · Management System
                </span>
            </div>

            {/* Importante: pointer-events-auto para que el click no sea ignorado por el drag-region */}
            <div className="flex gap-1 pointer-events-auto">
                <button 
                    onClick={handleMinimize}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                >
                    <span className="mb-1">_</span>
                </button>
                
                <button 
                    onClick={handleMaximize}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                >
                    <span className="text-xs">☐</span>
                </button>

                <button 
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}