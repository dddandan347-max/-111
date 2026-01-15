
import React from 'react';
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
  view, 
  label, 
  active, 
  onClick, 
  icon 
}: { 
  view: ViewState; 
  label: string; 
  active: boolean; 
  onClick: (v: ViewState) => void;
  icon: React.ReactNode;
}) => (
  <button
    onClick={() => onClick(view)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  setCurrentView, 
  children,
  currentUser,
  setCurrentUser,
  onOpenAdmin
}) => {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            StudioSync
          </h1>
          <p className="text-xs text-slate-500 mt-1">视频团队数字化工作台</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <NavItem 
            view="tasks" 
            label="任务看板" 
            active={currentView === 'tasks'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <NavItem 
            view="prompts" 
            label="剧本创作" 
            active={currentView === 'prompts'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          />
          <NavItem 
            view="documents" 
            label="团队文档" 
            active={currentView === 'documents'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <NavItem 
            view="assets" 
            label="参考素材" 
            active={currentView === 'assets'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <NavItem 
            view="finance" 
            label="财务管理" 
            active={currentView === 'finance'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                        {currentUser.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] text-slate-500 uppercase tracking-tighter">在线账号</div>
                        <div className="text-sm font-bold text-white truncate">{currentUser}</div>
                    </div>
                </div>
                <button onClick={onOpenAdmin} className="text-slate-500 hover:text-blue-400 p-1.5 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
            </div>
            <button onClick={() => setCurrentUser('')} className="w-full py-2 bg-slate-900 text-slate-400 hover:text-white hover:bg-red-900/40 rounded-lg text-xs font-bold transition-all border border-slate-700/50">
                安全退出
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-950">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
