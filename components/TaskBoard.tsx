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

const PRIORITY_CONFIG = {
  'High': { color: 'text-red-400 bg-red-400/10 border-red-400/20', label: '高优先级' },
  'Medium': { color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', label: '中优先级' },
  'Low': { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', label: '低优先级' },
};

const PRESET_COLORS = [
    { name: 'Purple', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { name: 'Yellow', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { name: 'Red', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { name: 'Blue', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Green', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { name: 'Orange', class: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    { name: 'Pink', class: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
    { name: 'Indigo', class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { name: 'Teal', class: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    { name: 'Gray', class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, currentUser, statuses, onUpdateStatuses }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newTag, setNewTag] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Status Management State
  const [isManagingStatuses, setIsManagingStatuses] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState(PRESET_COLORS[0].class);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Default to the first status or 'Idea' if exists, else first available
    const initialStatus = statuses.length > 0 ? statuses[0].id : 'Idea';

    const newTask: VideoTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: initialStatus,
      assignee: '', 
      deadline: nextWeek,
      startDate: today,
      priority: newPriority,
      tag: newTag.trim() || '普通',
      notes: ''
    };
    onAddTask(newTask);
    setNewTaskTitle('');
    setNewTag('');
    setNewPriority('Medium');
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const updateField = (task: VideoTask, field: keyof VideoTask, value: any) => {
    onUpdateTask({ ...task, [field]: value });
  };

  const claimTask = (task: VideoTask) => {
    onUpdateTask({ ...task, assignee: currentUser });
  };

  const unclaimTask = (task: VideoTask) => {
    onUpdateTask({ ...task, assignee: '' });
  };

  // Status Management Functions
  const addStatus = () => {
      if(!newStatusLabel.trim()) return;
      const id = newStatusLabel.trim().replace(/\s+/g, '_');
      
      if(statuses.some(s => s.id === id)) {
          alert('状态名称已存在');
          return;
      }

      onUpdateStatuses([...statuses, { id, label: newStatusLabel, color: newStatusColor }]);
      setNewStatusLabel('');
  };

  const removeStatus = (id: string) => {
      if(statuses.length <= 1) {
          alert('至少保留一个状态');
          return;
      }
      if(confirm('确定删除此状态吗？使用此状态的任务将需要重新分配。')) {
          onUpdateStatuses(statuses.filter(s => s.id !== id));
      }
  };

  const getStatusColor = (statusId: string) => {
      const s = statuses.find(x => x.id === statusId);
      return s ? s.color : 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">视频任务清单</h2>
            <div className="flex items-center gap-3 mt-1">
                <p className="text-slate-400 text-sm">管理拍摄计划、优先级与时间表</p>
                <button 
                    onClick={() => setIsManagingStatuses(!isManagingStatuses)}
                    className="text-xs text-blue-400 hover:text-white flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700 hover:border-blue-500 transition-colors"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    管理状态
                </button>
            </div>
        </div>
        
        <div className="flex gap-2 items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700 shadow-lg relative flex-wrap">
          <select 
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
            className="bg-slate-700 text-slate-200 text-sm px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-600 transition-colors"
          >
             <option value="Low">低优</option>
             <option value="Medium">中优</option>
             <option value="High">高优</option>
          </select>
          
          <input
            type="text"
            placeholder="标签 (如: Vlog)"
            className="bg-slate-900 text-white px-3 py-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 w-32 text-sm placeholder-slate-500 transition-all focus:w-40"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />

          <input
            type="text"
            placeholder="输入新任务标题..."
            className="bg-slate-900 text-white px-4 py-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 w-64 text-sm placeholder-slate-500"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          
          <button 
            onClick={addTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors whitespace-nowrap text-sm shadow-md"
          >
            添加
          </button>

          {showSuccess && (
            <div className="absolute top-full right-0 mt-2 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-lg animate-[popIn_0.3s_ease-out] z-50 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                任务已添加
            </div>
          )}
        </div>
      </div>

      {isManagingStatuses && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 animate-slideUp">
              <h3 className="text-sm font-bold text-white mb-3">自定义任务状态</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                  {statuses.map(s => (
                      <div key={s.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold border ${s.color}`}>
                          {s.label}
                          <button 
                            onClick={() => removeStatus(s.id)}
                            className="hover:text-red-500 hover:scale-110 transition-transform"
                            title="删除"
                          >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </div>
                  ))}
              </div>
              <div className="flex gap-2 items-center bg-slate-900/50 p-2 rounded border border-slate-700/50 max-w-2xl">
                  <input 
                    placeholder="新状态名称 (如: 审核中)"
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={newStatusLabel}
                    onChange={(e) => setNewStatusLabel(e.target.value)}
                  />
                  <div className="flex gap-1">
                      {PRESET_COLORS.map(c => (
                          <button
                            key={c.name}
                            onClick={() => setNewStatusColor(c.class)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${c.class.split(' ')[0]} ${newStatusColor === c.class ? 'border-white scale-110' : 'border-transparent'}`}
                            title={c.name}
                          />
                      ))}
                  </div>
                  <button 
                    onClick={addStatus}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded ml-auto"
                  >
                      添加状态
                  </button>
              </div>
          </div>
      )}

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800/80 backdrop-blur text-slate-400 text-xs uppercase sticky top-0 z-10 border-b border-slate-700">
              <tr>
                <th className="px-4 py-4 w-8"></th>
                <th className="px-4 py-4 font-semibold tracking-wider w-28">优先级</th>
                <th className="px-4 py-4 font-semibold tracking-wider w-32">状态</th>
                <th className="px-4 py-4 font-semibold tracking-wider min-w-[200px]">任务名称 / 标签</th>
                <th className="px-4 py-4 font-semibold tracking-wider w-40">负责人</th>
                <th className="px-4 py-4 font-semibold tracking-wider w-32">开始日期</th>
                <th className="px-4 py-4 font-semibold tracking-wider w-32">截止日期</th>
                <th className="px-4 py-4 font-semibold tracking-wider w-16 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {tasks.length === 0 ? (
                 <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                          <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          <span>暂无任务，请在上方添加一个新任务。</span>
                      </div>
                    </td>
                 </tr>
              ) : tasks.map(task => (
                <React.Fragment key={task.id}>
                  <tr className={`hover:bg-slate-800/40 transition-colors group ${expandedTaskId === task.id ? 'bg-slate-800/60' : ''}`}>
                    <td className="px-2 py-4 text-center">
                        <button 
                            onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                            className="text-slate-500 hover:text-white transition-colors p-1"
                        >
                            <svg className={`w-4 h-4 transform transition-transform duration-200 ${expandedTaskId === task.id ? 'rotate-90 text-blue-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </td>
                    <td className="px-4 py-4">
                       <select
                         value={task.priority}
                         onChange={(e) => updateField(task, 'priority', e.target.value)}
                         className={`appearance-none cursor-pointer px-2 py-1 rounded text-[10px] uppercase font-bold border tracking-wider focus:outline-none focus:ring-1 focus:ring-opacity-50 transition-colors w-full text-center ${PRIORITY_CONFIG[task.priority].color}`}
                       >
                          <option value="High" className="bg-slate-900 text-red-400">High</option>
                          <option value="Medium" className="bg-slate-900 text-orange-400">Medium</option>
                          <option value="Low" className="bg-slate-900 text-blue-400">Low</option>
                       </select>
                    </td>
                    <td className="px-4 py-4">
                       <select 
                         value={task.status}
                         onChange={(e) => updateField(task, 'status', e.target.value)}
                         className={`w-full appearance-none cursor-pointer pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${getStatusColor(task.status)}`}
                       >
                         {statuses.map(s => (
                           <option key={s.id} value={s.id} className="bg-slate-900 text-slate-300">{s.label}</option>
                         ))}
                       </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                          <input 
                            type="text" 
                            value={task.title}
                            onChange={(e) => updateField(task, 'title', e.target.value)}
                            className="bg-transparent text-slate-200 font-medium text-base focus:outline-none focus:border-b focus:border-blue-500 w-full"
                          />
                          <div className="flex items-center gap-2">
                             <input 
                                type="text"
                                value={task.tag}
                                onChange={(e) => updateField(task, 'tag', e.target.value)}
                                className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-blue-500 w-24 text-center"
                                placeholder="标签"
                             />
                             {task.notes && (
                                <div 
                                    className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer hover:text-blue-400"
                                    onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    有备注
                                </div>
                             )}
                          </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {task.assignee ? (
                        <div className="flex items-center justify-between group/assignee">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                              {task.assignee.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-slate-300 text-sm truncate max-w-[80px]">{task.assignee}</span>
                            </div>
                            {task.assignee === currentUser && (
                                <button 
                                  onClick={() => unclaimTask(task)}
                                  className="text-xs text-slate-500 hover:text-red-400 opacity-0 group-hover/assignee:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                            )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => claimTask(task)}
                          className="text-xs flex items-center gap-1 border border-dashed border-slate-600 text-slate-500 hover:text-blue-400 hover:border-blue-400 px-3 py-1.5 rounded-full transition-all hover:bg-blue-400/5 whitespace-nowrap"
                        >
                          认领
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                         <input 
                            type="date" 
                            value={task.startDate}
                            onChange={(e) => updateField(task, 'startDate', e.target.value)}
                            className="bg-transparent text-slate-400 text-sm focus:outline-none focus:text-white cursor-pointer w-full"
                         />
                    </td>
                    <td className="px-4 py-4">
                        <input 
                            type="date" 
                            value={task.deadline}
                            onChange={(e) => updateField(task, 'deadline', e.target.value)}
                            className="bg-transparent text-slate-400 text-sm focus:outline-none focus:text-white cursor-pointer w-full"
                         />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-600 hover:text-red-400 p-2 rounded-full hover:bg-red-400/10 transition-colors"
                        title="删除任务"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                  {expandedTaskId === task.id && (
                    <tr className="bg-slate-800/30">
                        <td colSpan={8} className="px-6 py-4 border-b border-slate-800/50">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800/50">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    <label className="text-xs font-semibold uppercase tracking-wider">任务备注 / 详情</label>
                                </div>
                                <textarea
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 min-h-[120px] placeholder-slate-600"
                                    placeholder="添加拍摄注意事项、脚本链接或具体需求..."
                                    value={task.notes || ''}
                                    onChange={(e) => updateField(task, 'notes', e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};