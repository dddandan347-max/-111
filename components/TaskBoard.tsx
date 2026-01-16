
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

const TaskItemMobile: React.FC<{
  task: VideoTask;
  statuses: TaskStatusDef[];
  onUpdateTask: (task: VideoTask) => void;
  onDeleteTask: (id: string) => void;
  getStatusColor: (id: string) => string;
  theme: 'dark' | 'light';
}> = ({ task, statuses, onUpdateTask, onDeleteTask, getStatusColor, theme }) => {
  return (
    <div className={`p-5 rounded-[2rem] border mb-4 transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-mochi-border shadow-mochi-sm'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2 w-fit ${theme === 'dark' ? PRIORITY_CONFIG[task.priority].dark : PRIORITY_CONFIG[task.priority].light}`}>
            {PRIORITY_CONFIG[task.priority].label} 优先级
          </span>
          <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'} ${task.status === 'Done' ? 'line-through opacity-40' : ''}`}>
            {task.title}
          </h3>
          {task.tag && <span className="text-[10px] opacity-40 font-bold">#{task.tag}</span>}
        </div>
        <button onClick={() => onDeleteTask(task.id)} className="p-2 text-rose-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold opacity-40">执行者</span>
          <span className="text-xs font-black">{task.assignee || '未认领'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold opacity-40">状态</span>
          <select 
            value={task.status} 
            onChange={(e) => onUpdateTask({ ...task, status: e.target.value })} 
            className={`appearance-none px-3 py-1 rounded-xl text-[10px] font-black border text-center outline-none ${getStatusColor(task.status)}`}
          >
            {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold opacity-40">截止日期</span>
          <span className="text-xs font-black">{task.deadline}</span>
        </div>
      </div>
    </div>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ 
  tasks, onAddTask, onUpdateTask, onDeleteTask, currentUser, 
  statuses, onUpdateStatuses, tags, onUpdateTags 
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
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
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-6">
        <div>
            <h2 className={`text-3xl lg:text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>视频看板</h2>
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'active', label: `进行中 (${activeTasks.length})` },
                    { id: 'done', label: `已完成 (${doneTasks.length})` },
                    { id: 'calendar', label: '日历' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setViewTab(tab.id as any)}
                        className={`whitespace-nowrap px-4 py-2 rounded-2xl text-[10px] font-black transition-all ${
                            viewTab === tab.id 
                            ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-rose-400 text-white shadow-mochi-sm')
                            : (theme === 'dark' ? 'text-slate-500 bg-slate-800/50' : 'text-slate-400 bg-white shadow-mochi-sm')
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
        <div className="relative w-full">
            <input
                type="text"
                placeholder="想要制作什么视频？输入标题..."
                className={`px-5 py-4 rounded-[1.5rem] border transition-all w-full text-sm font-bold shadow-sm ${
                  theme === 'dark' ? 'bg-slate-800 text-white border-slate-700 focus:border-blue-500' : 'bg-white text-slate-800 border-mochi-border focus:border-rose-400'
                }`}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} className="absolute right-3 top-2.5">
              <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-mochi-pink text-white shadow-sm'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </div>
            </button>
        </div>
      </div>

      <div className="lg:hidden">
        {(viewTab === 'active' ? activeTasks : doneTasks).map(task => (
          <TaskItemMobile 
            key={task.id} 
            task={task} 
            statuses={statuses} 
            onUpdateTask={onUpdateTask} 
            onDeleteTask={onDeleteTask} 
            getStatusColor={getStatusColor}
            theme={theme}
          />
        ))}
      </div>

      {/* PC Table View - Hide on Mobile */}
      <div className={`hidden lg:block rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white/60 border-mochi-border shadow-mochi'
      }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-mochi-mint/50 text-teal-600'
                }`}>
                  <th className="px-4 py-6 text-center">优先级</th>
                  <th className="px-4 py-6">状态</th>
                  <th className="px-4 py-6">内容</th>
                  <th className="px-4 py-6">负责人</th>
                  <th className="px-4 py-6">截止</th>
                  <th className="px-4 py-6 text-center">操作</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-slate-800' : 'divide-mochi-border'}`}>
                {(viewTab === 'active' ? activeTasks : doneTasks).map(task => (
                  <tr key={task.id} className={`${theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-white hover:shadow-mochi-sm'}`}>
                    <td className="px-4 py-5 text-center">
                      <select 
                        value={task.priority} 
                        onChange={(e) => onUpdateTask({ ...task, priority: e.target.value as any })}
                        className={`appearance-none px-3 py-1.5 rounded-xl text-[10px] font-black border tracking-wider w-full text-center outline-none ${theme === 'dark' ? PRIORITY_CONFIG[task.priority].dark : PRIORITY_CONFIG[task.priority].light}`}
                      >
                        <option value="High">HIGH</option>
                        <option value="Medium">MID</option>
                        <option value="Low">LOW</option>
                      </select>
                    </td>
                    <td className="px-4 py-5">
                       <select value={task.status} onChange={(e) => onUpdateTask({ ...task, status: e.target.value })} className={`w-full appearance-none px-4 py-2 rounded-xl text-xs font-black border ${getStatusColor(task.status)}`}>
                        {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-5 font-black">{task.title}</td>
                    <td className="px-4 py-5 text-xs font-black opacity-60">{task.assignee || '未认领'}</td>
                    <td className="px-4 py-5 text-xs font-mono">{task.deadline}</td>
                    <td className="px-4 py-5 text-center">
                      <button onClick={() => onDeleteTask(task.id)} className="text-rose-500 p-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
