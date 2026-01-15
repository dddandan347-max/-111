
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TaskBoard } from './components/TaskBoard';
import { FinanceTracker } from './components/FinanceTracker';
import { PromptLibrary } from './components/PromptLibrary';
import { AssetGallery } from './components/AssetGallery';
import { ViewState, VideoTask, Transaction, ScriptPrompt, AssetItem, TaskStatusDef, User } from './types';
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
  
  // Persistence for user login
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('studiosync_user') || '';
  });
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prompts, setPrompts] = useState<ScriptPrompt[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [financeCategories, setFinanceCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusDef[]>(DEFAULT_STATUSES);

  // Auth UI State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Admin State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminAuthInput, setAdminAuthInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('studiosync_admin_session') === 'true';
  });

  // New User State for Admin
  const [adminNewUser, setAdminNewUser] = useState({ username: '', password: '' });

  useEffect(() => {
    fetchData();
  }, []);

  // Save login state whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('studiosync_user', currentUser);
    } else {
      localStorage.removeItem('studiosync_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('studiosync_admin_session', String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  const fetchData = async () => {
    try {
        const [
            usersRes,
            tasksRes,
            transRes,
            promptsRes,
            assetsRes,
            settingsRes
        ] = await Promise.all([
            supabase.from('app_users').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('transactions').select('*').order('date', { ascending: false }),
            supabase.from('prompts').select('*').order('created_at', { ascending: false }),
            supabase.from('assets').select('*'),
            supabase.from('app_settings').select('*')
        ]);

        if (usersRes.data) setUsers(usersRes.data);
        if (tasksRes.data) setTasks(tasksRes.data.map(t => ({
            ...t,
            startDate: t.start_date,
        })));
        if (transRes.data) setTransactions(transRes.data.map(t => ({
            ...t,
            linkedTaskId: t.linked_task_id
        })));
        if (promptsRes.data) setPrompts(promptsRes.data.map(p => ({
            ...p,
            createdAt: p.created_at
        })));
        if (assetsRes.data) setAssets(assetsRes.data.map(a => ({
            ...a,
            dataUrl: a.data_url
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

  // --- Handlers for TaskBoard ---
  const handleAddTask = async (newTask: VideoTask) => {
      setTasks([...tasks, newTask]);
      const { error } = await supabase.from('tasks').insert({
          id: newTask.id,
          title: newTask.title,
          assignee: newTask.assignee,
          status: newTask.status,
          deadline: newTask.deadline,
          start_date: newTask.startDate,
          priority: newTask.priority,
          tag: newTask.tag,
          notes: newTask.notes
      });
      if (error) console.error('Error adding task:', error);
  };

  const handleUpdateTask = async (updatedTask: VideoTask) => {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      const { error } = await supabase.from('tasks').update({
          title: updatedTask.title,
          assignee: updatedTask.assignee,
          status: updatedTask.status,
          deadline: updatedTask.deadline,
          start_date: updatedTask.startDate,
          priority: updatedTask.priority,
          tag: updatedTask.tag,
          notes: updatedTask.notes
      }).eq('id', updatedTask.id);
      if (error) console.error('Error updating task:', error);
  };

  const handleDeleteTask = async (id: string) => {
      setTasks(tasks.filter(t => t.id !== id));
      await supabase.from('tasks').delete().eq('id', id);
  };

  const handleUpdateStatuses = async (newStatuses: TaskStatusDef[]) => {
      setTaskStatuses(newStatuses);
      await supabase.from('app_settings').upsert({
          key: 'task_statuses',
          value: newStatuses
      });
  };

  // --- Handlers for FinanceTracker ---
  const handleAddTransaction = async (newTrans: Transaction) => {
      setTransactions([newTrans, ...transactions]);
      await supabase.from('transactions').insert({
          id: newTrans.id,
          description: newTrans.description,
          amount: newTrans.amount,
          type: newTrans.type,
          date: newTrans.date,
          category: newTrans.category,
          linked_task_id: newTrans.linkedTaskId,
          notes: newTrans.notes
      });
  };

  const handleDeleteTransaction = async (id: string) => {
      setTransactions(transactions.filter(t => t.id !== id));
      await supabase.from('transactions').delete().eq('id', id);
  };

  const handleUpdateCategories = async (newCats: string[]) => {
      setFinanceCategories(newCats);
      await supabase.from('app_settings').upsert({
          key: 'finance_categories',
          value: newCats
      });
  };

  // --- Handlers for PromptLibrary ---
  const handleAddPrompt = async (newPrompt: ScriptPrompt) => {
      setPrompts([newPrompt, ...prompts]);
      await supabase.from('prompts').insert({
          id: newPrompt.id,
          title: newPrompt.title,
          content: newPrompt.content,
          tags: newPrompt.tags,
          created_at: newPrompt.createdAt
      });
  };

  const handleDeletePrompt = async (id: string) => {
      setPrompts(prompts.filter(p => p.id !== id));
      await supabase.from('prompts').delete().eq('id', id);
  };

  // --- Handlers for AssetGallery ---
  const handleAddAsset = async (newAsset: AssetItem) => {
      setAssets([newAsset, ...assets]);
      await supabase.from('assets').insert({
          id: newAsset.id,
          name: newAsset.name,
          data_url: newAsset.dataUrl,
          type: newAsset.type
      });
  };

  const handleDeleteAsset = async (id: string) => {
      setAssets(assets.filter(a => a.id !== id));
      await supabase.from('assets').delete().eq('id', id);
  };

  // --- Handlers for Auth ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const user = users.find(u => u.username === authUsername);
    if (!user) { setAuthError('用户不存在'); return; }
    if (user.password !== authPassword) { setAuthError('密码错误'); return; }
    if (!user.isApproved) { setAuthError('账号待审核'); return; }
    setCurrentUser(user.username);
  };

  const handleLogout = () => {
    setCurrentUser('');
    setIsAdminAuthenticated(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(''); setAuthSuccess('');
    if (users.some(u => u.username === authUsername)) { setAuthError('该用户名已被注册'); return; }
    const newUser: User = { username: authUsername.trim(), password: authPassword, isApproved: false };
    setUsers([...users, newUser]);
    const { error } = await supabase.from('app_users').insert(newUser);
    if (error) { setAuthError('注册失败'); } else {
        setAuthSuccess('注册成功！请等待审核。');
        setAuthMode('login');
    }
  };

  const handleAdminLogin = () => {
      if (adminAuthInput === ADMIN_PASSWORD) {
          setIsAdminAuthenticated(true);
          setAdminAuthInput('');
      } else { alert('密码错误'); }
  };

  const adminAddUserDirectly = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!adminNewUser.username || !adminNewUser.password) return;
      const newUser: User = { ...adminNewUser, isApproved: true };
      setUsers([...users, newUser]);
      await supabase.from('app_users').insert(newUser);
      setAdminNewUser({ username: '', password: '' });
  };

  const approveUser = async (username: string) => {
      setUsers(users.map(u => u.username === username ? { ...u, isApproved: true } : u));
      await supabase.from('app_users').update({ is_approved: true }).eq('username', username);
  };

  const deleteUser = async (username: string) => {
      if (confirm(`删除用户 "${username}"?`)) {
          setUsers(users.filter(u => u.username !== username));
          await supabase.from('app_users').delete().eq('username', username);
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'tasks':
        return <TaskBoard tasks={tasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} currentUser={currentUser} statuses={taskStatuses} onUpdateStatuses={handleUpdateStatuses} />;
      case 'finance':
        return <FinanceTracker transactions={transactions} onAddTransaction={handleAddTransaction} onDeleteTransaction={handleDeleteTransaction} tasks={tasks} categories={financeCategories} onUpdateCategories={handleUpdateCategories} />;
      case 'prompts':
        return <PromptLibrary prompts={prompts} onAddPrompt={handleAddPrompt} onDeletePrompt={handleDeletePrompt} />;
      case 'assets':
        return <AssetGallery assets={assets} onAddAsset={handleAddAsset} onDeleteAsset={handleDeleteAsset} />;
      default: return null;
    }
  };

  const renderAdminPanel = () => (
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-2xl w-full relative z-10 pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">管理员后台</h2>
            <button 
                onClick={() => { setShowAdminPanel(false); }}
                className="text-slate-400 hover:text-white"
            >
                关闭
            </button>
          </div>

          {!isAdminAuthenticated ? (
              <div className="space-y-4">
                  <p className="text-slate-400 text-sm">输入管理密码解锁全部权限</p>
                  <input 
                    type="password" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="管理员密码"
                    value={adminAuthInput}
                    onChange={(e) => setAdminAuthInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                  <button onClick={handleAdminLogin} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg">验证</button>
              </div>
          ) : (
              <div className="space-y-8">
                  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-bold text-white mb-4">直接添加成员 (自动开通)</h3>
                      <form onSubmit={adminAddUserDirectly} className="flex gap-4">
                          <input 
                            placeholder="用户名" 
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
                            value={adminNewUser.username}
                            onChange={(e) => setAdminNewUser({...adminNewUser, username: e.target.value})}
                          />
                          <input 
                            type="password"
                            placeholder="密码" 
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
                            value={adminNewUser.password}
                            onChange={(e) => setAdminNewUser({...adminNewUser, password: e.target.value})}
                          />
                          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">添加</button>
                      </form>
                  </div>

                  <div>
                      <h3 className="text-lg font-bold text-white mb-4">成员管理</h3>
                      <div className="space-y-2">
                          {users.map(user => (
                              <div key={user.username} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border border-slate-700">
                                  <div>
                                      <div className="font-bold text-white">{user.username}</div>
                                      <div className="text-xs text-slate-500">密码: {user.password} | 状态: {user.isApproved ? <span className="text-green-400">已开通</span> : <span className="text-yellow-400">待审核</span>}</div>
                                  </div>
                                  <div className="flex gap-2">
                                      {!user.isApproved && <button onClick={() => approveUser(user.username)} className="bg-green-600 px-3 py-1 rounded text-white text-xs">通过审核</button>}
                                      <button onClick={() => deleteUser(user.username)} className="bg-red-900/50 px-3 py-1 rounded text-red-200 text-xs">移除</button>
                                  </div>
                              </div>
                          ))}
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
                  <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full relative z-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 text-center">StudioSync</h1>
                    <div className="flex bg-slate-800/50 p-1 rounded-lg mb-6">
                        <button className={`flex-1 py-2 text-sm rounded-md transition-all ${authMode === 'login' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`} onClick={() => setAuthMode('login')}>登录</button>
                        <button className={`flex-1 py-2 text-sm rounded-md transition-all ${authMode === 'register' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`} onClick={() => setAuthMode('register')}>注册</button>
                    </div>
                    <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                        <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="用户名" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} />
                        <input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white" placeholder="密码" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
                        {authError && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{authError}</div>}
                        {authSuccess && <div className="text-green-400 text-sm bg-green-400/10 p-3 rounded-lg">{authSuccess}</div>}
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20">{authMode === 'login' ? '登 录' : '注 册'}</button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => setShowAdminPanel(true)} className="text-slate-600 text-xs hover:text-slate-400">管理员管理入口</button>
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
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                {renderAdminPanel()}
            </div>
        )}
    </>
  );
}
