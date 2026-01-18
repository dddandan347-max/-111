
import React, { useRef, useState, useMemo } from 'react';
import { AssetItem, AssetFolder } from '../types';

interface AssetGalleryProps {
  assets: AssetItem[];
  onAddAsset: (asset: AssetItem) => Promise<void> | void;
  onDeleteAsset: (id: string) => void;
  onUpdateAsset: (asset: AssetItem) => void;
  folders: AssetFolder[];
  onAddFolder: (folder: AssetFolder) => void;
  onDeleteFolder: (id: string) => void;
}

export const AssetGallery: React.FC<AssetGalleryProps> = ({ 
  assets, onAddAsset, onDeleteAsset, onUpdateAsset,
  folders, onAddFolder, onDeleteFolder 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFolderId, setActiveFolderId] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempDataUrl, setTempDataUrl] = useState<string | null>(null);
  
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  const filteredAssets = useMemo(() => {
    if (activeFolderId === 'all') return assets;
    return assets.filter(a => a.folderId === activeFolderId);
  }, [assets, activeFolderId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTempDataUrl(event.target.result as string);
        setTempName(file.name.split('.')[0]);
        setIsUploading(true);
      }
    };
    reader.onerror = () => alert("读取文件失败，请重试");
    reader.readAsDataURL(file);
  };

  const confirmUpload = async () => {
    if (!tempDataUrl || !tempName) return;
    
    setIsSaving(true);
    try {
      let targetFolderId = activeFolderId;
      if (activeFolderId === 'all') {
        targetFolderId = folders.length > 0 ? folders[0].id : 'moodboard';
      }

      const newAsset: AssetItem = {
        id: Date.now().toString(),
        name: tempName,
        dataUrl: tempDataUrl,
        type: 'image',
        folderId: targetFolderId
      };
      
      await onAddAsset(newAsset);
      resetUpload();
    } catch (err) {
      console.error("Confirm upload error:", err);
      alert("上传失败，请查看控制台日志");
    } finally {
      setIsSaving(false);
    }
  };

  const resetUpload = () => {
    setTempDataUrl(null);
    setTempName('');
    setIsUploading(false);
    setIsSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    onAddFolder({
      id: Date.now().toString(),
      name: newFolderName.trim(),
      icon: '📁'
    });
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const startRename = (asset: AssetItem) => {
    setEditingAssetId(asset.id);
    setEditingName(asset.name);
  };

  const saveRename = (asset: AssetItem) => {
    if (editingName.trim() && editingName !== asset.name) {
      onUpdateAsset({ ...asset, name: editingName.trim() });
    }
    setEditingAssetId(null);
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="w-full">
          <h2 className={`text-5xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            素材资产库 <span className="opacity-20 text-3xl">/ Reference</span>
          </h2>
          <div className="flex flex-wrap gap-2 mt-6">
            <button 
              onClick={() => setActiveFolderId('all')}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 border ${
                activeFolderId === 'all' 
                  ? (theme === 'dark' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-rose-400 text-white border-rose-300 shadow-mochi-sm')
                  : (theme === 'dark' ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300' : 'bg-white text-slate-400 border-mochi-border hover:shadow-sm')
              }`}
            >
              🌈 全部素材
            </button>
            {folders.map(folder => (
              <div key={folder.id} className="relative group/folder">
                <button 
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 border ${
                    activeFolderId === folder.id 
                      ? (theme === 'dark' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-rose-400 text-white border-rose-300 shadow-mochi-sm')
                      : (theme === 'dark' ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300' : 'bg-white text-slate-400 border-mochi-border hover:shadow-sm')
                  }`}
                >
                  <span>{folder.icon || '📁'}</span>
                  {folder.name}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm('确认删除该分类？')) onDeleteFolder(folder.id); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover/folder:opacity-100 transition-opacity shadow-lg z-10"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={() => setShowFolderModal(true)}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 border-dashed ${
                theme === 'dark' ? 'border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-400' : 'border-mochi-border text-slate-300 hover:border-rose-200 hover:text-rose-300'
              }`}
            >
              + 新建文件夹
            </button>
          </div>
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className={`shrink-0 px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center gap-3 transition-all active:scale-95 shadow-xl ${
            theme === 'dark' ? 'bg-blue-600 text-white shadow-blue-900/40' : 'bg-mochi-pink text-white shadow-mochi'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          上传参考
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
      </div>

      {showFolderModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
           <div className={`w-full max-w-sm rounded-[2rem] border p-8 space-y-6 animate-popIn ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-2xl'}`}>
              <h3 className="text-xl font-black text-center">新建分类</h3>
              <input 
                className={`w-full px-5 py-3 rounded-xl border font-bold outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-mochi-bg border-mochi-border focus:border-rose-400'}`}
                placeholder="例如：灯光、转场、配色..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && createFolder()}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowFolderModal(false)} className="flex-1 py-3 text-sm font-black opacity-40 hover:opacity-100 transition-opacity">取消</button>
                <button onClick={createFolder} className={`flex-1 py-3 rounded-xl text-sm font-black text-white ${theme === 'dark' ? 'bg-blue-600' : 'bg-rose-400'}`}>创建文件夹</button>
              </div>
           </div>
        </div>
      )}

      {isUploading && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md`}>
          <div className={`w-full max-w-lg rounded-[2.5rem] border p-10 space-y-8 animate-popIn ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-2xl'}`}>
            <h3 className="text-2xl font-black text-center">核对并上传素材</h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-800 border dark:border-slate-700 shadow-inner">
               <img src={tempDataUrl!} className="w-full h-full object-contain" alt="Preview" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">资产名称 (Asset Name)</label>
              <input 
                className={`w-full px-6 py-4 rounded-2xl border font-bold outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-mochi-bg border-mochi-border focus:border-rose-300'}`}
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                placeholder="起个好听的名字..."
                disabled={isSaving}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && confirmUpload()}
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={resetUpload} 
                disabled={isSaving}
                className="flex-1 py-4 font-black text-slate-500 hover:text-rose-500 transition-colors disabled:opacity-30"
              >
                放弃上传
              </button>
              <button 
                onClick={confirmUpload} 
                disabled={isSaving}
                className={`flex-1 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-blue-600' : 'bg-rose-400'}`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    正在保存...
                  </>
                ) : '确认并同步'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
        {filteredAssets.map(asset => (
          <div key={asset.id} className={`group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border transition-all duration-700 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-blue-500 shadow-xl' : 'bg-white border-mochi-border hover:shadow-mochi hover:-translate-y-2'}`}>
            <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
            
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex justify-between items-end">
                <div className="flex-1 min-w-0 mr-4">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 block">
                    {folders.find(f => f.id === asset.folderId)?.name || '未分类素材'}
                  </span>
                  
                  {editingAssetId === asset.id ? (
                    <input 
                      className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-2 py-1 text-white font-black text-lg outline-none focus:border-blue-400 transition-all"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => saveRename(asset)}
                      onKeyDown={e => e.key === 'Enter' && saveRename(asset)}
                      autoFocus
                    />
                  ) : (
                    <p 
                      onClick={() => startRename(asset)}
                      className="text-white font-black text-lg truncate drop-shadow-md cursor-text hover:text-blue-300 transition-colors flex items-center gap-2 group/name"
                    >
                      {asset.name}
                      <svg className="w-3 h-3 opacity-0 group-hover/name:opacity-100" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                    </p>
                  )}
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    if(confirm('确认删除该素材？')) {
                      onDeleteAsset(asset.id);
                    }
                  }}
                  className="w-10 h-10 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all backdrop-blur-md border border-rose-500/30 relative z-20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className={`col-span-full py-40 rounded-[3.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-700' : 'bg-white border-mochi-border text-slate-300'}`}>
            <div className="text-6xl mb-6 opacity-40">📸</div>
            <p className="font-black italic uppercase tracking-[0.3em] text-sm text-center px-4">该分类暂无素材</p>
          </div>
        )}
      </div>
    </div>
  );
};
