import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock } from "lucide-react";

interface SearchFormProps {
  onSearch: (regNo: string, date: string, session: "FN" | "AN") => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [regNo, setRegNo] = useState("");
  const [date, setDate] = useState("");
  const [session, setSession] = useState<"FN" | "AN">("FN");
  const [errors, setErrors] = useState<{ regNo?: string; date?: string }>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveRecentSearch = (search: string) => {
    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const validate = () => {
    const newErrors: { regNo?: string; date?: string } = {};
    if (!regNo.trim()) newErrors.regNo = "Register number is required";
    else if (regNo.trim().length < 3) newErrors.regNo = "Register number is too short";
    if (!date) newErrors.date = "Exam date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();

    // Safety check: if already loading, don't trigger again
    if (isLoading) return;

    if (validate()) {
      try {
        const formattedRegNo = regNo.trim().toUpperCase();
        saveRecentSearch(formattedRegNo);
        onSearch(formattedRegNo, date, session);
      } catch (err) {
        console.error("SearchForm submission error:", err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
    >
      {/* Glass Card */}
      <div className="glass-card rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg p-6 sm:p-8 relative overflow-hidden bg-white dark:bg-transparent text-black dark:text-white">
        {/* Subtle top glow within card */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-32 h-32 bg-gray-200 dark:bg-white/20 blur-3xl rounded-full" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

          {/* Register Number */}
          <div>
            <label htmlFor="regNo" className="block text-sm font-medium mb-1.5 ml-1">
              Register Number
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors" />
              </div>
              <input
                id="regNo"
                type="text"
                placeholder="e.g. 23CSE001"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                aria-describedby={errors.regNo ? "regNo-error" : undefined}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 input-focus transition-all duration-300"
              />
            </div>
            <AnimatePresence>
              {errors.regNo && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} id="regNo-error" className="text-xs text-red-400 mt-1.5 ml-1">
                  {errors.regNo}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Exam Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1.5 ml-1">
              Exam Date
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors" />
              </div>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-describedby={errors.date ? "date-error" : undefined}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 input-focus transition-all duration-300 dark:[color-scheme:dark]"
              />
            </div>
            <AnimatePresence>
              {errors.date && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} id="date-error" className="text-xs text-red-400 mt-1.5 ml-1">
                  {errors.date}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Session */}
          <div>
            <p className="block text-sm font-medium mb-2 ml-1">
              Session
            </p>
            <div className="flex gap-3 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10">
              {(["FN", "AN"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSession(s)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden
                    ${session === s
                      ? "text-black bg-white border border-gray-200 dark:border-white/10 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                >
                  <Clock className={`w-4 h-4 ${session === s ? 'hidden' : 'inline-block'}`} />
                  {s === "FN" ? "Forenoon" : "Afternoon"}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
              bg-black dark:bg-white text-white dark:text-black
              text-sm font-bold tracking-wide
              hover:opacity-90
              shadow-sm
              transition-all duration-300
              disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="fancy-loader"><div /><div /><div /></div>
            ) : (
              <><Search className="w-5 h-5" /> Locate Room</>
            )}
          </motion.button>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 relative z-10">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide mb-4 flex items-center gap-2 uppercase">
              <Clock className="w-3.5 h-3.5" /> Recent Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search}
                  type="button"
                  onClick={() => { setRegNo(search); document.getElementById("date")?.focus(); }}
                  className="text-xs px-4 py-2 rounded-xl
                    bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                    hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white
                    text-gray-600 dark:text-gray-300 font-medium
                    transition-all duration-200 shadow-sm
                    backdrop-blur-md"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
