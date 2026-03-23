import React, { useEffect, useState } from "react";
import { getStats } from "../../api/stats";

const Header = () => {
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    getStats().then(data => setStatus(data.system_status)).catch(() => setStatus("Offline"));
  }, []);

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between px-8 z-30">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full">
          <span className={`w-2 h-2 rounded-full ${status === 'Offline' ? 'bg-error' : 'bg-primary'} animate-pulse`}></span>
          <span className="text-xs font-bold text-primary font-headline tracking-tight">System Health: {status}</span>
        </div>
        
      </div>
    </header>
  );
};

export default Header;
