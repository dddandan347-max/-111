import React, { useState } from 'react';
import { Character } from '../types';

interface CharacterHubProps {
  characters: Character[];
  setCharacters: (c: Character[]) => void;
  currentUser: string;
}

export const CharacterHub: React.FC<CharacterHubProps> = ({ characters, setCharacters, currentUser }) => {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const addCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    const newChar: Character = {
        id: Date.now().toString(),
        name: newName,
        description: newDesc,
        imageUrl: `https://picsum.photos/seed/${newName.replace(/\s/g,'')}/200/200` // Deterministic random image
    };
    
    setCharacters([...characters, newChar]);
    setNewName('');
    setNewDesc('');
  };

  const toggleClaim = (id: string) => {
    setCharacters(characters.map(c => {
        if (c.id === id) {
            // If already claimed by someone else, don't allow override easily (basic logic)
            if (c.claimedBy && c.claimedBy !== currentUser) {
                alert(`该角色已被 ${c.claimedBy} 领取`);
                return c;
            }
            // Toggle claim
            return { ...c, claimedBy: c.claimedBy ? undefined : currentUser };
        }
        return c;
    }));
  };

  const deleteCharacter = (id: string) => {
      setCharacters(characters.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-white">角色 / 演员表</h2>
            <p className="text-slate-400 text-sm mt-1">查看剧本角色并认领您的演出任务</p>
         </div>
         <div className="text-slate-400 text-sm bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            当前身份: <span className="text-blue-400 font-bold">{currentUser}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add New Card */}
        <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col justify-center items-center min-h-[350px] hover:border-slate-500 hover:bg-slate-800/30 transition-all duration-300 group cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-300 mb-4 group-hover:text-white transition-colors group-hover:scale-105 transform duration-300">添加新角色</h3>
            <form onSubmit={addCharacter} className="w-full space-y-3">
                <input 
                    type="text" 
                    placeholder="角色姓名" 
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <textarea 
                    placeholder="角色简介 / 性格特征..." 
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500 resize-none h-24 placeholder-slate-500 transition-colors"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                    创建角色
                </button>
            </form>
        </div>

        {/* Character Cards */}
        {characters.map(char => (
            <div 
                key={char.id} 
                className={`flex flex-col relative bg-slate-800 rounded-xl overflow-hidden border transition-all duration-500 ease-out group hover:translate-y-[-6px] hover:shadow-2xl 
                ${char.claimedBy 
                    ? 'border-blue-500/50 shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/30' 
                    : 'border-slate-700 hover:border-slate-500'
                }`}
            >
                <div className="aspect-square w-full relative bg-slate-900 overflow-hidden">
                    {char.imageUrl && (
                        <img 
                            src={char.imageUrl} 
                            alt={char.name} 
                            className={`w-full h-full object-cover transition-all duration-700 transform 
                            ${char.claimedBy ? 'scale-110 grayscale-0' : 'grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105'}`} 
                        />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <button 
                            onClick={() => deleteCharacter(char.id)} 
                            className="p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors transform hover:scale-110"
                            title="删除角色"
                         >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {char.claimedBy && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/20 backdrop-blur-[2px] animate-[fadeIn_0.5s_ease-out]">
                             {/* Optional overlay effect if needed */}
                        </div>
                    )}
                    {char.claimedBy && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/95 via-blue-900/70 to-transparent p-4 pt-12 animate-slideUp">
                            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider drop-shadow-md">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                                </span>
                                已被认领
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col relative overflow-hidden">
                    {/* Background sheen effect for claimed cards */}
                    {char.claimedBy && (
                         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
                    )}

                    <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${char.claimedBy ? 'text-blue-100' : 'text-white'}`}>{char.name}</h3>
                    <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed">{char.description}</p>
                    
                    <div className="mt-auto relative z-10">
                        {char.claimedBy ? (
                            <div className="bg-slate-900/80 rounded-xl p-3 border border-blue-500/30 shadow-inner animate-popIn">
                                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">扮演者</div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] shadow-md">
                                            {char.claimedBy.charAt(0).toUpperCase()}
                                        </div>
                                        {char.claimedBy}
                                    </span>
                                    {char.claimedBy === currentUser && (
                                         <button 
                                            onClick={() => toggleClaim(char.id)} 
                                            className="text-xs text-slate-500 hover:text-red-400 hover:bg-red-400/10 px-2 py-1 rounded transition-all"
                                         >
                                            取消
                                         </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => toggleClaim(char.id)}
                                className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-95 border border-slate-600 hover:border-blue-500/50 shadow-md hover:shadow-blue-500/20 group-hover:border-slate-500"
                            >
                                <span className="inline-block transition-transform group-hover:scale-110 mr-2">✋</span> 
                                我要演这个
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};