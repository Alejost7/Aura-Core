import { useState } from 'react';
import TablaProductos from '../components/inventary/TablaProductos';
import Header from '../components/layout/Header';
import Grid from '../components/inventary/Grid';
import { useProducts } from '../hooks/UseProducts';

export default function Home({ onLogOut }: { onLogOut: () => void }) {
    const { productos, log, cargarStock, llamarARust } = useProducts();
    const [mostrar, setMostrar] = useState(false);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 font-sans">
        {/*Header*/}
        <Header onLogOut={onLogOut} />
        {/* Barra de Estado para ver la respuesta */}
        {mostrar && 
            <div className="mb-6 p-4 bg-slate-900/80 border border-slate-700 rounded-xl">
                <p className="text-cyan-400 font-mono">{log}</p>
            </div>
        }
        {/* Grid de Prueba */}
        <Grid 
            llamarARust={llamarARust} 
            cargarStock={cargarStock} mostrar={mostrar} 
            setMostrar={setMostrar} />

        {mostrar && <TablaProductos productos={productos} />}
        <footer className="fixed bottom-6 text-slate-600 text-xs">
            Tauri + React + Tailwindcss + Rust + TypeScript v4
        </footer>
        </div>
    )
    }