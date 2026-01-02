
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Users, MapPin, Calendar, FileText, CheckCircle2, Wand2, CalendarDays, Send, AlertTriangle, BellRing, ShieldAlert, RefreshCw, AtSign, UserCheck, Sparkles, Clock, ShieldCheck, Lock, Stamp, Zap, CheckCircle, Hourglass, UserX, MessageCircleX, MessageSquare, Crown, Plane, Search, Plus, Target, XCircle, Paperclip, FileUp, Globe, Mic, Square, Loader2, LayoutTemplate, ScanSearch, UserPlus, Trash2, FileDown, Calendar as CalendarIcon } from 'lucide-react';
import { Meeting, User, Department, Task, TaskStatus, MeetingType, Role, Recurrence, Team, Region, TaskPriority, MeetingAttachment } from '../types';
import { MOCK_USERS, DEPARTMENTS, getDepartmentEmoji } from '../constants';
import { summarizeMinutes, transcribeAudio, extractTasks } from '../services/geminiService';
import { format, addDays } from 'date-fns';

interface MeetingModalProps {
  meeting?: Meeting;
  initialDate?: Date;
  currentUser: User;
  onClose: () => void;
  onSave: (meeting: Partial<Meeting>, tasks?: Partial<Task>[]) => void;
  tasks?: Task[];
}

interface MoMRow {
  id: string;
  discussion: string;
  resolution: string;
  ownerId: string;
  deadline: string;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ meeting, initialDate, currentUser, onClose, onSave, tasks = [] }) => {
  const [title, setTitle] = useState(meeting?.title || '');
  const [dept, setDept] = useState<Department>(meeting?.department || currentUser.department);
  const [startTime, setStartTime] = useState(meeting ? meeting.startTime.slice(0, 16) : initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : '');
  const [endTime, setEndTime] = useState(meeting ? meeting.endTime.slice(0, 16) : '');
  const [location, setLocation] = useState(meeting?.location || '');
  const [description, setDescription] = useState(meeting?.description || '');
  const [attendees, setAttendees] = useState<string[]>(meeting?.attendees || [currentUser.id]);
  const [leaderId, setLeaderId] = useState<string>(meeting?.leaderId || currentUser.id);
  const [finalizedBy, setFinalizedBy] = useState<string[]>(meeting?.finalizedBy || []);
  const [minutes, setMinutes] = useState(meeting?.minutes || '');
  
  const classicNotesRef = useRef<HTMLTextAreaElement>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);

  // Sheet Structure Logic
  const initialRows: MoMRow[] = useMemo(() => {
    try {
      if (meeting?.minutes && meeting.minutes.startsWith('[{"id":')) {
        return JSON.parse(meeting.minutes);
      }
    } catch (e) {}
    return [{ id: '1', discussion: '', resolution: '', ownerId: '', deadline: '' }];
  }, [meeting]);

  const [rows, setRows] = useState<MoMRow[]>(initialRows);
  const [isSheetView, setIsSheetView] = useState(meeting?.minutes ? meeting.minutes.startsWith('[{"id":') : true);

  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [meetingType, setMeetingType] = useState<MeetingType>(meeting?.type || MeetingType.Standard);
  const [newTasks, setNewTasks] = useState<(Partial<Task> & { autoMatched?: boolean; taggedName?: string })[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attachments, setAttachments] = useState<MeetingAttachment[]>(meeting?.attachments || []);
  const [travelCities, setTravelCities] = useState(meeting?.travelCities || '');
  
  const [team, setTeam] = useState<Team>(meeting?.team || Team.None);
  const [region, setRegion] = useState<Region>(meeting?.region || Region.None);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isFullyFinalized = meeting?.isFinalized || (attendees.length > 0 && finalizedBy.length === attendees.length);
  const hasUserFinalized = finalizedBy.includes(currentUser.id);
  const isLockedForUser = isFullyFinalized || hasUserFinalized;
  const isTravel = meetingType === MeetingType.Travel;

  const attendeeUsers = MOCK_USERS.filter(u => attendees.includes(u.id));
  const pendingFinalizationUsers = attendeeUsers.filter(u => !finalizedBy.includes(u.id));

  const availableUsers = useMemo(() => {
    return MOCK_USERS.filter(u => 
      u.name.toLowerCase().includes(attendeeSearch.toLowerCase()) || 
      u.role.toLowerCase().includes(attendeeSearch.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [attendeeSearch]);

  const handleAddRow = () => {
    if (isLockedForUser) return;
    setRows(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), discussion: '', resolution: '', ownerId: '', deadline: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    if (isLockedForUser) return;
    if (rows.length === 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof MoMRow, value: string) => {
    if (isLockedForUser) return;
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const insertTag = (userName: string) => {
    if (isSheetView) {
      // In sheet view, we just insert into the focused discussion cell if possible
      // For simplicity, we'll suggest using the Owner dropdown or typing manually
      alert(`To assign a task in sheet view, select ${userName} in the 'Owner' column.`);
    } else {
      if (classicNotesRef.current) {
        const start = classicNotesRef.current.selectionStart;
        const end = classicNotesRef.current.selectionEnd;
        const text = minutes;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newText = `${before}@${userName} ${after}`;
        setMinutes(newText);
        classicNotesRef.current.focus();
      }
    }
    setShowTagMenu(false);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const attendeesNames = attendeeUsers.map(u => u.name).join(', ');
    const finalizedNames = MOCK_USERS.filter(u => finalizedBy.includes(u.id)).map(u => u.name).join(', ');

    let contentHtml = '';
    if (isSheetView) {
      contentHtml = `
        <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Discussion</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Resolution</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Owner</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; text-align: left;">Timeline</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td style="border: 1px solid #e2e8f0; padding: 12px;">${r.discussion || '-'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 12px;">${r.resolution || '-'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 12px;">${MOCK_USERS.find(u => u.id === r.ownerId)?.name || 'Unassigned'}</td>
                <td style="border: 1px solid #e2e8f0; padding: 12px;">${r.deadline || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      contentHtml = `
        <div style="white-space: pre-wrap; font-family: monospace; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 20px;">
          ${minutes || 'No minutes recorded.'}
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>MoM - ${title}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0; }
            .meta { display: grid; grid-cols: 2; gap: 10px; margin-top: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #10b981; margin-top: 30px; border-left: 4px solid #10b981; padding-left: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Minutes of Meeting</h1>
            <p style="margin: 5px 0; color: #10b981; font-weight: bold;">SWISS Pharmaceuticals (Pvt) Ltd</p>
            <div class="meta">
              <div><strong>Subject:</strong> ${title}</div>
              <div><strong>Date:</strong> ${format(new Date(startTime), 'PPP')}</div>
              <div><strong>Department:</strong> ${dept}</div>
              <div><strong>Location:</strong> ${location}</div>
            </div>
          </div>
          
          <div class="section-title">Participants</div>
          <p style="font-size: 13px;">${attendeesNames}</p>

          <div class="section-title">Formal Record</div>
          ${contentHtml}

          <div class="section-title">Verification Status</div>
          <p style="font-size: 11px; color: #64748b;">Verified by: ${finalizedNames || 'Pending'}</p>
          
          <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center;">
            This is an electronically generated and verified document of Swiss Pharmaceuticals. 
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleScanTasks = async () => {
    let sourceText = "";
    if (isSheetView) {
      sourceText = rows.map(r => `${r.discussion} ${r.resolution} @${MOCK_USERS.find(u => u.id === r.ownerId)?.name || ''}`).join('\n');
    } else {
      sourceText = minutes;
    }

    if (!sourceText.trim()) return;
    setIsScanning(true);
    try {
      const extracted = await extractTasks(sourceText);
      const matched = extracted.map((et: any) => {
        const user = MOCK_USERS.find(u => u.name.toLowerCase().includes((et.taggedName || '').toLowerCase()));
        return {
          title: et.title,
          description: et.description,
          assignedToId: user?.id,
          priority: et.priority as TaskPriority,
          dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
          autoMatched: !!user,
          taggedName: et.taggedName
        };
      });
      setNewTasks(matched);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyTemplate = () => {
    if (isLockedForUser) return;
    if (isSheetView) {
      setRows([{ id: '1', discussion: 'Meeting Introduction', resolution: 'Objectives set', ownerId: currentUser.id, deadline: format(new Date(), 'yyyy-MM-dd') }]);
    } else {
      setMinutes(`# MINUTES OF MEETING: ${title || 'Session'}
## 1. MEETING OBJECTIVES
- 
## 2. KEY DISCUSSIONS
- 
## 3. DECISIONS
- 
## 4. ACTION ITEMS
- @Name [Action Details]`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          setIsLoading(true);
          const transcription = await transcribeAudio(base64Data, mediaRecorder.mimeType);
          if (transcription) {
            if (isSheetView) {
              setRows(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), discussion: transcription, resolution: 'Extracted from audio', ownerId: '', deadline: '' }]);
            } else {
              setMinutes(prev => (prev ? prev + '\n' + transcription : transcription));
            }
          }
          setIsLoading(false);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { console.error(err); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleFinalize = () => {
    if (!finalizedBy.includes(currentUser.id)) {
      const nextFinalizedBy = [...finalizedBy, currentUser.id];
      const isNowFinalized = attendees.length > 0 && nextFinalizedBy.length === attendees.length;
      
      const finalMinutes = isSheetView ? JSON.stringify(rows) : minutes;

      onSave({
        ...meeting,
        title, department: dept, team, region, startTime, endTime, location, description,
        attendees, leaderId, minutes: finalMinutes, attachments, travelCities, type: meetingType,
        finalizedBy: nextFinalizedBy, isFinalized: isNowFinalized
      }, newTasks.filter(t => t.assignedToId).map(t => ({
          title: t.title,
          description: t.description,
          assignedToId: t.assignedToId,
          dueDate: t.dueDate,
          priority: t.priority,
          status: TaskStatus.PendingApproval
      })));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-[40px] shadow-2xl w-full max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-hidden flex flex-col relative ${isFullyFinalized ? 'bg-slate-50' : ''}`}>
        
        {isFullyFinalized && (
          <div className="bg-slate-900 py-2 px-8 flex items-center justify-center gap-3 text-white relative z-30">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-widest">Authenticated Pharmaceutical Record</span>
          </div>
        )}

        <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{isTravel ? 'Travel Log' : 'Meeting Documentation'}</h2>
            <p className="text-sm text-slate-400 font-medium">Capture directives and ensure enterprise-wide alignment.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPDF} className="p-3 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-2xl transition-all flex items-center gap-2 group">
              <FileDown size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Export PDF</span>
            </button>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-all"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar space-y-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="space-y-8">
              <div className="bg-slate-900 p-5 rounded-[28px] border border-slate-800 space-y-4 shadow-xl">
                <div className="flex gap-2">
                   {[MeetingType.Standard, MeetingType.Strategic, MeetingType.Travel].map(t => (
                     <button key={t} disabled={isLockedForUser} onClick={() => setMeetingType(t)} className={`flex-1 py-2 rounded-xl text-[9px] font-black border uppercase transition-all ${meetingType === t ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'}`}>{t}</button>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{isTravel ? 'Travel Subject' : 'Session Subject'}</span>
                  <input required disabled={isLockedForUser} value={title} onChange={e => setTitle(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" />
                </label>

                {isTravel && (
                   <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cities of Transit</span>
                    <input disabled={isLockedForUser} value={travelCities} onChange={e => setTravelCities(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" />
                  </label>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{isTravel ? 'Departure Date' : 'Start Time'}</span>
                    <input type={isTravel ? "date" : "datetime-local"} required disabled={isLockedForUser} value={isTravel ? startTime.slice(0, 10) : startTime} onChange={e => setStartTime(isTravel ? e.target.value + 'T00:00' : e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{isTravel ? 'Arrival Date' : 'End Time'}</span>
                    <input type={isTravel ? "date" : "datetime-local"} required disabled={isLockedForUser} value={isTravel ? endTime.slice(0, 10) : endTime} onChange={e => setEndTime(isTravel ? e.target.value + 'T23:59' : e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" />
                  </label>
                </div>
              </div>

              {pendingFinalizationUsers.length > 0 && (
                <div className="bg-amber-50 rounded-[28px] p-6 border border-amber-200 shadow-sm animate-pulse">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
                    <Hourglass size={12} /> Awaiting Verification
                  </span>
                  <div className="space-y-2">
                    {pendingFinalizationUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl border border-amber-100">
                        <div className="w-5 h-5 rounded-lg bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">{u.name.charAt(0)}</div>
                        <span className="text-[10px] font-bold text-slate-700">{u.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col h-full space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Personnel Roll</span>
              <div className="relative mb-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" disabled={isLockedForUser} placeholder="Filter personnel..." value={attendeeSearch} onChange={e => setAttendeeSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white transition-all" />
              </div>
              <div className="flex-1 flex flex-col gap-2 p-2 rounded-[32px] border border-slate-100 bg-slate-50/30 overflow-y-auto custom-scrollbar">
                {availableUsers.map(user => {
                  const isInvited = attendees.includes(user.id);
                  return (
                    <button key={user.id} type="button" disabled={isLockedForUser} onClick={() => setAttendees(prev => isInvited ? prev.filter(id => id !== user.id) : [...prev, user.id])} className={`w-full p-4 rounded-[24px] transition-all border text-left flex items-center gap-3 ${isInvited ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-500/20 translate-x-1' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${isInvited ? 'bg-white/20' : 'bg-slate-50'}`}>{user.name.charAt(0)}</div>
                      <div className="overflow-hidden">
                        <p className="font-black text-[11px] truncate leading-none mb-1">{user.name}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isInvited ? 'text-white/80' : 'text-emerald-500'}`}>{user.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                  <button onClick={() => setIsSheetView(true)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSheetView ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400'}`}>Sheet Structure</button>
                  <button onClick={() => setIsSheetView(false)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isSheetView ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400'}`}>Classic Notes</button>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isLockedForUser && (
                     <div className="relative">
                       <button type="button" onClick={() => setShowTagMenu(!showTagMenu)} className="text-[10px] font-black px-4 py-2 bg-indigo-600 text-white rounded-2xl uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all">
                        <AtSign size={14} /> Tag Personnel
                      </button>
                      {showTagMenu && (
                        <div className="absolute right-0 top-12 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-[60] animate-in zoom-in-95">
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">Assign to Task via Tag</p>
                           <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                              {attendeeUsers.map(u => (
                                <button key={u.id} onClick={() => insertTag(u.name)} className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-2">
                                   <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">@</div>
                                   {u.name}
                                </button>
                              ))}
                           </div>
                        </div>
                      )}
                     </div>
                  )}
                  {!isLockedForUser && (
                     <button type="button" onClick={handleApplyTemplate} className="text-[10px] font-black px-4 py-2 bg-slate-100 text-slate-600 rounded-2xl uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-2">
                      <LayoutTemplate size={14} /> Structure
                    </button>
                  )}
                  {!isLockedForUser && (
                     <button type="button" onClick={handleScanTasks} className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all ${isScanning ? 'bg-indigo-50 text-indigo-400' : 'bg-white text-indigo-600 border border-indigo-200'}`}>
                      {isScanning ? <Loader2 size={14} className="animate-spin" /> : <ScanSearch size={14} />} Extract Directives
                    </button>
                  )}
                  {!isLockedForUser && (
                     <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-white text-slate-900 border border-slate-200'}`}>
                      {isRecording ? <Square size={14} /> : <Mic size={14} />} {isRecording ? 'Capturing...' : 'Audio Input'}
                    </button>
                  )}
                  {!isLockedForUser && !isTravel && !isSheetView && (
                    <button type="button" onClick={async () => {
                      setIsLoading(true);
                      const summary = await summarizeMinutes(minutes);
                      setMinutes(summary || minutes);
                      setIsLoading(false);
                    }} className="text-[10px] font-black bg-emerald-600 text-white px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-emerald-700 transition-all">
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} AI MoM
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                {isSheetView ? (
                  <div className="flex-1 flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Technical Discussion</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Decision / Resolution</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                            <th className="px-6 py-4 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {rows.map((row) => (
                            <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="p-2">
                                <textarea 
                                  disabled={isLockedForUser}
                                  value={row.discussion}
                                  onChange={e => updateRow(row.id, 'discussion', e.target.value)}
                                  placeholder="What was deliberated..."
                                  className="w-full p-4 bg-transparent outline-none resize-none text-xs font-medium text-slate-700 h-24 placeholder:text-slate-300"
                                />
                              </td>
                              <td className="p-2">
                                <textarea 
                                  disabled={isLockedForUser}
                                  value={row.resolution}
                                  onChange={e => updateRow(row.id, 'resolution', e.target.value)}
                                  placeholder="Agreed outcomes..."
                                  className="w-full p-4 bg-transparent outline-none resize-none text-xs font-medium text-emerald-700 h-24 placeholder:text-slate-300"
                                />
                              </td>
                              <td className="p-2 align-top">
                                <div className="relative group/owner">
                                  <select 
                                    disabled={isLockedForUser}
                                    value={row.ownerId}
                                    onChange={e => updateRow(row.id, 'ownerId', e.target.value)}
                                    className={`w-full p-3 border rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500/10 outline-none appearance-none cursor-pointer transition-all ${row.ownerId ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                                  >
                                    <option value="">Unassigned</option>
                                    {attendeeUsers.map(u => (
                                      <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                  </select>
                                  {row.ownerId && <AtSign size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 opacity-50" />}
                                </div>
                              </td>
                              <td className="p-2 align-top">
                                <input 
                                  type="date"
                                  disabled={isLockedForUser}
                                  value={row.deadline}
                                  onChange={e => updateRow(row.id, 'deadline', e.target.value)}
                                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black outline-none focus:ring-2 focus:ring-emerald-500/10"
                                />
                              </td>
                              <td className="p-2 align-top">
                                <button onClick={() => handleRemoveRow(row.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {!isLockedForUser && (
                      <button onClick={handleAddRow} className="w-full py-4 border-t border-dashed border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest">
                        <Plus size={14} /> Append Record Row
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative h-full flex flex-col">
                    <textarea 
                      ref={classicNotesRef}
                      disabled={isLockedForUser} 
                      value={minutes} 
                      onChange={e => setMinutes(e.target.value)} 
                      className="flex-1 w-full p-8 outline-none resize-none transition-all text-sm leading-relaxed font-mono text-slate-700 bg-white placeholder:text-slate-300" 
                      placeholder="Document technical objectives. Use @Name for AI directive detection..." 
                    />
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100">
                      <Loader2 size={40} className="animate-spin text-emerald-600" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synthesizing Official Records...</p>
                    </div>
                  </div>
                )}
              </div>

              {newTasks.length > 0 && (
                <div className="bg-indigo-50/50 rounded-[28px] p-6 border border-indigo-100 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Draft Directives Generated</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">{newTasks.length} actionable items identified and queued for manifestation.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setNewTasks([])} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${isFullyFinalized ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isFullyFinalized ? 'Finalized' : 'Draft Protocol'}</span>
            </div>
            {meeting && (
               <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black uppercase text-slate-500">{finalizedBy.length} / {attendees.length} Verified</span>
               </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all">Exit Interface</button>
            {!isLockedForUser && <button onClick={handleFinalize} className="px-14 py-4 rounded-[24px] font-black text-white bg-slate-900 shadow-2xl flex items-center gap-3 hover:bg-emerald-600 transition-all active:scale-95 group"><ShieldCheck size={20} className="group-hover:scale-110 transition-transform" /> Sign & Verify Record</button>}
          </div>
        </div>
      </div>
    </div>
  );
};
