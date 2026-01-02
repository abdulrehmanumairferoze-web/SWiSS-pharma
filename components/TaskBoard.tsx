
import React, { useState, useRef } from 'react';
import { Task, TaskStatus, User, Meeting, TaskPriority, Role, MeetingAttachment } from '../types';
import { MOCK_USERS } from '../constants';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  X,
  CalendarDays,
  PauseCircle,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Zap,
  Filter,
  AlertOctagon,
  Timer,
  Trash2,
  PlayCircle,
  Link2,
  MousePointerClick,
  Plus,
  MessageCircleX,
  User as UserIcon,
  Info,
  ChevronRight,
  FileText,
  Paperclip,
  Download,
  Send,
  MessageSquare
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface TaskBoardProps {
  tasks: Task[];
  meetings: Meeting[];
  currentUser: User;
  onStatusChange: (taskId: string, status: TaskStatus, details?: any) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask?: () => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, meetings, currentUser, onStatusChange, onDeleteTask, onAddTask }) => {
  const [acknowledgingTask, setAcknowledgingTask] = useState<Task | null>(null);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [rejectingTaskId, setRejectingTaskId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [completionMessage, setCompletionMessage] = useState('');
  const [completionAttachments, setCompletionAttachments] = useState<MeetingAttachment[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const completionFileInputRef = useRef<HTMLInputElement>(null);

  const getAssignee = (id: string) => MOCK_USERS.find(u => u.id === id);
  const getAssigner = (id: string) => MOCK_USERS.find(u => u.id === id);
  
  const statusColumns = [
    { id: TaskStatus.PendingApproval, label: 'Awaiting Ack', icon: AlertCircle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: TaskStatus.Approved, label: 'Acknowledged', icon: UserPlus, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: TaskStatus.Pending, label: 'Pending / Hold', icon: PauseCircle, color: 'text-slate-600 bg-slate-50 border-slate-200' },
    { id: TaskStatus.InProgress, label: 'Working', icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: TaskStatus.Completed, label: 'Done', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: TaskStatus.Rejected, label: 'Rejected', icon: X, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  ];

  const filteredTasks = tasks.filter(task => {
    let isVisible = false;
    if (currentUser.role === Role.CEO || currentUser.role === Role.Chairman || currentUser.role === Role.MD || currentUser.role === Role.COO || currentUser.role === Role.CFO) {
      isVisible = true;
    } else {
      const assignee = MOCK_USERS.find(u => u.id === task.assignedToId);
      if (currentUser.role === Role.HOD && assignee?.department === currentUser.department) isVisible = true;
      else if (task.assignedToId === currentUser.id || task.assignedById === currentUser.id) isVisible = true;
    }
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) isVisible = false;
    return isVisible;
  });

  const handleOpenReject = (taskId: string) => {
    setRejectingTaskId(taskId);
    setRejectionReason('');
    setAcknowledgingTask(null);
  };

  const submitRejection = () => {
    if (rejectingTaskId && rejectionReason.trim()) {
      onStatusChange(rejectingTaskId, TaskStatus.Rejected, { reason: rejectionReason.trim() });
      setRejectingTaskId(null);
      setRejectionReason('');
    }
  };

  const handleOpenCompletion = (task: Task) => {
    setCompletingTask(task);
    setCompletionMessage('');
    setCompletionAttachments([]);
  };

  const submitCompletion = () => {
    if (completingTask) {
      onStatusChange(completingTask.id, TaskStatus.Completed, {
        message: completionMessage,
        attachments: completionAttachments
      });
      setCompletingTask(null);
    }
  };

  const handleCompletionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompletionAttachments(prev => [...prev, {
        name: file.name,
        type: file.type,
        data: reader.result as string
      }]);
    };
    reader.readAsDataURL(file);
    if (completionFileInputRef.current) completionFileInputRef.current.value = '';
  };

  const confirmAcknowledgment = (task: Task) => {
    onStatusChange(task.id, TaskStatus.Approved);
    setAcknowledgingTask(null);
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Q1: return 'bg-rose-100 text-rose-700 border-rose-200 ring-rose-500';
      case TaskPriority.Q2: return 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-500';
      case TaskPriority.Q3: return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400';
    }
  };

  const getUrgencyData = (dueDateStr: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr); dueDate.setHours(0, 0, 0, 0);
    const daysUntil = differenceInDays(dueDate, today);
    if (daysUntil < 0) return { type: 'overdue', label: 'Overdue', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (daysUntil <= 2) return { type: 'soon', label: 'Due Soon', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return null;
  };

  const downloadFile = (file: MeetingAttachment) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative h-full space-y-8">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Manifest</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Responsibility Tracking</p>
          </div>
          {(currentUser.role === Role.Chairman || currentUser.role === Role.CEO || currentUser.role === Role.COO || currentUser.role === Role.MD || currentUser.role === Role.CFO || currentUser.role === Role.HOD) && (
            <button 
              onClick={onAddTask}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 shrink-0"
            >
              <Plus size={16} strokeWidth={3} />
              Issue New Directive
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 overflow-x-auto custom-scrollbar shrink-0">
          <Filter size={16} className="text-slate-400 ml-2 shrink-0" />
          <span className="hidden sm:inline text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 whitespace-nowrap">Focus:</span>
          <div className="flex gap-1 min-w-max">
            {['All', ...Object.values(TaskPriority)].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${
                  priorityFilter === p 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                    : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewingTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.25)] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className={`h-1.5 w-full shrink-0 ${
              viewingTask.priority === TaskPriority.Q1 ? 'bg-rose-500' : 
              viewingTask.priority === TaskPriority.Q2 ? 'bg-amber-500' : 'bg-slate-400'
            }`}></div>
            
            <div className="p-10 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${getPriorityStyle(viewingTask.priority)} border`}>
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{viewingTask.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task ID: {viewingTask.id.slice(0,8)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewingTask(null)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Protocol</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      viewingTask.status === TaskStatus.Completed ? 'bg-emerald-500' :
                      viewingTask.status === TaskStatus.InProgress ? 'bg-blue-500' : 'bg-amber-500'
                    }`}></div>
                    <span className="text-xs font-black text-slate-700 uppercase">{viewingTask.status}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Rating</p>
                  <span className={`text-xs font-black uppercase ${
                    viewingTask.priority === TaskPriority.Q1 ? 'text-rose-600' :
                    viewingTask.priority === TaskPriority.Q2 ? 'text-amber-600' : 'text-slate-600'
                  }`}>{viewingTask.priority} - {viewingTask.priority === TaskPriority.Q1 ? 'Critical' : viewingTask.priority === TaskPriority.Q2 ? 'Strategic' : 'Operational'}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <FileText size={12} /> Technical Scope
                  </p>
                  <div className="bg-slate-50 rounded-[28px] p-6 border border-slate-100 shadow-inner">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {viewingTask.description || 'No detailed scope provided.'}
                    </p>
                  </div>
                </div>

                {viewingTask.attachments && viewingTask.attachments.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <Paperclip size={12} /> Assignment Reference
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {viewingTask.attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-indigo-400" />
                            <span className="text-xs font-bold text-slate-700">{file.name}</span>
                          </div>
                          <button onClick={() => downloadFile(file)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <Download size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingTask.status === TaskStatus.Completed && (
                  <div className="border-t border-slate-100 pt-6 space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <CheckCircle2 size={12} /> Completion Evidence
                      </p>
                      <div className="bg-emerald-50 rounded-[28px] p-6 border border-emerald-100">
                        <p className="text-sm text-emerald-900 font-medium italic mb-4 leading-relaxed">
                          {viewingTask.completionMessage || 'Task finalized without additional comments.'}
                        </p>
                        {viewingTask.completionAttachments && viewingTask.completionAttachments.length > 0 && (
                          <div className="grid grid-cols-1 gap-2">
                            {viewingTask.completionAttachments.map((file, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 transition-all group">
                                <div className="flex items-center gap-3">
                                  <FileText size={16} className="text-emerald-500" />
                                  <span className="text-xs font-bold text-slate-700">{file.name}</span>
                                </div>
                                <button onClick={() => downloadFile(file)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                  <Download size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-black text-sm">
                        {getAssignee(viewingTask.assignedToId)?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Responsible Party</p>
                        <p className="text-xs font-black text-slate-900">{getAssignee(viewingTask.assignedToId)?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 font-black text-sm">
                        {getAssigner(viewingTask.assignedById)?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Commanding Officer</p>
                        <p className="text-xs font-black text-slate-900">{getAssigner(viewingTask.assignedById)?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <CalendarDays size={20} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target Deadline</p>
                        <p className="text-xs font-black text-slate-900">{format(new Date(viewingTask.dueDate), 'MMMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex justify-end">
                <button 
                  onClick={() => setViewingTask(null)}
                  className="px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all"
                >
                  Return to Board
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {completingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-2 w-full bg-emerald-500"></div>
            <div className="p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Completion Protocol</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Submit Evidence of Success</p>
                </div>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Executive Summary</span>
                  <textarea 
                    value={completionMessage}
                    onChange={e => setCompletionMessage(e.target.value)}
                    className="w-full h-32 px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none text-sm font-medium"
                    placeholder="Briefly describe the outcome..."
                  />
                </label>

                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Upload Evidence</span>
                  <div className="flex flex-wrap gap-2">
                    {completionAttachments.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600">
                        <FileText size={12} /> {f.name}
                      </div>
                    ))}
                    <button 
                      onClick={() => completionFileInputRef.current?.click()}
                      className="px-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Paperclip size={14} /> Add Document
                    </button>
                    <input type="file" ref={completionFileInputRef} className="hidden" onChange={handleCompletionFileUpload} />
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button onClick={() => setCompletingTask(null)} className="flex-1 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
                  <button 
                    onClick={submitCompletion}
                    className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Finalize Directive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-20">
        {statusColumns.map((col) => {
          const Icon = col.icon;
          const columnTasks = filteredTasks.filter(t => t.status === col.id);
          
          return (
            <div key={col.id} className="flex flex-col gap-4">
              <div className={`flex items-center justify-between p-3 rounded-2xl border ${col.color} shadow-sm backdrop-blur-sm sticky top-0 z-10 bg-white`}>
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="font-black text-[9px] uppercase tracking-[0.1em]">{col.label}</span>
                </div>
                <span className="bg-white/60 px-2 py-0.5 rounded-lg text-[9px] font-black shadow-inner">{columnTasks.length}</span>
              </div>

              <div className="space-y-4">
                {columnTasks.map(task => {
                  const isMyAcknowledgment = task.status === TaskStatus.PendingApproval && task.assignedToId === currentUser.id;
                  const urgency = (task.status !== TaskStatus.Completed && task.status !== TaskStatus.Pending) ? getUrgencyData(task.dueDate) : null;
                  const isCompleted = task.status === TaskStatus.Completed;
                  
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => !isMyAcknowledgment && setViewingTask(task)}
                      className={`bg-white rounded-[24px] p-4 border shadow-sm transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer ${
                        isMyAcknowledgment 
                          ? 'border-amber-400 ring-4 ring-amber-400/10 animate-[pulse_2s_infinite]'
                          : (urgency?.type === 'overdue' ? 'border-rose-300 ring-2 ring-rose-100 shadow-xl shadow-rose-500/10' : urgency?.type === 'soon' ? 'border-amber-300 ring-2 ring-amber-100 shadow-xl shadow-amber-500/10' : 'border-slate-100 hover:shadow-lg hover:border-slate-300')
                      } ${task.priority === TaskPriority.Q1 && !isCompleted ? 'border-l-4 border-l-rose-500' : ''}`}
                    >
                      {/* Intake Badge */}
                      {isMyAcknowledgment && (
                        <div className="absolute top-0 right-0 p-2 z-10">
                          <span className="bg-amber-500 text-white text-[7px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 shadow-md">
                            <AlertCircle size={8} /> Intake
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h4 className={`font-black text-[11px] lg:text-xs leading-tight flex-1 group-hover:text-indigo-600 transition-colors ${isMyAcknowledgment ? 'text-amber-700' : 'text-slate-900'}`}>{task.title}</h4>
                        <div className={`flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border shrink-0 shadow-sm ${getPriorityStyle(task.priority)}`}>
                          <Zap size={8} className={task.priority === TaskPriority.Q1 ? 'animate-pulse' : ''} />
                          {task.priority}
                        </div>
                      </div>

                      {urgency && (
                        <div className={`mb-3 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] w-fit px-2 py-1 rounded-md border ${urgency.color} shadow-sm`}>
                          {urgency.type === 'overdue' ? <AlertOctagon size={10} /> : <Timer size={10} />}
                          {urgency.label}
                        </div>
                      )}
                      
                      <p className="text-[10px] text-slate-400 mb-4 line-clamp-2 font-medium leading-relaxed">{task.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black border shadow-inner ${task.assignedToId === currentUser.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {getAssignee(task.assignedToId)?.name.charAt(0)}
                          </div>
                          <span className="text-[9px] font-black text-slate-800 truncate max-w-[60px]">{getAssignee(task.assignedToId)?.name.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.attachments && task.attachments.length > 0 && <Paperclip size={10} className="text-slate-300" />}
                          <div className={`flex items-center gap-1 text-[9px] font-black ${urgency?.type === 'overdue' ? 'text-rose-500' : 'text-slate-300'}`}>
                            <CalendarDays size={10} />
                            {format(new Date(task.dueDate), 'MMM dd')}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isMyAcknowledgment && (
                          <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => setAcknowledgingTask(task)}
                              className="w-full py-3 rounded-xl bg-amber-500 text-white text-[10px] font-black shadow-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                            >
                              <ShieldCheck size={14} /> Intake
                            </button>
                            <button 
                              onClick={() => handleOpenReject(task.id)}
                              className="w-full py-2.5 rounded-xl bg-white border border-rose-200 text-rose-500 text-[10px] font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                            >
                              <MessageCircleX size={14} /> Decline Directive
                            </button>
                          </div>
                        )}
                        {task.status === TaskStatus.Approved && task.assignedToId === currentUser.id && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => onStatusChange(task.id, TaskStatus.InProgress)}
                              className="flex-[2] py-2.5 rounded-xl bg-indigo-600 text-white text-[9px] font-black hover:bg-indigo-700 transition-all shadow-lg uppercase tracking-widest"
                            >
                              Engage
                            </button>
                            <button 
                              onClick={() => onStatusChange(task.id, TaskStatus.Pending)}
                              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-[9px] font-black hover:bg-slate-200 transition-all uppercase tracking-widest flex items-center justify-center"
                            >
                              Hold
                            </button>
                          </div>
                        )}
                        {task.status === TaskStatus.InProgress && task.assignedToId === currentUser.id && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleOpenCompletion(task)}
                              className="flex-[2] py-2.5 rounded-xl bg-emerald-600 text-white text-[9px] font-black hover:bg-emerald-700 transition-all shadow-lg uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                              Finalize
                            </button>
                            <button 
                              onClick={() => onStatusChange(task.id, TaskStatus.Pending)}
                              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-[9px] font-black hover:bg-slate-200 transition-all uppercase tracking-widest flex items-center justify-center"
                            >
                              Hold
                            </button>
                          </div>
                        )}
                        {isCompleted && (
                          <div className="relative">
                            {confirmDeleteId === task.id ? (
                              <div className="flex gap-1 animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                  onClick={() => onDeleteTask(task.id)}
                                  className="flex-1 py-2 bg-rose-600 text-white text-[9px] font-black rounded-xl shadow-lg uppercase tracking-widest"
                                >
                                  Purge
                                </button>
                                <button 
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-2 bg-slate-100 text-slate-500 text-[9px] font-black rounded-xl"
                                >
                                  Esc
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setConfirmDeleteId(task.id)}
                                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-[9px] font-black hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-2 uppercase tracking-widest border border-slate-200 border-dashed"
                              >
                                <Trash2 size={12} /> Clear
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {acknowledgingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`h-2 w-full ${
              acknowledgingTask.priority === TaskPriority.Q1 ? 'bg-rose-500' : 
              acknowledgingTask.priority === TaskPriority.Q2 ? 'bg-amber-500' : 'bg-slate-400'
            }`}></div>
            <div className="p-10 text-center">
              <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Assignment Intake</h3>
              <p className={`text-[11px] font-black uppercase tracking-[0.3em] mb-6 ${
                acknowledgingTask.priority === TaskPriority.Q1 ? 'text-rose-500' : 'text-slate-400'
              }`}>
                INTAKE PROTOCOL: {acknowledgingTask.priority} RATING
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
                <h4 className="font-black text-slate-900 text-lg mb-2">{acknowledgingTask.title}</h4>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">{acknowledgingTask.description}</p>
                {acknowledgingTask.attachments && acknowledgingTask.attachments.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Paperclip size={10}/> Attached Reference</p>
                    <div className="flex flex-wrap gap-2">
                      {acknowledgingTask.attachments.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-600">
                          <FileText size={10} /> {f.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-indigo-600 flex items-center gap-2">
                    <CalendarDays size={14} /> Due: {format(new Date(acknowledgingTask.dueDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => confirmAcknowledgment(acknowledgingTask)} className="w-full py-5 rounded-2xl font-black text-white bg-emerald-600 shadow-2xl transition-all">Confirm Commitment</button>
                <button onClick={() => handleOpenReject(acknowledgingTask.id)} className="w-full py-4 rounded-2xl font-bold text-slate-400 uppercase tracking-widest text-[10px]">Technical Decline</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectingTaskId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden p-8 animate-in zoom-in-95 duration-200">
             <div className="flex items-center gap-4 mb-6 text-rose-600">
                <AlertTriangle size={24} />
                <h3 className="text-xl font-black">Decline Directive</h3>
             </div>
             <textarea 
                required
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full h-32 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-rose-500/10 outline-none resize-none text-sm font-medium"
                placeholder="Detail technical grounds for rejection..."
             />
             <div className="flex gap-3 mt-6">
                <button onClick={() => setRejectingTaskId(null)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                <button onClick={submitRejection} className="flex-[2] py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl shadow-rose-200">Submit Record</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
