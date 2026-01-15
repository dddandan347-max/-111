
import React, { useState } from 'react';
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

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, currentUser, statuses, onUpdateStatuses }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      status: statuses[0]?.id || 'Idea',
      assignee: '', 
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      priority: newPriority,
      tag: '一般',
    });
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">生产流水线</h2>
            <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest">Production Pipeline</p>
        </div>
        
        <div className="flex gap-3 bg-slate-900/80 p-2 rounded-[2rem] border border-slate-800 shadow-2xl glass">
          <input
            type="text"
            placeholder="有什么新创意？"
            className="bg-transparent text-white px-6 py-3 focus:outline-none w-64 text-sm font-bold"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <button 
            onClick={addTask}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95"
          >
            发布任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statuses.map(status => (
            <div key={status.id} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                        {status.label}
                    </h3>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 text-slate-500">
                        {tasks.filter(t => t.status === status.id).length}
                    </span>
                </div>
                
                <div className="space-y-3 min-h-[300px]">
                    {tasks.filter(t => t.status === status.id).map(task => (
                        <div 
                            key={task.id} 
                            onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                            className={`glass p-5 rounded-3xl border transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${expandedTaskId === task.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-slate-800/50'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black border uppercase ${PRIORITY_STYLE[task.priority]}`}>
                                    {task.priority}
                                </span>
                                <div className="text-[9px] font-mono text-slate-600 group-hover:text-blue-500 transition-colors">
                                    {task.deadline.substring(5)}
                                </div>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-4 line-clamp-2 leading-snug">{task.title}</h4>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {task.assignee ? (
                                        <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black" title={task.assignee}>
                                            {task.assignee[0].toUpperCase()}
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] text-slate-500">
                                            ?
                                        </div>
                                    )}
                                </div>
                                <div className="text-[10px] text-slate-600 font-black italic">#{task.tag}</div>
                            </div>

                            {expandedTaskId === task.id && (
                                <div className="mt-6 pt-6 border-t border-slate-800 animate-popIn">
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            {statuses.map(s => (
                                                <button 
                                                    key={s.id} 
                                                    onClick={(e) => { e.stopPropagation(); onUpdateTask({...task, status: s.id}); }}
                                                    className={`text-[8px] px-2 py-1 rounded-md border font-black transition-all ${task.status === s.id ? 'bg-blue-600 border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                                                >
                                                    {s.label[0]}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                            className="w-full py-2 bg-red-900/20 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-900/40 transition-all border border-red-500/20"
                                        >
                                            终止任务
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {tasks.filter(t => t.status === status.id).length === 0 && (
                        <div className="h-32 border-2 border-dashed border-slate-800/30 rounded-3xl flex items-center justify-center opacity-20">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">空置区间</span>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
