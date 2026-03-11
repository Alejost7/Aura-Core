import { useState } from "react";

export type ReportPreset = "hoy" | "semana" | "mes" | "custom";

export function useReportRange() {
    const [reportPreset, setReportPreset] = useState<ReportPreset>("hoy");
    const [reportDesde, setReportDesde] = useState("");
    const [reportHasta, setReportHasta] = useState("");

    function formatDateInput(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getTodayRange() {
        const today = formatDateInput(new Date());
        return { desde: today, hasta: today };
    }

    function getPresetDates(preset: Exclude<ReportPreset, "custom">): { desde: string; hasta: string } {
        const today = new Date();
        const hasta = formatDateInput(today);
        if (preset === "hoy") return { desde: hasta, hasta };
        if (preset === "semana") {
            const desdeDate = new Date(today);
            desdeDate.setDate(today.getDate() - 6);
            return { desde: formatDateInput(desdeDate), hasta };
        }
        const desdeDate = new Date(today.getFullYear(), today.getMonth(), 1);
        return { desde: formatDateInput(desdeDate), hasta };
    }

    async function applyReportPreset(
        preset: Exclude<ReportPreset, "custom">,
        onLoadRange: (desde: string, hasta: string) => Promise<void>
    ) {
        const { desde, hasta } = getPresetDates(preset);
        setReportPreset(preset);
        setReportDesde(desde);
        setReportHasta(hasta);
        await onLoadRange(desde, hasta);
    }

    async function applyCustomRange(
        onLoadRange: (desde: string, hasta: string) => Promise<void>
    ) {
        if (!reportDesde || !reportHasta) return;
        setReportPreset("custom");
        await onLoadRange(reportDesde, reportHasta);
    }

    return {
        reportPreset,
        reportDesde,
        reportHasta,
        setReportDesde,
        setReportHasta,
        getTodayRange,
        applyReportPreset,
        applyCustomRange
    };
}
