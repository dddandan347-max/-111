
import React, { useState, useMemo, useRef } from 'react';
import { Transaction, VideoTask } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, PieChart, Pie } from 'recharts';
import { supabase } from '../services/supabase';

interface FinanceProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  tasks: VideoTask[];
  categories: string[];
  onUpdateCategories: (c: string[]) => void;
}

export const FinanceTracker: React.FC<FinanceProps> = ({ transactions, onAddTransaction, onDeleteTransaction, tasks, categories, onUpdateCategories }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(categories[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter State
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fileName = `finance/${Date.now()}-${file.name}`;
    try {
      const { error } = await supabase.storage.from('studiosync_assets').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('studiosync_assets').getPublicUrl(fileName);
      setAttachmentUrl(publicUrl);
    } catch (err) {
      alert("上传凭证失败");
    } finally {
      setIsUploading(false);
    }
  };

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    onAddTransaction({
      id: Date.now().toString(),
      description: desc,
      amount: parseFloat(amount),
      type,
      date: date || new Date().toISOString(),
      category,
      linkedTaskId: linkedTaskId || undefined,
      attachmentUrl: attachmentUrl || undefined
    });
    setDesc(''); setAmount(''); setLinkedTaskId(''); setAttachmentUrl('');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const matchMonth = filterMonth === 'All' || t.date.startsWith(filterMonth);
        const matchCategory = filterCategory === 'All' || t.category === filterCategory;
        return matchMonth && matchCategory;
    });
  }, [transactions, filterMonth, filterCategory]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, {name: string, income: number, expense: number}>();
    transactions.forEach(t => {
        const m = t.date.substring(0, 7);
        if (!map.has(m)) map.set(m, {name: m, income: 0, expense: 0});
        const entry = map.get(m)!;
        if (t.type === 'income') entry.income += t.amount;
        else entry.expense += t.amount;
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)).slice(-12);
  }, [transactions]);

  const categoryData = useMemo(() => {
      const map = new Map<string, number>();
      filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
          map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">财务罗盘</h2>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2 font-bold">
               <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
               可视化资金流水与报销对账
            </p>
        </div>
        <div className="flex gap-4">
            <div className="glass px-6 py-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-black uppercase mb-1">净盈余</div>
                <div className={`text-2xl font-black ${(totals.income - totals.expense) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    ¥{(totals.income - totals.expense).toLocaleString()}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="glass p-6 rounded-3xl border border-slate-800/50 h-80">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase mb-6 flex justify-between">收支趋势</h3>
                     <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={monthlyData} onClick={(data) => data && setFilterMonth(data.activeLabel)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                            <Line type="monotone" dataKey="income" name="收入" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="expense" name="支出" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="glass p-6 rounded-3xl border border-slate-800/50 h-80">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase mb-6 flex justify-between">支出结构</h3>
                     <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie data={categoryData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" onClick={(data) => setFilterCategory(data.name)}>
                                {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                 </div>
            </div>

            <div className="glass rounded-3xl border border-slate-800/50 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex flex-wrap justify-between items-center bg-slate-900/40 gap-4">
                    <div className="flex gap-3">
                        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-slate-950 border border-slate-800 text-[10px] font-bold px-3 py-2 rounded-xl text-white">
                            <option value="All">所有月份</option>
                            {Array.from(new Set(transactions.map(t => t.date.substring(0, 7)))).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-slate-950 border border-slate-800 text-[10px] font-bold px-3 py-2 rounded-xl text-white">
                            <option value="All">全部分类</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="text-[10px] font-black text-slate-500 uppercase bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-4">日期</th>
                                <th className="px-6 py-4">项目描述</th>
                                <th className="px-6 py-4">分类</th>
                                <th className="px-6 py-4">凭证</th>
                                <th className="px-6 py-4 text-right">金额</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-blue-600/5 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{t.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-200">{t.description}</div>
                                        {t.linkedTaskId && <div className="text-[9px] text-blue-500 mt-1 uppercase font-black tracking-widest"># {tasks.find(x => x.id === t.linkedTaskId)?.title}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase">{t.category}</td>
                                    <td className="px-6 py-4">
                                        {t.attachmentUrl ? (
                                          <a href={t.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                                          </a>
                                        ) : <span className="text-slate-800">-</span>}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {t.type === 'income' ? '+' : '-'}¥{t.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onDeleteTransaction(t.id)} className="text-slate-700 hover:text-red-500">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <form onSubmit={addTransaction} className="glass p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-8 animate-popIn">
                <h3 className="text-xl font-black text-white mb-8">新增记录</h3>
                <div className="space-y-6">
                    <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500'}`}>支出</button>
                        <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>收入</button>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">金额</label>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xl font-black" placeholder="0.00" required />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">描述</label>
                        <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none" placeholder="项目事由..." required />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">凭证附件</label>
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()} 
                          className={`w-full py-4 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-1 ${attachmentUrl ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-600 hover:border-slate-700'}`}
                        >
                            {isUploading ? (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : attachmentUrl ? (
                              <span className="text-[10px] font-black uppercase">已上传凭证</span>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-[9px] font-black uppercase tracking-widest">上传发票/收据</span>
                              </>
                            )}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all">
                        录入数据
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
