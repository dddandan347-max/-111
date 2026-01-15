
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
  { id: 'Idea', label: '创意构思', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'Scripting', label: '脚本撰写', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { id: 'Filming', label: '拍摄中', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { id: 'Editing', label: '后期剪辑', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'Done', label: '已完成', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('tasks');
  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('studiosync_user') || '');
  
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prompts, setPrompts] = useState<ScriptPrompt[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [financeCategories, setFinanceCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusDef[]>(DEFAULT_STATUSES);

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
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) localStorage.setItem('studiosync_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('studiosync_admin_session', String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

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
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
  };

  const handleAddPrompt = async (newPrompt: ScriptPrompt) => {
      const { error } = await supabase.from('prompts').upsert({
          id: newPrompt.id,
          title: newPrompt.title,
          content: newPrompt.content,
          tags: newPrompt.tags,
          created_at: newPrompt.createdAt
      });
      if (!error) fetchData();
  };

  const handleAddDoc = async (doc: DocItem) => {
      const { error } = await supabase.from('documents').upsert({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          updated_at: doc.updatedAt,
          author: doc.author
      });
      if (!error) fetchData();
  };

  const handleDeleteDoc = async (id: string) => {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (!error) fetchData();
  };

  // ... (Other handlers like handleLogin, handleRegister, handleAdminLogin remain same) ...
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const user = users.find(u => u.username === authUsername);
    if (!user) { setAuthError('用户不存在'); return; }
    if (user.password !== authPassword) { setAuthError('密码错误'); return; }
    if (!user.isApproved) { setAuthError('账号待审核，请联系管理员'); return; }
    setCurrentUser(user.username);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthSuccess('');
    const trimmedUsername = authUsername.trim();
    if (users.some(u => u.username === trimmedUsername)) { setAuthError('该用户名已被占用'); return; }
    const newUserObj = { username: trimmedUsername, password: authPassword, is_approved: false };
    const { error } = await supabase.from('app_users').insert(newUserObj);
    if (error) { setAuthError('注册失败'); } else {
        setAuthSuccess('注册申请已提交！请等待管理员审核。');
        setAuthMode('login');
        fetchData(); 
    }
  };

  const handleAdminLogin = () => {
      if (adminAuthInput === ADMIN_PASSWORD) {
          setIsAdminAuthenticated(true);
          setAdminAuthInput('');
          fetchData();
      } else { alert('密码错误'); }
  };

  const approveUser = async (username: string) => {
      const { error } = await supabase.from('app_users').update({ is_approved: true }).eq('username', username);
      if (!error) fetchData();
  };

  const deleteUser = async (username: string) => {
      if (confirm(`确定要删除用户 "${username}" 吗?`)) {
          const { error } = await supabase.from('app_users').delete().eq('username', username);
          if (!error) fetchData();
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'tasks':
        return <TaskBoard tasks={tasks} onAddTask={async(t)=>{await supabase.from('tasks').insert({id:t.id, title:t.title, assignee:t.assignee, status:t.status, deadline:t.deadline, start_date:t.startDate, priority:t.priority, tag:t.tag, notes:t.notes}); fetchData();}} onUpdateTask={async(t)=>{await supabase.from('tasks').update({title:t.title, status:t.status, assignee:t.assignee, deadline:t.deadline, start_date:t.startDate, priority:t.priority, tag:t.tag, notes:t.notes}).eq('id', t.id); fetchData();}} onDeleteTask={async(id)=>{await supabase.from('tasks').delete().eq('id', id); fetchData();}} currentUser={currentUser} statuses={taskStatuses} onUpdateStatuses={(s) => setTaskStatuses(s)} />;
      case 'finance':
        return <FinanceTracker transactions={transactions} onAddTransaction={async(t)=>{await supabase.from('transactions').insert({id:t.id, description:t.description, amount:t.amount, type:t.type, date:t.date, category:t.category, linked_task_id:t.linkedTaskId, notes:t.notes}); fetchData();}} onDeleteTransaction={async(id)=>{await supabase.from('transactions').delete().eq('id', id); fetchData();}} tasks={tasks} categories={financeCategories} onUpdateCategories={(c) => setFinanceCategories(c)} />;
      case 'prompts':
        return <PromptLibrary prompts={prompts} onAddPrompt={handleAddPrompt} onDeletePrompt={(id) => { supabase.from('prompts').delete().eq('id', id).then(()=>fetchData()) }} />;
      case 'documents':
        return <DocumentCenter docs={docs} onAddDoc={handleAddDoc} onDeleteDoc={handleDeleteDoc} currentUser={currentUser} />;
      case 'assets':
        return <AssetGallery assets={assets} onAddAsset={async(a)=>{await supabase.from('assets').insert({id:a.id, name:a.name, data_url:a.dataUrl, type:a.type}); fetchData();}} onDeleteAsset={async(id)=>{await supabase.from('assets').delete().eq('id', id); fetchData();}} />;
      default: return null;
    }
  };

  // ... (renderAdminPanel, auth checks etc remain same as before) ...
  const renderAdminPanel = () => (
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl w-full relative z-10 pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">管理员后台</h2>
            <button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {!isAdminAuthenticated ? (
              <div className="space-y-4">
                  <p className="text-slate-400 text-sm">请输入超级管理员密码：</p>
                  <input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="管理员密码" value={adminAuthInput} onChange={(e) => setAdminAuthInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} autoFocus />
                  <button onClick={handleAdminLogin} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">验证身份</button>
              </div>
          ) : (
              <div className="space-y-8">
                  <div>
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-white">注册申请列表 ({users.length})</h3>
                          <button onClick={fetchData} className="text-xs text-blue-400 hover:underline">刷新</button>
                      </div>
                      <div className="space-y-3">
                          {users.length === 0 ? (
                              <div className="text-slate-500 text-center py-8 bg-slate-800/50 rounded-lg border border-dashed border-slate-700 font-medium">暂无用户记录</div>
                          ) : (
                              users.map(user => (
                                <div key={user.username} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700 hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.isApproved ? 'bg-blue-600' : 'bg-slate-700'}`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {user.username}
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${user.isApproved ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                    {user.isApproved ? '已开通' : '待审核'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5 font-mono">PWD: {user.password}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!user.isApproved && (
                                            <button onClick={() => approveUser(user.username)} className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded text-white text-xs font-bold transition-colors shadow-lg">通过</button>
                                        )}
                                        <button onClick={() => deleteUser(user.username)} className="bg-red-900/40 hover:bg-red-600 px-3 py-1.5 rounded text-red-200 hover:text-white text-xs font-bold transition-all">删除</button>
                                    </div>
                                </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          )}
      </div>
  );

  if (!currentUser) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
              {!showAdminPanel ? (
                  <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full relative z-10 animate-popIn">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 text-center font-mono tracking-tighter">StudioSync</h1>
                    <div className="flex bg-slate-800/50 p-1 rounded-lg mb-6 border border-slate-700">
                        <button className={`flex-1 py-2 text-sm rounded-md transition-all font-medium ${authMode === 'login' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setAuthMode('login')}>登录系统</button>
                        <button className={`flex-1 py-2 text-sm rounded-md transition-all font-medium ${authMode === 'register' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setAuthMode('register')}>新成员注册</button>
                    </div>
                    <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">用户名</label>
                            <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="请输入用户名" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">访问密码</label>
                            <input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="请输入密码" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                        </div>
                        {authError && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-500/20">{authError}</div>}
                        {authSuccess && <div className="text-green-400 text-xs bg-green-400/10 p-3 rounded-lg border border-green-500/20">{authSuccess}</div>}
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-[0.98]">
                            {authMode === 'login' ? '登 录' : '申请加入'}
                        </button>
                    </form>
                    <div className="mt-8 text-center pt-6 border-t border-slate-800">
                        <button onClick={() => setShowAdminPanel(true)} className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-slate-400 transition-colors">
                            —— 系统管理员入口 ——
                        </button>
                    </div>
                  </div>
              ) : renderAdminPanel()}
          </div>
      )
  }

  return (
    <>
        <Layout currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} setCurrentUser={setCurrentUser} onOpenAdmin={() => setShowAdminPanel(true)}>
            {renderContent()}
        </Layout>
        {showAdminPanel && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                {renderAdminPanel()}
            </div>
        )}
    </>
  );
}
