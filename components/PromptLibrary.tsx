
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

// 预定义分类（用户可在标签中定义）
const CATEGORY_TAGS = ['全部', '电影', '短视频', '广告', '纪录片', 'Vlog'];

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
    // 默认给第一个选中的标签或分类
    const currentTags = activeTab === '全部' ? ['电影'] : [activeTab];
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
    <div className={`h-full flex flex-col transition-all duration-500 ${isEditing ? 'fixed inset-0 z-[100] bg-white dark:bg-slate-950 p-0 overflow-hidden' : 'space-y-8'}`}>
      
      {/* 选区浮动菜单 (仅编辑模式显示) */}
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
          <div className="relative group px-1 border-r dark:border-slate-700">
             <button className="text-[10px] font-black uppercase tracking-widest px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">字号</button>
             <div className="absolute bottom-0 left-0 w-full h-4 translate-y-full bg-transparent group-hover:block hidden"></div>
             <div className="absolute hidden group-hover:block bottom-full mb-1 left-0 w-40 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-popIn">
                {FONT_SIZES.map(f => (
                  <button key={f.val} onClick={() => exec('fontSize', f.val)} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors border-b dark:border-slate-700 last:border-0">{f.label}</button>
                ))}
             </div>
          </div>
          <div className="relative group px-1 border-r dark:border-slate-700">
             <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-black text-rose-500">A</button>
             <div className="absolute bottom-0 left-0 w-full h-4 translate-y-full bg-transparent group-hover:block hidden"></div>
             <div className="absolute hidden group-hover:grid grid-cols-5 gap-2 p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl bottom-full mb-1 left-1/2 -translate-x-1/2 w-52">
                {TEXT_COLORS.map(c => (
                  <button key={c.color} onClick={() => exec('foreColor', c.color)} className="w-8 h-8 rounded-lg border dark:border-slate-600 hover:scale-110 transition-transform" style={{ backgroundColor: c.color }} title={c.name}></button>
                ))}
             </div>
          </div>
          <div className="relative group px-1">
             <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">🖍️</button>
             <div className="absolute bottom-0 left-0 w-full h-4 translate-y-full bg-transparent group-hover:block hidden"></div>
             <div className="absolute hidden group-hover:grid grid-cols-5 gap-2 p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl bottom-full mb-1 left-1/2 -translate-x-1/2 w-52">
                {BG_COLORS.map(c => (
                  <button key={c.color} onClick={() => exec('hiliteColor', c.color)} className="w-8 h-8 rounded-lg border dark:border-slate-600 hover:scale-110 transition-transform" style={{ backgroundColor: c.color }} title={c.name}></button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* 列表页 UI */}
      {!isEditing && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className={`text-5xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>剧本库 <span className="text-2xl opacity-30 italic font-mono uppercase tracking-[0.2em]">vault</span></h2>
              <p className="text-sm font-bold opacity-40 mt-2">管理团队所有影视及短视频剧本资产</p>
            </div>
            <button 
              onClick={() => { setActivePromptId(Date.now().toString()); setLocalTopic(''); }}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                theme === 'dark' ? 'bg-blue-600 text-white shadow-blue-900/40' : 'bg-rose-400 text-white shadow-mochi'
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              创作新剧本
            </button>
          </div>

          {/* 筛选标签栏 */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
             {CATEGORY_TAGS.map(tag => (
               <button 
                 key={tag} 
                 onClick={() => setActiveTab(tag)}
                 className={`px-6 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                   activeTab === tag 
                    ? (theme === 'dark' ? 'bg-white text-slate-900' : 'bg-slate-800 text-white') 
                    : (theme === 'dark' ? 'bg-slate-900 text-slate-500 border border-slate-800' : 'bg-white text-slate-400 border border-slate-100 shadow-sm')
                 }`}
               >
                 {tag}
               </button>
             ))}
          </div>

          {/* 剧本网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {filteredPrompts.map(p => (
              <div 
                key={p.id} 
                onClick={() => setActivePromptId(p.id)}
                className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer min-h-[280px] flex flex-col justify-between overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-slate-900 border-slate-800 hover:border-blue-500 shadow-xl' 
                    : 'bg-white border-mochi-border hover:shadow-mochi hover:-translate-y-2'
                }`}
              >
                {/* 装饰性背景 */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-all group-hover:opacity-30 ${theme === 'dark' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                       theme === 'dark' ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-rose-50 border-rose-100 text-rose-500'
                     }`}>
                       {p.tags?.[0] || '默认'}
                     </span>
                     <span className="text-[10px] font-mono opacity-20 font-black">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className={`text-2xl font-black leading-tight mb-4 group-hover:text-blue-500 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {p.title || '无标题剧本'}
                  </h3>
                  <div className={`text-xs opacity-40 line-clamp-3 leading-relaxed mb-6 font-medium`}>
                    {p.content?.replace(/<[^>]*>/g, '').substring(0, 100) || '暂无内容预览...'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t dark:border-slate-800 border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black">
                       {p.title.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">MASTER_VER</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('确认永久删除？')){ onDeletePrompt(p.id); }}}
                    className="p-2 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}

            {/* 空状态预览 */}
            {filteredPrompts.length === 0 && (
              <div className="col-span-full py-32 rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center opacity-20 transition-all border-slate-300 dark:border-slate-800">
                 <div className="text-6xl mb-6">📄</div>
                 <p className="font-black italic uppercase tracking-[0.3em] text-sm">No_Scripts_Found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 全屏编辑器 (编辑模式) */}
      {isEditing && (
        <div className="flex-1 flex flex-col h-full animate-fadeIn overflow-hidden">
          <div className="h-20 shrink-0 border-b flex items-center justify-between px-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-[110]">
             <button onClick={() => setActivePromptId(null)} className="flex items-center gap-3 font-black text-sm group">
                <div className="w-10 h-10 rounded-full border flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </div>
                <span>剧本资产库</span>
             </button>
             
             <div className="flex items-center gap-6">
                <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Auto Sync Active</span>
                <button onClick={savePrompt} className="px-10 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/30 hover:bg-blue-500 active:scale-95 transition-all">同步至云端</button>
                <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-2"></div>
                <button onClick={() => { if(confirm('确认废弃该剧本？')){ onDeletePrompt(activePromptId!); setActivePromptId(null); }}} className="w-12 h-12 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
             </div>
          </div>

          {/* 编辑中心 */}
          <div className="flex-1 overflow-y-auto pt-24 pb-60 custom-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto px-10">
               <input 
                 className="w-full bg-transparent text-6xl md:text-8xl font-black mb-16 focus:outline-none placeholder:opacity-5 dark:text-white tracking-tighter caret-blue-500"
                 placeholder="给剧本起个震撼的名字..."
                 value={localTopic}
                 onChange={e => setLocalTopic(e.target.value)}
                 autoFocus
               />
               <div 
                 ref={editorRef}
                 contentEditable
                 onKeyDown={handleKeyDown}
                 className="w-full min-h-[800px] bg-transparent text-2xl leading-[1.8] focus:outline-none outline-none prose prose-2xl dark:prose-invert max-w-none pb-40 selection:bg-blue-100 dark:selection:bg-blue-900/50"
                 placeholder="输入 '/' 唤起快捷组件，选中文本开启沉浸式样式调节..."
               />
            </div>
          </div>
        </div>
      )}

      {/* Slash Command 菜单 (仅编辑模式) */}
      {isEditing && slashMenu && (
        <div 
          className="fixed z-[160] w-72 p-2 rounded-2xl border shadow-2xl animate-popIn bg-white dark:bg-slate-800 dark:border-slate-700"
          style={{ top: slashMenu.y, left: slashMenu.x }}
          onMouseDown={e => e.preventDefault()}
        >
          <div className="text-[10px] font-black uppercase text-slate-400 p-2 tracking-widest border-b dark:border-slate-700 mb-2">快速插入</div>
          {[
            { cmd: 'formatBlock', val: 'H1', icon: 'H1', title: '大标题', desc: '最重要的章节标题' },
            { cmd: 'formatBlock', val: 'H2', icon: 'H2', title: '二级标题', desc: '子场景或节点' },
            { cmd: 'insertUnorderedList', val: undefined, icon: '●', title: '动作列表', desc: '描述具体镜头画面' },
            { cmd: 'insertHorizontalRule', val: undefined, icon: '—', title: '分割线', desc: '用于区分转场' },
          ].map(item => (
            <button key={item.title} onClick={() => exec(item.cmd, item.val)} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-4 group transition-all">
               <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">{item.icon}</span>
               <div className="flex flex-col">
                 <span className="text-sm font-black">{item.title}</span>
                 <span className="text-[10px] opacity-40">{item.desc}</span>
               </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
