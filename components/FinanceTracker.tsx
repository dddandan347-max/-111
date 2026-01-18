
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
  users: string[]; 
}

type SettlePeriod = 'day' | 'month' | 'year';

export const FinanceTracker: React.FC<FinanceProps> = ({ 
  transactions, onAddTransaction, onDeleteTransaction, tasks, categories, onUpdateCategories, users 
}) => {
  const [settlePeriod, setSettlePeriod] = useState<SettlePeriod>('month');
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(categories[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [operator, setOperator] = useState('');

  const userStats = useMemo(() => {
    const currentMonth = date.substring(0, 7);
    const stats: Record<string, { income: number, expense: number }> = {};
    
    users.forEach(u => stats[u] = { income: 0, expense: 0 });
    
    transactions.forEach(t => {
      if (t.date.startsWith(currentMonth)) {
        if (!stats[t.operator]) stats[t.operator] = { income: 0, expense: 0 };
        if (t.type === 'income') stats[t.operator].income += t.amount;
        else stats[t.operator].expense += t.amount;
      }
    });
    return Object.entries(stats).filter(([_, val]) => val.income > 0 || val.expense > 0);
  }, [transactions, date, users]);

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
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)).slice(-12);
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
    if (!desc || !amount || !operator) return alert("请填写完整信息，包括经手人");
    onAddTransaction({
      id: Date.now().toString(),
      description: desc,
      amount: parseFloat(amount),
      type,
      date,
      category,
      operator
    });
    setDesc('');
    setAmount('');
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
            <h2 className={`text-5xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              财务看板 <span className="text-3xl opacity-50">￥</span>
            </h2>
            <p className={`text-sm mt-3 font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              实时收支流水与成员月度结算报表
            </p>
        </div>
        
        <div className={`flex p-1.5 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-mochi-sm'}`}>
            {(['day', 'month', 'year'] as const).map(p => (
                <button 
                  key={p} 
                  onClick={() => setSettlePeriod(p)} 
                  className={`px-6 py-2.5 text-[11px] font-black rounded-xl transition-all ${
                    settlePeriod === p 
                    ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-rose-400 text-white shadow-mochi-sm') 
                    : 'text-slate-500 hover:text-rose-400'
                  }`}
                >
                    {p === 'day' ? '按日' : p === 'month' ? '按月' : '按年'}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: '总收入累计', val: totals.income, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-transparent' },
            { label: '总支出累计', val: totals.expense, color: 'text-rose-400', bg: 'from-rose-500/10 to-transparent' },
            { label: '预计净利润', val: totals.income - totals.expense, color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent' }
          ].map((card, i) => (
            <div key={i} className={`relative overflow-hidden border rounded-[2.5rem] p-8 transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-mochi'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-20`}></div>
                <div className="relative z-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-40">{card.label}</div>
                  <div className={`text-4xl font-black font-mono ${card.color}`}>¥{card.val.toLocaleString()}</div>
                </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 p-8 rounded-[3rem] border flex flex-col transition-all min-h-[500px] w-full ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-mochi'}`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>收支趋势分析</h3>
              </div>
              <div className="flex-1 w-full min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#F2E8DF'} vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{ fill: theme === 'dark' ? '#1e293b' : '#FDFBF7', opacity: 0.4 }}
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#0f172a' : 'white', 
                            borderRadius: '20px', 
                            border: theme === 'dark' ? '1px solid #334155' : '1px solid #F2E8DF',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '20px' }} />
                        <Bar dataKey="income" name="收入" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                        <Bar dataKey="expense" name="支出" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          <div className={`p-8 rounded-[3rem] border transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-mochi-border shadow-mochi'}`}>
              <h3 className={`text-xl font-black mb-8 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>新增记账记录</h3>
              <form onSubmit={addTransaction} className="space-y-5">
                  <div className={`grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-mochi-bg border-mochi-border'}`}>
                      <button type="button" onClick={() => setType('expense')} className={`py-3 text-[11px] font-black rounded-xl transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-rose-400'}`}>支出项目</button>
                      <button type="button" onClick={() => setType('income')} className={`py-3 text-[11px] font-black rounded-xl transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-emerald-400'}`}>收入项目</button>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">金额 (RMB)</label>
                    <input type="number" placeholder="0.00" className={`w-full rounded-2xl px-5 py-4 border font-black outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-mochi-bg border-mochi-border focus:border-rose-300'}`} value={amount} onChange={e => setAmount(e.target.value)} required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">账目描述</label>
                    <input type="text" placeholder="描述这笔钱的用途..." className={`w-full rounded-2xl px-5 py-4 border font-bold outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-mochi-bg border-mochi-border focus:border-rose-300'}`} value={desc} onChange={e => setDesc(e.target.value)} required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">经手负责人</label>
                    <select className={`w-full rounded-2xl px-5 py-4 border font-black outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-mochi-bg border-mochi-border text-slate-700'}`} value={operator} onChange={e => setOperator(e.target.value)} required>
                        <option value="">点击选择成员...</option>
                        {users.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <select className={`w-full rounded-2xl px-4 py-4 border font-bold text-xs outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-mochi-bg border-mochi-border text-slate-700'}`} value={category} onChange={e => setCategory(e.target.value)}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <input type="date" className={`w-full rounded-2xl px-4 py-4 border font-bold text-xs outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-mochi-bg border-mochi-border text-slate-700'}`} value={date} onChange={e => setDate(e.target.value)} />
                      </div>
                  </div>
                  
                  <button type="submit" className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40' : 'bg-mochi-pink hover:bg-rose-400 text-white shadow-mochi-sm'}`}>
                    确认入账
                  </button>
              </form>
          </div>
      </div>

      <div className={`p-10 rounded-[3rem] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-mochi-border shadow-mochi'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>成员月度结算报表 ({date.substring(0, 7)})</h3>
              <div className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800/40 text-slate-500 border border-slate-800">
                结算范围: {date.substring(0, 7)}
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userStats.map(([user, data]) => (
                  <div key={user} className={`p-6 rounded-[2rem] border transition-all hover:translate-y-[-4px] ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800' : 'bg-mochi-bg border-mochi-border hover:shadow-mochi-sm'}`}>
                      <div className="flex items-center gap-3 mb-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-mochi-pink text-mochi-text'}`}>
                            {user.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-black text-base">{user}</span>
                      </div>
                      <div className="space-y-2 text-xs font-bold">
                          <div className="flex justify-between opacity-60"><span>收入贡献:</span><span className="text-emerald-500">¥{data.income.toLocaleString()}</span></div>
                          <div className="flex justify-between opacity-60"><span>报销支出:</span><span className="text-rose-500">¥{data.expense.toLocaleString()}</span></div>
                          <div className={`pt-3 border-t mt-3 flex justify-between ${theme === 'dark' ? 'border-slate-700' : 'border-mochi-border'}`}>
                            <span className="opacity-90">应结差额:</span>
                            <span className={`font-black ${data.income - data.expense >= 0 ? 'text-blue-400' : 'text-rose-500'}`}>
                              ¥{(data.income - data.expense).toLocaleString()}
                            </span>
                          </div>
                      </div>
                  </div>
              ))}
              {userStats.length === 0 && <div className="col-span-full py-16 text-center opacity-20 italic font-black text-sm tracking-widest">本月尚无财务结算数据</div>}
          </div>
      </div>

      <div className={`rounded-[3rem] border overflow-hidden transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-mochi-border shadow-mochi'}`}>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b transition-colors ${theme === 'dark' ? 'bg-slate-800/40 text-slate-500 border-slate-800' : 'bg-mochi-bg/50 text-slate-400 border-mochi-border'}`}>
                          <th className="px-8 py-6">日期</th>
                          <th className="px-8 py-6">事项描述</th>
                          <th className="px-8 py-6">经手成员</th>
                          <th className="px-8 py-6 text-right">金额 (RMB)</th>
                          <th className="px-8 py-6 text-center w-24">管理</th>
                      </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-slate-800' : 'divide-mochi-border'}`}>
                      {transactions.map(t => (
                          <tr key={t.id} className={`group relative transition-all duration-300 ${
                              theme === 'dark' 
                                ? 'hover:bg-[#161f31] text-slate-300' 
                                : 'hover:bg-[#fdf9f4] text-slate-700'
                          }`}>
                              <td className="px-8 py-6 text-xs font-black opacity-40 font-mono">
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all scale-y-0 group-hover:scale-y-100 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                  {t.date}
                              </td>
                              <td className="px-8 py-6 font-black text-sm">{t.description}</td>
                              <td className="px-8 py-6">
                                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all border ${
                                      theme === 'dark' 
                                        ? 'bg-slate-800/60 text-blue-400 border-slate-700' 
                                        : 'bg-mochi-pink/20 text-rose-500 border-rose-100'
                                  }`}>
                                      {t.operator}
                                  </span>
                              </td>
                              <td className={`px-8 py-6 text-right font-mono font-black text-base ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {t.type === 'income' ? '+' : '-'}¥{t.amount.toLocaleString()}
                              </td>
                              <td className="px-8 py-6 text-center">
                                  <button 
                                      onClick={() => onDeleteTransaction(t.id)} 
                                      className={`p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${
                                          theme === 'dark' ? 'text-slate-600 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
                                      }`}
                                  >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {transactions.length === 0 && (
                          <tr>
                              <td colSpan={5} className="py-32 text-center opacity-20 font-black italic tracking-[0.3em] text-sm">TRANSACTION_EMPTY</td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
