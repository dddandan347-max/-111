
import React, { useState, useRef, useEffect } from 'react';
import { ScriptPrompt } from '../types';
import { generateScriptIdea } from '../services/geminiService';
import { supabase } from '../services/supabase';

interface PromptLibraryProps {
  prompts: ScriptPrompt[];
  onAddPrompt: (p: ScriptPrompt) => void;
  onDeletePrompt: (id: string) => void;
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

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ prompts, onAddPrompt, onDeletePrompt }) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('电影感 & 情感向');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  
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
  }, [activePromptId, prompts]);

  const parseHighlightsToHtml = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\{hl-(\w+)\}(.*?)\{\/hl\}/g, (_, color, inner) => {
        const classes = HIGHLIGHT_COLORS[color] || HIGHLIGHT_COLORS.yellow;
        return `<span class="px-1 rounded border ${classes}" data-color="${color}">${inner}</span>`;
      })
      .replace(/\{media-img\}(.*?)\{\/media\}/g, (_, url) => {
        return `<div class="my-4 max-w-full md:max-w-md group relative inline-block animate-popIn"><img src="${url}" data-media-type="img" class="rounded-xl border border-slate-700 shadow-lg" /><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-[10px] px-2 py-1 rounded cursor-pointer" onclick="this.parentElement.remove()">删除</div></div>`;
      })
      .replace(/\{media-video\}(.*?)\{\/media\}/g, (_, url) => {
        return `<div class="my-4 max-w-full md:max-w-md group relative animate-popIn"><video src="${url}" controls data-media-type="video" class="rounded-xl border border-slate-700 shadow-lg w-full"></video><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-[10px] px-2 py-1 rounded cursor-pointer" onclick="this.parentElement.remove()">删除</div></div>`;
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
        if (['DIV', 'P'].includes(node.tagName)) return '\n' + Array.from(node.childNodes).map(convert).join('');
      }
      return Array.from(node.childNodes).map(convert).join('');
    };
    return Array.from(temp.childNodes).map(convert).join('').trim();
  };

  const insertMedia = (type: 'img' | 'video', url: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const tag = type === 'img' ? `{media-img}${url}{/media}` : `{media-video}${url}{/media}`;
    const html = parseHighlightsToHtml(tag);
    document.execCommand('insertHTML', false, html + '<br>');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `scripts/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('studiosync_assets')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('studiosync_assets')
        .getPublicUrl(filePath);

      if (file.type.startsWith('image/')) {
        insertMedia('img', publicUrl);
      } else if (file.type.startsWith('video/')) {
        insertMedia('video', publicUrl);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('素材上传失败，请检查数据库配置');
    } finally {
      setIsUploading(false);
      if (mediaInputRef.current) mediaInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!topic) return alert("请先输入主题");
    setIsLoading(true);
    const content = await generateScriptIdea(topic, style);
    if (editorRef.current) {
        editorRef.current.innerHTML = parseHighlightsToHtml(content);
    }
    setIsLoading(false);
  };

  const applyColor = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = `px-1 rounded border ${HIGHLIGHT_COLORS[color]}`;
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

    try {
      await onAddPrompt(promptData);
      setActivePromptId(promptData.id);
      alert("剧本已保存成功");
    } catch (err) {
      alert("保存失败。");
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fadeIn relative">
      {(isUploading || isLoading) && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-blue-500/20 flex flex-col items-center gap-6 animate-popIn shadow-2xl">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-500/10 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-xl tracking-tighter">{isUploading ? '正在同步素材...' : 'Gemini 正在构思...'}</p>
                  <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">Please stand by</p>
                </div>
            </div>
        </div>
      )}

      <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">脚本中心</h2>
            <button onClick={() => setActivePromptId(null)} className="p-2 glass text-blue-400 hover:text-white rounded-xl transition-all border border-slate-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[70vh]">
            {prompts.map(p => (
                <div key={p.id} onClick={() => setActivePromptId(p.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${activePromptId === p.id ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-200 truncate">{p.title}</h3>
                    <div className="flex justify-between items-center mt-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeletePrompt(p.id); }} className="hover:text-red-500 transition-colors">REMOVE</button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex-1 glass rounded-[2.5rem] border border-slate-800/50 flex flex-col overflow-hidden shadow-2xl relative min-h-[600px] animate-popIn">
        <div className="bg-slate-900/40 backdrop-blur-md border-b border-slate-800/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
                    {Object.entries(HIGHLIGHT_COLORS).map(([color, classes]) => (
                        <button key={color} onClick={() => applyColor(color)} className={`w-6 h-6 rounded-lg transition-transform hover:scale-125 ${classes.split(' ')[0]}`} />
                    ))}
                </div>
                <div className="h-6 w-[1px] bg-slate-800 mx-1" />
                <button onClick={() => mediaInputRef.current?.click()} className="p-2 text-slate-500 hover:text-blue-400 transition-colors" title="插入云端素材">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </button>
                <input type="file" ref={mediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
            </div>
            
            <div className="flex items-center gap-3">
                <button onClick={handleGenerate} disabled={isLoading} className="bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Gemini 构思
                </button>
                <button onClick={savePrompt} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95">
                  保存剧本
                </button>
            </div>
        </div>

        <div className="flex-1 p-8 md:p-16 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-slate-950/20">
            <input 
                type="text" 
                placeholder="在此输入剧本标题..."
                className="w-full bg-transparent text-4xl font-black text-white mb-8 focus:outline-none placeholder:text-slate-800 tracking-tighter"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
            />
            <div 
                ref={editorRef}
                contentEditable
                className="w-full min-h-[500px] bg-transparent text-slate-300 text-lg leading-relaxed focus:outline-none font-serif whitespace-pre-wrap outline-none pb-40 relative group"
                placeholder="点击云端图标上传视频，或直接在此处开始写作..."
            />
            <div className="pointer-events-none opacity-20 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-20 text-center">
                STUDIO SYNC EDITOR ENGINE v2.0
            </div>
        </div>
      </div>
    </div>
  );
};
