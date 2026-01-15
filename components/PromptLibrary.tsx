import React, { useState } from 'react';
import { ScriptPrompt } from '../types';
import { generateScriptIdea } from '../services/geminiService';

interface PromptLibraryProps {
  prompts: ScriptPrompt[];
  setPrompts: (p: ScriptPrompt[]) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ prompts, setPrompts }) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('电影感 & 情感向');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsLoading(true);
    const content = await generateScriptIdea(topic, style);
    setGeneratedContent(content);
    setIsEditing(true);
    setActivePromptId(null); // Creating new
    setIsLoading(false);
  };

  const savePrompt = () => {
    if (!generatedContent || !topic) return;

    const newPrompt: ScriptPrompt = {
      id: activePromptId || Date.now().toString(),
      title: topic,
      content: generatedContent,
      tags: [style],
      createdAt: new Date().toISOString()
    };

    if (activePromptId) {
      setPrompts(prompts.map(p => p.id === activePromptId ? newPrompt : p));
    } else {
      setPrompts([newPrompt, ...prompts]);
    }
    
    // Reset view
    setTopic('');
    setGeneratedContent('');
    setIsEditing(false);
    setActivePromptId(null);
  };

  const viewPrompt = (p: ScriptPrompt) => {
    setTopic(p.title);
    setGeneratedContent(p.content);
    setStyle(p.tags[0] || '通用');
    setActivePromptId(p.id);
    setIsEditing(true);
  };

  const deletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrompts(prompts.filter(p => p.id !== id));
    if (activePromptId === id) {
        setIsEditing(false);
        setTopic('');
        setGeneratedContent('');
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* List Sidebar */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-white">脚本库</h2>
        <button 
          onClick={() => { setIsEditing(true); setTopic(''); setGeneratedContent(''); setActivePromptId(null); }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          新建脚本
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {prompts.map(p => (
                <div 
                    key={p.id}
                    onClick={() => viewPrompt(p)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        activePromptId === p.id 
                        ? 'bg-slate-800 border-blue-500 shadow-md' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-200 line-clamp-1">{p.title}</h3>
                        <button onClick={(e) => deletePrompt(p.id, e)} className="text-slate-600 hover:text-red-400">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.content}</p>
                    <div className="mt-3 flex gap-2">
                        {p.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{tag}</span>
                        ))}
                    </div>
                </div>
            ))}
            {prompts.length === 0 && (
                <div className="text-center py-8 text-slate-600 text-sm">暂无脚本，请创建一个！</div>
            )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col overflow-hidden">
        {isEditing ? (
            <>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input 
                        type="text" 
                        placeholder="视频主题 / 标题"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <select
                        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                    >
                        <option>电影感 & 情感向</option>
                        <option>快节奏 Vlog</option>
                        <option>企业宣传 / 专业</option>
                        <option>搞笑 / 玩梗</option>
                        <option>教育 / 教程</option>
                    </select>
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gemini 智能生成中...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                AI 生成
                            </>
                        )}
                    </button>
                </div>

                <textarea
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-6 text-slate-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-none mb-4"
                    placeholder="在此编写脚本或使用 AI 生成大纲..."
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={savePrompt}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
                    >
                        保存脚本
                    </button>
                </div>
            </>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <svg className="w-20 h-20 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <p>选择一个脚本进行编辑或创建一个新脚本。</p>
            </div>
        )}
      </div>
    </div>
  );
};