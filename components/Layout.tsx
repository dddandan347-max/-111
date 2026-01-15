
import React, { useState } from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  onOpenAdmin: () => void;
  children: React.ReactNode;
}

const NavItem = ({ 
  view, label, active, onClick, icon 
}: { 
  view: ViewState; label: string; active: boolean; onClick: (v: ViewState) => void; icon: React.ReactNode;
}) => (
  <button
    onClick={() => onClick(view)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${
      active 
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, setCurrentView, children, currentUser, setCurrentUser, onOpenAdmin
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <span className="text-white font-black text-xl italic">S</span>
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">
            STUDIO SYNC
          </h1>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Next-Gen Workspace</p>
      </div>

      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <NavItem view="tasks" label="任务看板" active={currentView === 'tasks'} onClick={handleNavClick} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>} />
        <NavItem view="prompts" label="剧本引擎" active={currentView === 'prompts'} onClick={handleNavClick} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
        <NavItem view="assets" label="云端素材" active={currentView === 'assets'} onClick={handleNavClick} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>} />
        <NavItem view="documents" label="团队知识库" active={currentView === 'documents'} onClick={handleNavClick} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
        <NavItem view="finance" label="财务罗盘" active={currentView === 'finance'} onClick={handleNavClick} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </nav>

      <div className="p-6">
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-inner">
          <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                  {currentUser.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs font-bold text-white truncate">{currentUser}</div>
                  <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      在线
                  </div>
              </div>
              <button onClick={onOpenAdmin} className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066" /></svg>
              </button>
          </div>
          <button onClick={() => setCurrentUser('')} className="w-full py-2 bg-slate-950 text-slate-500 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-800">
              Sign Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 glass border-r border-slate-800/50 flex-col shrink-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`absolute top-0 left-0 w-72 h-full glass border-r border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </aside>
      </div>

      <main className="flex-1 overflow-auto relative">
        {/* Mobile Header Bar */}
        <header className="lg:hidden glass border-b border-slate-800/50 p-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm italic">S</span>
             </div>
             <span className="font-black tracking-tighter">STUDIO SYNC</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 animate-popIn">
          {children}
        </div>
      </main>
    </div>
  );
};
