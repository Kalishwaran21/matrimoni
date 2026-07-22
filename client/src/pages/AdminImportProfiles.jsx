import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";
import ManagerOutsideData from "./ManagerOutsideData";

export default function AdminImportProfiles() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  
  // Review Queue state
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(null);
      setResults(null);
      setReviewQueue([]);
      setCurrentIndex(0);
      setIsReviewing(false);
    }
  };

  const handlePreview = () => {
    if (!file) return toast.error("Select a JSON file first.");
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setLoading(true);
        const { data } = await api.post("/admin/import-preview", { profiles: json });
        setPreview(data);
        if (data.allMapped) {
          setReviewQueue(data.allMapped);
        }
      } catch (error) {
        toast.error("Invalid JSON format or network error.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFastImport = () => {
    if (!file) return toast.error("Select a JSON file first.");
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setLoading(true);
        const { data } = await api.post("/admin/import-profiles", { profiles: json });
        setResults(data);
        setPreview(null);
        setReviewQueue([]);
        toast.success(`Fast imported ${data.imported} profiles successfully!`);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to import profiles.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const nextProfile = () => {
    setCurrentIndex(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If we are in review mode
  if (isReviewing && preview && reviewQueue.length > 0 && currentIndex < reviewQueue.length) {
    return (
      <div className="grid gap-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900">Reviewing Imported Profiles</h2>
            <p className="text-sm text-slate-500 font-medium">
              Profile <span className="text-maroon-600 font-bold">{currentIndex + 1}</span> of {reviewQueue.length}
            </p>
          </div>
          <button 
            type="button"
            className="btn-outline flex items-center gap-2"
            onClick={nextProfile}
          >
            Skip this Profile <ArrowRight size={16} />
          </button>
        </div>
        
        {/* Render the robust Outside Data form injected with prefillData */}
        <ManagerOutsideData 
          prefillData={reviewQueue[currentIndex]} 
          onSuccess={nextProfile} 
        />
      </div>
    );
  }

  if (isReviewing && preview && currentIndex >= reviewQueue.length && reviewQueue.length > 0) {
    return (
      <div className="panel bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center py-12 text-center animate-fade-up">
        <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
        <h2 className="text-2xl font-black text-emerald-900 mb-2">Review Complete!</h2>
        <p className="text-emerald-700">You have gone through all {reviewQueue.length} valid profiles in the file.</p>
        <button 
          className="mt-6 px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
          onClick={() => { setFile(null); setPreview(null); setReviewQueue([]); setCurrentIndex(0); }}
        >
          Import Another File
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-black text-slate-950">Bulk Import Profiles</h1>
        <p className="mt-1 text-slate-500">Upload a JSON file, preview, and review profiles one-by-one.</p>
      </div>

      <div className="panel flex flex-col items-center justify-center p-10 text-center border-dashed border-2 border-slate-200">
        <div className="rounded-full bg-slate-50 p-4 mb-4">
          <UploadCloud className="text-slate-400" size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Select JSON File</h2>
        <p className="text-sm text-slate-500 mb-6">Upload raw scraped JSON profiles</p>
        
        <input 
          type="file" 
          accept=".json" 
          onChange={handleFileChange} 
          className="hidden" 
          id="file-upload" 
        />
        <label 
          htmlFor="file-upload" 
          className="btn-primary cursor-pointer"
        >
          Browse File
        </label>
        
        {file && (
          <p className="mt-4 text-sm font-medium text-maroon-600 bg-maroon-50 px-3 py-1 rounded-full">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {file && !preview && (
        <div className="flex gap-4">
          <button 
            className="btn-primary w-full" 
            onClick={handlePreview} 
            disabled={loading}
          >
            {loading ? <Spinner /> : "Process & Preview Data"}
          </button>
        </div>
      )}

      {preview && reviewQueue.length === 0 && (
        <div className="panel">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-rose-500" size={20} /> Preview Results
          </h3>
          <p className="text-slate-600 mb-4">Total found: {preview.total}</p>
          <div className="p-4 bg-rose-50 text-rose-700 rounded-lg">
            No valid profiles found to review. All {preview.invalid} profiles were skipped.
          </div>
        </div>
      )}

      {preview && reviewQueue.length > 0 && (
        <div className="panel border-emerald-200 bg-emerald-50">
          <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={20} /> Data Ready for Import
          </h3>
          <p className="text-emerald-700 mb-6">Found <strong>{preview.valid}</strong> valid profiles out of {preview.total} total.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="btn-primary flex-1 py-3 text-lg" 
              onClick={handleFastImport} 
              disabled={loading}
            >
              {loading ? <Spinner /> : `⚡ Fast Import All (${preview.valid})`}
            </button>
            <button 
              className="btn-outline flex-1 py-3" 
              onClick={() => setIsReviewing(true)} 
            >
              Review Individually
            </button>
          </div>
        </div>
      )}

      {results && (
        <div className="panel bg-emerald-50 border-emerald-100 flex flex-col items-center text-center animate-fade-up">
          <CheckCircle2 className="text-emerald-600 mb-4" size={48} />
          <h3 className="font-black text-2xl text-emerald-900 mb-2">Import Complete!</h3>
          <p className="text-emerald-800 mb-6">
            Successfully imported <strong>{results.imported}</strong> profiles instantly.
            {results.skipped > 0 && ` Skipped ${results.skipped} (invalid or duplicate email).`}
            {results.errors > 0 && ` Errors: ${results.errors}.`}
          </p>
          <button 
            className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
            onClick={() => { setFile(null); setResults(null); setPreview(null); }}
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
