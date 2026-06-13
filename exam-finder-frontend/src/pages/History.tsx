import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    History as HistoryIcon,
    Download,
    Calendar,
    Clock,
    RefreshCcw,
    FileText
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { getDownloadHistory, type DownloadHistoryEntry } from "@/api/axios";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function History() {
    const [history, setHistory] = useState<DownloadHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const data = await getDownloadHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load your download history. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadAgain = (entry: DownloadHistoryEntry) => {
        toast({
            title: "Generating PDF",
            description: `Re-generating hall ticket for ${entry.regNo}...`,
        });
        // Placeholder - will integrate with real PDF generation soon
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 tracking-tight">
                                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10">
                                        <HistoryIcon className="w-7 h-7" />
                                    </div>
                                    Download History
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2 text-base">
                                    View and manage your previously generated hall tickets
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={fetchHistory}
                                disabled={isLoading}
                                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 font-medium text-sm transition-all active:scale-[0.98]"
                            >
                                <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                                Refresh History
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="glass-card rounded-3xl border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center py-32 gap-6 relative overflow-hidden backdrop-blur-xl">
                                <div className="fancy-loader"><div /><div /><div /></div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium tracking-wide animate-pulse">Retrieving records...</p>
                            </div>
                        ) : history.length > 0 ? (
                            <div className="glass-card rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden relative backdrop-blur-2xl">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200 dark:bg-white/5 blur-[100px] rounded-full pointer-events-none" />

                                <div className="overflow-x-auto relative z-10">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 backdrop-blur-lg">
                                                <th className="px-6 sm:px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Register Number</th>
                                                <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden sm:table-cell">Exam Details</th>
                                                <th className="px-6 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden md:table-cell">Downloaded On</th>
                                                <th className="px-6 sm:px-8 py-5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                            {history.map((entry, index) => (
                                                <motion.tr
                                                    key={entry.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                                >
                                                    <td className="px-6 sm:px-8 py-5">
                                                        <span className="font-mono font-bold text-base bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10">{entry.regNo}</span>
                                                        {/* Mobile detail fallback */}
                                                        <div className="mt-2 flex flex-col gap-1 sm:hidden">
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {format(new Date(entry.examDate), "MMM d, yyyy")}</span>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1.5"><Clock className="w-3 h-3" /> {entry.session}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 hidden sm:table-cell">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-2 font-medium">
                                                                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                                {format(new Date(entry.examDate), "PPP")}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                <Clock className="w-4 h-4" />
                                                                {entry.session === "FN" ? "Forenoon" : "Afternoon"}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 hidden md:table-cell text-gray-500 dark:text-gray-400 font-medium">
                                                        {format(new Date(entry.downloadedAt), "MMM d, yyyy HH:mm")}
                                                    </td>
                                                    <td className="px-6 sm:px-8 py-5 text-right">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                                                                bg-black dark:bg-white text-white dark:text-black hover:opacity-90
                                                                active:scale-[0.95] transition-all duration-200 text-sm font-bold shadow-sm"
                                                            onClick={() => handleDownloadAgain(entry)}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Download</span>
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="glass-card rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg flex flex-col items-center justify-center py-24 px-6 text-center backdrop-blur-2xl relative overflow-hidden">
                                    {/* Subtle inner glow */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-200 dark:bg-white/5 blur-[80px] rounded-full pointer-events-none" />

                                    <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-inner">
                                        <FileText className="w-10 h-10 text-gray-400 dark:text-white/40" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 tracking-tight relative z-10">No history found</h3>
                                    <p className="text-base text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed relative z-10">
                                        You haven't downloaded any hall tickets yet. Start by searching for your exam!
                                    </p>
                                    <Link to="/" className="relative z-10">
                                        <button className="mt-8 flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold tracking-wide hover:opacity-90 transition-all shadow-sm active:scale-[0.98]">
                                            Go to Search
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
