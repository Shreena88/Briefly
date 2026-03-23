import React from "react";
import { useDocumentStore } from "../../store/documentStore";

const Sidebar = () => {
  const { currentView, setCurrentView, reset } = useDocumentStore();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "library", label: "Library", icon: "folder_open" },
  ];

  const handleNavClick = (viewId) => {
    if (viewId === "dashboard") {
      reset(); // Going back to dashboard resets the active document view
    }
    setCurrentView(viewId);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200/20 bg-slate-100 dark:bg-slate-900 flex flex-col py-8 px-4 z-40">
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              architecture
            </span>
          </div>
          <div>
            <h1 className="font-headline font-extrabold text-blue-700 dark:text-blue-500 tracking-tight leading-none text-lg">
              InfoDoc Engine
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
              Institutional Intelligence
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.id
                ? "text-blue-700 dark:text-blue-400 font-bold bg-white/50 dark:bg-slate-800/50 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-headline text-sm tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        {/* Simplified sidebar footer */}
      </div>
    </aside>
  );
};

export default Sidebar;
