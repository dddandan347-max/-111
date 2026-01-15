
import React, { useState } from 'react';
import { DocItem } from '../types';

interface DocumentCenterProps {
  docs: DocItem[];
  onAddDoc: (doc: DocItem) => void;
  onDeleteDoc: (id: string) => void;
  currentUser: string;
}

export const DocumentCenter: React.FC<DocumentCenterProps> = ({ docs, onAddDoc, onDeleteDoc, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('拍摄规约');

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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-white">团队知识库</h2>
            <p className="text-slate-500 text-sm mt-1">存放SOP流程、拍摄准则与常用模板</p>
        </div>
        {!isEditing && (
            <button onClick={startNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新增文档
            </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex gap-4">
                <input 
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-xl font-bold"
                    placeholder="文档标题"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <select 
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <textarea 
                className="w-full h-96 bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-sm leading-relaxed"
                placeholder="使用 Markdown 格式书写内容..."
                value={content}
                onChange={e => setContent(e.target.value)}
            />
            <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">取消</button>
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl font-bold">保存并发布</button>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map(doc => (
                <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-all group flex flex-col min-h-[220px]">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-1 rounded border border-blue-500/20">
                            {doc.category}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => editDoc(doc)} className="text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            <button onClick={() => onDeleteDoc(doc.id)} className="text-slate-400 hover:text-red-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{doc.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {doc.content.replace(/[#*`]/g, '')}
                    </p>
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> {doc.author}</span>
                        <span>更新于 {new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
            {docs.length === 0 && (
                <div className="col-span-full py-20 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500">
                    <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p>知识库空空如也，快去发布第一个团队准则吧！</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
