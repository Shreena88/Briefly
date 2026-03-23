import React, { useEffect, useState } from "react";
import { getStats } from "../../api/stats";

const BatchView = () => {
  const [stats, setStats] = useState({
    total_processed: 0,
    health_score: 0,
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch batch stats:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8 pt-0">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold font-manrope text-on-surface tracking-tight">Batch Processing</h1>
          <p className="text-on-surface-variant font-body mt-1">Institutional document ingestion and neural transcription engine.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface-container-lowest text-on-surface border border-outline-variant/20 rounded-lg font-manrope text-sm font-bold flex items-center gap-2 hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">pause</span>
            Pause Batch
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-manrope text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-lg">bolt</span>
            Priority Boost
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary-fixed/30 px-2 py-0.5 rounded">
                System Status: {stats.total_processed > 0 ? 'Active' : 'Idle'}
              </span>
              <h2 className="text-xl font-bold font-manrope mt-2">
                Primary Queue - <span className="text-primary">{stats.total_processed} documents indexed</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold font-manrope text-on-surface">{stats.total_processed > 0 ? '100%' : '0%'}</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden mb-8">
            <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: stats.total_processed > 0 ? '100%' : '0%' }}></div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <StatItem label="Active Jobs" value="0" />
            <StatItem label="Avg. Latency" value="0.8s" />
            <StatItem label="Success Rate" value={`${stats.success_rate || 99.8}%`} variant="green" />
          </div>
        </div>

        <div className="col-span-4 bg-surface-container-low p-6 rounded-xl flex flex-col h-[300px]">
          <h3 className="text-sm font-bold font-manrope uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">terminal</span>
            Live Event Log
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px] no-scrollbar">
            {stats.recent_activity.map((item, idx) => (
              <LogEntry key={idx} time="Realtime" type="success" msg={`SUCCESS: ${item.filename} processed.`} />
            ))}
            {stats.recent_activity.length === 0 && (
              <div className="text-slate-400 opacity-50 italic">Listening for system events...</div>
            )}
          </div>
        </div>

        <div className="col-span-12 bg-surface-container-lowest rounded-xl overflow-hidden mt-2 shadow-sm border border-outline-variant/5">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest/50 backdrop-blur-sm">
            <h3 className="font-manrope font-bold text-on-surface">Integrated Archives</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-label text-on-surface-variant">Document Identification</th>
                  <th className="px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-label text-on-surface-variant">Status</th>
                  <th className="px-6 py-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-label text-on-surface-variant">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {stats.recent_activity.map((doc) => (
                  <QueueRow 
                    key={doc.id}
                    name={doc.filename} 
                    details={`ID: ${doc.id.substring(0, 8)}`} 
                    status="COMPLETE" 
                    statusColor="green" 
                    progress={100} 
                  />
                ))}
                {stats.recent_activity.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium italic">No active batch sessions.</td>
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

const StatItem = ({ label, value, variant }) => (
  <div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-1 font-label">{label}</p>
    <p className={`text-lg font-bold font-manrope ${variant === 'green' ? 'text-green-600' : 'text-on-surface'}`}>{value}</p>
  </div>
);

const LogEntry = ({ time, type, msg }) => (
  <div className={`flex gap-2 ${type === 'success' ? 'text-green-600' : type === 'error' ? 'text-error' : 'text-on-surface'}`}>
    <span className="opacity-50">[{time}]</span>
    <span>{msg}</span>
  </div>
);

const QueueRow = ({ name, details, status, statusColor, confidence, progress }) => (
  <tr className="hover:bg-surface-container-high transition-colors group">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-8 bg-surface-container rounded flex items-center justify-center border border-outline-variant/20 text-slate-400">
          <span className="material-symbols-outlined">description</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface leading-tight font-body">{name}</p>
          <p className="text-[10px] text-slate-500 font-label">{details}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-${statusColor}-50 text-${statusColor}-700 text-[10px] font-bold border border-${statusColor}-200 font-label`}>
        <span className={`h-1 w-1 rounded-full bg-${statusColor}-700`}></span>
        {status}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-manrope font-semibold text-on-surface">{confidence}</span>
        {confidence !== '--' && <div className="flex gap-0.5">
          <div className="h-1 w-3 bg-primary rounded-full"></div>
          <div className="h-1 w-3 bg-primary rounded-full"></div>
          <div className="h-1 w-3 bg-primary rounded-full"></div>
          <div className="h-1 w-3 bg-outline-variant/30 rounded-full"></div>
        </div>}
      </div>
    </td>
    <td className="px-6 py-4 w-48">
      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
        <div className={`bg-${status === 'COMPLETE' ? 'green-600' : 'primary'} h-full rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
    </td>
    <td className="px-6 py-4 text-right">
      {status === 'IN_QUEUE' ? (
        <button className="px-3 py-1 bg-surface-container text-[10px] font-bold rounded-lg text-on-surface hover:bg-primary-fixed transition-colors font-label">
          PRIORITIZE
        </button>
      ) : (
        <button className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      )}
    </td>
  </tr>
);

export default BatchView;
