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
  const [currentUser, setCurrentUser] = useState<string>('');
  
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Initial Data Fetching
  useEffect(() => {
    fetchData();
  }, []);

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
            startDate: t.start_date, // Map snake_case to camelCase
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

        // Handle settings
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
      // Optimistic update
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
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) console.error('Error deleting task:', error);
  };

  const handleUpdateStatuses = async (newStatuses: TaskStatusDef[]) => {
      setTaskStatuses(newStatuses);
      // Upsert into app_settings
      const { error } = await supabase.from('app_settings').upsert({
          key: 'task_statuses',
          value: newStatuses
      });
      if (error) console.error('Error updating statuses:', error);
  };

  // --- Handlers for FinanceTracker ---
  const handleAddTransaction = async (newTrans: Transaction) => {
      setTransactions([newTrans, ...transactions]);
      const { error } = await supabase.from('transactions').insert({
          id: newTrans.id,
          description: newTrans.description,
          amount: newTrans.amount,
          type: newTrans.type,
          date: newTrans.date,
          category: newTrans.category,
          linked_task_id: newTrans.linkedTaskId,
          notes: newTrans.notes
      });
      if (error) console.error('Error adding transaction:', error);
  };

  const handleDeleteTransaction = async (id: string) => {
      setTransactions(transactions.filter(t => t.id !== id));
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) console.error('Error deleting transaction:', error);
  };

  const handleUpdateCategories = async (newCats: string[]) => {
      setFinanceCategories(newCats);
      const { error } = await supabase.from('app_settings').upsert({
          key: 'finance_categories',
          value: newCats
      });
      if (error) console.error('Error updating categories:', error);
  };

  // --- Handlers for PromptLibrary ---
  const handleAddPrompt = async (newPrompt: ScriptPrompt) => {
      setPrompts([newPrompt, ...prompts]);
      const { error } = await supabase.from('prompts').insert({
          id: newPrompt.id,
          title: newPrompt.title,
          content: newPrompt.content,
          tags: newPrompt.tags,
          created_at: newPrompt.createdAt
      });
      if (error) console.error('Error adding prompt:', error);
  };

  const handleDeletePrompt = async (id: string) => {
      setPrompts(prompts.filter(p => p.id !== id));
      const { error } = await supabase.from('prompts').delete().eq('id', id);
      if (error) console.error('Error deleting prompt:', error);
  };

  // --- Handlers for AssetGallery ---
  const handleAddAsset = async (newAsset: AssetItem) => {
      setAssets([newAsset, ...assets]);
      const { error } = await supabase.from('assets').insert({
          id: newAsset.id,
          name: newAsset.name,
          data_url: newAsset.dataUrl,
          type: newAsset.type
      });
      if (error) console.error('Error adding asset:', error);
  };

  const handleDeleteAsset = async (id: string) => {
      setAssets(assets.filter(a => a.id !== id));
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) console.error('Error deleting asset:', error);
  };

  // --- Handlers for Auth ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    // In a real app we would query the DB here, but we already fetched users
    const user = users.find(u => u.username === authUsername);
    
    if (!user) {
        setAuthError('用户不存在，请先注册');
        return;
    }

    if (user.password !== authPassword) {
        setAuthError('密码错误');
        return;
    }

    if (!user.isApproved) {
        setAuthError('账号等待管理员审核中，请联系管理员');
        return;
    }

    setCurrentUser(user.username);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authUsername.trim().length < 2) {
        setAuthError('用户名至少需要2个字符');
        return;
    }

    if (authPassword.length < 4) {
        setAuthError('密码至少需要4个字符');
        return;
    }

    if (users.some(u => u.username === authUsername)) {
        setAuthError('该用户名已被注册');
        return;
    }

    const newUser: User = {
        username: authUsername.trim(),
        password: authPassword,
        isApproved: false
    };

    // Update local state
    setUsers([...users, newUser]);
    
    // Update DB
    const { error } = await supabase.from('app_users').insert(newUser);

    if (error) {
        setAuthError('注册失败，请稍后重试');
        console.error(error);
    } else {
        setAuthSuccess('注册成功！请等待管理员审核您的账号。');
        setAuthMode('login');
        setAuthPassword('');
    }
  };

  const handleAdminLogin = () => {
      if (adminAuthInput === ADMIN_PASSWORD) {
          setIsAdminAuthenticated(true);
          setAdminAuthInput('');
      } else {
          alert('管理员密码错误');
      }
  };

  const approveUser = async (username: string) => {
      setUsers(users.map(u => u.username === username ? { ...u, isApproved: true } : u));
      await supabase.from('app_users').update({ is_approved: true }).eq('username', username);
  };

  const deleteUser = async (username: string) => {
      if (confirm(`确定要删除用户 "${username}" 吗?`)) {
          setUsers(users.filter(u => u.username !== username));
          await supabase.from('app_users').delete().eq('username', username);
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'tasks':
        return <TaskBoard 
            tasks={tasks} 
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            currentUser={currentUser} 
            statuses={taskStatuses}
            onUpdateStatuses={handleUpdateStatuses}
        />;
      case 'finance':
        return <FinanceTracker 
            transactions={transactions} 
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            tasks={tasks} 
            categories={financeCategories}
            onUpdateCategories={handleUpdateCategories}
        />;
      case 'prompts':
        return <PromptLibrary 
            prompts={prompts} 
            onAddPrompt={handleAddPrompt}
            onDeletePrompt={handleDeletePrompt}
        />;
      case 'assets':
        return <AssetGallery 
            assets={assets} 
            onAddAsset={handleAddAsset}
            onDeleteAsset={handleDeleteAsset}
        />;
      default:
        return <div className="text-white">请选择一个视图</div>;
    }
  };

  const renderAdminPanel = () => (
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-lg w-full relative z-10 pointer-events-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">管理员后台</h2>
            <button 
                onClick={() => { setShowAdminPanel(false); setIsAdminAuthenticated(false); setAdminAuthInput(''); }}
                className="text-slate-400 hover:text-white"
            >
                {currentUser ? '关闭' : '返回'}
            </button>
          </div>

          {!isAdminAuthenticated ? (
              <div className="space-y-4">
                  <p className="text-slate-400 text-sm">请输入管理员密码以管理用户。</p>
                  <input 
                    type="password" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="管理员密码"
                    value={adminAuthInput}
                    onChange={(e) => setAdminAuthInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                  <button 
                    onClick={handleAdminLogin}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    验证
                  </button>
              </div>
          ) : (
              <div className="space-y-4">
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {users.length === 0 ? (
                          <div className="text-center text-slate-500 py-8">暂无注册用户</div>
                      ) : users.map(user => (
                          <div key={user.username} className="bg-slate-800 p-3 rounded-lg flex items-center justify-between border border-slate-700">
                              <div>
                                  <div className="font-bold text-white">{user.username}</div>
                                  <div className="text-xs">
                                      {user.isApproved ? (
                                          <span className="text-green-400">已审核</span>
                                      ) : (
                                          <span className="text-yellow-400">待审核</span>
                                      )}
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  {!user.isApproved && (
                                      <button 
                                        onClick={() => approveUser(user.username)}
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                                      >
                                          通过
                                      </button>
                                  )}
                                  <button 
                                    onClick={() => deleteUser(user.username)}
                                    className="bg-red-900/50 hover:bg-red-900 text-red-200 hover:text-white text-xs px-3 py-1.5 rounded transition-colors"
                                  >
                                      删除
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );

  // Login Screen
  if (!currentUser) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
              </div>

              {!showAdminPanel ? (
                  // User Login/Register Card
                  <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full relative z-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 text-center">StudioSync</h1>
                    <p className="text-slate-400 text-center mb-8">团队协作中心</p>
                    
                    {/* Tabs */}
                    <div className="flex bg-slate-800/50 p-1 rounded-lg mb-6">
                        <button 
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${authMode === 'login' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                        >
                            登录
                        </button>
                        <button 
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${authMode === 'register' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                        >
                            注册
                        </button>
                    </div>

                    <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">用户名</label>
                            <input 
                                autoFocus
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="请输入您的姓名"
                                value={authUsername}
                                onChange={(e) => setAuthUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">密码</label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder={authMode === 'register' ? "设置您的登录密码" : "请输入密码"}
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                            />
                        </div>

                        {authError && (
                            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                {authError}
                            </div>
                        )}
                        {authSuccess && (
                            <div className="text-green-400 text-sm bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                                {authSuccess}
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                        >
                            {authMode === 'login' ? '进入工作台' : '提交注册'}
                        </button>

                        <button 
                            type="button"
                            onClick={() => setCurrentUser('Developer')}
                            className="w-full mt-3 bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 font-medium py-2 rounded-lg transition-colors text-sm border-dashed"
                        >
                            开发测试免登录
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => setShowAdminPanel(true)}
                            className="text-slate-600 text-xs hover:text-slate-400 transition-colors"
                        >
                            管理员入口
                        </button>
                    </div>
                  </div>
              ) : (
                  renderAdminPanel()
              )}
          </div>
      )
  }

  // Authenticated View
  return (
    <>
        <Layout 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenAdmin={() => setShowAdminPanel(true)}
        >
        {renderContent()}
        </Layout>
        
        {/* Admin Modal Overlay when logged in */}
        {showAdminPanel && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                {renderAdminPanel()}
            </div>
        )}
    </>
  );
}