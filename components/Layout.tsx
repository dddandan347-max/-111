
import React, { useState } from 'react';
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

// Add key to props definition and ensure theme is restricted to 'dark' | 'light'
interface NavItemProps {
  key?: React.Key;
  view: ViewState;
  label: string;
  active: boolean;
  onClick: (v: ViewState) => void;
  icon: React.ReactNode;
  theme: 'dark' | 'light';
  isMobile?: boolean;
}

const NavItem = ({ 
  view, 
  label, 
  active, 
  onClick, 
  icon,
  theme,
  isMobile = false
}: NavItemProps) => {
  if (isMobile) {
    return (
      <button
        onClick={() => onClick(view)}
        className={`flex flex-col items-center justify-center py-2 flex-1 transition-all ${
          active 
            ? (theme === 'dark' ? 'text-blue-400' : 'text-rose-500')
            : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')
        }`}
      >
        <div className={`transition-transform duration-300 ${active ? 'scale-110 -translate-y-1' : ''}`}>
          {icon}
        </div>
        <span className={`text-[10px] mt-1 font-black uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-60'}`}>
          {label.substring(0, 2)}
        </span>
      </button>
    );
  }

  return (
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
};

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { view: 'tasks' as ViewState, label: '视频任务', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { view: 'prompts' as ViewState, label: '脚本工坊', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { view: 'documents' as ViewState, label: 'SOP 文档', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { view: 'assets' as ViewState, label: '参考仓库', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { view: 'finance' as ViewState, label: '财务账本', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-mochi-bg text-mochi-text'}`}>
      {/* PC Side Sidebar */}
      <aside className={`hidden lg:flex w-72 border-r flex-col shrink-0 z-20 transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'mochi-glass border-mochi-border shadow-2xl shadow-orange-900/5'}`}>
        <div className="p-8 border-b dark:border-slate-800 border-mochi-border/50">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black italic transform -rotate-12 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-mochi-pink text-white shadow-mochi-sm'}`}>S</div>
            <h1 className="text-2xl font-black tracking-tighter italic dark:text-white text-slate-800">
              Studio<span className={theme === 'dark' ? 'text-blue-500' : 'text-rose-400'}>Sync</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-5 overflow-y-auto">
          {navItems.map(item => (
            <NavItem 
              key={item.view}
              view={item.view} 
              label={item.label} 
              active={currentView === item.view} 
              onClick={setCurrentView}
              theme={theme}
              icon={item.icon}
            />
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <button 
            onClick={onToggleTheme}
            className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 font-black text-xs transition-all shadow-sm active:scale-95 ${
              theme === 'dark' ? 'bg-slate-800 text-yellow-400 border border-slate-700 hover:bg-slate-700' : 'bg-mochi-yellow text-slate-700 border border-orange-200 hover:bg-yellow-100 shadow-mochi-sm'
            }`}
          >
            {theme === 'dark' ? '🌙 深色模式' : '✨ 奶油模式'}
          </button>
          <div className={`rounded-2xl p-4 border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-mochi-border shadow-mochi-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black truncate">{currentUser}</span>
              <button onClick={() => setCurrentUser('')} className="text-[10px] font-black uppercase text-rose-500">退出</button>
            </div>
            <button onClick={onOpenAdmin} className="w-full text-center text-[10px] text-slate-500 font-black uppercase">管理后台</button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-6 border-b transition-all ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-mochi-border backdrop-blur-md'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black italic transform -rotate-12 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-mochi-pink text-white shadow-mochi-sm'}`}>S</div>
          <span className="font-black italic tracking-tighter">StudioSync</span>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={onToggleTheme} className="text-xl">{theme === 'dark' ? '🌙' : '✨'}</button>
           <button onClick={() => setCurrentUser('')} className="text-sm font-black text-rose-500">退出</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0 transition-colors duration-500">
        <div className="max-w-7xl mx-auto p-4 md:p-12 pb-24 lg:pb-12">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 z-30 flex items-stretch border-t transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-mochi-border shadow-[0_-4px_20px_rgba(180,160,140,0.1)]'}`}>
        {navItems.map(item => (
          <NavItem 
            key={item.view}
            view={item.view} 
            label={item.label} 
            active={currentView === item.view} 
            onClick={setCurrentView}
            theme={theme}
            icon={item.icon}
            isMobile={true}
          />
        ))}
      </nav>
    </div>
  );
};
