import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchForm } from "@/components/SearchForm";
import { ResultCard, NoResultCard } from "@/components/ResultCard";
import { AdmitCardModal } from "@/components/AdmitCardModal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { searchExam, saveDownloadHistory, type ExamResult } from "@/api/axios";
import { generateAdmitCardPdf } from "@/utils/generatePdf";
import { toast } from "@/hooks/use-toast";
import { Search, FileText, Smartphone } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Instant Search",
    description: "Find your exam hall in seconds with just your register number.",
  },
  {
    icon: FileText,
    title: "Download Admit Card",
    description: "Generate and download a printable admit card as a PDF.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Access from any device, anywhere, anytime.",
  },
];

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [noResult, setNoResult] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    date: string;
    session: "FN" | "AN";
  } | null>(null);
  const { isAuthenticated } = useAuth();
  const [showPreview, setShowPreview] = useState(false);

  const handleSearch = async (regNo: string, date: string, session: "FN" | "AN") => {
    setIsLoading(true);
    setResult(null);
    setNoResult(false);
    setSearchParams({ date, session });

    try {
      const data = await searchExam({ reg_no: regNo, date, session });
      setResult(data);
      toast({
        title: "Exam hall found!",
        description: `Your exam is in Room ${data.room_no}, Block ${data.block}`,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      setNoResult(true);

      const status = error.response?.status;
      if (status === 404) {
        toast({
          variant: "destructive",
          title: "Exam Not Found",
          description: "No exam hall was found for the given register number and date. Please verify your details."
        });
      } else if (status === 500) {
        toast({
          variant: "destructive",
          title: "Server Error",
          description: "Something went wrong on our end. Please try again in few moments."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Search Failed",
          description: "Network error or invalid input. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (result && searchParams) {
      generateAdmitCardPdf({ result, date: searchParams.date, session: searchParams.session });
      toast({ title: "PDF Downloaded", description: "Your admit card has been downloaded successfully." });

      // Save to history if logged in
      if (isAuthenticated) {
        try {
          await saveDownloadHistory({
            regNo: result.reg_no,
            examDate: searchParams.date,
            session: searchParams.session
          });
        } catch (error) {
          console.error("Failed to save history:", error);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1">
          {/* Split Hero Section */}
          <section>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">

                {/* Left column */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="lg:w-1/2 flex flex-col justify-center py-20 lg:py-24 lg:pr-16"
                >
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
                  >
                    Find Your
                    <br />
                    <span>
                      Exam Hall
                    </span>
                    <br />
                    Instantly
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-12 max-w-md"
                  >
                    Enter your register number, exam date, and session to instantly locate your assigned exam room.
                  </motion.p>

                  <div className="space-y-6">
                    {features.map((f, i) => (
                      <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                        className="flex items-start gap-4 group"
                      >
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-gray-100 dark:bg-neutral-900 flex items-center justify-center border border-gray-200 dark:border-neutral-800 transition-colors">
                          <f.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="text-base font-semibold tracking-wide">{f.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{f.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-xs text-gray-500 font-medium uppercase tracking-widest"
                  >
                    Trusted by students across the university
                  </motion.p>
                </motion.div>

                {/* Right column */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  className="lg:w-1/2 flex flex-col justify-center py-10 lg:py-24 lg:pl-16 relative"
                >
                  <div className="max-w-md w-full mx-auto relative z-10">
                    <div className="mb-8 text-center lg:text-left">
                      <h2 className="text-2xl font-bold mb-2">Search Your Exam Hall</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fill in all fields below to get started.</p>
                    </div>
                    <SearchForm onSearch={handleSearch} isLoading={isLoading} />
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* Result Section */}
          <AnimatePresence>
            {(result || noResult) && searchParams && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="py-20 relative z-20"
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                  <h2 className="text-2xl font-bold text-center mb-10 tracking-tight">
                    {result ? "Your Exam Details" : "Search Results"}
                  </h2>
                  {result ? (
                    <ResultCard result={result} searchParams={searchParams} onDownloadPdf={handleDownloadPdf} onPreviewPdf={() => setShowPreview(true)} />
                  ) : (
                    <NoResultCard />
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>

      <Footer />

      {result && searchParams && (
        <AdmitCardModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownloadPdf}
          result={result}
          searchParams={searchParams}
        />
      )}
    </div>
  );
}
