import { motion } from "framer-motion";
import { MapPin, Building2, Layers, BookOpen, GraduationCap, Download, Eye, Map as MapIcon, Share2, Navigation, CalendarPlus } from "lucide-react";
import type { ExamResult } from "@/api/axios";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResultCardProps {
  result: ExamResult;
  searchParams: { date: string; session: "FN" | "AN" };
  onDownloadPdf: () => void;
  onPreviewPdf: () => void;
}

export function ResultCard({ result, searchParams, onDownloadPdf, onPreviewPdf }: ResultCardProps) {
  const infoItems = [
    { icon: GraduationCap, label: "Program", value: result.program },
    { icon: BookOpen, label: "Branch", value: result.branch },
    { icon: BookOpen, label: "Course", value: result.course_name },
    { icon: Building2, label: "Block", value: result.block },
    { icon: Layers, label: "Floor", value: result.floor },
  ];

  const mapUrl = result.latitude && result.longitude
    ? `https://www.google.com/maps?q=${result.latitude},${result.longitude}&z=15&output=embed`
    : null;

  // Google Maps directions URL — uses actual coordinates when available
  const googleMapsDirectionsUrl = result.latitude && result.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${result.latitude},${result.longitude}&travelmode=walking`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${result.block} Block, University`)}`;

  const handleNavigate = () => {
    window.open(googleMapsDirectionsUrl, "_blank", "noopener,noreferrer");
  };

  // Google Calendar link generator
  const generateCalendarLink = (): string => {
    const dateStr = searchParams.date.replace(/-/g, ""); // "2026-04-15" → "20260415"
    const startTime = searchParams.session === "FN" ? "T090000" : "T130000";
    const endTime = searchParams.session === "FN" ? "T120000" : "T160000";
    const dates = `${dateStr}${startTime}/${dateStr}${endTime}`;

    const title = `Exam - ${result.course_name || "Course"}`;
    const location = `${result.block || ""} Block, Room ${result.room_no || ""}, University`;
    const details = [
      `Register No: ${result.reg_no || ""}`,
      `Program: ${result.program || ""}`,
      `Branch: ${result.branch || ""}`,
      `Floor: ${result.floor || ""}`,
      `Session: ${searchParams.session === "FN" ? "Forenoon (9 AM – 12 PM)" : "Afternoon (1 PM – 4 PM)"}`,
    ].join("\n");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates,
      location,
      details,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleAddToCalendar = () => {
    window.open(generateCalendarLink(), "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    const shareText = `My exam hall details for ${searchParams.date} (${searchParams.session}):\nRoom: ${result.room_no}\nBlock: ${result.block}\nCourse: ${result.course_name}`;
    const shareUrl = window.location.href;
    const fullText = `${shareText}\nCheck here: ${shareUrl}`;

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(fullText);
        toast({
          title: "Link Copied!",
          description: "Exam details copied to clipboard.",
        });
      } catch (err) {
        console.error("Clipboard failed:", err);
      }
    };

    // Detect if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: "Where Is My Exam?",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback for mobile if sharing fails or is cancelled
        await copyToClipboard();
      }
    } else {
      // Desktop or unsupported share: straight to clipboard for best UX
      await copyToClipboard();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}>
      <div className="glass-card rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative backdrop-blur-2xl">
        <button
          type="button"
          onClick={handleShare}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all z-10"
          title="Share hall ticket"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 px-6 sm:px-8 py-5">
          <div className="flex items-center gap-2 mb-1.5">
            <MapPin className="w-5 h-5" />
            <h3 className="text-lg font-bold tracking-tight">Exam Hall Found</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Reg: <span className="font-semibold text-black dark:text-white">{result.reg_no}</span>
            {" • "}Date: <span className="font-semibold text-black dark:text-white">{searchParams.date}</span>
            {" • "}Session: <span className="font-semibold text-black dark:text-white">{searchParams.session === "FN" ? "Forenoon" : "Afternoon"}</span>
          </p>
        </div>

        <div className="p-6 sm:p-8 relative">
          {/* Subtle inner glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200 dark:bg-white/5 blur-[80px] rounded-full pointer-events-none" />

          {/* Room banner */}
          <div className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-8 flex items-center justify-between shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 dark:from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Room Number</p>
              <p className="text-5xl font-extrabold tracking-tighter text-black dark:text-white">{result.room_no || "—"}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 group transition-all duration-300 relative z-10"
                  aria-label="View Location"
                >
                  <div className="w-14 h-14 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center bg-gray-200 dark:bg-black/20 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-colors">Map</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-neutral-950 backdrop-blur-3xl border border-gray-200 dark:border-neutral-800 text-black dark:text-white shadow-2xl rounded-3xl">
                <DialogHeader className="p-6 pb-0 border-b border-gray-200 dark:border-neutral-800">
                  <DialogTitle className="text-xl font-bold tracking-tight">Location: {result.block} Block</DialogTitle>
                </DialogHeader>
                <div className="p-6 flex flex-col gap-5">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-inner">
                    {mapUrl ? (
                      <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                        <MapPin className="w-12 h-12 text-gray-300 dark:text-white/20 mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          Exact coordinates not available for this hall.
                        </p>
                        <a
                          href={googleMapsDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 text-xs font-bold text-black dark:text-white underline underline-offset-4 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          Search for {result.block} Block on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Assigned Block</p>
                      <p className="text-base font-bold uppercase">{result.block} • Floor {result.floor}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleNavigate}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl
                      bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-lg
                      text-white text-sm font-bold tracking-wide transition-all duration-300"
                  >
                    <Navigation className="w-5 h-5" />
                    Navigate to Exam Hall
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 relative z-10">
            {infoItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl glass-card border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 bg-white dark:bg-transparent">
                  <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-semibold truncate">{item.value || "—"}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex flex-col gap-3 relative z-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onPreviewPdf}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl
                  border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-[0.98]
                  transition-all duration-300 text-sm font-semibold tracking-wide"
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button
                type="button"
                onClick={onDownloadPdf}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl
                  bg-black dark:bg-white text-white dark:text-black hover:opacity-90 tracking-wide
                  active:scale-[0.98] transition-all duration-300 text-sm font-bold shadow-sm"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-1">
              <button
                type="button"
                onClick={handleNavigate}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  bg-blue-600/80 hover:bg-blue-500 border border-blue-500/30 text-white
                  active:scale-[0.98] transition-all duration-300 text-sm font-semibold tracking-wide"
              >
                <Navigation className="w-4 h-4" /> Navigate
              </button>
              <button
                onClick={handleAddToCalendar}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-500/30 text-white
                  active:scale-[0.98] transition-all duration-300 text-sm font-semibold tracking-wide"
              >
                <CalendarPlus className="w-4 h-4" /> Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NoResultCard() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      <div className="glass-card rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg text-center p-12 sm:p-16 bg-white dark:bg-black text-black dark:text-white">
        <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <MapPin className="w-8 h-8 text-gray-500 dark:text-white/60" />
        </div>
        <h3 className="text-2xl font-bold mb-3 tracking-tight">No match found</h3>
        <p className="text-base text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          We couldn't find an exam hall matching those details. Please check your register number and exam session.
        </p>
      </div>
    </motion.div>
  );
}
