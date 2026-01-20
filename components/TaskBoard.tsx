
import React, { useState, useMemo } from 'react';
import { VideoTask, TaskStatusDef } from '../types';

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

export const TaskBoard: React.FC<TaskBoardProps> = ({ 
  tasks, onAddTask, onUpdateTask, onDeleteTask, currentUser, 
  statuses, onUpdateStatuses, tags, onUpdateTags 
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'done' | 'calendar'>('active');
  const [editingAssigneeId, setEditingAssigneeId] = useState<string | null>(null);
  
  const theme = document.documentElement.className.includes('light') ? 'light' : 'dark';

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [tasks]);

  const activeTasks = useMemo(() => sortedTasks.filter(t => t.status !== 'Done'), [sortedTasks]);
  const doneTasks = useMemo(() => sortedTasks.filter(t => t.status === 'Done'), [sortedTasks]);

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

  const toggleClaim = (task: VideoTask) => {
    const newAssignee = task.assignee === currentUser ? '' : currentUser;
    onUpdateTask({ ...task, assignee: newAssignee });
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col gap-6">
        <div>
            <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>视频看板</h2>
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                {[
                    { id: 'active', label: `进行中 (${activeTasks.length})` },
                    { id: 'done', label: `已完成 (${doneTasks.length})` }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setViewTab(tab.id as any)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all ${
                            viewTab === tab.id 
                            ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-rose-400 text-white shadow-mochi-sm')
                            : (theme === 'dark' ? 'text-slate-500 bg-slate-800/50 hover:text-white' : 'text-slate-400 bg-white shadow-mochi-sm')
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
                className={`px-6 py-5 rounded-[1.8rem] border transition-all w-full text-base font-bold shadow-sm ${
                  theme === 'dark' ? 'bg-slate-800 text-white border-slate-700 focus:border-blue-500' : 'bg-white text-slate-800 border-mochi-border focus:border-rose-400'
                }`}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} className="absolute right-4 top-3.5">
              <div className={`p-2.5 rounded-2xl ${theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-rose-400 text-white shadow-sm'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </div>
            </button>
        </div>
      </div>

      <div className={`rounded-[3rem] border overflow-hidden transition-all duration-500 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-mochi-border shadow-mochi'
      }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-b ${
                    theme === 'dark' ? 'bg-slate-800/50 text-slate-500 border-slate-800' : 'bg-mochi-mint/30 text-teal-600 border-mochi-border'
                }`}>
                  <th className="px-8 py-6 text-center w-24">优先级</th>
                  <th className="px-6 py-6 w-32">状态</th>
                  <th className="px-6 py-6">任务标题</th>
                  <th className="px-6 py-6 w-48">执行人 (认领)</th>
                  <th className="px-6 py-6 w-32">截止</th>
                  <th className="px-6 py-6 text-center w-20">操作</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${theme === 'dark' ? 'divide-slate-800' : 'divide-mochi-border'}`}>
                {(viewTab === 'active' ? activeTasks : doneTasks).map(task => (
                  <tr key={task.id} className={`group ${theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-mochi-bg/40'}`}>
                    <td className="px-8 py-6 text-center">
                      <select 
                        value={task.priority} 
                        onChange={(e) => onUpdateTask({ ...task, priority: e.target.value as any })}
                        className={`appearance-none px-3 py-2 rounded-xl text-[10px] font-black border tracking-wider w-full text-center outline-none cursor-pointer hover:scale-105 transition-transform ${theme === 'dark' ? PRIORITY_CONFIG[task.priority].dark : PRIORITY_CONFIG[task.priority].light}`}
                      >
                        <option value="High">HIGH</option>
                        <option value="Medium">MID</option>
                        <option value="Low">LOW</option>
                      </select>
                    </td>
                    <td className="px-6 py-6">
                       <select 
                        value={task.status} 
                        onChange={(e) => onUpdateTask({ ...task, status: e.target.value })} 
                        className={`w-full appearance-none px-4 py-2.5 rounded-xl text-[10px] font-black border outline-none cursor-pointer transition-all ${getStatusColor(task.status)}`}
                       >
                        {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className={`px-6 py-6 font-black text-sm ${task.status === 'Done' ? 'opacity-30 line-through' : ''}`}>
                      {task.title}
                      {task.tag && <span className={`ml-3 px-2 py-0.5 rounded-lg text-[9px] border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>#{task.tag}</span>}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3 group/assignee">
                         {editingAssigneeId === task.id ? (
                           <input 
                            autoFocus
                            className={`w-full bg-transparent border-b outline-none font-black text-xs ${theme === 'dark' ? 'border-blue-500 text-white' : 'border-rose-400 text-slate-800'}`}
                            value={task.assignee}
                            onBlur={() => setEditingAssigneeId(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingAssigneeId(null)}
                            onChange={e => onUpdateTask({...task, assignee: e.target.value})}
                           />
                         ) : (
                           <>
                             <div 
                              onClick={() => setEditingAssigneeId(task.id)}
                              className={`flex-1 text-xs font-black cursor-text ${task.assignee ? (theme === 'dark' ? 'text-blue-400' : 'text-slate-800') : 'text-slate-500 italic opacity-40'}`}
                             >
                               {task.assignee || '无人领任务'}
                             </div>
                             <button 
                               onClick={() => toggleClaim(task)}
                               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
                                 task.assignee === currentUser
                                 ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20'
                                 : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 opacity-0 group-hover/assignee:opacity-100'
                               }`}
                             >
                               {task.assignee === currentUser ? '放弃' : '认领'}
                             </button>
                           </>
                         )}
                      </div>
                    </td>
                    <td className={`px-6 py-6 text-[10px] font-mono font-black ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {task.deadline}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button 
                        onClick={() => onDeleteTask(task.id)} 
                        className={`p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'text-slate-600 hover:text-rose-500 hover:bg-rose-500/10' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          { (viewTab === 'active' ? activeTasks : doneTasks).length === 0 && (
            <div className="py-32 text-center">
              <div className="text-4xl mb-4 opacity-20">🎬</div>
              <p className="text-sm font-black italic uppercase tracking-widest opacity-20">No Tasks Found</p>
            </div>
          )}
      </div>
    </div>
  );
};
