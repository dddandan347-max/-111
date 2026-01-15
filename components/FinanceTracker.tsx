
import React, { useState, useMemo } from 'react';
import { Transaction, VideoTask } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface FinanceProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  tasks: VideoTask[];
  categories: string[];
  onUpdateCategories: (c: string[]) => void;
}

type SettlePeriod = 'day' | 'month' | 'year';

export const FinanceTracker: React.FC<FinanceProps> = ({ transactions, onAddTransaction, onDeleteTransaction, tasks, categories, onUpdateCategories }) => {
  const [settlePeriod, setSettlePeriod] = useState<SettlePeriod>('month');
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  // Input State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(categories[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const trendData = useMemo(() => {
    const map = new Map<string, {name: string, income: number, expense: number}>();
    
    transactions.forEach(t => {
        let key = '';
        if (settlePeriod === 'day') key = t.date;
        else if (settlePeriod === 'month') key = t.date.substring(0, 7);
        else if (settlePeriod === 'year') key = t.date.substring(0, 4);

        if (!map.has(key)) map.set(key, {name: key, income: 0, expense: 0});
        const entry = map.get(key)!;
        if (t.type === 'income') entry.income += t.amount;
        else entry.expense += t.amount;
    });

    const sorted = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    if (settlePeriod === 'day') return sorted.slice(-30);
    return sorted;
  }, [transactions, settlePeriod]);

  const totals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    onAddTransaction({
      id: Date.now().toString(),
      description: desc,
      amount: parseFloat(amount),
      type,
      date,
      category
    });
    setDesc('');
    setAmount('');
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
            <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              收支明细 🧾
            </h2>
            <p className={`text-sm mt-2 font-bold opacity-60 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
              清晰透明地追踪团队每一分钱的去向
            </p>
        </div>
        
        <div className={`flex p-1.5 rounded-[1.5rem] border transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-mochi-border shadow-mochi-sm'}`}>
            {(['day', 'month', 'year'] as const).map(p => (
                <button
                    key={p}
                    onClick={() => setSettlePeriod(p)}
                    className={`px-5 py-2.5 text-xs font-black rounded-[1rem] transition-all ${
                      settlePeriod === p 
                        ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-mochi-pink text-white shadow-mochi-sm') 
                        : 'text-slate-400 hover:text-rose-400'
                    }`}
                >
                    {p === 'day' ? '日结' : p === 'month' ? '月结' : '年结'}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: '累计总收入', val: totals.income, color: 'text-emerald-500', bg: theme === 'dark' ? 'hover:border-emerald-500/30' : 'hover:border-emerald-200' },
            { label: '累计总支出', val: totals.expense, color: 'text-rose-500', bg: theme === 'dark' ? 'hover:border-rose-500/30' : 'hover:border-rose-200' },
            { label: '当前净利润', val: totals.income - totals.expense, color: (totals.income - totals.expense >= 0 ? 'text-blue-500' : 'text-rose-600'), bg: theme === 'dark' ? 'hover:border-blue-500/30' : 'hover:border-blue-200' }
          ].map((card, i) => (
            <div key={i} className={`group transition-all duration-500 hover:-translate-y-2 border rounded-[2.5rem] p-8 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-mochi-border shadow-mochi'
            } ${card.bg}`}>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-40">{card.label}</div>
                <div className={`text-4xl font-black font-mono transition-transform duration-500 group-hover:scale-105 ${card.color}`}>
                  ¥{card.val.toLocaleString()}
                </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border h-[450px] transition-all ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-mochi-border shadow-mochi'
          }`}>
              <h3 className="text-xs font-black dark:text-slate-400 text-slate-500 mb-10 uppercase tracking-widest flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-ping ${theme === 'dark' ? 'bg-blue-500' : 'bg-rose-400'}`}></div>
                  收支趋势分析
              </h3>
              <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#F2E8DF'} vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1e293b' : 'white', 
                          borderColor: theme === 'dark' ? '#334155' : '#F2E8DF', 
                          borderRadius: '20px', 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          border: 'none',
                          padding: '12px'
                        }}
                        itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                        cursor={{ fill: theme === 'dark' ? '#1e293b' : '#FFFDF5', opacity: 0.5 }}
                      />
                      <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                      <Bar dataKey="income" name="收入" fill={theme === 'dark' ? '#10b981' : '#10b981'} radius={[8, 8, 0, 0]} barSize={24} />
                      <Bar dataKey="expense" name="支出" fill={theme === 'dark' ? '#f43f5e' : '#f43f5e'} radius={[8, 8, 0, 0]} barSize={24} />
                  </BarChart>
              </ResponsiveContainer>
          </div>

          <div className={`p-8 rounded-[2.5rem] border transition-all ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-mochi-border shadow-mochi'
          }`}>
              <div className="flex items-center gap-3 mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${theme === 'dark' ? 'bg-blue-600' : 'bg-mochi-pink shadow-mochi-sm'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-black dark:text-white text-slate-800">记账</h3>
              </div>
              <form onSubmit={addTransaction} className="space-y-5">
                  <div className={`grid grid-cols-2 gap-2 p-2 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-mochi-bg border-mochi-border shadow-inner'}`}>
                      <button type="button" onClick={() => setType('expense')} className={`py-2.5 text-xs font-black rounded-xl transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>支出</button>
                      <button type="button" onClick={() => setType('income')} className={`py-2.5 text-xs font-black rounded-xl transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>收入</button>
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-black px-2 tracking-widest">金额</label>
                      <input type="number" placeholder="0.00" className={`w-full rounded-2xl px-5 py-4 font-black transition-all font-mono outline-none border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-mochi-border text-slate-800 focus:border-rose-300 focus:shadow-mochi-sm'}`} value={amount} onChange={e => setAmount(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-black px-2 tracking-widest">描述</label>
                      <input type="text" placeholder="干嘛用了？" className={`w-full rounded-2xl px-5 py-4 font-bold transition-all outline-none border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-mochi-border text-slate-800 focus:border-rose-300 focus:shadow-mochi-sm'}`} value={desc} onChange={e => setDesc(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase font-black px-2 tracking-widest">分类</label>
                          <select className={`w-full rounded-2xl px-4 py-4 font-bold outline-none border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-mochi-border text-slate-800 focus:border-rose-300'}`} value={category} onChange={e => setCategory(e.target.value)}>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase font-black px-2 tracking-widest">日期</label>
                          <input type="date" className={`w-full rounded-2xl px-4 py-4 font-bold outline-none border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-mochi-border text-slate-800 focus:border-rose-300'}`} value={date} onChange={e => setDate(e.target.value)} />
                      </div>
                  </div>
                  <button type="submit" className={`w-full py-5 rounded-[1.5rem] font-black text-sm tracking-widest uppercase transition-all active:scale-95 mt-4 shadow-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-mochi-pink hover:bg-rose-400 text-white shadow-mochi-sm'}`}>提交入账</button>
              </form>
          </div>
      </div>

      <div className={`rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white/60 border-mochi-border shadow-mochi'
      }`}>
          <div className={`px-8 py-6 border-b flex justify-between items-center transition-colors ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-mochi-mint/30 border-mochi-border'}`}>
              <h3 className="text-xs font-black dark:text-white text-slate-700 uppercase tracking-widest">流水审计</h3>
              <div className="w-10 h-2 bg-rose-200 rounded-full opacity-50"></div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-b ${theme === 'dark' ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-white text-slate-400 border-mochi-border'}`}>
                          <th className="px-8 py-6">日期</th>
                          <th className="px-8 py-6">事项描述</th>
                          <th className="px-8 py-6 text-center">分类</th>
                          <th className="px-8 py-6 text-right">金额 (¥)</th>
                          <th className="px-8 py-6 text-center w-24">操作</th>
                      </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-slate-800' : 'divide-mochi-border'}`}>
                      {transactions.slice(0, 10).map((t, idx) => (
                          <tr key={t.id} className={`group transition-all duration-300 ${
                            theme === 'dark' 
                              ? 'hover:bg-slate-800/40' 
                              : (idx % 2 === 0 ? 'bg-white/40' : 'bg-mochi-bg/20') + ' hover:bg-white hover:shadow-mochi-sm'
                          }`}>
                              <td className="px-8 py-5 text-xs font-mono font-black opacity-60">{t.date}</td>
                              <td className="px-8 py-5">
                                  <div className="font-black text-sm">{t.description}</div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                  <span className={`text-[10px] px-3 py-1.5 rounded-xl border font-black uppercase transition-all group-hover:scale-110 ${
                                    theme === 'dark' 
                                      ? 'bg-slate-800 text-slate-400 border-slate-700' 
                                      : 'bg-white text-slate-500 border-mochi-border shadow-sm'
                                  }`}>
                                    {t.category}
                                  </span>
                              </td>
                              <td className={`px-8 py-5 text-right font-mono font-black text-base ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {t.type === 'income' ? '+' : '-'}¥{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-8 py-5 text-center">
                                  <button 
                                    onClick={() => onDeleteTransaction(t.id)} 
                                    className={`p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'text-slate-600 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
                                  >
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
