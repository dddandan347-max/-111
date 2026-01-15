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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
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
  const [isEditingUser, setIsEditingUser] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            StudioSync
          </h1>
          <p className="text-xs text-slate-500 mt-1">团队协作中心</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <NavItem 
            view="tasks" 
            label="视频任务看板" 
            active={currentView === 'tasks'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <NavItem 
            view="finance" 
            label="财务收支" 
            active={currentView === 'finance'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <NavItem 
            view="prompts" 
            label="脚本与提示词" 
            active={currentView === 'prompts'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
          />
          <NavItem 
            view="assets" 
            label="素材与图片" 
            active={currentView === 'assets'} 
            onClick={setCurrentView}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-2">
                <div className="text-xs text-slate-500 mb-1">当前身份</div>
                {isEditingUser ? (
                  <input
                    autoFocus
                    type="text"
                    className="w-full bg-slate-700 text-white px-2 py-1 rounded text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
                    value={currentUser}
                    onChange={(e) => setCurrentUser(e.target.value)}
                    onBlur={() => setIsEditingUser(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingUser(false)}
                  />
                ) : (
                  <div 
                    className="text-sm font-semibold text-white truncate cursor-pointer hover:text-blue-400"
                    onClick={() => setIsEditingUser(true)}
                  >
                    {currentUser}
                  </div>
                )}
            </div>
            <button 
                onClick={onOpenAdmin}
                className="text-slate-500 hover:text-white p-2 rounded hover:bg-slate-700 transition-colors"
                title="管理员后台"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};