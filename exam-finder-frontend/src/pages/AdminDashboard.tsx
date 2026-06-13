import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Clock,
  User,
  FileText,
  Users,
  Search,
  BookOpen,
  GraduationCap,
  Download
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/Spinner";
import {
  uploadCsv,
  getBatches,
  getAdminStats,
  getSearchLogs,
  exportSearchLogsCsv,
  sendEmailReminders,
  type BatchInfo,
  type UploadResponse,
  type SearchLogEntry,
  type SearchLogPage
} from "@/api/axios";

interface AdminStats {
  totalUsers: number;
  totalRecords: number;
  totalBatches: number;
  totalSearches: number;
}
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploadedBy, setUploadedBy] = useState("admin");
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchLogPage, setSearchLogPage] = useState<SearchLogPage | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDashboardData(currentPage);
  }, [currentPage]);

  const loadDashboardData = async (page = 0) => {
    setLoadingData(true);
    try {
      const [batchesData, statsData, logsData] = await Promise.all([
        getBatches().catch(() => []),
        getAdminStats().catch(() => null),
        getSearchLogs(page, 10).catch(() => null)
      ]);
      setBatches(batchesData);
      setStats(statsData);
      setSearchLogPage(logsData);
    } catch (error) {
      console.log("Could not load dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateCsvHeaders = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const firstLine = text.split("\n")[0].toLowerCase();
        // Check for expected headers (adjust as needed)
        const expectedHeaders = ["reg_no", "date", "session"];
        const hasRequiredHeaders = expectedHeaders.some((h) =>
          firstLine.includes(h)
        );

        if (!hasRequiredHeaders) {
          toast({
            variant: "destructive",
            title: "CSV Format Warning",
            description:
              "The file may not have the expected headers. Make sure it contains: reg_no, date, session, etc.",
          });
        }
        resolve(true); // Still allow upload, just warn
      };
      reader.onerror = () => resolve(true);
      reader.readAsText(file.slice(0, 1000)); // Read first 1KB
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a CSV file",
        });
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
      await validateCsvHeaders(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to upload",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await uploadCsv(file, uploadedBy, description);
      setUploadResult(result);
      toast({
        title: "Upload successful",
        description: result.message || "CSV file uploaded successfully",
      });

      // Clear form
      setFile(null);
      setDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Reload dashboard stats and batches
      loadDashboardData(currentPage);
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const err = error as { response?: { data?: { message?: string; errors?: string[] } } };

      const errorMessage = err.response?.data?.message || "Failed to upload CSV";
      const errors = err.response?.data?.errors || [];

      setUploadResult({
        message: errorMessage,
        errors: errors,
      });

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendReminders = async () => {
    setIsSendingEmails(true);
    try {
      const result = await sendEmailReminders();
      toast({
        title: "Reminders Triggered",
        description: result.message,
      });
    } catch (error: any) {
      console.error("Failed to send reminders:", error);
      toast({
        variant: "destructive",
        title: "Failed to send reminders",
        description: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSendReminders} disabled={isSendingEmails} className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
                {isSendingEmails ? <Spinner size="sm" /> : <AlertCircle className="w-4 h-4" />}
                Trigger Emails
              </Button>
              <Button variant="outline" onClick={() => loadDashboardData(currentPage)} disabled={loadingData} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">
            Manage exam data, view analytics, and track search history
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats ? stats.totalUsers.toLocaleString() : "..."}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats ? stats.totalRecords.toLocaleString() : "..."}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Batches</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats ? stats.totalBatches.toLocaleString() : "..."}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Search Queries</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats ? stats.totalSearches.toLocaleString() : "..."}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="w-6 h-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload CSV
                </CardTitle>
                <CardDescription>
                  Upload a CSV file containing exam seating data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Input */}
                <div className="space-y-2">
                  <Label htmlFor="csvFile">CSV File</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${file
                      ? "border-primary/50 bg-primary/5"
                      : "border-input hover:border-primary/30 hover:bg-muted/50"
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={clearFile}
                          className="ml-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="csvFile"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FileSpreadsheet className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="font-medium">Click to select CSV file</p>
                        <p className="text-sm text-muted-foreground">
                          or drag and drop
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Uploaded By */}
                <div className="space-y-2">
                  <Label htmlFor="uploadedBy" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Uploaded By
                  </Label>
                  <Input
                    id="uploadedBy"
                    type="text"
                    placeholder="Your name"
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description (optional)
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="e.g., December 2024 End Semester"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Upload Button */}
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner size="sm" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload CSV
                    </>
                  )}
                </Button>

                {/* Upload Result */}
                {uploadResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${uploadResult.errors && uploadResult.errors.length > 0
                      ? "bg-destructive/10 border border-destructive/20"
                      : "bg-success/10 border border-success/20"
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {uploadResult.errors && uploadResult.errors.length > 0 ? (
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{uploadResult.message}</p>
                        {uploadResult.successCount !== undefined && (
                          <p className="text-sm text-muted-foreground">
                            {uploadResult.successCount} records processed
                          </p>
                        )}
                        {uploadResult.errors && uploadResult.errors.length > 0 && (
                          <ul className="mt-2 text-sm text-destructive list-disc list-inside">
                            {uploadResult.errors.slice(0, 5).map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                            {uploadResult.errors.length > 5 && (
                              <li>...and {uploadResult.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Recent Batches Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Recent Uploads
                    </CardTitle>
                    <CardDescription>
                      Previously uploaded CSV batches
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={loadDashboardData}
                    disabled={loadingData}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : batches.length > 0 ? (
                  <div className="space-y-3">
                    {batches.map((batch, index) => (
                      <motion.div
                        key={batch.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{batch.fileName}</p>
                            {batch.description && (
                              <p className="text-sm text-muted-foreground">
                                {batch.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {batch.recordCount} records
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By: {batch.uploadedBy}</span>
                          <span>
                            {new Date(batch.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No recent uploads</p>
                    <p className="text-sm">
                      Upload a CSV file to see it listed here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Searches Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      Recent Search Logs
                    </CardTitle>
                    <CardDescription>
                      Latest exam queries made by students
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setExporting(true);
                        try {
                          await exportSearchLogsCsv();
                          toast({ title: "Export Started", description: "Your CSV is downloading." });
                        } catch (e) {
                          toast({ variant: "destructive", title: "Export Failed", description: "Failed to download search logs." });
                        } finally {
                          setExporting(false);
                        }
                      }}
                      disabled={exporting}
                      className="gap-2"
                    >
                      {exporting ? <Spinner size="sm" /> : <Download className="w-4 h-4" />}
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => loadDashboardData(currentPage)}
                      disabled={loadingData}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : searchLogPage && searchLogPage.content.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <div className="overflow-auto border rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="px-4 py-3 font-medium">Log ID</th>
                            <th className="px-4 py-3 font-medium">Register Number</th>
                            <th className="px-4 py-3 font-medium">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {searchLogPage.content.map((log) => (
                            <tr key={log.id} className="hover:bg-muted/30">
                              <td className="px-4 py-3 text-muted-foreground">#{log.id}</td>
                              <td className="px-4 py-3 font-medium">{log.regNo}</td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing page {searchLogPage.number + 1} of {searchLogPage.totalPages} ({searchLogPage.totalElements} total)
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                          disabled={searchLogPage.number === 0 || loadingData}
                        >
                          Previous
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={searchLogPage.last || loadingData}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No search logs available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
