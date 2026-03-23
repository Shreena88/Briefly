import React, { useState, useEffect } from "react";
import { getSettings, updateSettings } from "../../api/settings";

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState("ocr");
  const [settings, setSettings] = useState({
    engine: "easyocr",
    confidence_threshold: 85,
    language_model: "Universal Latin (Standard)",
    email_notifications: true,
    error_alerts: false
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    setSaving(true);
    updateSettings(settings)
      .then(() => {
        setSaving(false);
        alert("Settings saved successfully!");
      })
      .catch((err) => {
        console.error("Failed to save settings:", err);
        setSaving(false);
        alert("Failed to save settings.");
      });
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-12">Loading settings...</div>;

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <header className="mb-16">
        <h2 className="text-[3.5rem] font-headline font-extrabold text-on-surface leading-tight tracking-tight">
          System <span className="text-primary italic">Workspace</span>
        </h2>
        <p className="text-slate-500 text-xl font-medium mt-4">Configure neural engines and processing pipelines.</p>
      </header>

      <div className="flex gap-16">
        {/* Sidebar Nav */}
        <div className="w-64 space-y-2">
          {[
            { id: "ocr", label: "OCR Engine", icon: "neurology" },
            { id: "entities", label: "Entity Extraction", icon: "database" },
            { id: "alerts", label: "Alerts & Logic", icon: "notification_important" },
            { id: "security", label: "Data Security", icon: "shield_lock" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm tracking-tight ${
                activeTab === tab.id 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "ocr" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-xl font-extrabold text-on-surface mb-2">Primary Engine Configuration</h3>
                    <p className="text-slate-500 text-sm font-medium">Select the vision model used for textual deserialization.</p>
                  </div>
                  <div className="px-4 py-2 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-widest">
                    AI Active
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">OCR Engine</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: "easyocr", name: "EasyOCR (Neural)", desc: "Best for high-res scans & complex layouts" },
                        { id: "tesseract", name: "Tesseract (Legacy)", desc: "High performance, lower accuracy on handwriting" }
                      ].map(engine => (
                        <div 
                          key={engine.id}
                          onClick={() => updateSetting("engine", engine.id)}
                          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                            settings.engine === engine.id 
                            ? "border-primary bg-primary/5" 
                            : "border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-on-surface">{engine.name}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settings.engine === engine.id ? "border-primary" : "border-slate-300"}`}>
                              {settings.engine === engine.id && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{engine.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Confidence Threshold</label>
                      <span className="text-sm font-extrabold text-primary">{settings.confidence_threshold}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={settings.confidence_threshold}
                      onChange={(e) => updateSetting("confidence_threshold", parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4">
                <button className="px-8 py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">Discard Changes</button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-4 bg-primary text-white text-sm font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {saving ? "Persisting Logic..." : "Deploy Configuration"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
