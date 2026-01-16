
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ScriptPrompt } from '../types';

interface PromptLibraryProps {
  prompts: ScriptPrompt[];
  onAddPrompt: (p: ScriptPrompt) => void;
  onDeletePrompt: (id: string) => void;
}

const TEXT_COLORS = [
  { name: '默认', color: 'inherit' },
  { name: '灰色', color: '#6b7280' },
  { name: '棕色', color: '#92400e' },
  { name: '橙色', color: '#ea580c' },
  { name: '黄色', color: '#ca8a04' },
  { name: '绿色', color: '#16a34a' },
  { name: '蓝色', color: '#2563eb' },
  { name: '紫色', color: '#9333ea' },
  { name: '粉色', color: '#db2777' },
  { name: '红色', color: '#dc2626' },
];

const BG_COLORS = [
  { name: '无', color: 'transparent' },
  { name: '灰', color: '#f3f4f6' },
  { name: '棕', color: '#fef3c7' },
  { name: '橙', color: '#ffedd5' },
  { name: '黄', color: '#fef9c3' },
  { name: '绿', color: '#dcfce7' },
  { name: '蓝', color: '#dbeafe' },
  { name: '紫', color: '#f3e8ff' },
  { name: '粉', color: '#fce7f3' },
  { name: '红', color: '#fee2e2' },
];

const FONT_SIZES = [
  { label: '12px (极小)', val: '12px' },
  { label: '14px (较小)', val: '14px' },
  { label: '16px (标准)', val: '16px' },
  { label: '18px (适中)', val: '18px' },
  { label: '24px (大)', val: '24px' },
  { label: '32px (特大)', val: '32px' },
  { label: '48px (标题)', val: '48px' },
];

// 预定义分类，实际使用时可以从 prompts 的 tags 中动态提取
const CATEGORY_TAGS = ['全部', '电影', '短视频', '广告', '纪录片', 'Vlog', '待分类'];

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ prompts, onAddPrompt, onDeletePrompt }) => {
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [localTopic, setLocalTopic] = useState('');
  const [activeTab, setActiveTab] = useState('全部');
  const [slashMenu, setSlashMenu] = useState<{ visible: boolean; x: number; y: number } | null>(null);
  const [selectionMenu, setSelectionMenu] = useState<{ visible: boolean; x: number; y: number } | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  useEffect(() => {
    if (activePromptId) {
      const prompt = prompts.find(p => p.id === activePromptId);
      if (prompt && editorRef.current) {
        editorRef.current.innerHTML = prompt.content || '';
        setLocalTopic(prompt.title);
      }
    }
  }, [activePromptId, prompts]);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim().length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectionMenu({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY - 85
          });
        } else {
          setSelectionMenu(null);
        }
      }, 50);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSlashMenu({ visible: true, x: rect.left, y: rect.top + window.scrollY + 25 });
      }
    } else if (e.key === 'Escape') {
      setSlashMenu(null);
    }
  };

  const exec = (command: string, value: any = undefined) => {
    document.execCommand('styleWithCSS', false, 'true');
    if (command === 'fontSize') {
      document.execCommand('fontSize', false, '7'); 
      const fontEls = editorRef.current?.querySelectorAll('font[size="7"]');
      fontEls?.forEach(el => {
        (el as HTMLElement).removeAttribute('size');
        const span = document.createElement('span');
        span.style.fontSize = value;
        span.innerHTML = el.innerHTML;
        el.parentNode?.replaceChild(span, el);
      });
    } else {
      document.execCommand(command, false, value);
    }
    setSlashMenu(null);
    setSelectionMenu(null);
    editorRef.current?.focus();
  };

  const savePrompt = async () => {
    if (!localTopic) return alert("标题不能为空");
    const content = editorRef.current?.innerHTML || '';
    // 如果是从特定标签页进入的新建，自动带上该标签
    const currentTags = activeTab === '全部' ? ['待分类'] : [activeTab];
    
    onAddPrompt({
      id: activePromptId || Date.now().toString(),
      title: localTopic,
      content,
      tags: currentTags,
      createdAt: new Date().toISOString()
    });
    alert("剧本已同步至工作区");
  };

  const filteredPrompts = useMemo(() => {
    if (activeTab === '全部') return prompts;
    return prompts.filter(p => p.tags && p.tags.includes(activeTab));
  }, [prompts, activeTab]);

  const isEditing = activePromptId !== null;

  return (
    <div className={`h-full flex flex-col transition-all duration-500 ${isEditing ? 'fixed inset-0 z-[100] bg-white dark:bg-slate-950 p-0 overflow-hidden' : 'space-y-12'}`}>
      
      {/* 选区魔法浮动菜单 (编辑器中显示) */}
      {isEditing && selectionMenu && (
        <div 
          className="fixed z-[150] flex items-center gap-1 p-2 rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-popIn -translate-x-1/2 bg-white dark:bg-slate-800 dark:border-slate-700"
          style={{ top: selectionMenu.y, left: selectionMenu.x }}
          onMouseDown={e => e.preventDefault()}
        >
          <div className="flex items-center gap-1 pr-2 border-r dark:border-slate-700">
            <button onClick={() => exec('bold')} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-black">B</button>
            <button onClick={() => exec('italic')} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 italic">I</button>
            <button onClick={() => exec('underline')} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 underline">U</button>
          </div>
          
          {/* 字号选择 - 修复 hover 消失问题 */}
          <div className="relative group px-1 border-r dark:border-slate-700">
             <button className="text-[10px] font-black uppercase tracking-widest px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">字号</button>
             {/* Bridge bridge bridge! */}
             <div className="absolute bottom-0 left-0 w-full h-6 translate-y-full bg-transparent group-hover:block hidden"></div>
             <div className="absolute hidden group-hover:block bottom-full mb-2 left-0 w-44 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-popIn">
                {FONT_SIZES.map(f => (
                  <button key={f.val} onClick={() => exec('fontSize', f.val)} className="w-full text-left px-4 py-3.5 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors border-b dark:border-slate-700 last:border-0">{f.label}</button>
                ))}
             </div>
          </div>

          <div className="relative group px-1 border-r dark:border-slate-700">
             <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-black text-rose-500">A</button>
             <div className="absolute bottom-0 left-0 w-full h-6 translate-y-full bg-transparent group-hover:block hidden"></div>
             <div className="absolute hidden group-hover:grid grid-cols-5 gap-2 p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl bottom-full mb-2 left-1/2 -translate-x-1/2 w-52">
                {TEXT_COLORS.map(c => (
                  <button key={c.color} onClick={() => exec('foreColor', c.color)} className="w-8 h-8 rounded-lg border dark:border-slate-600 hover:scale-110 transition-transform" style={{ backgroundColor: c.color }}></button>
                ))}
             </div>
          </div>

          <div className="relative group px-1">
             <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">🖍️</button>
             <div className="absolute bottom-0 left-0 w-full h-6 translate-y-full bg-transparent group-hover:block hidden"></div>
             <div className="absolute hidden group-hover:grid grid-cols-5 gap-2 p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl bottom-full mb-2 left-1/2 -translate-x-1/2 w-52">
                {BG_COLORS.map(c => (
                  <button key={c.color} onClick={() => exec('hiliteColor', c.color)} className="w-8 h-8 rounded-lg border dark:border-slate-600 hover:scale-110 transition-transform" style={{ backgroundColor: c.color }}></button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* 剧本库列表视图 */}
      {!isEditing && (
        <>
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-2">
              <h2 className={`text-6xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                剧本库 <span className="text-3xl opacity-20 font-mono tracking-widest ml-4">SCRIPTS_VAULT</span>
              </h2>
              <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Team Script Assets & Creative Management</p>
            </div>
            
            <button 
              onClick={() => { setActivePromptId(Date.now().toString()); setLocalTopic(''); }}
              className={`group flex items-center gap-4 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl ${
                theme === 'dark' ? 'bg-blue-600 text-white shadow-blue-900/40' : 'bg-rose-400 text-white shadow-mochi'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </div>
              开启新的创作
            </button>
          </div>

          {/* 分类筛选器 */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
             {CATEGORY_TAGS.map(tag => (
               <button 
                 key={tag} 
                 onClick={() => setActiveTab(tag)}
                 className={`px-8 py-3 rounded-2xl text-[11px] font-black transition-all border whitespace-nowrap uppercase tracking-widest ${
                   activeTab === tag 
                    ? (theme === 'dark' ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-white border-slate-800 shadow-lg') 
                    : (theme === 'dark' ? 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600' : 'bg-white text-slate-400 border-mochi-border hover:shadow-sm')
                 }`}
               >
                 {tag}
               </button>
             ))}
          </div>

          {/* 剧本响应式网格布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 pb-32">
            {filteredPrompts.map(p => (
              <div 
                key={p.id} 
                onClick={() => setActivePromptId(p.id)}
                className={`group relative p-10 rounded-[3rem] border transition-all duration-700 cursor-pointer min-h-[320px] flex flex-col justify-between overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-slate-900 border-slate-800 hover:border-blue-500 hover:shadow-2xl shadow-blue-900/10' 
                    : 'bg-white border-mochi-border hover:shadow-mochi hover:-translate-y-3'
                }`}
              >
                {/* 装饰性光晕背景 */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-all duration-1000 ${theme === 'dark' ? 'bg-blue-400' : 'bg-rose-400'}`}></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                     <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                       theme === 'dark' ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-mochi-pink/20 border-rose-100 text-rose-500'
                     }`}>
                       {p.tags?.[0] || '待分类'}
                     </div>
                     <span className="text-[10px] font-black opacity-20 tracking-tighter uppercase">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className={`text-3xl font-black leading-tight mb-6 group-hover:text-blue-500 transition-colors line-clamp-2 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {p.title || '未命名项目'}
                  </h3>
                  
                  <div className={`text-sm opacity-40 line-clamp-3 leading-relaxed font-medium mb-8`}>
                    {p.content?.replace(/<[^>]*>/g, '').substring(0, 120) || '此处静悄悄，还没有任何剧本文字...'}
                  </div>
                </div>

                <div className="relative flex items-center justify-between pt-6 border-t dark:border-slate-800 border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ${theme === 'dark' ? 'bg-slate-800 text-blue-400' : 'bg-mochi-bg text-rose-500'}`}>
                       {p.title.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Production</span>
                        <span className="text-[10px] font-black opacity-60">MASTER_V1.0</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('该操作无法撤销，确定永久删除剧本？')){ onDeletePrompt(p.id); }}}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                  </div>
                </div>
              </div>
            ))}

            {/* 空状态卡片 */}
            {filteredPrompts.length === 0 && (
              <div className="col-span-full py-40 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-all">
                 <div className="text-8xl mb-8 animate-bounce">🎬</div>
                 <p className="font-black italic uppercase tracking-[0.5em] text-lg text-slate-400">Project_Vault_Empty</p>
                 <button 
                    onClick={() => { setActivePromptId(Date.now().toString()); setLocalTopic(''); }}
                    className="mt-8 text-blue-500 font-black text-sm uppercase underline tracking-widest"
                 >
                    立即开始创作
                 </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 沉浸式全屏编辑器 (编辑模式) */}
      {isEditing && (
        <div className="flex-1 flex flex-col h-full animate-fadeIn overflow-hidden">
          {/* Editor Header */}
          <div className="h-24 shrink-0 border-b flex items-center justify-between px-12 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl z-[110]">
             <button onClick={() => setActivePromptId(null)} className="flex items-center gap-4 font-black text-sm group">
                <div className="w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </div>
                <div className="flex flex-col">
                    <span className="opacity-40 text-[9px] uppercase tracking-widest">Back to</span>
                    <span className="text-base tracking-tighter">剧本中心</span>
                </div>
             </button>
             
             <div className="flex items-center gap-8">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 animate-pulse">Live Sync Active</span>
                    <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">Editing with Cloud Engine</span>
                </div>
                <button onClick={savePrompt} className="px-12 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-2xl shadow-blue-500/30 hover:bg-blue-500 active:scale-95 transition-all uppercase tracking-widest">保存剧本</button>
                <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800"></div>
                <button onClick={() => { if(confirm('删除后无法找回，确认废弃？')){ onDeletePrompt(activePromptId!); setActivePromptId(null); }}} className="w-12 h-12 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
             </div>
          </div>

          {/* Main Workspace */}
          <div className="flex-1 overflow-y-auto pt-28 pb-72 custom-scrollbar scroll-smooth">
            <div className="max-w-5xl mx-auto px-12">
               <input 
                 className="w-full bg-transparent text-7xl md:text-9xl font-black mb-20 focus:outline-none placeholder:opacity-5 dark:text-white tracking-tighter caret-blue-500 leading-none"
                 placeholder="Untitled Story..."
                 value={localTopic}
                 onChange={e => setLocalTopic(e.target.value)}
                 autoFocus
               />
               
               {/* Content Area */}
               <div 
                 ref={editorRef}
                 contentEditable
                 onKeyDown={handleKeyDown}
                 className="w-full min-h-[1000px] bg-transparent text-2xl leading-[1.8] focus:outline-none outline-none prose prose-2xl dark:prose-invert max-w-none pb-60 selection:bg-blue-100 dark:selection:bg-blue-900/50"
                 placeholder="输入 '/' 唤起排版菜单，或选中文本精调样式..."
               />
            </div>
          </div>
        </div>
      )}

      {/* Slash Menu (编辑器中显示) */}
      {isEditing && slashMenu && (
        <div 
          className="fixed z-[160] w-80 p-3 rounded-[1.5rem] border shadow-[0_30px_90px_rgba(0,0,0,0.4)] animate-popIn bg-white dark:bg-slate-900 dark:border-slate-800"
          style={{ top: slashMenu.y, left: slashMenu.x }}
          onMouseDown={e => e.preventDefault()}
        >
          <div className="text-[10px] font-black uppercase text-slate-400 p-3 tracking-widest border-b dark:border-slate-800 mb-2">快速插入组件</div>
          {[
            { cmd: 'formatBlock', val: 'H1', icon: 'H1', title: '大标题', desc: '场景或核心章节' },
            { cmd: 'formatBlock', val: 'H2', icon: 'H2', title: '二级标题', desc: '次要节点或备注' },
            { cmd: 'insertUnorderedList', val: undefined, icon: '●', title: '项目列表', desc: '用于记录拍摄要点' },
            { cmd: 'insertHorizontalRule', val: undefined, icon: '—', title: '分割线', desc: '剧本转场标记' },
          ].map(item => (
            <button key={item.title} onClick={() => exec(item.cmd, item.val)} className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-5 group transition-all">
               <span className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-950 text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">{item.icon}</span>
               <div className="flex flex-col">
                 <span className="text-base font-black tracking-tight">{item.title}</span>
                 <span className="text-[10px] opacity-40 uppercase tracking-widest">{item.desc}</span>
               </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
