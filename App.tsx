
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TaskBoard } from './components/TaskBoard';
import { FinanceTracker } from './components/FinanceTracker';
import { PromptLibrary } from './components/PromptLibrary';
import { AssetGallery } from './components/AssetGallery';
import { DocumentCenter } from './components/DocumentCenter';
import { ViewState, VideoTask, Transaction, ScriptPrompt, AssetItem, TaskStatusDef, User, DocItem } from './types';
import { supabase } from './services/supabase';

const ADMIN_PASSWORD = 'Qq1640668066';

const DEFAULT_CATEGORIES = [
  '平台收益', '外包成本', '道具服装', '软件订阅', '餐饮差旅', '设备租赁', '营销推广', '其他'
];

const DEFAULT_STATUSES: TaskStatusDef[] = [
  { id: 'Idea', label: '创意构思', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 dark:border-purple-500/20' },
  { id: 'Scripting', label: '脚本撰写', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
  { id: 'Filming', label: '拍摄中', color: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' },
  { id: 'Editing', label: '后期剪辑', color: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20' },
  { id: 'Done', label: '已完成', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
];

const DEFAULT_TAGS = ['常规', 'Vlog', '短视频', '广告', '纪录片'];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('tasks');
  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('studiosync_user') || '');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('studiosync_theme') as 'dark' | 'light') || 'dark');
  
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prompts, setPrompts] = useState<ScriptPrompt[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [financeCategories, setFinanceCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusDef[]>(DEFAULT_STATUSES);
  const [taskTags, setTaskTags] = useState<string[]>(DEFAULT_TAGS);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminAuthInput, setAdminAuthInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('studiosync_admin_session') === 'true';
  });

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('studiosync_theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) localStorage.setItem('studiosync_user', currentUser);
  }, [currentUser]);

  const fetchData = async () => {
    try {
        const [
            usersRes, tasksRes, transRes, promptsRes, assetsRes, settingsRes, docsRes
        ] = await Promise.all([
            supabase.from('app_users').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('transactions').select('*').order('date', { ascending: false }),
            supabase.from('prompts').select('*').order('created_at', { ascending: false }),
            supabase.from('assets').select('*'),
            supabase.from('app_settings').select('*'),
            supabase.from('documents').select('*').order('updated_at', { ascending: false })
        ]);

        if (usersRes.data) {
            setUsers(usersRes.data.map(u => ({
                username: u.username,
                password: u.password,
                isApproved: u.is_approved
            })));
        }
        if (tasksRes.data) setTasks(tasksRes.data.map(t => ({ ...t, startDate: t.start_date })));
        if (transRes.data) setTransactions(transRes.data.map(t => ({ ...t, linkedTaskId: t.linked_task_id })));
        if (promptsRes.data) setPrompts(promptsRes.data.map(p => ({ ...p, createdAt: p.created_at })));
        if (assetsRes.data) setAssets(assetsRes.data.map(a => ({ ...a, dataUrl: a.data_url })));
        if (docsRes.data) setDocs(docsRes.data.map(d => ({ 
            id: d.id, title: d.title, content: d.content, category: d.category, updatedAt: d.updated_at, author: d.author 
        })));

        if (settingsRes.data) {
            const catSetting = settingsRes.data.find(s => s.key === 'finance_categories');
            if (catSetting) setFinanceCategories(catSetting.value);
            const statusSetting = settingsRes.data.find(s => s.key === 'task_statuses');
            if (statusSetting) setTaskStatuses(statusSetting.value);
            const tagsSetting = settingsRes.data.find(s => s.key === 'task_tags');
            if (tagsSetting) setTaskTags(tagsSetting.value);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
  };

  const handleUpdateTags = async (newTags: string[]) => {
    setTaskTags(newTags);
    await supabase.from('app_settings').upsert({ key: 'task_tags', value: newTags });
  };

  const handleUpdateStatuses = async (newStatuses: TaskStatusDef[]) => {
    setTaskStatuses(newStatuses);
    await supabase.from('app_settings').upsert({ key: 'task_statuses', value: newStatuses });
  };

  const renderContent = () => {
    const userList = users.map(u => u.username);
    switch (currentView) {
      case 'tasks':
        return <TaskBoard 
            tasks={tasks} 
            onAddTask={async(t)=>{await supabase.from('tasks').insert({id:t.id, title:t.title, assignee:t.assignee, status:t.status, deadline:t.deadline, start_date:t.startDate, priority:t.priority, tag:t.tag, notes:t.notes}); fetchData();}} 
            onUpdateTask={async(t)=>{await supabase.from('tasks').update({title:t.title, status:t.status, assignee:t.assignee, deadline:t.deadline, start_date:t.startDate, priority:t.priority, tag:t.tag, notes:t.notes}).eq('id', t.id); fetchData();}} 
            onDeleteTask={async(id)=>{await supabase.from('tasks').delete().eq('id', id); fetchData();}} 
            currentUser={currentUser} 
            statuses={taskStatuses} 
            onUpdateStatuses={handleUpdateStatuses}
            tags={taskTags}
            onUpdateTags={handleUpdateTags}
        />;
      case 'finance':
        return <FinanceTracker 
          transactions={transactions} 
          onAddTransaction={async(t)=>{await supabase.from('transactions').insert({id:t.id, description:t.description, amount:t.amount, type:t.type, date:t.date, category:t.category, operator: t.operator, linked_task_id:t.linkedTaskId, notes:t.notes}); fetchData();}} 
          onDeleteTransaction={async(id)=>{await supabase.from('transactions').delete().eq('id', id); fetchData();}} 
          tasks={tasks} 
          categories={financeCategories} 
          users={userList} // 注入用户列表
          onUpdateCategories={async(c) => { setFinanceCategories(c); await supabase.from('app_settings').upsert({key:'finance_categories', value:c}); }} 
        />;
      case 'prompts':
        return <PromptLibrary prompts={prompts} onAddPrompt={async(p)=>{await supabase.from('prompts').upsert({id:p.id, title:p.title, content:p.content, tags:p.tags, created_at:p.createdAt}); fetchData();}} onDeletePrompt={(id) => { supabase.from('prompts').delete().eq('id', id).then(()=>fetchData()) }} />;
      case 'documents':
        return <DocumentCenter docs={docs} onAddDoc={async(d)=>{await supabase.from('documents').upsert({id:d.id, title:d.title, content:d.content, category:d.category, updated_at:d.updatedAt, author:d.author}); fetchData();}} onDeleteDoc={async(id)=>{await supabase.from('documents').delete().eq('id', id); fetchData();}} currentUser={currentUser} />;
      case 'assets':
        return <AssetGallery assets={assets} onAddAsset={async(a)=>{await supabase.from('assets').insert({id:a.id, name:a.name, data_url:a.dataUrl, type:a.type}); fetchData();}} onDeleteAsset={async(id)=>{await supabase.from('assets').delete().eq('id', id); fetchData();}} />;
      default: return null;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === authUsername);
    if (!user || user.password !== authPassword || !user.isApproved) { setAuthError('凭据无效或账号待审核'); return; }
    setCurrentUser(user.username);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.username === authUsername)) { setAuthError('用户名已存在'); return; }
    await supabase.from('app_users').insert({ username: authUsername, password: authPassword, is_approved: false });
    setAuthSuccess('申请已提交，请等待审核');
    setAuthMode('login');
    fetchData();
  };

  const handleAdminLogin = () => {
      if (adminAuthInput === ADMIN_PASSWORD) { setIsAdminAuthenticated(true); fetchData(); } else { alert('密码错误'); }
  };

  const renderAdminPanel = () => (
      <div className="bg-slate-900 dark:bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white">管理员后台</h2><button onClick={() => setShowAdminPanel(false)} className="text-slate-400">关闭</button></div>
          {!isAdminAuthenticated ? (
              <div className="space-y-4"><input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="管理员密码" value={adminAuthInput} onChange={(e) => setAdminAuthInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} /><button onClick={handleAdminLogin} className="w-full bg-purple-600 py-3 rounded-lg text-white">验证</button></div>
          ) : (
              <div className="space-y-4">{users.map(u => (
                  <div key={u.username} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                      <div className="text-white font-bold">{u.username} {!u.isApproved && <span className="text-xs text-yellow-500">(待审)</span>}</div>
                      <div className="flex gap-2">
                          {!u.isApproved && <button onClick={async() => {await supabase.from('app_users').update({is_approved:true}).eq('username',u.username); fetchData();}} className="bg-green-600 px-3 py-1 rounded text-xs">通过</button>}
                          <button onClick={async() => {await supabase.from('app_users').delete().eq('username',u.username); fetchData();}} className="bg-red-900/40 px-3 py-1 rounded text-xs">删除</button>
                      </div>
                  </div>
              ))}</div>
          )}
      </div>
  );

  if (!currentUser) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              {!showAdminPanel ? (
                  <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full animate-popIn">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 text-center font-mono tracking-tighter">StudioSync</h1>
                    <div className="flex bg-slate-800/50 p-1 rounded-lg mb-6 border border-slate-700">
                        <button className={`flex-1 py-2 text-sm rounded-md transition-all ${authMode === 'login' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400'}`} onClick={() => setAuthMode('login')}>登录</button>
                        <button className={`flex-1 py-2 text-sm rounded-md transition-all ${authMode === 'register' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400'}`} onClick={() => setAuthMode('register')}>注册</button>
                    </div>
                    <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                        <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="用户名" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required />
                        <input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="密码" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                        {authError && <div className="text-red-400 text-xs">{authError}</div>}
                        {authSuccess && <div className="text-green-400 text-xs">{authSuccess}</div>}
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">{authMode === 'login' ? '登录' : '申请加入'}</button>
                    </form>
                    <button onClick={() => setShowAdminPanel(true)} className="w-full mt-6 text-slate-600 text-[10px] uppercase tracking-widest">管理员入口</button>
                  </div>
              ) : renderAdminPanel()}
          </div>
      )
  }

  return (
    <>
        <Layout 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
          onOpenAdmin={() => setShowAdminPanel(true)}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        >
            {renderContent()}
        </Layout>
        {showAdminPanel && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                {renderAdminPanel()}
            </div>
        )}
    </>
  );
}
