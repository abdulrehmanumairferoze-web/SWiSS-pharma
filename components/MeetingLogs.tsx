
import React, { useState } from 'react';
import { Meeting, User, Department } from '../types';
import { MOCK_USERS, getDepartmentEmoji } from '../constants';
import { format, isSameMonth } from 'date-fns';
// Added Users and FileDown to the imports from lucide-react
import { FileText, Clock, MapPin, ChevronDown, ChevronUp, User as UserIcon, Lock, Crown, Paperclip, Download, ShieldCheck, Target, Calendar as CalendarIcon, Activity, Users, FileDown } from 'lucide-react';

interface MeetingLogsProps {
  meetings: Meeting[];
  currentUser: User;
}

interface MoMRow {
  id: string;
  discussion: string;
  resolution: string;
  ownerId: string;
  deadline: string;
}

export const MeetingLogs: React.FC<MeetingLogsProps> = ({ meetings, currentUser }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentMonthMeetings = meetings.filter(m => 
    m.attendees.includes(currentUser.id) && 
    isSameMonth(new Date(m.startTime), new Date())
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const getUserName = (id: string) => MOCK_USERS.find(u => u.id === id)?.name || 'Unknown';

  const downloadFile = (name: string, data: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = (meeting: Meeting) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const attendeesNames = MOCK_USERS.filter(u => meeting.attendees.includes(u.id)).map(u => u.name).join(', ');
    const finalizedNames = MOCK_USERS.filter(u => (meeting.finalizedBy || []).includes(u.id)).map(u => u.name).join(', ');

    let minutesHtml = '';
    const minutes = meeting.minutes || '';
    if (minutes.startsWith('[{"id":')) {
      const rows: MoMRow[] = JSON.parse(minutes);
      minutesHtml = `
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
                <td style="border: 1px solid #e2e8f0; padding: 12px;">${getUserName(r.ownerId)}</td>
                <td style="border: 1px solid #e2e8f0; padding: 12px;">${r.deadline || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      minutesHtml = `
        <div style="white-space: pre-wrap; font-family: monospace; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 20px; font-size: 13px;">
          ${minutes || 'No minutes recorded.'}
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>MoM - ${meeting.title}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #10b981; margin-top: 30px; border-left: 4px solid #10b981; padding-left: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Official Minutes of Meeting</h1>
            <p style="margin: 5px 0; color: #10b981; font-weight: bold;">SWISS Pharmaceuticals (Pvt) Ltd</p>
            <div class="meta">
              <div><strong>Subject:</strong> ${meeting.title}</div>
              <div><strong>Date:</strong> ${format(new Date(meeting.startTime), 'PPP')}</div>
              <div><strong>Department:</strong> ${meeting.department}</div>
              <div><strong>Location:</strong> ${meeting.location}</div>
            </div>
          </div>
          <div class="section-title">Verified Participants</div>
          <p style="font-size: 12px;">${attendeesNames}</p>
          <div class="section-title">Deliberations & Decisions</div>
          ${minutesHtml}
          <div class="section-title">Operational Approval</div>
          <p style="font-size: 11px; color: #64748b;">Digitally Authenticated by: ${finalizedNames || 'Pending Verification'}</p>
          <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center;">
            Document ID: ${meeting.id} | Generated on: ${format(new Date(), 'PPP p')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderMinutes = (minutes: string) => {
    try {
      if (minutes.startsWith('[{"id":')) {
        const rows: MoMRow[] = JSON.parse(minutes);
        return (
          <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-3xl bg-white shadow-inner">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Deliberation Point</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Corporate Resolution</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-5 text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{row.discussion}</td>
                    <td className="px-6 py-5">
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                        <p className="text-xs font-bold text-emerald-800 leading-relaxed">{row.resolution}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {row.ownerId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100">{getUserName(row.ownerId).charAt(0)}</div>
                          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-700">{getUserName(row.ownerId)}</span>
                        </div>
                      ) : <span className="text-[10px] italic text-slate-300 uppercase tracking-widest">N/A</span>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                        <CalendarIcon size={12} className="opacity-40" />
                        {row.deadline ? format(new Date(row.deadline), 'MMM dd, yyyy') : 'TBD'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    } catch (e) {}

    return (
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-inner">
        {minutes ? (
          <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed text-sm italic">
            {minutes}
          </div>
        ) : (
          <p className="text-slate-400 text-xs italic text-center py-4">No structured minutes recorded for this session.</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <Activity size={160} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Activity Journal</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em] mt-2">Governance Review: {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="text-right relative z-10 bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-inner">
          <p className="text-5xl font-black text-emerald-600 tracking-tighter">{currentMonthMeetings.length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Validated Sessions</p>
        </div>
      </div>

      <div className="space-y-6">
        {currentMonthMeetings.map((meeting) => {
          const isExpanded = expandedId === meeting.id;
          return (
            <div 
              key={meeting.id} 
              className={`bg-white rounded-[40px] border transition-all duration-500 overflow-hidden ${
                isExpanded ? 'border-emerald-200 shadow-2xl ring-8 ring-emerald-500/5 translate-y-[-4px]' : 'border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div 
                className="p-8 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shadow-xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{format(new Date(meeting.startTime), 'MMM')}</span>
                    <span className="text-2xl font-black text-white leading-none">{format(new Date(meeting.startTime), 'dd')}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{meeting.title}</h3>
                      {meeting.isFinalized && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg">
                           <ShieldCheck size={12} className="text-emerald-400" />
                           <span className="text-[9px] font-black uppercase tracking-widest">Locked</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                        <Clock size={14} className="text-indigo-400" />
                        {format(new Date(meeting.startTime), 'HH:mm')} - {format(new Date(meeting.endTime), 'HH:mm')}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                        <MapPin size={14} className="text-rose-400" />
                        {meeting.location}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-black uppercase tracking-widest">
                        <Crown size={14} className="animate-pulse" />
                        Lead: {getUserName(meeting.leaderId)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-2 mr-4">
                      {meeting.attendees.slice(0, 3).map(id => (
                        <div key={id} title={getUserName(id)} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">{getUserName(id).charAt(0)}</div>
                      ))}
                      {meeting.attendees.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[8px] font-black text-white">+{meeting.attendees.length - 3}</div>
                      )}
                   </div>
                   <span className="text-[10px] bg-slate-100 px-4 py-2 rounded-2xl font-black text-slate-600 uppercase tracking-widest border border-slate-200 shadow-sm">
                    {getDepartmentEmoji(meeting.department)} {meeting.department}
                  </span>
                  <div className={`w-12 h-12 rounded-[20px] transition-all flex items-center justify-center ${isExpanded ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-300'}`}>
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-8 pb-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="pt-8 border-t border-slate-100 space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 tracking-tight">Session Record Ledger</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Formal Governance Documentation</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleDownloadPDF(meeting)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 group"
                        >
                          <FileDown size={14} className="group-hover:scale-110 transition-transform" /> Export PDF
                        </button>
                        {meeting.attachments && meeting.attachments.length > 0 && (
                           <div className="flex gap-2">
                             {meeting.attachments.map((file, idx) => (
                               <button 
                                 key={idx}
                                 onClick={() => downloadFile(file.name, file.data)}
                                 className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm active:scale-95"
                               >
                                 <Download size={14} /> {file.name}
                               </button>
                             ))}
                           </div>
                        )}
                      </div>
                    </div>

                    {renderMinutes(meeting.minutes || '')}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                      <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <Target size={14} className="text-indigo-500" /> Operational Context
                        </h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-2 border-indigo-200 pl-6">
                          {meeting.description || 'No descriptive narrative provided for this session context.'}
                        </p>
                      </div>

                      <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <Users size={14} className="text-emerald-500" /> Verified Registry
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {meeting.attendees.map(id => {
                            const user = MOCK_USERS.find(u => u.id === id);
                            const isTheLeader = id === meeting.leaderId;
                            return (
                              <div key={id} className={`flex items-center gap-2 bg-white px-3 py-2 rounded-xl border shadow-sm ${isTheLeader ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-100'}`}>
                                <div className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 ${isTheLeader ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {user?.name.charAt(0)}
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 truncate">{user?.name} {isTheLeader && '👑'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {currentMonthMeetings.length === 0 && (
          <div className="bg-white rounded-[48px] border-2 border-dashed border-slate-100 py-32 flex flex-col items-center justify-center text-slate-300">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6 shadow-inner">
              <Clock size={48} strokeWidth={1} />
            </div>
            <p className="font-black text-xl tracking-tight text-slate-400">Idle Governance Feed</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-2">No validated sessions recorded for the active cycle.</p>
          </div>
        )}
      </div>
    </div>
  );
};
