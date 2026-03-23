import React, { useEffect, useState } from "react";
import DropZone from "../upload/DropZone";
import { getStats } from "../../api/stats";
import { getDocument } from "../../api/documents";
import { useDocumentStore } from "../../store/documentStore";

const DashboardView = () => {
  const { setActiveDocument, setCurrentView } = useDocumentStore();
  const [stats, setStats] = useState({
    total_processed: 0,
    success_rate: 0,
    entities_extracted: 0,
    system_status: "Initializing...",
    health_score: 0,
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  const handleVerify = async (docId) => {
    try {
      const fullDoc = await getDocument(docId);
      setActiveDocument(fullDoc);
      setCurrentView("verification");
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  useEffect(() => {
    getStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch stats:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mt-16 p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface font-headline tracking-tighter">Ingestion Hub</h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">System Health</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-primary/30 rounded-full"></div>
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <div className="w-1 h-5 bg-primary/60 rounded-full"></div>
            </div>
            <span className="text-sm font-semibold text-primary">{stats.system_status}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-1 shadow-sm border border-slate-200/10 h-full">
           <DropZone variant="large" />
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <StatCard 
            label="Total Processed" 
            value={stats.total_processed.toLocaleString()} 
            trend="+100% initial" 
            icon="description" 
            color="blue" 
          />
          <StatCard 
            label="Success Rate" 
            value={`${stats.success_rate}%`} 
            trend="System stable" 
            icon="verified" 
            color="green" 
            filledIcon 
          />
        </div>

        <div className="col-span-12 bg-surface-container-lowest rounded-xl shadow-sm border border-slate-200/10 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold font-headline">Recent Ingestions</h3>
            <button className="text-sm font-bold text-primary hover:underline transition-all">View All Activity</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.05em]">Filename</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.05em]">Upload Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.05em]">OCR Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.05em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent_activity.map((item) => (
                  <tr key={item.id} className="group hover:bg-surface-container-high transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded text-slate-500">
                          <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
                        </div>
                        <span className="font-semibold text-sm">{item.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">{item.date}</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleVerify(item.id)}
                        className="bg-surface-container text-on-surface-variant px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
                {stats.recent_activity.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium">No recent activity detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, icon, color, filledIcon }) => (
  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-200/10 flex items-center justify-between">
    <div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="text-4xl font-extrabold font-headline mt-1 tabular-nums">{value}</div>
      <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${color === 'green' ? 'text-slate-400' : 'text-' + color}`}>
        {trend.includes('%') && <span className="material-symbols-outlined text-sm">trending_up</span>}
        {trend}
      </div>
    </div>
    <div className={`w-12 h-12 bg-${color}/5 rounded-lg flex items-center justify-center text-${color}`}>
      <span className="material-symbols-outlined" style={filledIcon ? { fontVariationSettings: "'FILL' 1" } : {}}>{icon}</span>
    </div>
  </div>
);

export default DashboardView;
