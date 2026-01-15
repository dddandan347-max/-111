
import React, { useState, useRef } from 'react';
import { ScriptPrompt } from '../types';
import { generateScriptIdea } from '../services/geminiService';

interface PromptLibraryProps {
  prompts: ScriptPrompt[];
  onAddPrompt: (p: ScriptPrompt) => void;
  onDeletePrompt: (id: string) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ prompts, onAddPrompt, onDeletePrompt }) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('电影感 & 情感向');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  
  // 查找替换状态
  const [showSearch, setShowSearch] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!topic) {
        alert("请先输入视频主题再生成");
        return;
    }
    setIsLoading(true);
    const content = await generateScriptIdea(topic, style);
    setGeneratedContent(content);
    setIsLoading(false);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const newContent = generatedContent.split(findText).join(replaceText);
    setGeneratedContent(newContent);
    alert(`替换成功！`);
  };

  const applyHighlight = (color: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = generatedContent.substring(start, end);

    if (!selectedText) {
        alert("请先选中一段文字再进行高亮");
        return;
    }

    const newContent = 
        generatedContent.substring(0, start) + 
        `{hl-${color}}${selectedText}{/hl}` + 
        generatedContent.substring(end);
    
    setGeneratedContent(newContent);
  };

  const savePrompt = () => {
    if (!generatedContent || !topic) {
        alert("标题和内容不能为空");
        return;
    }

    const promptData: ScriptPrompt = {
      id: activePromptId || Date.now().toString(),
      title: topic,
      content: generatedContent,
      tags: [style],
      createdAt: activePromptId 
        ? (prompts.find(p => p.id === activePromptId)?.createdAt || new Date().toISOString())
        : new Date().toISOString()
    };

    // CRITICAL: 这里必须调用外部传入的 onAddPrompt，它在 App.tsx 中负责真正的 Supabase 写入
    if (activePromptId) {
       // 如果是修改旧的，App.tsx 里的逻辑通常是先删再插，或者你需要 App 支持 update
       // 根据你 App.tsx 的 handleAddPrompt 实现，它使用 insert。
       // 我们先执行删除旧的，再插入新的以同步数据库。
       onDeletePrompt(activePromptId);
    }
    
    onAddPrompt(promptData);
    setActivePromptId(promptData.id);
    alert("剧本已同步至数据库！");
  };

  const startNewPrompt = () => {
    setTopic('');
    setGeneratedContent('');
    setStyle('电影感 & 情感向');
    setActivePromptId(null);
    setShowSearch(false);
  };

  const viewPrompt = (p: ScriptPrompt) => {
    setTopic(p.title);
    setGeneratedContent(p.content);
    setStyle(p.tags[0] || '电影感 & 情感向');
    setActivePromptId(p.id);
  };

  const deletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("确定要删除此剧本吗？此操作不可撤销。")) {
        onDeletePrompt(id); // 这里直接调用 App.tsx 的数据库删除逻辑
        if (activePromptId === id) {
            startNewPrompt();
        }
    }
  };

  const renderHighlightedContent = (text: string) => {
    const parts = text.split(/(\{hl-\w+\}.*?\{\/hl\})/g);
    return parts.map((part, i) => {
      const match = part.match(/\{hl-(\w+)\}(.*?)\{\/hl\}/);
      if (match) {
        const colorClass = 
          match[1] === 'yellow' ? 'bg-yellow-400/50 text-slate-900' :
          match[1] === 'green' ? 'bg-emerald-400/50 text-slate-900' :
          match[1] === 'blue' ? 'bg-blue-400/50 text-slate-900' : '';
        return <mark key={i} className={`${colorClass} rounded px-0.5`}>{match[2]}</mark>;
      }
      return part;
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">脚本库</h2>
            <button 
                onClick={startNewPrompt}
                className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {prompts.map(p => (
                <div 
                    key={p.id}
                    onClick={() => viewPrompt(p)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all group ${
                        activePromptId === p.id 
                        ? 'bg-blue-600/10 border-blue-500/50' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <h3 className={`font-medium text-sm line-clamp-1 ${activePromptId === p.id ? 'text-blue-300' : 'text-slate-200'}`}>
                            {p.title}
                        </h3>
                        <button 
                            onClick={(e) => deletePrompt(p.id, e)} 
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400"
                        >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                        {p.content.replace(/\{hl-\w+\}|\{\/hl\}/g, '')}
                    </p>
                </div>
            ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
        <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-900/50 rounded-lg p-1 border border-slate-700">
                    <button onClick={() => applyHighlight('yellow')} className="p-1.5 hover:bg-yellow-500/20 text-yellow-500 rounded"><div className="w-4 h-4 bg-yellow-500 rounded-sm"></div></button>
                    <button onClick={() => applyHighlight('green')} className="p-1.5 hover:bg-emerald-500/20 text-emerald-500 rounded"><div className="w-4 h-4 bg-emerald-500 rounded-sm"></div></button>
                    <button onClick={() => applyHighlight('blue')} className="p-1.5 hover:bg-blue-500/20 text-blue-500 rounded"><div className="w-4 h-4 bg-blue-500 rounded-sm"></div></button>
                </div>
                <button 
                    onClick={() => setShowSearch(!showSearch)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showSearch ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                >
                    查找替换
                </button>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white disabled:opacity-50 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                >
                    {isLoading ? '生成中...' : 'Gemini AI 续写'}
                </button>
                <button 
                    onClick={savePrompt}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg"
                >
                    {activePromptId ? '同步修改' : '保存剧本'}
                </button>
            </div>
        </div>

        {showSearch && (
            <div className="absolute top-[60px] left-6 right-6 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-2xl z-30">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">查找</label>
                        <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 outline-none" value={findText} onChange={(e)=>setFindText(e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">替换为</label>
                        <input className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 outline-none" value={replaceText} onChange={(e)=>setReplaceText(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleReplaceAll} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-xs font-bold">替换全部</button>
                        <button onClick={() => setShowSearch(false)} className="text-slate-400 px-2 py-1.5 text-xs">取消</button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto bg-slate-950/30 p-4 md:p-8 flex justify-center custom-scrollbar">
            <div className="w-full max-w-3xl bg-slate-900 min-h-[1000px] shadow-2xl border border-slate-800 rounded-sm p-8 md:p-16 flex flex-col relative">
                <input 
                    type="text" 
                    placeholder="输入剧本标题..."
                    className="w-full bg-transparent text-4xl font-bold text-white mb-6 border-none focus:outline-none placeholder:text-slate-800"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
                
                <div className="h-px bg-slate-800 mb-10"></div>

                <div className="relative flex-1 flex flex-col">
                    <div 
                        className="absolute inset-0 pointer-events-none text-transparent text-lg leading-loose font-serif whitespace-pre-wrap break-words"
                        aria-hidden="true"
                    >
                        {renderHighlightedContent(generatedContent)}
                    </div>
                    
                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent text-slate-300 text-lg leading-loose resize-none focus:outline-none placeholder:text-slate-800 font-serif whitespace-pre-wrap break-words z-10"
                        placeholder="在此输入或生成剧本..."
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
