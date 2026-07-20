import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";

export default function AdminImportProfiles() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(null);
      setResults(null);
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
      } catch (error) {
        toast.error("Invalid JSON format or network error.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!file) return toast.error("Select a JSON file first.");
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setLoading(true);
        const { data } = await api.post("/admin/import-profiles", { profiles: json });
        setResults(data);
        toast.success(`Imported ${data.imported} profiles successfully!`);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to import profiles.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid gap-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-black text-slate-950">Bulk Import Profiles</h1>
        <p className="mt-1 text-slate-500">Upload a JSON file to bulk create profiles in the system.</p>
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

      {file && !results && (
        <div className="flex gap-4">
          <button 
            className="btn-outline flex-1" 
            onClick={handlePreview} 
            disabled={loading}
          >
            {loading ? <Spinner /> : "Preview Data"}
          </button>
          <button 
            className="btn-primary flex-1" 
            onClick={handleImport} 
            disabled={loading}
          >
            {loading ? <Spinner /> : "Start Import"}
          </button>
        </div>
      )}

      {preview && !results && (
        <div className="panel">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={20} /> Preview Results
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl text-center">
              <p className="text-sm text-slate-500 mb-1">Total Found</p>
              <p className="text-2xl font-black text-slate-900">{preview.total}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl text-center">
              <p className="text-sm text-emerald-600 mb-1">Valid (Ready)</p>
              <p className="text-2xl font-black text-emerald-700">{preview.valid}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl text-center">
              <p className="text-sm text-rose-600 mb-1">Invalid (Skipped)</p>
              <p className="text-2xl font-black text-rose-700">{preview.invalid}</p>
            </div>
          </div>
          
          {preview.invalidReasons && preview.invalidReasons.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Sample Invalid Reasons:</p>
              <ul className="text-xs text-rose-600 space-y-1">
                {preview.invalidReasons.map((r, i) => (
                  <li key={i}>- {r.name}: {r.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {results && (
        <div className="panel bg-emerald-50 border-emerald-100">
          <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600" size={20} /> Import Complete!
          </h3>
          <p className="text-emerald-800">
            Successfully imported <strong>{results.imported}</strong> profiles.
            {results.skipped > 0 && ` Skipped ${results.skipped} (invalid or duplicate email).`}
            {results.errors > 0 && ` Errors: ${results.errors}.`}
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-sm hover:bg-emerald-700 transition"
            onClick={() => { setFile(null); setResults(null); setPreview(null); }}
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
