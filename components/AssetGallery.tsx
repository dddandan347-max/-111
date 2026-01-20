
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
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // 文件夹编辑状态
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderEditName, setFolderEditName] = useState('');
  const [folderEditIcon, setFolderEditIcon] = useState('');

  // 拖拽交互状态
  const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null);
  const [dropOverFolderId, setDropOverFolderId] = useState<string | null>(null);

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
      console.error(err);
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
      icon: newFolderIcon.trim() || '📁'
    });
    setNewFolderName('');
    setNewFolderIcon('📁');
    setShowFolderModal(false);
  };

  const saveRename = (asset: AssetItem) => {
    if (editingName.trim() && editingName !== asset.name) {
      onUpdateAsset({ ...asset, name: editingName.trim() });
    }
    setEditingAssetId(null);
  };

  // 文件夹更新逻辑
  const submitFolderEdit = (folder: AssetFolder) => {
    if (folderEditName.trim()) {
      onAddFolder({ ...folder, name: folderEditName.trim(), icon: folderEditIcon.trim() });
    }
    setEditingFolderId(null);
  };

  // 拖拽逻辑实现
  const handleDragStart = (id: string) => {
    setDraggedAssetId(id);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDropOverFolderId(folderId);
  };

  const handleDrop = (folderId: string) => {
    if (draggedAssetId) {
      const asset = assets.find(a => a.id === draggedAssetId);
      if (asset && asset.folderId !== folderId) {
        onUpdateAsset({ ...asset, folderId });
      }
    }
    setDraggedAssetId(null);
    setDropOverFolderId(null);
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
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop('all')}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all border ${
                activeFolderId === 'all' 
                  ? (theme === 'dark' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-rose-400 text-white border-rose-300 shadow-mochi-sm')
                  : (theme === 'dark' ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300' : 'bg-white text-slate-400 border-mochi-border hover:shadow-sm')
              }`}
            >
              🌈 全部素材
            </button>
            {folders.map(folder => (
              <div 
                key={folder.id} 
                className="relative group/folder"
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={() => setDropOverFolderId(null)}
                onDrop={() => handleDrop(folder.id)}
              >
                {editingFolderId === folder.id ? (
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800 border-blue-500' : 'bg-white border-rose-300 shadow-sm'}`}>
                    <input className="w-6 bg-transparent text-center" value={folderEditIcon} onChange={e => setFolderEditIcon(e.target.value)} maxLength={2} />
                    <input 
                      className="w-20 bg-transparent font-black text-[11px] outline-none" 
                      value={folderEditName} 
                      onChange={e => setFolderEditName(e.target.value)}
                      onBlur={() => submitFolderEdit(folder)}
                      onKeyDown={e => e.key === 'Enter' && submitFolderEdit(folder)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => setActiveFolderId(folder.id)}
                    onDoubleClick={() => {
                      setEditingFolderId(folder.id);
                      setFolderEditName(folder.name);
                      setFolderEditIcon(folder.icon || '📁');
                    }}
                    className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all flex items-center gap-2 border ${
                      dropOverFolderId === folder.id ? 'scale-110 rotate-2 bg-blue-500/20 ring-2 ring-blue-500' : ''
                    } ${
                      activeFolderId === folder.id 
                        ? (theme === 'dark' ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-rose-400 text-white border-rose-300 shadow-mochi-sm')
                        : (theme === 'dark' ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300' : 'bg-white text-slate-400 border-mochi-border hover:shadow-sm')
                    }`}
                  >
                    <span>{folder.icon || '📁'}</span>
                    {folder.name}
                  </button>
                )}
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteFolder(folder.id); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover/folder:opacity-100 transition-opacity shadow-lg z-10"
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={() => setShowFolderModal(true)} className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 border-dashed ${theme === 'dark' ? 'border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-400' : 'border-mochi-border text-slate-300 hover:border-rose-200 hover:text-rose-300'}`}>
              + 新建文件夹
            </button>
          </div>
        </div>

        <button onClick={() => fileInputRef.current?.click()} className={`shrink-0 px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center gap-3 transition-all active:scale-95 shadow-xl ${theme === 'dark' ? 'bg-blue-600 text-white shadow-blue-900/40' : 'bg-mochi-pink text-white shadow-mochi'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          上传参考
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
      </div>

      {showFolderModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
           <div className={`w-full max-w-sm rounded-[2rem] border p-8 space-y-6 animate-popIn ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-2xl'}`}>
              <h3 className="text-xl font-black text-center">新建分类</h3>
              <div className="flex gap-2">
                <input className={`w-14 px-2 py-3 rounded-xl border font-bold text-center outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-mochi-bg border-mochi-border'}`} value={newFolderIcon} onChange={e => setNewFolderIcon(e.target.value)} maxLength={2} placeholder="图标" />
                <input className={`flex-1 px-5 py-3 rounded-xl border font-bold outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-mochi-bg border-mochi-border text-slate-800'}`} placeholder="文件夹名称..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && createFolder()} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowFolderModal(false)} className="flex-1 py-3 text-sm font-black opacity-40">取消</button>
                <button onClick={createFolder} className={`flex-1 py-3 rounded-xl text-sm font-black text-white ${theme === 'dark' ? 'bg-blue-600' : 'bg-rose-400'}`}>创建</button>
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
            <input className={`w-full px-6 py-4 rounded-2xl border font-bold outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-mochi-bg border-mochi-border focus:border-rose-300'}`} value={tempName} onChange={e => setTempName(e.target.value)} disabled={isSaving} autoFocus onKeyDown={e => e.key === 'Enter' && confirmUpload()} />
            <div className="flex gap-4">
              <button onClick={resetUpload} disabled={isSaving} className="flex-1 py-4 font-black text-slate-500 disabled:opacity-30">取消</button>
              <button onClick={confirmUpload} disabled={isSaving} className={`flex-1 py-4 rounded-2xl font-black text-white ${theme === 'dark' ? 'bg-blue-600' : 'bg-rose-400'}`}>{isSaving ? '正在保存...' : '确认同步'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
        {filteredAssets.map(asset => (
          <div 
            key={asset.id} 
            draggable
            onDragStart={() => handleDragStart(asset.id)}
            className={`group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border transition-all duration-700 ${
              draggedAssetId === asset.id ? 'opacity-40 scale-95 grayscale' : ''
            } ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-blue-500 shadow-xl' : 'bg-white border-mochi-border hover:shadow-mochi hover:-translate-y-2'}`}
          >
            <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 pointer-events-none" loading="lazy" />
            
            <div className="absolute top-4 right-4 z-[60]">
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteAsset(asset.id);
                  }}
                  className="w-10 h-10 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-2xl hover:scale-110 active:scale-90 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
                <div className="flex flex-col pointer-events-auto space-y-1.5">
                  <div className="flex items-center gap-2">
                    <select
                      value={asset.folderId || ''}
                      onChange={(e) => onUpdateAsset({ ...asset, folderId: e.target.value })}
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border outline-none cursor-pointer transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900/60 border-slate-700 text-blue-400 hover:bg-slate-800' 
                          : 'bg-white/60 border-mochi-border text-rose-400 hover:bg-white'
                      }`}
                    >
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">可拖拽</span>
                  </div>
                  
                  {editingAssetId === asset.id ? (
                    <input 
                      className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-2 py-1 text-white font-black text-lg outline-none"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => saveRename(asset)}
                      onKeyDown={e => e.key === 'Enter' && saveRename(asset)}
                      autoFocus
                    />
                  ) : (
                    <p onClick={() => { setEditingAssetId(asset.id); setEditingName(asset.name); }} className="text-white font-black text-lg truncate cursor-text hover:text-blue-300 transition-colors">
                      {asset.name}
                    </p>
                  )}
                </div>
            </div>
          </div>
        ))}
        {filteredAssets.length === 0 && (
          <div className={`col-span-full py-40 rounded-[3.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-colors ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-700' : 'bg-white border-mochi-border text-slate-300'}`}>
            <div className="text-6xl mb-6 opacity-40">📸</div>
            <p className="font-black italic uppercase tracking-[0.3em] text-sm">该分类暂无素材</p>
          </div>
        )}
      </div>
    </div>
  );
};
