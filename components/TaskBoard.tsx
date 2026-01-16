
import React, { useState, useEffect, useMemo } from 'react';
import { VideoTask, TaskPriority, TaskStatusDef } from '../types';

interface TaskBoardProps {
  tasks: VideoTask[];
  onAddTask: (task: VideoTask) => void;
  onUpdateTask: (task: VideoTask) => void;
  onDeleteTask: (id: string) => void;
  currentUser: string;
  statuses: TaskStatusDef[];
  onUpdateStatuses: (s: TaskStatusDef[]) => void;
  tags: string[];
  onUpdateTags: (tags: string[]) => void;
}

const PRIORITY_CONFIG = {
  'High': { 
    dark: 'text-red-400 bg-red-400/10 border-red-400/20', 
    light: 'text-rose-600 bg-rose-50 border-rose-100',
    dot: 'bg-rose-500',
    label: '高' 
  },
  'Medium': { 
    dark: 'text-orange-400 bg-orange-400/10 border-orange-400/20', 
    light: 'text-amber-600 bg-amber-50 border-amber-100',
    dot: 'bg-amber-500',
    label: '中' 
  },
  'Low': { 
    dark: 'text-blue-400 bg-blue-400/10 border-blue-400/20', 
    light: 'text-sky-600 bg-sky-50 border-sky-100',
    dot: 'bg-sky-500',
    label: '低' 
  },
};

const TaskRow: React.FC<{
    task: VideoTask;
    statuses: TaskStatusDef[];
    tags: string[];
    expandedTaskId: string | null;
    setExpandedTaskId: (id: string | null) => void;
    onUpdateTask: (task: VideoTask) => void;
    onDeleteTask: (id: string) => void;
    getStatusColor: (id: string) => string;
    currentUser: string;
    theme: 'dark' | 'light';
    isDoneView: boolean;
}> = ({ task, statuses, tags, expandedTaskId, setExpandedTaskId, onUpdateTask, onDeleteTask, getStatusColor, currentUser, theme, isDoneView }) => {
    const [localTitle, setLocalTitle] = useState(task.title);
    const [localTag, setLocalTag] = useState(task.tag);
    const [localAssignee, setLocalAssignee] = useState(task.assignee);
    const [isEditingAssignee, setIsEditingAssignee] = useState(false);

    useEffect(() => {
        setLocalTitle(task.title);
        setLocalTag(task.tag);
        setLocalAssignee(task.assignee);
    }, [task.title, task.tag, task.assignee]);

    const handleSync = (field: keyof VideoTask, value: any) => {
        if (task[field] === value) return;
        onUpdateTask({ ...task, [field]: value });
    };

    return (
        <React.Fragment>
            <tr className={`transition-all duration-300 animate-fadeIn ${
              expandedTaskId === task.id 
                ? (theme === 'dark' ? 'bg-slate-800/60' : 'bg-rose-50/50') 
                : (theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-white hover:shadow-mochi-sm')
            } ${isDoneView ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                <td className="px-2 py-5 text-center">
                    <button onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)} className={`transition-colors p-2 rounded-lg ${theme === 'dark' ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-rose-400'}`}>
                        <svg className={`w-4 h-4 transform transition-transform ${expandedTaskId === task.id ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </td>
                <td className="px-4 py-5">
                    <select 
                      value={task.priority} 
                      onChange={(e) => handleSync('priority', e.target.value)} 
                      className={`appearance-none cursor-pointer px-3 py-1.5 rounded-xl text-[10px] font-black border tracking-wider w-full text-center outline-none transition-all hover:scale-105 ${theme === 'dark' ? PRIORITY_CONFIG[task.priority].dark : PRIORITY_CONFIG[task.priority].light}`}
                    >
                        <option value="High">HIGH</option>
                        <option value="Medium">MID</option>
                        <option value="Low">LOW</option>
                    </select>
                </td>
                <td className="px-4 py-5">
                    <select 
                      value={task.status} 
                      onChange={(e) => handleSync('status', e.target.value)} 
                      className={`w-full appearance-none cursor-pointer pl-4 pr-2 py-2 rounded-xl text-xs font-black border outline-none transition-all hover:shadow-sm ${getStatusColor(task.status)}`}
                    >
                        {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                </td>
                <td className="px-4 py-5">
                    <div className="flex flex-col gap-1">
                        <input 
                            type="text" 
                            value={localTitle} 
                            onChange={(e) => setLocalTitle(e.target.value)}
                            onBlur={() => handleSync('title', localTitle)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
                            placeholder="任务标题..."
                            className={`bg-transparent font-black text-base focus:outline-none w-full border-b border-transparent focus:border-rose-400/30 transition-colors ${
                                theme === 'dark' ? 'text-slate-200 focus:text-white' : 'text-slate-700 focus:text-rose-500'
                            } ${isDoneView ? 'line-through opacity-50' : ''}`} 
                        />
                        <div className="flex items-center gap-2">
                          <input 
                              type="text" 
                              value={localTag} 
                              placeholder="# 添加标签"
                              onChange={(e) => setLocalTag(e.target.value)} 
                              onBlur={() => handleSync('tag', localTag)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
                              className={`bg-transparent text-[11px] font-bold border-none outline-none w-full opacity-40 hover:opacity-100 focus:opacity-100 transition-opacity ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} 
                          />
                        </div>
                    </div>
                </td>
                <td className="px-4 py-5">
                    {isEditingAssignee ? (
                        <input 
                            autoFocus
                            className={`text-xs px-3 py-2 rounded-xl border outline-none w-full font-bold shadow-sm ${theme === 'dark' ? 'bg-slate-800 text-white border-blue-500' : 'bg-white text-slate-800 border-rose-300 ring-4 ring-rose-50'}`} 
                            value={localAssignee} 
                            onChange={(e) => setLocalAssignee(e.target.value)}
                            onBlur={() => { setIsEditingAssignee(false); handleSync('assignee', localAssignee); }}
                            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())}
                        />
                    ) : (
                        localAssignee ? (
                            <div onClick={() => setIsEditingAssignee(true)} className="flex items-center gap-3 group/assignee cursor-pointer">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border transition-all ${theme === 'dark' ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'bg-mochi-pink text-white border-transparent shadow-mochi-sm'}`}>
                                    {localAssignee.charAt(0).toUpperCase()}
                                </div>
                                <span className={`text-sm font-black transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-blue-400' : 'text-slate-700 hover:text-rose-500'}`}>{localAssignee}</span>
                            </div>
                        ) : (
                            <button onClick={() => handleSync('assignee', currentUser)} className={`w-full flex items-center justify-center gap-2 py-2 border border-dashed rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-400' : 'border-mochi-border text-slate-400 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm'}`}>认领</button>
                        )
                    )}
                </td>
                <td className="px-4 py-5">
                    <input type="date" value={task.deadline} onChange={(e) => handleSync('deadline', e.target.value)} className={`bg-transparent outline-none cursor-pointer text-xs font-bold ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-rose-500'}`} />
                </td>
                <td className="px-4 py-5 text-center">
                    <button onClick={() => onDeleteTask(task.id)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'text-slate-600 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </td>
            </tr>
            {expandedTaskId === task.id && (
                <tr className="animate-slideUp">
                    <td colSpan={8} className={`px-8 py-6 ${theme === 'dark' ? 'bg-slate-800/20' : 'bg-mochi-bg/30'}`}>
                        <div className="flex flex-col gap-2">
                          <label className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>任务详情说明</label>
                          <textarea 
                              className={`w-full rounded-2xl p-5 text-sm focus:outline-none min-h-[120px] transition-all border ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-blue-500' : 'bg-white border-mochi-border text-slate-700 shadow-mochi-sm focus:border-rose-400'}`} 
                              placeholder="在此记录任务的关键环节、参考链接或特别说明..." 
                              defaultValue={task.notes || ''} 
                              onBlur={(e) => handleSync('notes', e.target.value)} 
                          />
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ 
  tasks, onAddTask, onUpdateTask, onDeleteTask, currentUser, 
  statuses, onUpdateStatuses, tags, onUpdateTags 
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'active' | 'done' | 'calendar'>('active');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  const getStatusColor = (statusId: string) => {
      const s = statuses.find(x => x.id === statusId);
      if (!s) return '';
      if (theme === 'light') {
          if (statusId === 'Idea') return 'bg-purple-100 text-purple-600 border-purple-200';
          if (statusId === 'Scripting') return 'bg-amber-100 text-amber-600 border-amber-200';
          if (statusId === 'Filming') return 'bg-rose-100 text-rose-600 border-rose-200';
          if (statusId === 'Editing') return 'bg-sky-100 text-sky-600 border-sky-200';
          if (statusId === 'Done') return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      }
      return s.color;
  };

  const handleAddTask = () => {
    if (!newTaskTitle) return;
    onAddTask({
        id: Date.now().toString(),
        title: newTaskTitle,
        status: statuses[0].id,
        assignee: '',
        deadline: new Date(Date.now() + 604800000).toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        tag: tags[0] || '常规',
    });
    setNewTaskTitle('');
    setViewTab('active');
  };

  // Calendar Logic
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const days = [];
    
    // Fill previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
        days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    // Fill current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Fill next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [calendarDate]);

  const changeMonth = (offset: number) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1));
  };

  const renderCalendar = () => (
    <div className="flex flex-col gap-4 animate-fadeIn">
        <div className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-mochi-border shadow-mochi'}`}>
            <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                {calendarDate.getFullYear()}年 {calendarDate.getMonth() + 1}月
            </h3>
            <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-mochi-bg hover:bg-rose-100 text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setCalendarDate(new Date())} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-800 hover:bg-blue-600 text-slate-400' : 'bg-mochi-bg hover:bg-rose-400 hover:text-white text-slate-500'}`}>今天</button>
                <button onClick={() => changeMonth(1)} className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-mochi-bg hover:bg-rose-100 text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>

        <div className={`grid grid-cols-7 border rounded-[2.5rem] overflow-hidden transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white/60 border-mochi-border shadow-mochi'}`}>
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d} className={`py-4 text-center text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-mochi-mint/50 text-teal-600'}`}>{d}</div>
            ))}
            {calendarDays.map((day, idx) => {
                const dateStr = day.date.toISOString().split('T')[0];
                const dayTasks = tasks.filter(t => t.deadline === dateStr);
                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                
                return (
                    <div key={idx} className={`min-h-[140px] p-2 border-t border-r last:border-r-0 transition-colors ${
                        theme === 'dark' 
                        ? (day.isCurrentMonth ? 'border-slate-800 hover:bg-slate-800/30' : 'bg-slate-950/50 border-slate-800 opacity-30') 
                        : (day.isCurrentMonth ? 'border-mochi-border hover:bg-white/50' : 'bg-slate-100/50 border-mochi-border opacity-40')
                    }`}>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <span className={`text-xs font-black p-1.5 rounded-lg ${
                                isToday 
                                ? (theme === 'dark' ? 'bg-blue-600 text-white animate-pulse' : 'bg-rose-400 text-white shadow-mochi-sm') 
                                : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')
                            }`}>
                                {day.date.getDate()}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {dayTasks.map(t => (
                                <div 
                                    key={t.id} 
                                    onClick={() => { setExpandedTaskId(t.id); setViewTab(t.status === 'Done' ? 'done' : 'active'); }}
                                    className={`px-2 py-1.5 rounded-lg text-[9px] font-black border cursor-pointer transition-all hover:scale-105 truncate flex items-center gap-1.5 ${
                                        t.status === 'Done' ? 'line-through opacity-50 grayscale' : ''
                                    } ${theme === 'dark' ? PRIORITY_CONFIG[t.priority].dark : PRIORITY_CONFIG[t.priority].light}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_CONFIG[t.priority].dot}`} />
                                    {t.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>视频看板</h2>
            <div className="flex items-center gap-3 mt-4">
                {[
                    { id: 'active', label: `进行中 (${activeTasks.length})` },
                    { id: 'done', label: `已完成 (${doneTasks.length})` },
                    { id: 'calendar', label: '日历视图' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setViewTab(tab.id as any)}
                        className={`px-6 py-2 rounded-2xl text-[11px] font-black transition-all ${
                            viewTab === tab.id 
                            ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-rose-400 text-white shadow-mochi-sm')
                            : (theme === 'dark' ? 'text-slate-500 hover:text-white bg-slate-800/50' : 'text-slate-400 hover:text-rose-500 bg-white shadow-mochi-sm')
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
        <div className="relative group">
            <input
                type="text"
                placeholder="想要制作什么视频？输入标题..."
                className={`px-6 py-4 rounded-[1.5rem] border transition-all w-96 text-sm font-bold shadow-sm ${
                  theme === 'dark' 
                    ? 'bg-slate-800 text-white border-slate-700 focus:border-blue-500' 
                    : 'bg-white text-slate-800 border-mochi-border focus:border-rose-400 focus:shadow-mochi'
                }`}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} className="absolute right-3 top-3">
              <div className={`p-1.5 rounded-xl transition-transform active:scale-90 ${theme === 'dark' ? 'bg-slate-700' : 'bg-mochi-pink text-white shadow-sm'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </div>
            </button>
        </div>
      </div>

      {viewTab === 'calendar' ? renderCalendar() : (
        <div className={`rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white/60 border-mochi-border shadow-mochi'
        }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                      theme === 'dark' 
                      ? 'bg-slate-800 text-slate-500' 
                      : (viewTab === 'active' ? 'bg-mochi-mint/50 text-teal-600' : 'bg-emerald-50 text-emerald-600')
                  }`}>
                    <th className="px-4 py-6 w-14 text-center"></th>
                    <th className="px-4 py-6 w-32 text-center">优先级</th>
                    <th className="px-4 py-6 w-40">状态</th>
                    <th className="px-4 py-6 min-w-[300px]">视频内容</th>
                    <th className="px-4 py-6 w-48">负责人</th>
                    <th className="px-4 py-6 w-40">截止期</th>
                    <th className="px-4 py-6 w-20 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-slate-800' : 'divide-mochi-border'}`}>
                  {(viewTab === 'active' ? activeTasks : doneTasks).map(task => (
                    <TaskRow 
                        key={task.id}
                        task={task}
                        statuses={statuses}
                        tags={tags}
                        expandedTaskId={expandedTaskId}
                        setExpandedTaskId={setExpandedTaskId}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                        getStatusColor={getStatusColor}
                        currentUser={currentUser}
                        theme={theme}
                        isDoneView={viewTab === 'done'}
                    />
                  ))}
                  {(viewTab === 'active' ? activeTasks : doneTasks).length === 0 && (
                      <tr>
                          <td colSpan={8} className="py-32 text-center">
                              <div className={`flex flex-col items-center opacity-30 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
                                <span className="text-6xl mb-4">{viewTab === 'active' ? '🎈' : '🏆'}</span>
                                <p className="font-black italic uppercase tracking-widest text-sm">
                                    {viewTab === 'active' ? '没有正在进行中的任务' : '还没有已完成的任务，继续努力！'}
                                </p>
                              </div>
                          </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      )}
    </div>
  );
};
