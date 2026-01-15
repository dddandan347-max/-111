import React, { useState, useMemo } from 'react';
import { Transaction, VideoTask } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend, PieChart, Pie } from 'recharts';

interface FinanceProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  tasks: VideoTask[];
  categories: string[];
  onUpdateCategories: (c: string[]) => void;
}

export const FinanceTracker: React.FC<FinanceProps> = ({ transactions, onAddTransaction, onDeleteTransaction, tasks, categories, onUpdateCategories }) => {
  // Input State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(categories[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [notes, setNotes] = useState('');

  // Category Management State
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // Filter State
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const newTrans: Transaction = {
      id: Date.now().toString(),
      description: desc,
      amount: parseFloat(amount),
      type,
      date: date || new Date().toISOString(),
      category,
      linkedTaskId: linkedTaskId || undefined,
      notes: notes || undefined
    };

    onAddTransaction(newTrans);
    
    // Reset Form
    setDesc('');
    setAmount('');
    setNotes('');
    setLinkedTaskId('');
  };

  const addCategoryItem = () => {
     const trimmed = newCatInput.trim();
     if(trimmed && !categories.includes(trimmed)) {
        onUpdateCategories([...categories, trimmed]);
        setNewCatInput('');
        setCategory(trimmed); // Auto-select the new category
     }
  };

  const removeCategoryItem = (cat: string) => {
     if(confirm(`确定删除分类 "${cat}" 吗？这不会影响已有的历史记录。`)) {
        const newCats = categories.filter(c => c !== cat);
        onUpdateCategories(newCats);
        if(category === cat && newCats.length > 0) setCategory(newCats[0]);
     }
  };

  // Derived Data
  const availableMonths = useMemo(() => {
      const months = new Set(transactions.map(t => t.date.substring(0, 7)));
      return Array.from(months).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const matchMonth = filterMonth === 'All' || t.date.startsWith(filterMonth);
        const matchCategory = filterCategory === 'All' || t.category === filterCategory;
        const matchType = filterType === 'All' || t.type === filterType;
        return matchMonth && matchCategory && matchType;
    });
  }, [transactions, filterMonth, filterCategory, filterType]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const net = totals.income - totals.expense;

  // Chart Data Preparation
  const monthlyData = useMemo(() => {
    // Aggregate by month from ALL transactions to show trend
    const map = new Map<string, {name: string, income: number, expense: number}>();
    transactions.forEach(t => {
        const m = t.date.substring(0, 7);
        if (!map.has(m)) map.set(m, {name: m, income: 0, expense: 0});
        const entry = map.get(m)!;
        if (t.type === 'income') entry.income += t.amount;
        else entry.expense += t.amount;
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)).slice(-12); // Last 12 months
  }, [transactions]);

  const categoryData = useMemo(() => {
      // Aggregate by category based on filtered transactions
      const map = new Map<string, number>();
      filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
          map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6 min-w-0">
            <h2 className="text-3xl font-bold text-white mb-6">预算与财务</h2>
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">总收入 (筛选后)</p>
                    <p className="text-3xl font-bold text-emerald-400 mt-2">¥{totals.income.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">总支出 (筛选后)</p>
                    <p className="text-3xl font-bold text-rose-400 mt-2">¥{totals.expense.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">净余额</p>
                    <p className={`text-3xl font-bold mt-2 ${net >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    ¥{net.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-72">
                     <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">月度收支趋势 (全量)</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                            <Legend />
                            <Line type="monotone" dataKey="income" name="收入" stroke="#10b981" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="expense" name="支出" stroke="#f43f5e" strokeWidth={2} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-72">
                     <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">支出分类占比 (筛选后)</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px', color: '#ccc'}} />
                        </PieChart>
                     </ResponsiveContainer>
                 </div>
            </div>

            {/* List and Filters */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex flex-wrap gap-4 items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">筛选:</span>
                    <select 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                    >
                        <option value="All">所有月份</option>
                        {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                    >
                        <option value="All">所有分类</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                    >
                        <option value="All">收支类型</option>
                        <option value="income">收入</option>
                        <option value="expense">支出</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4">日期</th>
                            <th className="px-6 py-4">描述</th>
                            <th className="px-6 py-4">类别</th>
                            <th className="px-6 py-4">关联任务</th>
                            <th className="px-6 py-4 text-right">金额</th>
                            <th className="px-6 py-4 text-center">操作</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                        {filteredTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-4 text-slate-400 text-sm whitespace-nowrap">
                                {t.date}
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-slate-200 font-medium">{t.description}</div>
                                {t.notes && <div className="text-xs text-slate-500 mt-1">{t.notes}</div>}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{t.category}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                                {t.linkedTaskId ? (
                                    <span className="text-blue-400 flex items-center gap-1 text-xs bg-blue-400/10 px-2 py-1 rounded">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                        {tasks.find(task => task.id === t.linkedTaskId)?.title || '未知任务'}
                                    </span>
                                ) : '-'}
                            </td>
                            <td className={`px-6 py-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {t.type === 'income' ? '+' : '-'}¥{t.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => onDeleteTransaction(t.id)} className="text-slate-600 hover:text-red-400 p-1.5 hover:bg-red-400/10 rounded-full transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </td>
                            </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    暂无符合条件的收支记录。
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Right Form Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
             <form onSubmit={addTransaction} className="bg-slate-800 p-6 rounded-xl border border-slate-700 sticky top-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    记一笔
                </h3>
                
                <div className="space-y-4">
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            支出
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            收入
                        </button>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs font-medium mb-1.5">金额 *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs font-medium mb-1.5">描述 *</label>
                        <input
                            type="text"
                            placeholder="如：购买硬盘"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs font-medium mb-1.5">日期</label>
                        <input
                            type="date"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-slate-400 text-xs font-medium">分类</label>
                            <button 
                                type="button" 
                                onClick={() => setIsManagingCats(!isManagingCats)}
                                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {isManagingCats ? '完成' : '管理'}
                            </button>
                        </div>
                        
                        {isManagingCats ? (
                            <div className="bg-slate-900/80 border border-blue-500/30 rounded-lg p-3 mb-2 animate-[popIn_0.2s_ease-out]">
                                <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto custom-scrollbar">
                                    {categories.map(c => (
                                        <div key={c} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded flex items-center gap-1 border border-slate-700">
                                            {c}
                                            <button 
                                                type="button" 
                                                onClick={() => removeCategoryItem(c)} 
                                                className="text-slate-500 hover:text-red-400 p-0.5 rounded-full hover:bg-slate-700"
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                     <input 
                                        value={newCatInput} 
                                        onChange={e => setNewCatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategoryItem())}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                        placeholder="新分类名称..."
                                        autoFocus
                                     />
                                     <button 
                                        type="button" 
                                        onClick={addCategoryItem} 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                     >
                                        添加
                                     </button>
                                </div>
                            </div>
                        ) : (
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs font-medium mb-1.5">关联任务 (可选)</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                            value={linkedTaskId}
                            onChange={(e) => setLinkedTaskId(e.target.value)}
                        >
                            <option value="">无关联任务</option>
                            {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs font-medium mb-1.5">备注 (可选)</label>
                        <textarea
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none h-20"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-900/20 mt-2"
                    >
                        保存记录
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};