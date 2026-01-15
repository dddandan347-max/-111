
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
}

const PRIORITY_STYLE = {
  'High': 'text-rose-400 bg-rose-400/10 border-rose-500/30',
  'Medium': 'text-orange-400 bg-orange-400/10 border-orange-500/30',
  'Low': 'text-blue-400 bg-blue-400/10 border-blue-500/30',
};

const TaskSkeleton = () => (
  <div className="glass p-5 rounded-3xl border border-slate-800/50 space-y-4">
    <div className="flex justify-between">
      <div className="w-12 h-4 skeleton rounded" />
      <div className="w-16 h-4 skeleton rounded" />
    </div>
    <div className="w-full h-10 skeleton rounded-xl" />
    <div className="flex justify-between items-center pt-2">
      <div className="w-8 h-8 skeleton rounded-full" />
      <div className="w-12 h-3 skeleton rounded" />
    </div>
  </div>
);

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, currentUser, statuses, onUpdateStatuses }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'calendar'>('board');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Calendar Logic
  const currentMonth = new Date();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      status: statuses[0]?.id || 'Idea',
      assignee: '', 
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      tag: '一般',
    });
    setNewTaskTitle('');
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  const getTasksForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.deadline === dateStr || t.startDate === dateStr);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">生产流水线</h2>
            <div className="flex items-center gap-4 mt-2">
               <p className="text-slate-500 text-sm uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Production Pipeline
              </p>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button onClick={() => setViewMode('board')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${viewMode === 'board' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>看板</button>
                <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>日历</button>
              </div>
            </div>
        </div>
        
        <div className="flex gap-2 glass p-2 rounded-[2rem] border border-slate-800 shadow-2xl w-full md:w-auto">
          <input
            type="text"
            placeholder="发布拍摄通告或新创意..."
            className="bg-transparent text-white px-6 py-3 focus:outline-none flex-1 md:w-64 text-sm font-bold placeholder:text-slate-700"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <button 
            onClick={addTask}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95 shrink-0"
          >
            发布
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statuses.map(status => (
              <div key={status.id} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]} shadow-[0_0_8px_currentColor]`} />
                          {status.label}
                      </h3>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 text-slate-400 font-bold">
                          {tasks.filter(t => t.status === status.id).length}
                      </span>
                  </div>
                  
                  <div className="space-y-3 min-h-[300px]">
                      {isInitialLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <TaskSkeleton key={i} />)
                      ) : (
                        <>
                          {tasks.filter(t => t.status === status.id).map(task => (
                              <div 
                                  key={task.id} 
                                  onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                  className={`glass p-5 rounded-[2rem] border transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${expandedTaskId === task.id ? 'border-blue-500/50 ring-4 ring-blue-500/5' : 'border-slate-800/50 hover:border-slate-700'}`}
                              >
                                  <div className="flex justify-between items-start mb-4">
                                      <span className={`text-[8px] px-2 py-0.5 rounded-lg font-black border uppercase tracking-widest ${PRIORITY_STYLE[task.priority]}`}>
                                          {task.priority}
                                      </span>
                                      <div className="text-[9px] font-mono font-bold text-slate-600 group-hover:text-blue-500 transition-colors">
                                          {task.deadline.substring(5)}
                                      </div>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-200 mb-5 line-clamp-2 leading-snug group-hover:text-white transition-colors">{task.title}</h4>
                                  
                                  <div className="flex items-center justify-between">
                                      <div className="flex -space-x-2">
                                          {task.assignee ? (
                                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg" title={task.assignee}>
                                                  {task.assignee[0].toUpperCase()}
                                              </div>
                                          ) : (
                                              <div className="w-8 h-8 rounded-full bg-slate-800/50 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-600 font-black">
                                                  ?
                                              </div>
                                          )}
                                      </div>
                                      <div className="text-[9px] text-slate-600 font-black italic uppercase tracking-widest opacity-60">#{task.tag}</div>
                                  </div>

                                  {expandedTaskId === task.id && (
                                      <div className="mt-6 pt-6 border-t border-slate-800/50 animate-popIn">
                                          <div className="grid grid-cols-5 gap-1 mb-4">
                                              {statuses.map(s => (
                                                  <button 
                                                      key={s.id} 
                                                      onClick={(e) => { e.stopPropagation(); onUpdateTask({...task, status: s.id}); }}
                                                      className={`h-6 rounded-md border font-black transition-all flex items-center justify-center ${task.status === s.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-700 hover:text-slate-400'}`}
                                                      title={s.label}
                                                  >
                                                      <span className="text-[8px]">{s.label[0]}</span>
                                                  </button>
                                              ))}
                                          </div>
                                          <button 
                                              onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                              className="w-full py-2 bg-red-950/20 text-red-500/80 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-900/40 hover:text-red-400 transition-all border border-red-500/10"
                                          >
                                              终止任务
                                          </button>
                                      </div>
                                  )}
                              </div>
                          ))}
                        </>
                      )}
                  </div>
              </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-[2.5rem] border border-slate-800 overflow-hidden animate-popIn">
            <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-800 last:border-0">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => (
                    <div key={idx} className={`min-h-[140px] p-4 border-r border-b border-slate-800 last:border-r-0 ${!day ? 'bg-slate-950/20' : ''}`}>
                        {day && (
                            <>
                                <div className="text-xs font-black text-slate-600 mb-2">{day}</div>
                                <div className="space-y-1">
                                    {getTasksForDay(day).map(t => (
                                        <div key={t.id} className={`text-[8px] p-1.5 rounded-lg border font-bold truncate ${statuses.find(s => s.id === t.status)?.color || 'bg-slate-800 text-slate-400'}`}>
                                            {t.title}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
