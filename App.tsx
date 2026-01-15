import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TaskBoard } from './components/TaskBoard';
import { FinanceTracker } from './components/FinanceTracker';
import { PromptLibrary } from './components/PromptLibrary';
import { AssetGallery } from './components/AssetGallery';
import { ViewState, VideoTask, Transaction, ScriptPrompt, AssetItem, TaskStatusDef, User } from './types';

// Helper for local storage
function useStickyState<T>(defaultValue: T, key: string): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

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
  const [currentUser, setCurrentUser] = useStickyState<string>('', 'studio_current_user');
  
  // Auth State
  const [users, setUsers] = useStickyState<User[]>([], 'studio_users');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Admin State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminAuthInput, setAdminAuthInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Application Data States (Persisted)
  const [tasks, setTasks] = useStickyState<VideoTask[]>([
      { 
        id: '1', 
        title: '产品发布预告片', 
        status: 'Scripting', 
        assignee: '', 
        deadline: '2023-12-01', 
        startDate: '2023-11-20',
        priority: 'High',
        tag: '宣传片',
        notes: '初步构思：展示产品核心功能，风格要科技感强。' 
      }
  ], 'studio_tasks');
  
  const [transactions, setTransactions] = useStickyState<Transaction[]>([], 'studio_finance');
  const [prompts, setPrompts] = useStickyState<ScriptPrompt[]>([], 'studio_prompts');
  const [assets, setAssets] = useStickyState<AssetItem[]>([], 'studio_assets');
  const [financeCategories, setFinanceCategories] = useStickyState<string[]>(DEFAULT_CATEGORIES, 'studio_finance_categories');
  const [taskStatuses, setTaskStatuses] = useStickyState<TaskStatusDef[]>(DEFAULT_STATUSES, 'studio_task_statuses');

  // Auth Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

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

  const handleRegister = (e: React.FormEvent) => {
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

    setUsers([...users, newUser]);
    setAuthSuccess('注册成功！请等待管理员审核您的账号。');
    setAuthMode('login');
    setAuthPassword(''); // Keep username for convenience
  };

  const handleAdminLogin = () => {
      if (adminAuthInput === ADMIN_PASSWORD) {
          setIsAdminAuthenticated(true);
          setAdminAuthInput('');
      } else {
          alert('管理员密码错误');
      }
  };

  const approveUser = (username: string) => {
      setUsers(users.map(u => u.username === username ? { ...u, isApproved: true } : u));
  };

  const deleteUser = (username: string) => {
      if (confirm(`确定要删除用户 "${username}" 吗?`)) {
          setUsers(users.filter(u => u.username !== username));
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'tasks':
        return <TaskBoard 
            tasks={tasks} 
            setTasks={setTasks} 
            currentUser={currentUser} 
            statuses={taskStatuses}
            setStatuses={setTaskStatuses}
        />;
      case 'finance':
        return <FinanceTracker 
            transactions={transactions} 
            setTransactions={setTransactions} 
            tasks={tasks} 
            categories={financeCategories}
            setCategories={setFinanceCategories}
        />;
      case 'prompts':
        return <PromptLibrary prompts={prompts} setPrompts={setPrompts} />;
      case 'assets':
        return <AssetGallery assets={assets} setAssets={setAssets} />;
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