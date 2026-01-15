
import React, { useState, useRef } from 'react';
import { DocItem } from '../types';

interface DocumentCenterProps {
  docs: DocItem[];
  onAddDoc: (doc: DocItem) => void;
  onDeleteDoc: (id: string) => void;
  currentUser: string;
}

const CAT_COLORS: Record<string, { dark: string, light: string }> = {
  '拍摄规约': { dark: 'bg-rose-500/10 text-rose-400 border-rose-500/20', light: 'bg-rose-100 text-rose-600 border-rose-200' },
  '剪辑标准': { dark: 'bg-blue-500/10 text-blue-400 border-blue-500/20', light: 'bg-sky-100 text-sky-600 border-sky-200' },
  '团队通告': { dark: 'bg-amber-500/10 text-amber-400 border-amber-500/20', light: 'bg-amber-100 text-amber-600 border-amber-200' },
  '商务模板': { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', light: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  '其他': { dark: 'bg-slate-500/10 text-slate-400 border-slate-500/20', light: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const DocumentCenter: React.FC<DocumentCenterProps> = ({ docs, onAddDoc, onDeleteDoc, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('拍摄规约');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  const categories = ['拍摄规约', '剪辑标准', '团队通告', '商务模板', '其他'];

  const handleSave = () => {
    if (!title || !content) return alert("标题和内容不能为空");
    const doc: DocItem = {
      id: activeDoc?.id || Date.now().toString(),
      title,
      content,
      category,
      updatedAt: new Date().toISOString(),
      author: currentUser
    };
    onAddDoc(doc);
    setIsEditing(false);
    setActiveDoc(null);
  };

  const startNew = () => {
    setActiveDoc(null);
    setTitle('');
    setContent('');
    setCategory('拍摄规约');
    setIsEditing(true);
  };

  const editDoc = (doc: DocItem) => {
    setActiveDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setCategory(doc.category);
    setIsEditing(true);
  };

  const handleImportMD = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        if (!title) setTitle(file.name.replace('.md', ''));
        setContent(text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>团队 SOP ✨</h2>
            <p className={`text-sm mt-2 font-bold opacity-60 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>沉淀团队智慧，让每个人都成为高效能专家</p>
        </div>
        {!isEditing && (
            <button onClick={startNew} className={`px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center gap-3 transition-all active:scale-95 shadow-lg ${theme === 'dark' ? 'bg-blue-600 text-white shadow-blue-900/30' : 'bg-mochi-pink text-white shadow-mochi'}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                新增文档
            </button>
        )}
      </div>

      {isEditing ? (
        <div className={`rounded-[2.5rem] border p-10 space-y-6 shadow-2xl animate-popIn transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-mochi'}`}>
            <div className="flex flex-col md:flex-row gap-6">
                <input 
                    className={`flex-1 rounded-2xl px-6 py-4 font-black text-2xl outline-none border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-mochi-bg border-mochi-border text-slate-800 focus:border-rose-300'}`}
                    placeholder="请输入极具号召力的文档标题..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <select 
                    className={`rounded-2xl px-6 py-4 font-bold outline-none border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-mochi-border text-slate-700'}`}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="relative group min-h-[500px]">
                <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="file" ref={fileInputRef} onChange={handleImportMD} accept=".md" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className={`px-5 py-2.5 rounded-xl text-xs font-black border flex items-center gap-2 backdrop-blur-md transition-all ${theme === 'dark' ? 'bg-slate-700/80 text-white border-slate-600' : 'bg-white/90 text-slate-600 border-mochi-border shadow-mochi-sm'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        导入 MARKDOWN
                    </button>
                </div>
                <textarea 
                    className={`w-full h-[500px] rounded-[2rem] px-8 py-8 font-mono text-base leading-relaxed outline-none border transition-all custom-scrollbar ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500' : 'bg-mochi-bg border-mochi-border text-slate-700 focus:border-rose-300'}`}
                    placeholder="在此编写详细的工作流程、规范说明或通告内容..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${theme === 'dark' ? 'bg-slate-800 text-blue-400' : 'bg-rose-50 text-rose-400'}`}>✍️</div>
                  <div className="text-xs text-slate-500 font-bold max-w-sm">支持标准 Markdown 语法，实时云端同步，让知识在团队间无缝流动。</div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={() => setIsEditing(false)} className={`flex-1 md:flex-none px-10 py-4 font-black text-sm transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}>放弃修改</button>
                    <button onClick={handleSave} className={`flex-1 md:flex-none px-12 py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-rose-400 text-white shadow-mochi'}`}>发布到知识库</button>
                </div>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {docs.map(doc => (
                <div key={doc.id} className={`group border rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col min-h-[300px] ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-600 shadow-xl' : 'bg-white border-mochi-border hover:shadow-mochi hover:-translate-y-2'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-transform group-hover:scale-110 ${theme === 'dark' ? CAT_COLORS[doc.category].dark : CAT_COLORS[doc.category].light}`}>
                            {doc.category}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                            <button onClick={() => editDoc(doc)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-blue-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            <button onClick={() => onDeleteDoc(doc.id)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </div>
                    <h3 className={`text-2xl font-black mb-4 line-clamp-2 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800 group-hover:text-rose-500'}`}>{doc.title}</h3>
                    <p className={`text-sm line-clamp-4 mb-8 flex-1 leading-relaxed opacity-60 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {doc.content.replace(/[#*`\n]/g, ' ')}
                    </p>
                    <div className={`pt-6 border-t flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'border-slate-800 text-slate-600' : 'border-mochi-border text-slate-400'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${theme === 'dark' ? 'bg-slate-800' : 'bg-mochi-bg'}`}>{doc.author.charAt(0)}</div>
                          {doc.author}
                        </div>
                        <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
            {docs.length === 0 && (
                <div className={`col-span-full py-32 rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-slate-600' : 'bg-white border-mochi-border text-slate-400'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner ${theme === 'dark' ? 'bg-slate-800' : 'bg-mochi-bg'}`}>📂</div>
                    <p className="font-black italic uppercase tracking-[0.2em] text-sm">知识库空空如也，快去发布第一个团队 SOP 吧！</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
