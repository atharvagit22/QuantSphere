// src/components/ui/FAB.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, UploadCloud, Database } from "lucide-react";
import { parseCSV } from "../../utils/dataParser.js";
import * as demo from "../../utils/demoData.js";

/**
 * FAB with modal (centered).
 * Props:
 *  - onLoadParsedData(parsedData) => called with parsed object
 *  - onLoadDemo() => optional callback when demo chosen
 */
export default function FAB({ onLoadParsedData, onLoadDemo }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    try {
      if (typeof parseCSV === "function") {
        const parsed = await parseCSV(f);
        onLoadParsedData && onLoadParsedData(parsed);
      } else {
        // fallback: load demo if parser missing
        onLoadParsedData && onLoadParsedData(demo.demoMainData || {});
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to parse CSV");
    } finally {
      setLoading(false);
    }
  }

  function handleDemo() {
    const main = demo.demoMainData || {};
    if (onLoadDemo) onLoadDemo(main);
    if (onLoadParsedData) onLoadParsedData(main);
    setOpen(false);
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full shadow-2xl
                   bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] text-white flex items-center justify-center
                   hover:shadow-2xl"
        onClick={() => setOpen(true)}
        title="Quick actions"
      >
        <Plus size={20} />
      </motion.button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="relative z-50 w-[520px] max-w-full bg-[#0b0f14] rounded-xl border border-[#111827] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Quick actions</h3>
                <p className="text-sm text-gray-400 mt-1">Upload CSV or load demo data</p>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="sr-only">Choose CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFile}
                  className="block w-full text-sm text-gray-200 file:mr-4 file:py-2 file:px-4
                             file:rounded file:border-0 file:text-sm file:font-semibold
                             file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDemo}
                  className="px-4 py-2 rounded bg-emerald-600 text-white flex items-center gap-2"
                >
                  <Database size={16} /> Load Demo
                </button>

                <button
                  onClick={() => {
                    // small helper: if user provided onLoadDemo, call it
                    handleDemo();
                  }}
                  className="px-4 py-2 rounded border border-[#1f2937] text-sm text-gray-200 flex items-center gap-2"
                >
                  <UploadCloud size={16} /> Use demo CSVs
                </button>

                {loading && <div className="text-sm text-gray-400 ml-2">Parsing…</div>}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Tip: the modal does not replace existing upload widgets — it's a convenience quick-action.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
