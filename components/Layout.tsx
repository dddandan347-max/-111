
import React, { useState } from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  children: React.ReactNode;
  currentUser: string;
  setCurrentUser: (user: string) => void;
  onOpenAdmin: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

interface NavItemProps {
  view: ViewState;
  label: string;
  active: boolean;
  onClick: (v: ViewState) => void;
  icon: React.ReactNode;
  theme: 'dark' | 'light';
}

const NavItem = ({ 
  view, 
  label, 
  active, 
  onClick, 
  icon,
  theme
}: NavItemProps) => {
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { view: 'tasks' as ViewState, label: '视频任务', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { view: 'prompts' as ViewState, label: '脚本工坊', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { view: 'documents' as ViewState, label: 'SOP 文档', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { view: 'assets' as ViewState, label: '参考仓库', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { view: 'finance' as ViewState, label: '财务账本', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setIsDrawerOpen(false);
  };

  const SidebarContent = () => (
    <>
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
          // Fixed type error by ensuring 'key' is handled by React and not passed as a component prop
          <NavItem 
            key={item.view}
            view={item.view} 
            label={item.label} 
            active={currentView === item.view} 
            onClick={handleNavClick}
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
          <button onClick={() => { onOpenAdmin(); setIsDrawerOpen(false); }} className="w-full text-center text-[10px] text-slate-500 font-black uppercase">管理后台</button>
        </div>
      </div>
    </>
  );

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-mochi-bg text-mochi-text'}`}>
      {/* PC Side Sidebar */}
      <aside className={`hidden lg:flex w-72 border-r flex-col shrink-0 z-20 transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'mochi-glass border-mochi-border shadow-2xl shadow-orange-900/5'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${isDrawerOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsDrawerOpen(false)}
        />
        {/* Drawer */}
        <aside className={`absolute top-0 left-0 bottom-0 w-72 flex flex-col transition-transform duration-300 ease-out transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} ${theme === 'dark' ? 'bg-slate-900' : 'bg-mochi-bg'}`}>
          <SidebarContent />
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className={`lg:hidden h-16 shrink-0 z-30 flex items-center justify-between px-6 border-b transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border'}`}>
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black italic transform -rotate-12 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-mochi-pink text-white'}`}>S</div>
            <h1 className="text-xl font-black tracking-tighter italic">StudioSync</h1>
          </div>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
};