
import React from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  onOpenAdmin: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  children: React.ReactNode;
}

const NavItem = ({ 
  view, 
  label, 
  active, 
  onClick, 
  icon,
  theme
}: { 
  view: ViewState; 
  label: string; 
  active: boolean; 
  onClick: (v: ViewState) => void;
  icon: React.ReactNode;
  theme: 'dark' | 'light';
}) => (
  <button
    onClick={() => onClick(view)}
    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all mb-3 relative group overflow-hidden ${
      active 
        ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-mochi-pink text-mochi-text shadow-mochi-sm font-black')
        : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-white hover:text-mochi-text hover:shadow-sm')
    }`}
  >
    {active && theme === 'light' && (
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-400 rounded-r-full"></div>
    )}
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:translate-x-1'}`}>
      {icon}
    </span>
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  setCurrentView, 
  children,
  currentUser,
  setCurrentUser,
  onOpenAdmin,
  theme,
  onToggleTheme
}) => {
  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-mochi-bg text-mochi-text'}`}>
      <aside className={`w-72 border-r flex flex-col shrink-0 z-20 transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'mochi-glass border-mochi-border shadow-2xl shadow-orange-900/5'}`}>
        <div className="p-8 border-b dark:border-slate-800 border-mochi-border/50">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black italic transform -rotate-12 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-mochi-pink text-white shadow-mochi-sm'}`}>S</div>
            <h1 className="text-2xl font-black tracking-tighter italic dark:text-white text-slate-800">
              Studio<span className={theme === 'dark' ? 'text-blue-500' : 'text-rose-400'}>Sync</span>
            </h1>
          </div>
          <p className="text-[9px] dark:text-slate-500 text-slate-400 mt-2 uppercase font-black tracking-[0.2em] opacity-60">Team Creative Hub</p>
        </div>

        <nav className="flex-1 p-5 overflow-y-auto custom-scrollbar">
          <NavItem 
            view="tasks" 
            label="视频任务" 
            active={currentView === 'tasks'} 
            onClick={setCurrentView}
            theme={theme}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <NavItem 
            view="prompts" 
            label="脚本工坊" 
            active={currentView === 'prompts'} 
            onClick={setCurrentView}
            theme={theme}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          />
          <NavItem 
            view="documents" 
            label="SOP 文档" 
            active={currentView === 'documents'} 
            onClick={setCurrentView}
            theme={theme}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <NavItem 
            view="assets" 
            label="参考仓库" 
            active={currentView === 'assets'} 
            onClick={setCurrentView}
            theme={theme}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <NavItem 
            view="finance" 
            label="财务账本" 
            active={currentView === 'finance'} 
            onClick={setCurrentView}
            theme={theme}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </nav>

        <div className="p-6 space-y-4">
          <button 
            onClick={onToggleTheme}
            className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 font-black text-xs transition-all shadow-sm active:scale-95 ${
              theme === 'dark' 
                ? 'bg-slate-800 text-yellow-400 border border-slate-700 hover:bg-slate-700' 
                : 'bg-mochi-yellow text-slate-700 border border-orange-200 hover:bg-yellow-100 shadow-mochi-sm'
            }`}
          >
            {theme === 'dark' ? (
              <><span className="text-base">🌙</span> 深色模式已开</>
            ) : (
              <><span className="text-base">✨</span> 奶油模式已开</>
            )}
          </button>

          <div className={`rounded-[2rem] p-4 border transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-mochi-border shadow-mochi-sm'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-rose-300 to-pink-500'}`}>
                        {currentUser.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Logged In</div>
                        <div className={`text-sm font-black truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{currentUser}</div>
                    </div>
                </div>
                <button onClick={onOpenAdmin} className={`p-2 transition-all rounded-xl ${theme === 'dark' ? 'text-slate-500 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
            </div>
            <button onClick={() => setCurrentUser('')} className={`w-full py-2.5 rounded-xl text-xs font-black transition-all border ${theme === 'dark' ? 'bg-slate-900 text-slate-500 hover:text-white hover:bg-red-900/40 border-slate-700/50' : 'bg-rose-50 text-rose-400 hover:text-white hover:bg-rose-500 border-rose-100 shadow-sm'}`}>
                退出工作区
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto transition-colors duration-500">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
};
