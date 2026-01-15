
import React, { useState, useRef, useEffect } from 'react';
import { ScriptPrompt } from '../types';
import { supabase } from '../services/supabase';

interface PromptLibraryProps {
  prompts: ScriptPrompt[];
  onAddPrompt: (p: ScriptPrompt) => void;
  onDeletePrompt: (id: string) => void;
  currentUser: string;
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  red: 'bg-red-500/30 text-red-200 border-red-500/50',
  orange: 'bg-orange-500/30 text-orange-200 border-orange-500/50',
  yellow: 'bg-yellow-500/30 text-yellow-100 border-yellow-500/50',
  green: 'bg-emerald-500/30 text-emerald-100 border-emerald-500/50',
  blue: 'bg-blue-500/30 text-blue-100 border-blue-500/50',
  indigo: 'bg-indigo-500/30 text-indigo-100 border-indigo-500/50',
  purple: 'bg-purple-500/30 text-purple-100 border-purple-500/50',
  pink: 'bg-pink-500/30 text-pink-100 border-pink-500/50',
};

// 浅色模式下的高亮颜色
const LIGHT_HIGHLIGHT_COLORS: Record<string, string> = {
  red: 'bg-rose-100 text-rose-700 border-rose-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  yellow: 'bg-amber-100 text-amber-700 border-amber-200',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue: 'bg-sky-100 text-sky-700 border-sky-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
};

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ prompts, onAddPrompt, onDeletePrompt, currentUser }) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('电影感 & 情感向');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';
  
  const [slashMenu, setSlashMenu] = useState<{ visible: boolean; x: number; y: number; index: number }>({
    visible: false, x: 0, y: 0, index: 0
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activePromptId) {
      const prompt = prompts.find(p => p.id === activePromptId);
      if (prompt && editorRef.current) {
        editorRef.current.innerHTML = parseHighlightsToHtml(prompt.content);
        setTopic(prompt.title);
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setTopic('');
    }
  }, [activePromptId, prompts, theme]);

  const parseHighlightsToHtml = (text: string) => {
    if (!text) return '';
    const colors = theme === 'dark' ? HIGHLIGHT_COLORS : LIGHT_HIGHLIGHT_COLORS;
    return text
      .replace(/\{hl-(\w+)\}(.*?)\{\/hl\}/g, (_, color, inner) => {
        const classes = colors[color] || colors.yellow;
        return `<span class="px-1 rounded border ${classes}" data-color="${color}">${inner}</span>`;
      })
      .replace(/\{media-img\}(.*?)\{\/media\}/g, (_, url) => {
        return `<div class="my-4 max-w-full md:max-w-md group relative inline-block animate-popIn"><img src="${url}" data-media-type="img" class="rounded-2xl border ${theme === 'dark' ? 'border-slate-700 shadow-xl' : 'border-mochi-border shadow-mochi'}" /><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-xl font-black cursor-pointer shadow-lg" onclick="this.parentElement.remove()">删除</div></div>`;
      })
      .replace(/\{media-video\}(.*?)\{\/media\}/g, (_, url) => {
        return `<div class="my-4 max-w-full md:max-w-md group relative animate-popIn"><video src="${url}" controls data-media-type="video" class="rounded-2xl border ${theme === 'dark' ? 'border-slate-700 shadow-xl' : 'border-mochi-border shadow-mochi'} w-full"></video><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-xl font-black cursor-pointer shadow-lg" onclick="this.parentElement.remove()">删除</div></div>`;
      })
      .replace(/\n/g, '<br>');
  };

  const parseHtmlToHighlights = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const convert = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
      if (node.nodeName === 'BR') return '\n';
      if (node instanceof HTMLElement) {
        if (node.tagName === 'SPAN' && node.dataset.color) return `{hl-${node.dataset.color}}${node.innerText}{/hl}`;
        const img = node.querySelector('img');
        if (img && img.dataset.mediaType === 'img') return `{media-img}${img.src}{/media}`;
        const video = node.querySelector('video');
        if (video && video.dataset.mediaType === 'video') return `{media-video}${video.src}{/media}`;
        if (['DIV', 'P', 'H1', 'H2', 'BLOCKQUOTE', 'LI'].includes(node.tagName)) return '\n' + Array.from(node.childNodes).map(convert).join('');
      }
      return Array.from(node.childNodes).map(convert).join('');
    };
    return Array.from(temp.childNodes).map(convert).join('').trim();
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    const offset = range.startOffset;
    const textContent = container.textContent || '';
    const textBefore = textContent.slice(0, offset);
    
    if (textBefore.endsWith('/')) {
      const rect = range.getBoundingClientRect();
      setSlashMenu({ visible: true, x: rect.left, y: rect.bottom + window.scrollY, index: 0 });
    } else if (slashMenu.visible) {
      setSlashMenu({ ...slashMenu, visible: false });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `prompts/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(filePath);
      const isImage = file.type.startsWith('image/');
      const mediaHtml = isImage 
        ? `<div class="my-4 max-w-full md:max-w-md group relative inline-block animate-popIn"><img src="${publicUrl}" data-media-type="img" class="rounded-2xl border ${theme === 'dark' ? 'border-slate-700 shadow-xl' : 'border-mochi-border shadow-mochi'}" /><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-xl font-black cursor-pointer shadow-lg" onclick="this.parentElement.remove()">删除</div></div>`
        : `<div class="my-4 max-w-full md:max-w-md group relative animate-popIn"><video src="${publicUrl}" controls data-media-type="video" class="rounded-2xl border ${theme === 'dark' ? 'border-slate-700 shadow-xl' : 'border-mochi-border shadow-mochi'} w-full"></video><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-xl font-black cursor-pointer shadow-lg" onclick="this.parentElement.remove()">删除</div></div>`;
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertHTML', false, mediaHtml + '&nbsp;');
      }
    } catch (error) { console.error('Error uploading:', error); alert('上传失败'); } finally { setIsUploading(false); if (e.target) e.target.value = ''; }
  };

  const menuItems = [
    { id: 'h1', label: '大标题', desc: '# 大标题', icon: 'H1', action: () => executeCommand('h1') },
    { id: 'h2', label: '次级标题', desc: '## 中标题', icon: 'H2', action: () => executeCommand('h2') },
    { id: 'img', label: '插入图片', desc: '上传团队素材', icon: '🖼️', action: () => executeCommand('img') },
    { id: 'hl', label: '荧光标记', desc: '高亮核心文本', icon: '✨', action: () => executeCommand('hl') },
  ];

  const executeCommand = (cmd: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      const offset = range.startOffset;
      if (node.textContent && node.textContent.charAt(offset - 1) === '/') {
        range.setStart(node, offset - 1);
        range.deleteContents();
      }
    }
    switch (cmd) {
      case 'img': mediaInputRef.current?.click(); break;
      case 'h1': document.execCommand('formatBlock', false, 'H1'); break;
      case 'h2': document.execCommand('formatBlock', false, 'H2'); break;
      case 'hl': applyColor('yellow'); break;
    }
    setSlashMenu(prev => ({ ...prev, visible: false }));
  };

  const applyColor = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const colors = theme === 'dark' ? HIGHLIGHT_COLORS : LIGHT_HIGHLIGHT_COLORS;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = `px-1 rounded border ${colors[color]}`;
    span.dataset.color = color;
    range.surroundContents(span);
    selection.removeAllRanges();
  };

  const savePrompt = async () => {
    const html = editorRef.current?.innerHTML || '';
    const contentToSave = parseHtmlToHighlights(html);
    if (!topic) return alert("剧本标题不能为空");
    const promptData: ScriptPrompt = {
      id: activePromptId || Date.now().toString(),
      title: topic,
      content: contentToSave,
      tags: [style],
      createdAt: new Date().toISOString()
    };
    try { await onAddPrompt(promptData); setActivePromptId(promptData.id); alert("剧本已保存"); } catch (err) { alert("保存失败"); }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 animate-fadeIn relative">
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center">
            <div className={`p-10 rounded-[2.5rem] border flex flex-col items-center gap-6 animate-popIn ${theme === 'dark' ? 'bg-slate-900 border-blue-500/30' : 'bg-white border-mochi-border shadow-mochi'}`}>
                <div className={`w-14 h-14 border-4 border-t-transparent rounded-full animate-spin ${theme === 'dark' ? 'border-blue-500' : 'border-rose-400'}`}></div>
                <p className={`font-black tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>正在同步至云端...</p>
            </div>
        </div>
      )}

      {slashMenu.visible && (
        <div className={`fixed z-[110] border rounded-[1.5rem] shadow-2xl w-72 overflow-hidden animate-popIn ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-mochi-border'}`} style={{ top: slashMenu.y, left: slashMenu.x }}>
          <div className={`p-4 border-b text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-mochi-bg border-mochi-border text-slate-500'}`}>剧本指令</div>
          {menuItems.map((item, i) => (
            <div key={item.id} onClick={item.action} className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${slashMenu.index === i ? (theme === 'dark' ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'bg-mochi-pink/20 border-l-4 border-rose-400') : (theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-mochi-bg')}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-white border border-mochi-border'}`}>{item.icon}</div>
              <div>
                <div className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{item.label}</div>
                <div className="text-[10px] text-slate-500 font-bold">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full md:w-72 shrink-0 flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
            <h2 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>脚本仓库</h2>
            <button onClick={() => setActivePromptId(null)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-mochi-pink text-white hover:bg-rose-400 shadow-mochi-sm'}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[75vh]">
            {prompts.map(p => (
                <div key={p.id} onClick={() => setActivePromptId(p.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all group ${activePromptId === p.id ? (theme === 'dark' ? 'bg-blue-600/10 border-blue-500 shadow-lg' : 'bg-white border-rose-300 shadow-mochi ring-1 ring-rose-200') : (theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-mochi-border hover:shadow-mochi-sm hover:scale-[1.02]')}`}>
                    <h3 className={`text-sm font-black truncate mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{p.title}</h3>
                    <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-widest">
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeletePrompt(p.id); }} className="hover:text-rose-500 transition-colors">删除</button>
                    </div>
                </div>
            ))}
            {prompts.length === 0 && <div className="text-center py-20 opacity-20 font-black italic uppercase tracking-tighter">Empty Library</div>}
        </div>
      </div>

      <div className={`flex-1 rounded-[2.5rem] border flex flex-col overflow-hidden shadow-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-mochi'}`}>
        <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 transition-colors ${theme === 'dark' ? 'bg-slate-800/90 border-b border-slate-700' : 'bg-mochi-bg/80 border-b border-mochi-border'}`}>
            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-mochi-border'}`}>
                    {Object.entries(theme === 'dark' ? HIGHLIGHT_COLORS : LIGHT_HIGHLIGHT_COLORS).map(([color, classes]) => (
                        <button key={color} onClick={() => applyColor(color)} className={`w-6 h-6 rounded-lg transition-transform hover:scale-125 ${classes.split(' ')[0]}`} />
                    ))}
                </div>
                <div className="h-8 w-[1px] bg-slate-300/30 mx-2" />
                <button onClick={() => { mediaInputRef.current?.click(); }} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-900' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </button>
                <input type="file" ref={mediaInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
            </div>
            
            <button onClick={savePrompt} className={`px-8 py-3 rounded-[1rem] text-xs font-black shadow-lg transition-all active:scale-95 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-mochi-pink hover:bg-rose-400 text-white shadow-mochi-sm'}`}>
              保存剧本
            </button>
        </div>

        <div className={`flex-1 p-10 md:p-16 overflow-y-auto custom-scrollbar ${theme === 'light' ? 'bg-white' : 'bg-transparent'}`}>
            <input 
                type="text" 
                placeholder="在此输入剧本标题..."
                className={`w-full bg-transparent text-4xl font-black mb-10 focus:outline-none placeholder:opacity-10 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
            />
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className={`w-full min-h-[600px] bg-transparent text-xl leading-[2.2] focus:outline-none font-serif outline-none pb-40 prose dark:prose-invert max-w-none ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                placeholder="输入 / 唤起快捷菜单，记录您的天才创意..."
            />
        </div>
      </div>
    </div>
  );
};
