import React, { useRef } from 'react';
import { AssetItem } from '../types';

interface AssetGalleryProps {
  assets: AssetItem[];
  onAddAsset: (asset: AssetItem) => void;
  onDeleteAsset: (id: string) => void;
}

export const AssetGallery: React.FC<AssetGalleryProps> = ({ assets, onAddAsset, onDeleteAsset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process first file for simplicity in this demo
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        const newAsset: AssetItem = {
          id: Date.now().toString(),
          name: file.name,
          dataUrl: event.target.result as string,
          type: 'image'
        };
        onAddAsset(newAsset);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">素材参考库</h2>
        <div>
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                上传素材
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map(asset => (
            <div key={asset.id} className="group relative aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-sm">
                <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white text-sm font-medium truncate mb-1">{asset.name}</p>
                    <button 
                        onClick={() => onDeleteAsset(asset.id)}
                        className="text-xs text-red-300 hover:text-red-100 text-left"
                    >
                        移除
                    </button>
                </div>
            </div>
        ))}
        {assets.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-slate-700 rounded-xl h-64 flex flex-col items-center justify-center text-slate-500">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p>上传情绪板、勘景图或角色参考图。</p>
            </div>
        )}
      </div>
    </div>
  );
};