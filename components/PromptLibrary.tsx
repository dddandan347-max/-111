
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
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  useEffect(() => {
    if (activePromptId) {
      const prompt = prompts.find(p => p.id === activePromptId);
      if (prompt && editorRef.current) {
        editorRef.current.innerHTML = prompt.content || '';
        setLocalTopic(prompt.title);
      } else if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [activePromptId, prompts]);

  const exec = (command: string, value: any = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'fontSize') {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, value);
      const sizeMap: Record<string, string> = { '3': '14px', '4': '18px', '5': '24px', '6': '32px', '7': '48px' };
      const fonts = editorRef.current.querySelectorAll('font[size]');
      fonts.forEach((f: any) => {
        const sz = f.getAttribute('size');
        if (sizeMap[sz]) {
          f.style.fontSize = sizeMap[sz];
          f.style.lineHeight = '1.4';
          f.removeAttribute('size');
        }
      });
    } else {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(command, false, value);
    }
  };

  const handleExitAndSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (localTopic || content) {
        onAddPrompt({
          id: activePromptId || Date.now().toString(),
          title: localTopic || '未命名剧本',
          content,
          tags: activeTab === '全部' ? ['待处理'] : [activeTab],
          createdAt: new Date().toISOString()
        });
      }
    }
    setActivePromptId(null);
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
                  <div className="text-sm opacity-40 line-clamp-3 leading-relaxed">{p.content?.replace(/<[^>]*>/g, '').substring(0, 100)}</div>
                </div>
                <div className="flex items-center justify-between pt-8 border-t dark:border-slate-800">
                  <span className="text-[10px] font-mono opacity-20 font-black tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); if(confirm('确认彻底删除此资产？')){ onDeletePrompt(p.id); }}} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-rose-50 rounded-xl"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isEditing && (
        <div className="flex-1 flex flex-col h-full animate-fadeIn overflow-hidden bg-white dark:bg-slate-950">
          <div className="h-24 border-b flex items-center justify-between px-12 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl z-[110]">
             <button onClick={handleExitAndSave} className="flex items-center gap-4 font-black text-sm group">
                <div className="w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-all font-sans">←</div>
                保存并退出
             </button>
             <div className="flex items-center gap-6">
                <span className="text-[10px] font-black uppercase opacity-20 tracking-widest">Auto Saving...</span>
             </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto pt-32 pb-80 custom-scrollbar scroll-smooth">
              <div className="max-w-4xl mx-auto px-12">
                 <input className="w-full bg-transparent text-8xl font-black mb-20 focus:outline-none placeholder:opacity-10 dark:text-white tracking-tighter" placeholder="请输入标题..." value={localTopic} onChange={e => setLocalTopic(e.target.value)} autoFocus />
                 <div ref={editorRef} contentEditable className="w-full min-h-[1200px] bg-transparent text-2xl leading-[2.2] focus:outline-none outline-none prose prose-2xl dark:prose-invert max-w-none pb-60" placeholder="开始创作..." />
              </div>
            </div>

            <div className={`w-80 border-l hidden 2xl:flex flex-col p-6 pr-24 space-y-10 transition-colors overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-mochi-bg border-mochi-border'}`}>
                <section>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6">字号调节</h3>
                   <div className="space-y-2">
                      {FONT_SIZES.map(f => (
                        <button key={f.val} onClick={() => exec('fontSize', f.val)} className="w-full py-4 px-5 rounded-2xl border flex items-center justify-between hover:bg-blue-600 hover:text-white transition-all bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm">
                          <span className="text-[11px] font-black">{f.label}</span>
                        </button>
                      ))}
                   </div>
                </section>

                <section>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6">格式调节</h3>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => exec('bold')} className="py-4 rounded-2xl border text-[10px] font-black bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-blue-500 transition-all">加粗</button>
                      <button onClick={() => exec('italic')} className="py-4 rounded-2xl border text-[10px] font-black bg-white dark:bg-slate-800 dark:border-slate-700 italic hover:border-blue-500 transition-all">倾斜</button>
                   </div>
                </section>

                <section>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-6">视觉调色盘</h3>
                   <div className="space-y-6">
                      <div className="relative group">
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-800 border dark:border-slate-700 hover:border-blue-500 transition-all cursor-pointer shadow-sm relative overflow-visible">
                          <span className="text-[11px] font-black opacity-60">字体颜色</span>
                          <div className="w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}></div>
                          <input 
                            type="color" 
                            className="absolute left-0 top-0 h-full w-full opacity-0 cursor-pointer z-20 scale-[2] origin-left" 
                            onChange={(e) => exec('foreColor', e.target.value)} 
                          />
                        </div>
                      </div>

                      <div className="relative group">
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-800 border dark:border-slate-700 hover:border-blue-500 transition-all cursor-pointer shadow-sm relative overflow-visible">
                          <span className="text-[11px] font-black opacity-60">文本高亮</span>
                          <div className="w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl bg-white" style={{ background: 'linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%, #ddd), linear-gradient(45deg, #ddd 25%, white 25%, white 75%, #ddd 75%, #ddd)', backgroundSize: '6px 6px' }}></div>
                          <input 
                            type="color" 
                            className="absolute left-0 top-0 h-full w-full opacity-0 cursor-pointer z-20 scale-[2] origin-left" 
                            onChange={(e) => exec('hiliteColor', e.target.value)} 
                          />
                        </div>
                      </div>
                   </div>
                </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
