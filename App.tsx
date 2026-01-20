
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TaskBoard } from './components/TaskBoard';
import { FinanceTracker } from './components/FinanceTracker';
import { PromptLibrary } from './components/PromptLibrary';
import { AssetGallery } from './components/AssetGallery';
import { DocumentCenter } from './components/DocumentCenter';
import { ViewState, VideoTask, Transaction, ScriptPrompt, AssetItem, TaskStatusDef, User, DocItem, AssetFolder } from './types';
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

const DEFAULT_ASSET_FOLDERS: AssetFolder[] = [
  { id: 'moodboard', name: '情绪板', icon: '🖼️' },
  { id: 'location', name: '场景勘查', icon: '📍' },
  { id: 'styling', name: '妆造参考', icon: '👗' },
  { id: 'lighting', name: '灯光草图', icon: '💡' }
];

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
  const [assetFolders, setAssetFolders] = useState<AssetFolder[]>(DEFAULT_ASSET_FOLDERS);
  
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
            supabase.from('assets').select('*').order('id', { ascending: false }),
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
        
        if (assetsRes.data) {
          setAssets(assetsRes.data.map(a => ({ 
            id: a.id, 
            name: a.name, 
            dataUrl: a.data_url, 
            type: a.type || 'image', 
            folderId: a.folder_id 
          })));
        }

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
            const folderSetting = settingsRes.data.find(s => s.key === 'asset_folders');
            if (folderSetting) setAssetFolders(folderSetting.value);
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

  const handleUpdateFolders = async (newFolders: AssetFolder[]) => {
    setAssetFolders(newFolders);
    await supabase.from('app_settings').upsert({ key: 'asset_folders', value: newFolders });
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
          users={userList} 
          onUpdateCategories={async(c) => { setFinanceCategories(c); await supabase.from('app_settings').upsert({key:'finance_categories', value:c}); }} 
        />;
      case 'prompts':
        return <PromptLibrary prompts={prompts} 
          onAddPrompt={async(p)=>{
            await supabase.from('prompts').upsert({id:p.id, title:p.title, content:p.content, tags:p.tags, created_at:p.createdAt}); 
            fetchData();
          }} 
          onDeletePrompt={async(id) => { 
            await supabase.from('prompts').delete().eq('id', id);
            fetchData();
          }} 
        />;
      case 'documents':
        return <DocumentCenter docs={docs} onAddDoc={async(d)=>{await supabase.from('documents').upsert({id:d.id, title:d.title, content:d.content, category:d.category, updated_at:d.updatedAt, author:d.author}); fetchData();}} onDeleteDoc={async(id)=>{await supabase.from('documents').delete().eq('id', id); fetchData();}} currentUser={currentUser} />;
      case 'assets':
        return <AssetGallery 
          assets={assets} 
          folders={assetFolders}
          onAddAsset={async(a)=>{
            await supabase.from('assets').insert({
              id: a.id, name: a.name, data_url: a.dataUrl, type: a.type, folder_id: a.folderId
            });
            await fetchData();
          }} 
          onUpdateAsset={async(a)=>{
            await supabase.from('assets').update({ name: a.name, folder_id: a.folderId }).eq('id', a.id); 
            await fetchData();
          }}
          onDeleteAsset={async(id)=>{
            // 乐观更新：立即从本地 UI 移除
            setAssets(prev => prev.filter(item => item.id !== id));
            try {
              const { error } = await supabase.from('assets').delete().eq('id', id); 
              if (error) {
                console.error("Delete asset error:", error);
                await fetchData(); // 如果失败了，重新抓取还原 UI
                return;
              }
              // 不再需要显式 fetchData，因为乐观更新已经处理了本地状态
            } catch (e) {
              await fetchData();
            }
          }} 
          onAddFolder={async(f) => {
            const nextFolders = [...assetFolders, f];
            setAssetFolders(nextFolders);
            await supabase.from('app_settings').upsert({ key: 'asset_folders', value: nextFolders });
          }}
          onDeleteFolder={async(id) => {
            const nextFolders = assetFolders.filter(f => f.id !== id);
            setAssetFolders(nextFolders);
            await supabase.from('app_settings').upsert({ key: 'asset_folders', value: nextFolders });
          }}
        />;
      default: return null;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === authUsername);
    if (!user) { setAuthError('用户不存在'); return; }
    if (user.password !== authPassword) { setAuthError('密码错误'); return; }
    if (!user.isApproved) { setAuthError('账号审核中，请联系管理员'); return; }
    setCurrentUser(user.username);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.username === authUsername)) { setAuthError('该用户名已被占用'); return; }
    if (authPassword.length < 6) { setAuthError('密码至少需要6位'); return; }
    await supabase.from('app_users').insert({ username: authUsername, password: authPassword, is_approved: false });
    setAuthSuccess('申请已提交，请等待审核后登录');
    setAuthUsername('');
    setAuthPassword('');
    setAuthMode('login');
    fetchData();
  };

  const handleAdminLogin = () => {
      if (adminAuthInput === ADMIN_PASSWORD) { setIsAdminAuthenticated(true); fetchData(); } else { alert('密码错误'); }
  };

  const renderAdminPanel = () => (
      <div className="bg-slate-900 dark:bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-white italic">ADMIN CONTROL</h2><button onClick={() => setShowAdminPanel(false)} className="text-slate-400 hover:text-white transition-colors p-2 text-xl">×</button></div>
          {!isAdminAuthenticated ? (
              <div className="space-y-4"><input type="password" className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="管理员核心密钥" value={adminAuthInput} onChange={(e) => setAdminAuthInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} /><button onClick={handleAdminLogin} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-4 rounded-2xl text-white font-black tracking-widest uppercase text-sm shadow-xl">验证权限</button></div>
          ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">{users.map(u => (
                  <div key={u.username} className="bg-slate-800/50 p-5 rounded-2xl flex items-center justify-between border border-slate-700/50">
                      <div>
                        <div className="text-white font-black flex items-center gap-2">{u.username} {!u.isApproved && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 tracking-widest uppercase">待审</span>}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">PWD: {u.password.substring(0,2)}****</div>
                      </div>
                      <div className="flex gap-2">
                          {!u.isApproved && <button onClick={async() => {await supabase.from('app_users').update({is_approved:true}).eq('username',u.username); fetchData();}} className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">通过</button>}
                          <button onClick={async() => {if(confirm(`确定删除用户 ${u.username} 吗？`)){await supabase.from('app_users').delete().eq('username',u.username); fetchData();}}} className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">移除</button>
                      </div>
                  </div>
              ))}</div>
          )}
      </div>
  );

  if (!currentUser) {
      return (
          <div className={`min-h-screen relative flex items-center justify-center p-4 overflow-hidden transition-colors duration-700 ${theme === 'dark' ? 'bg-[#030712]' : 'bg-mochi-bg'}`}>
              <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 animate-pulse transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-mochi-pink'}`}></div>
              <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 animate-pulse transition-colors ${theme === 'dark' ? 'bg-purple-600' : 'bg-mochi-yellow'}`}></div>
              
              {!showAdminPanel ? (
                  <div className="relative w-full max-w-lg z-10">
                    <div className={`backdrop-blur-3xl rounded-[3rem] border p-10 lg:p-14 shadow-2xl transition-all duration-500 transform ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white/70 border-mochi-border'}`}>
                        <div className="flex flex-col items-center mb-12">
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-4xl font-black italic transform -rotate-12 mb-6 shadow-2xl ${theme === 'dark' ? 'bg-blue-600 text-white shadow-blue-900/40' : 'bg-mochi-pink text-white shadow-mochi'}`}>S</div>
                            <h1 className={`text-4xl font-black italic tracking-tighter transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                Studio<span className={theme === 'dark' ? 'text-blue-500' : 'text-rose-400'}>Sync</span>
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mt-3">Team_Collaboration_OS</p>
                        </div>

                        <div className={`flex p-1.5 rounded-2xl mb-8 border transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
                            <button 
                                className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${authMode === 'login' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-500'}`} 
                                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                            >
                                登 录
                            </button>
                            <button 
                                className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${authMode === 'register' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-500'}`} 
                                onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                            >
                                注 册
                            </button>
                        </div>

                        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Username / 用户名</label>
                                <input 
                                    type="text" 
                                    className={`w-full rounded-[1.5rem] px-6 py-5 font-bold outline-none border transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:bg-slate-950' : 'bg-white/50 border-slate-200 text-slate-800 focus:border-rose-300 focus:bg-white'}`} 
                                    placeholder="输入您的成员代号..." 
                                    value={authUsername} 
                                    onChange={(e) => setAuthUsername(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Security Key / 密码</label>
                                <input 
                                    type="password" 
                                    className={`w-full rounded-[1.5rem] px-6 py-5 font-bold outline-none border transition-all ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:bg-slate-950' : 'bg-white/50 border-slate-200 text-slate-800 focus:border-rose-300 focus:bg-white'}`} 
                                    placeholder="输入您的安全密钥..." 
                                    value={authPassword} 
                                    onChange={(e) => setAuthPassword(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="min-h-[20px]">
                                {authError && <div className="text-rose-500 text-[11px] font-black flex items-center gap-2 animate-shake"><span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">!</span> {authError}</div>}
                                {authSuccess && <div className="text-emerald-500 text-[11px] font-black flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span> {authSuccess}</div>}
                            </div>

                            <button 
                                type="submit" 
                                className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl active:scale-[0.98] active:jelly ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40' : 'bg-mochi-pink hover:bg-rose-400 text-white shadow-mochi'}`}
                            >
                                {authMode === 'login' ? '进 入 工作区' : '提 交 申 请'}
                            </button>
                        </form>
                        
                        <div className="mt-12 flex justify-center items-center gap-4">
                            <div className={`h-[1px] flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                            <button onClick={() => setShowAdminPanel(true)} className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${theme === 'dark' ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}>
                                系统控制入口
                            </button>
                            <div className={`h-[1px] flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                        </div>
                    </div>
                  </div>
              ) : (
                <div className="z-10 w-full flex justify-center animate-popIn">
                    {renderAdminPanel()}
                </div>
              )}
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
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                {renderAdminPanel()}
            </div>
        )}
    </>
  );
}
