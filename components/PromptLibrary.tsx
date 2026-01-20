
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ScriptPrompt } from '../types';

interface PromptLibraryProps {
  prompts: ScriptPrompt[];
  onAddPrompt: (p: ScriptPrompt) => void;
  onDeletePrompt: (id: string) => void;
}

const FONT_SIZES = [
  { label: '14px 正文', val: '3' }, 
  { label: '18px 重点', val: '4' },
  { label: '24px 小标题', val: '5' },
  { label: '32px 大标题', val: '6' },
  { label: '48px 巨型', val: '7' },
];

const DEFAULT_CATEGORIES = ['全部', '短视频', '电影', '广告', '纪录片', '待处理'];

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ prompts, onAddPrompt, onDeletePrompt }) => {
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [localTopic, setLocalTopic] = useState('');
  const [activeTab, setActiveTab] = useState('全部');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  // 每次进入编辑器时加载内容
  useEffect(() => {
    if (activePromptId) {
      const prompt = prompts.find(p => p.id === activePromptId);
      if (prompt && editorRef.current) {
        editorRef.current.innerHTML = prompt.content || '';
        setLocalTopic(prompt.title);
      } else if (editorRef.current) {
        editorRef.current.innerHTML = '';
        setLocalTopic('');
      }
    }
  }, [activePromptId]);

  // 同步到数据库的函数
  const syncToDatabase = () => {
    if (!activePromptId || !editorRef.current) return;
    const content = editorRef.current.innerHTML;
    // 只有在有标题或内容时才保存
    if (localTopic.trim() || content.trim()) {
      onAddPrompt({
        id: activePromptId,
        title: localTopic || '未命名剧本',
        content,
        tags: activeTab === '全部' ? ['待处理'] : [activeTab],
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleEditorInput = () => {
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(syncToDatabase, 1500); // 1.5秒自动保存一次
  };

  const handleExit = () => {
    syncToDatabase(); // 离开前最后同步一次
    setActivePromptId(null);
  };

  const exec = (command: string, value: any = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const filteredPrompts = useMemo(() => {
    if (activeTab === '全部') return prompts;
    return prompts.filter(p => p.tags && p.tags.includes(activeTab));
  }, [prompts, activeTab]);

  const isEditing = activePromptId !== null;

  return (
    <div className={`h-full flex flex-col transition-all duration-500 ${isEditing ? 'fixed inset-0 z-[100] bg-white dark:bg-slate-950 p-0 overflow-hidden' : 'space-y-10'}`}>
      
      {!isEditing && (
        <>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-2">
              <h2 className={`text-7xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>剧本资产库</h2>
              <p className="text-xs font-bold opacity-30 uppercase tracking-[0.5em]">TEAM_COLLAB_VERSION_3.0</p>
            </div>
            <button 
              onClick={() => { setActivePromptId(Date.now().toString()); setLocalTopic(''); }}
              className={`px-12 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${
                theme === 'dark' ? 'bg-blue-600 text-white shadow-blue-900/40' : 'bg-rose-400 text-white shadow-mochi'
              }`}
            >
              + 新建资产
            </button>
          </div>

          <div className={`flex gap-3 p-1 rounded-3xl w-fit ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-slate-100/50'}`}>
             {DEFAULT_CATEGORIES.map(tag => (
               <button key={tag} onClick={() => setActiveTab(tag)} className={`px-8 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest ${activeTab === tag ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-800 shadow-md') : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}>
                 {tag}
               </button>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 pb-40">
            {filteredPrompts.map(p => (
              <div key={p.id} onClick={() => setActivePromptId(p.id)} className={`group relative p-10 rounded-[3.5rem] border transition-all duration-700 cursor-pointer min-h-[340px] flex flex-col justify-between overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-blue-500 shadow-xl' : 'bg-white border-mochi-border hover:shadow-mochi hover:-translate-y-3'}`}>
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                     <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>{p.tags?.[0] || '待处理'}</span>
                  </div>
                  <h3 className={`text-3xl font-black mb-6 line-clamp-2 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{p.title || '空标题剧本'}</h3>
                  <div className="text-sm opacity-40 line-clamp-3 leading-relaxed prose-sm dark:prose-invert">
                    {p.content?.replace(/<[^>]*>/g, '').substring(0, 100) || '暂无内容...'}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-8 border-t dark:border-slate-800">
                  <span className="text-[10px] font-mono opacity-20 font-black tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); if(confirm('确认彻底删除此资产？')){ onDeletePrompt(p.id); }}} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isEditing && (
        <div className="flex-1 flex flex-col h-full animate-fadeIn overflow-hidden bg-white dark:bg-slate-950">
          <div className="h-24 border-b flex items-center justify-between px-12 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl z-[110]">
             <button onClick={handleExit} className="flex items-center gap-4 font-black text-sm group">
                <div className="w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all font-sans">←</div>
                离开并同步
             </button>
             <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest animate-pulse">Auto Sync Enabled</span>
                  <span className="text-[8px] font-mono opacity-20 uppercase">Cloud_Sync_Active</span>
                </div>
             </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto pt-32 pb-80 custom-scrollbar scroll-smooth">
              <div className="max-w-4xl mx-auto px-12">
                 <input 
                  className="w-full bg-transparent text-8xl font-black mb-20 focus:outline-none placeholder:opacity-10 dark:text-white tracking-tighter" 
                  placeholder="请输入标题..." 
                  value={localTopic} 
                  onChange={e => { setLocalTopic(e.target.value); handleEditorInput(); }} 
                  autoFocus 
                 />
                 <div 
                  ref={editorRef} 
                  contentEditable 
                  onInput={handleEditorInput}
                  className="w-full min-h-[1200px] bg-transparent text-2xl leading-[2.2] focus:outline-none outline-none prose prose-2xl dark:prose-invert max-w-none pb-60" 
                  placeholder="开始创作..." 
                 />
              </div>
            </div>

            <div className={`w-80 border-l hidden 2xl:flex flex-col p-6 pr-24 space-y-10 transition-colors overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-mochi-bg border-mochi-border'}`}>
                <section>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6">快捷格式</h3>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => exec('bold')} className="py-4 rounded-2xl border text-[10px] font-black bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-blue-500 transition-all">加粗</button>
                      <button onClick={() => exec('italic')} className="py-4 rounded-2xl border text-[10px] font-black bg-white dark:bg-slate-800 dark:border-slate-700 italic hover:border-blue-500 transition-all">倾斜</button>
                      <button onClick={() => exec('underline')} className="py-4 rounded-2xl border text-[10px] font-black bg-white dark:bg-slate-800 dark:border-slate-700 underline hover:border-blue-500 transition-all">下划线</button>
                      <button onClick={() => exec('insertUnorderedList')} className="py-4 rounded-2xl border text-[10px] font-black bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-blue-500 transition-all">列表</button>
                   </div>
                </section>
                <section>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6">文本着色</h3>
                   <div className="flex gap-3 flex-wrap">
                      {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                        <button key={color} onClick={() => exec('foreColor', color)} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                      ))}
                      <button onClick={() => exec('foreColor', theme === 'dark' ? '#ffffff' : '#000000')} className="w-8 h-8 rounded-full border-2 border-slate-200 bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">R</button>
                   </div>
                </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
