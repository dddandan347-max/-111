
import React, { useState, useRef, useEffect } from 'react';
import { ScriptPrompt } from '../types';
import { generateScriptIdea } from '../services/geminiService';

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
        return `<div class="my-4 max-w-full md:max-w-md group relative inline-block"><img src="${url}" data-media-type="img" class="rounded-xl border border-slate-700 shadow-lg" /><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-[10px] px-2 py-1 rounded cursor-pointer" onclick="this.parentElement.remove()">删除媒体</div></div>`;
      })
      .replace(/\{media-video\}(.*?)\{\/media\}/g, (_, url) => {
        return `<div class="my-4 max-w-full md:max-w-md group relative"><video src="${url}" controls data-media-type="video" class="rounded-xl border border-slate-700 shadow-lg w-full"></video><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-[10px] px-2 py-1 rounded cursor-pointer" onclick="this.parentElement.remove()">删除媒体</div></div>`;
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
        if (node.tagName === 'SPAN' && node.dataset.color) {
          return `{hl-${node.dataset.color}}${node.innerText}{/hl}`;
        }
        // 处理媒体容器
        const img = node.querySelector('img');
        if (img && img.dataset.mediaType === 'img') {
          return `{media-img}${img.src}{/media}`;
        }
        const video = node.querySelector('video');
        if (video && video.dataset.mediaType === 'video') {
          return `{media-video}${video.src}{/media}`;
        }
        // 如果节点本身就是 img 或 video
        if (node.tagName === 'IMG' && (node as any).dataset.mediaType === 'img') {
          return `{media-img}${(node as HTMLImageElement).src}{/media}`;
        }
        if (node.tagName === 'VIDEO' && (node as any).dataset.mediaType === 'video') {
          return `{media-video}${(node as HTMLVideoElement).src}{/media}`;
        }

        if (['DIV', 'P'].includes(node.tagName)) {
           return '\n' + Array.from(node.childNodes).map(convert).join('');
        }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 已解除大小限制，仅保留一个温和提示
    if (file.size > 50 * 1024 * 1024) {
      if(!confirm("文件超过 50MB，Base64 编码可能会导致保存非常缓慢，确定继续吗？")) return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (file.type.startsWith('image/')) {
        insertMedia('img', result);
      } else if (file.type.startsWith('video/')) {
        insertMedia('video', result);
      }
    };
    reader.readAsDataURL(file);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
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
      alert("保存成功！大容量素材已同步。");
    } catch (err) {
      console.error(err);
      alert("保存失败，可能是文件超出了数据库单行最大限制 (PostgreSQL 通常限制 1GB，但网络传输可能受限)。");
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fadeIn">
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">脚本仓库</h2>
            <button onClick={() => setActivePromptId(null)} className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all" title="新建剧本">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar max-h-[70vh]">
            {prompts.map(p => (
                <div key={p.id} onClick={() => setActivePromptId(p.id)} className={`p-3 rounded-xl border cursor-pointer transition-all ${activePromptId === p.id ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-200 truncate">{p.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</span>
                      <button onClick={(e) => { e.stopPropagation(); onDeletePrompt(p.id); }} className="text-slate-600 hover:text-red-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative min-h-[600px]">
        <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-4 py-2 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                    {Object.entries(HIGHLIGHT_COLORS).map(([color, classes]) => (
                        <button key={color} onClick={() => applyColor(color)} className={`w-6 h-6 rounded flex items-center justify-center transition-transform hover:scale-110 ${classes.split(' ')[0]}`} />
                    ))}
                </div>
                <div className="h-6 w-[1px] bg-slate-700 mx-1" />
                <button onClick={() => mediaInputRef.current?.click()} className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors" title="插入图片/视频参考">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <input type="file" ref={mediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={handleGenerate} disabled={isLoading} className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-purple-500/30">
                    {isLoading ? 'AI 正在构思...' : 'Gemini 创作大纲'}
                </button>
                <button onClick={savePrompt} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95">
                  保存剧本
                </button>
            </div>
        </div>

        <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar">
            <input 
                type="text" 
                placeholder="在此输入剧本标题..."
                className="w-full bg-transparent text-3xl font-bold text-white mb-6 focus:outline-none placeholder:text-slate-800"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
            />
            <div 
                ref={editorRef}
                contentEditable
                className="w-full min-h-[500px] bg-transparent text-slate-300 text-lg leading-loose focus:outline-none font-serif whitespace-pre-wrap outline-none pb-20"
                placeholder="点击上方图标插入媒体或开始编写..."
            />
        </div>
      </div>
    </div>
  );
};
