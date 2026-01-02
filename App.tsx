
import React, { useState, useEffect } from 'react';
import { User, Meeting, Task, Role, TaskStatus, Department, Team, Region, AuditLog, ActionType, MeetingType, Recurrence, TaskPriority, AppNotification, NotificationType } from './types';
import { MOCK_USERS, DEPARTMENTS, getDepartmentEmoji } from './constants';
import { Layout } from './components/Layout';
import { CalendarView } from './components/Calendar';
import { MeetingModal } from './components/MeetingModal';
import { TaskBoard } from './components/TaskBoard';
import { MeetingLogs } from './components/MeetingLogs';
import { TaskModal } from './components/TaskModal';
import { AuditTrail } from './components/AuditTrail';
import { ReminderSystem } from './components/ReminderSystem';
import { Login } from './components/Login';
import { EmployeeModal } from './components/EmployeeModal';
import { format, addMinutes, addDays, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { 
  Users, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  Building, 
  Plus, 
  Activity, 
  Filter, 
  Search, 
  UserCog, 
  Globe, 
  Layers,
  MapPin,
  Stethoscope,
  Briefcase,
  Zap,
  LayoutDashboard,
  Target,
  Crown,
  SearchCheck,
  UserPen,
  BadgePlus,
  UserPlus
} from 'lucide-react';

// --- ENHANCED EXAMPLE DATA GENERATOR ---

const generateEnterpriseMeetings = (): Meeting[] => {
  const meetings: Meeting[] = [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 1. Hero Example: Strategic Meeting for Naeem (MD)
  const strategicDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
  meetings.push({
    id: 'm-strat-naeem',
    title: 'Q4 Export & Regional Expansion Strategy',
    description: 'Critical board session to review target progress in Region 1, 2, and 3. Led by MD Muhammad Naeem.',
    startTime: strategicDate.toISOString(),
    endTime: addMinutes(strategicDate, 120).toISOString(),
    location: 'Sovereign Boardroom - 4th Floor',
    department: Department.Executive,
    team: Team.None,
    region: Region.None,
    organizerId: 'u_md', // Naeem
    leaderId: 'u_md',
    attendees: ['u_md', 'u1', 'u100', 's_hod_1', 'fin_hod'],
    finalizedBy: ['u_md', 'u1'],
    rejectedBy: {},
    minutes: `Session commenced at 10:00 AM. 
    
Objectives: 
1. Review Export Sales progress toward 950Mn target.
2. Finalize New Product Pipeline (Pharma & Nutra).
3. Strategy for Market Opening in Ivory Coast and Cameroon.

Key Discussions: 
- Export sales in R1 are trending at 105% of target, but R3 (PKR 233Mn) requires marketing intervention.
- @Zaid Khan assigned to lead the Ivory Coast regulatory filing.
- @James Wilson confirmed budget for the Warehouse project completion.

Resolutions: 
- Approved expedited registration for 4 new Pharma products.
- Confirmed ISO 17025 certification timeline.`,
    isCustomRoom: true,
    type: MeetingType.Strategic,
    recurrence: Recurrence.Monthly,
    isFinalized: true
  });

  // 2. Production Example: Operational Sync
  const prodDate = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0), -1);
  meetings.push({
    id: 'm-prod-safety',
    title: 'Line B Sterilization Efficiency Audit',
    description: 'Technical sync following deviation report on Line B.',
    startTime: prodDate.toISOString(),
    endTime: addMinutes(prodDate, 45).toISOString(),
    location: 'Production Hub - Level 2',
    department: Department.Production,
    team: Team.None,
    region: Region.None,
    organizerId: 'prod_hod',
    leaderId: 'prod_hod',
    attendees: ['prod_hod', 'prod_1', 'u_md'],
    finalizedBy: ['prod_hod', 'prod_1', 'u_md'],
    rejectedBy: {},
    minutes: `Audit successful. Sterilization modules verified.
    
Actions:
- @Eli Whitney to perform deep-clean protocol audit by Friday.
- MD requested 95% production plan adherence report.`,
    isCustomRoom: false,
    type: MeetingType.Standard,
    recurrence: Recurrence.Daily,
    isFinalized: true
  });

  // 3. Filler Meetings for variety
  const deptTasks: Record<Department, string[]> = {
    [Department.Executive]: ['Global Roadmap', 'Operational Audit', 'Investor Relations'],
    [Department.Finance]: ['Quarterly Audit', 'Tax Compliance', 'Budget Allocation'],
    [Department.Engineering]: ['System Architecture', 'Sprint Planning', 'HVAC Maintenance'],
    [Department.BusinessDevelopment]: ['Market Analysis', 'Lead Generation', 'Partnership Outreach'],
    [Department.Regulatory]: ['FDA Filing Prep', 'EU-MDR Review', 'Compliance Audit'],
    [Department.RD]: ['Phase III Results', 'Compound Synthesis', 'Lab Protocol Sync'],
    [Department.Sales]: ['Pipeline Review', 'Target Realignment', 'Performance Coaching'],
    [Department.Marketing]: ['Campaign Launch', 'Digital Strategy', 'Brand Identity'],
    [Department.Production]: ['Line A Efficiency', 'Line B Deviation', 'Sterilization Sync'],
    [Department.SupplyChain]: ['Logistics Sync', 'Inventory Control', 'Warehouse Audit'],
    [Department.QA]: ['Validation Study', 'SOP Refresh', 'Root Cause Analysis'],
    [Department.QC]: ['Batch Sample Test', 'Purity Analysis', 'Chromatography'],
    [Department.Export]: ['Trade Compliance', 'Regional Sync: R1', 'Customs Logistics'],
    [Department.IT]: ['Cloud Migration', 'Cybersecurity Patch', 'Data Integrity']
  };

  DEPARTMENTS.forEach(dept => {
    const departmentUsers = MOCK_USERS.filter(u => u.department === dept);
    const hod = departmentUsers.find(u => u.role === Role.HOD) || departmentUsers[0] || MOCK_USERS[0];
    
    for (let i = 0; i < 2; i++) {
      const day = daysInMonth[Math.floor(Math.random() * daysInMonth.length)];
      if (isSameDay(day, strategicDate)) continue;

      const hour = 9 + Math.floor(Math.random() * 8); 
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);
      const end = addMinutes(start, 60);

      meetings.push({
        id: `m-${dept}-${i}`,
        title: deptTasks[dept][i % deptTasks[dept].length],
        description: `Scheduled operational sync for the ${dept} division.`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        location: `Meeting Room ${i + 1}`,
        department: dept,
        team: Team.None,
        region: Region.None,
        organizerId: hod.id,
        leaderId: hod.id,
        attendees: [hod.id],
        finalizedBy: [],
        rejectedBy: {},
        minutes: `Focusing on ${deptTasks[dept][i % deptTasks[dept].length].toLowerCase()} objectives.`,
        isCustomRoom: false,
        type: MeetingType.Standard,
        recurrence: Recurrence.None,
        isFinalized: false 
      });
    }
  });

  return meetings;
};

const INITIAL_MEETINGS = generateEnterpriseMeetings();

const INITIAL_TASKS: Task[] = [
  // Muhammad Naeem (MD) tasks
  {
    id: 't-naeem-1',
    title: 'Approve Region 3 Marketing Strategy',
    description: 'Review and approve the new marketing collateral for R3 expansion to meet the PKR 233Mn target.',
    assignedToId: 'u_md',
    assignedById: 'u1',
    dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    status: TaskStatus.InProgress,
    priority: TaskPriority.Q1,
    createdAt: addDays(new Date(), -1).toISOString()
  },
  {
    id: 't-naeem-2',
    title: 'Sign Off: Nutraceutical Facility Registration',
    description: 'Review the final audit report for the Nutra facility before submission to regulators.',
    assignedToId: 'u_md',
    assignedById: 'u100',
    dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    status: TaskStatus.Approved,
    priority: TaskPriority.Q1,
    createdAt: addDays(new Date(), -2).toISOString()
  },
  // Staff Performance Examples (Junior/Senior/MSD)
  {
    id: 't-staff-zaid-1',
    title: 'Ivory Coast Regulatory Filing',
    description: 'Prepare all necessary documentation for the expansion into Ivory Coast as part of the market expansion KPI.',
    assignedToId: 's_a_msd1', // Zaid Khan (MSD)
    assignedById: 'u_md',
    meetingId: 'm-strat-naeem',
    dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    status: TaskStatus.InProgress,
    priority: TaskPriority.Q1,
    createdAt: addDays(new Date(), -1).toISOString()
  },
  {
    id: 't-staff-eli-1',
    title: 'Perform Deep-Clean Protocol Audit',
    description: 'Execute the newly approved sterilization deep-clean protocol on Line B.',
    assignedToId: 'prod_1', // Eli Whitney (Junior)
    assignedById: 'prod_hod',
    meetingId: 'm-prod-safety',
    dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    status: TaskStatus.Completed,
    priority: TaskPriority.Q2,
    createdAt: addDays(new Date(), -1).toISOString()
  },
  {
    id: 't-staff-alice-1',
    title: 'Quarterly Tax Compliance Report',
    description: 'Compile the financial data for the Q4 tax compliance submission.',
    assignedToId: 'fin_1', // Alice Wong (Junior)
    assignedById: 'fin_hod',
    dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    status: TaskStatus.PendingApproval,
    priority: TaskPriority.Q2,
    createdAt: addDays(new Date(), -2).toISOString()
  },
  {
    id: 't-staff-bob-1',
    title: 'Line B Maintenance Audit',
    description: 'Check all sensors and valves on Line B to ensure 95% production uptime.',
    assignedToId: 'fin_2', // Bob Myers (Junior)
    assignedById: 'fin_hod',
    dueDate: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
    status: TaskStatus.Rejected,
    priority: TaskPriority.Q1,
    rejectionReason: 'Calibration kit unavailable until Monday.',
    createdAt: addDays(new Date(), -3).toISOString()
  }
];

const INITIAL_LOGS: AuditLog[] = [
  { id: 'l-log-1', timestamp: new Date().toISOString(), userId: 'u_md', action: ActionType.MeetingFinalized, details: 'MD finalized Strategic Council Record for Q4 expansion.', department: Department.Executive },
  { id: 'l-log-2', timestamp: addDays(new Date(), -1).toISOString(), userId: 'u1', action: ActionType.TaskAssigned, details: 'CEO assigned Q1 task "Approve Region 3 Marketing Strategy" to MD.', department: Department.Executive },
  { id: 'l-log-3', timestamp: addDays(new Date(), -1).toISOString(), userId: 'prod_hod', action: ActionType.TaskStatusUpdate, details: 'Task "Perform Deep-Clean Protocol Audit" marked COMPLETED by Eli Whitney.', department: Department.Production }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'tasks' | 'directory' | 'logs' | 'activity' | 'dept-calendar' | 'exec-sync'>('dashboard');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [designations, setDesignations] = useState<string[]>(Object.values(Role));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All');
  const [searchDirectory, setSearchDirectory] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [newDesignationName, setNewDesignationName] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<User | undefined>();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | undefined>();
  const [initialDate, setInitialDate] = useState<Date | undefined>();

  useEffect(() => {
    const savedMeetings = localStorage.getItem('pharma_v6_meetings');
    const savedTasks = localStorage.getItem('pharma_v6_tasks');
    const savedLogs = localStorage.getItem('pharma_v6_logs');
    const savedUser = localStorage.getItem('pharma_v6_user');
    const savedNotifs = localStorage.getItem('pharma_v6_notifs');
    const savedUsers = localStorage.getItem('pharma_v6_users_list');
    const savedDesignations = localStorage.getItem('pharma_v6_designations');
    
    if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
    else setMeetings(INITIAL_MEETINGS);

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    else setTasks(INITIAL_TASKS);

    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    else setAuditLogs(INITIAL_LOGS);

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else setUsers(MOCK_USERS);

    if (savedDesignations) setDesignations(JSON.parse(savedDesignations));

    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    } else {
      const naeem = MOCK_USERS.find(u => u.id === 'u_md');
      if (naeem) {
        addNotification(
            naeem.id,
            'New Priority Assignment', 
            'MD Muhammad Naeem has assigned you a Q1 task: "Ivory Coast Regulatory Filing"', 
            NotificationType.Task, 
            'tasks'
        );
      }
    }

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      const naeem = MOCK_USERS.find(u => u.id === 'u_md');
      if (naeem) {
        setCurrentUser(naeem);
        localStorage.setItem('pharma_v6_user', JSON.stringify(naeem));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pharma_v6_meetings', JSON.stringify(meetings));
    localStorage.setItem('pharma_v6_tasks', JSON.stringify(tasks));
    localStorage.setItem('pharma_v6_logs', JSON.stringify(auditLogs));
    localStorage.setItem('pharma_v6_notifs', JSON.stringify(notifications));
    localStorage.setItem('pharma_v6_users_list', JSON.stringify(users));
    localStorage.setItem('pharma_v6_designations', JSON.stringify(designations));
    if (currentUser) {
      localStorage.setItem('pharma_v6_user', JSON.stringify(currentUser));
    }
  }, [meetings, tasks, auditLogs, currentUser, notifications, users, designations]);

  const addAuditLog = (action: ActionType, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      action,
      details,
      department: currentUser.department
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (recipientId: string, title: string, message: string, type: NotificationType, linkTo?: 'tasks' | 'calendar' | 'logs', referenceId?: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      recipientId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      linkTo,
      referenceId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setDeptFilter(user.department);
    addAuditLog(ActionType.Login, `Authenticated session for ${user.name} (${user.role}).`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pharma_v6_user');
    setActiveTab('dashboard');
  };

  const handleAddDesignation = () => {
    if (!newDesignationName.trim()) return;
    if (designations.includes(newDesignationName)) return;
    setDesignations(prev => [...prev, newDesignationName.trim()]);
    addAuditLog(ActionType.DesignationAdded, `Chairman created new designation: ${newDesignationName}`);
    setNewDesignationName('');
  };

  const handleUpdateEmployee = (updatedEmployee: User) => {
    const exists = users.find(u => u.id === updatedEmployee.id);
    if (exists) {
      setUsers(prev => prev.map(u => u.id === updatedEmployee.id ? updatedEmployee : u));
      addAuditLog(ActionType.PersonnelUpdate, `Chairman updated records for ${updatedEmployee.name}`);
    } else {
      setUsers(prev => [updatedEmployee, ...prev]);
      addAuditLog(ActionType.PersonnelUpdate, `Chairman added new personnel: ${updatedEmployee.name} (${updatedEmployee.role})`);
    }
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveMeeting = (meetingData: Partial<Meeting>, newTasks?: Partial<Task>[]) => {
    const newMeeting: Meeting = {
      id: selectedMeeting?.id || Math.random().toString(36).substr(2, 9),
      title: meetingData.title!,
      description: meetingData.description || '',
      startTime: meetingData.startTime!,
      endTime: meetingData.endTime!,
      location: meetingData.location || '',
      department: meetingData.department!,
      team: meetingData.team || Team.None,
      region: meetingData.region || Region.None,
      organizerId: meetingData.organizerId || currentUser!.id,
      leaderId: meetingData.leaderId || meetingData.organizerId || currentUser!.id,
      attendees: meetingData.attendees || [],
      finalizedBy: meetingData.finalizedBy || [],
      rejectedBy: meetingData.rejectedBy || {},
      minutes: meetingData.minutes || '',
      isCustomRoom: meetingData.isCustomRoom || false,
      type: meetingData.type || MeetingType.Standard,
      recurrence: meetingData.recurrence || Recurrence.None,
      isFinalized: meetingData.isFinalized || false
    };

    if (selectedMeeting) {
      setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? newMeeting : m));
      if (newMeeting.isFinalized && !selectedMeeting.isFinalized) {
        addAuditLog(ActionType.MeetingFinalized, `OFFICIAL RECORD LOCKED: "${newMeeting.title}"`);
      }
    } else {
      setMeetings(prev => [...prev, newMeeting]);
      addAuditLog(ActionType.MeetingScheduled, `Scheduled: "${newMeeting.title}"`);
    }

    if (newTasks && newTasks.length > 0) {
      const tasksToCreate: Task[] = newTasks.map(t => ({
        id: Math.random().toString(36).substr(2, 9),
        title: t.title!,
        description: t.description || '',
        assignedToId: t.assignedToId!,
        assignedById: currentUser!.id,
        meetingId: newMeeting.id,
        dueDate: t.dueDate!,
        priority: t.priority || TaskPriority.Q2,
        recurrence: t.recurrence || Recurrence.None,
        status: TaskStatus.PendingApproval,
        createdAt: new Date().toISOString()
      }));
      setTasks(prev => [...prev, ...tasksToCreate]);

      tasksToCreate.forEach(task => {
        addNotification(
          task.assignedToId,
          'Directive Received',
          `New ${task.priority} task "${task.title}" requires your intake acknowledgment.`,
          NotificationType.Task,
          'tasks'
        );
      });
    }

    setIsModalOpen(false);
    setSelectedMeeting(undefined);
  };

  const handleSaveStandaloneTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: taskData.title!,
      description: taskData.description || '',
      assignedToId: taskData.assignedToId!,
      assignedById: currentUser!.id,
      dueDate: taskData.dueDate!,
      priority: taskData.priority || TaskPriority.Q2,
      recurrence: taskData.recurrence || Recurrence.None,
      attachments: taskData.attachments || [],
      status: TaskStatus.PendingApproval,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    
    addNotification(
      newTask.assignedToId,
      'Direct Directive Issued',
      `${currentUser?.name} has assigned you a ${newTask.priority} task. Explicit intake required.`,
      NotificationType.Task,
      'tasks'
    );

    addAuditLog(ActionType.TaskAssigned, `Direct task assigned to ${users.find(u => u.id === newTask.assignedToId)?.name}`);
    setIsTaskModalOpen(false);
    setSelectedAssignee(undefined);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus, details?: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (status === TaskStatus.Completed && task.status !== TaskStatus.Completed) {
      const assignee = users.find(u => u.id === task.assignedToId);
      addNotification(
        task.assignedById,
        'Task Finalized',
        `"${task.title}" has been marked as COMPLETED by ${assignee?.name || 'the assignee'}.`,
        NotificationType.Task,
        'tasks'
      );
    }

    if (status === TaskStatus.Approved && task.status === TaskStatus.PendingApproval) {
      addNotification(
        task.assignedById,
        'Task Intake Confirmed',
        `${users.find(u => u.id === task.assignedToId)?.name} has acknowledged and accepted responsibility for "${task.title}".`,
        NotificationType.Task,
        'tasks'
      );
    }

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status, 
          rejectionReason: details?.reason || t.rejectionReason,
          completionMessage: details?.message || t.completionMessage,
          completionAttachments: details?.attachments || t.completionAttachments
        };
      }
      return t;
    }));
    addAuditLog(ActionType.TaskStatusUpdate, `Status updated for task ID ${taskId.slice(0, 5)}... to ${status}`);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addAuditLog(ActionType.TaskDeleted, `REMOVED FROM BOARD: Completed task "${taskToDelete.title}" was purged from active manifest.`);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.recipientId === currentUser.id ? { ...n, read: true } : n));
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const isExecutive = currentUser.role === Role.Chairman || currentUser.role === Role.CEO || currentUser.role === Role.COO || currentUser.role === Role.MD || currentUser.role === Role.CFO;
  const isChairman = currentUser.role === Role.Chairman;
  const isHOD = currentUser.role === Role.HOD;
  const canSeeAuditTrail = currentUser.role === Role.Chairman || currentUser.role === Role.CEO;

  const userNotifications = notifications.filter(n => n.recipientId === currentUser.id);

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onSwitchUser={handleLogin}
      notifications={userNotifications}
      onClearNotification={clearNotification}
      onMarkNotificationsRead={markNotificationsRead}
      onQuickTask={() => { setSelectedAssignee(undefined); setIsTaskModalOpen(true); }}
      onQuickMeeting={() => { setInitialDate(new Date()); setSelectedMeeting(undefined); setIsModalOpen(true); }}
    >
      <ReminderSystem meetings={meetings} userId={currentUser.id} onViewMeeting={(m) => { setSelectedMeeting(m); setIsModalOpen(true); }} />
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-700">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { label: 'Responsibilities', value: tasks.filter(t => t.assignedToId === currentUser.id && t.status !== TaskStatus.Completed).length, icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Schedule Today', value: meetings.filter(m => m.attendees.includes(currentUser.id) && isSameDay(new Date(m.startTime), new Date())).length, icon: CalendarIcon, color: 'text-rose-600 bg-rose-50' },
                { label: 'Critical (Q1)', value: tasks.filter(t => t.priority === TaskPriority.Q1 && t.status !== TaskStatus.Completed).length, icon: Zap, color: 'text-rose-600 bg-rose-50' },
                { label: 'Audit Events', value: auditLogs.length, icon: Activity, color: 'text-amber-600 bg-amber-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-50 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Target size={24} className="text-emerald-600" /> Operational Adherence</h3>
                    </div>
                    <div className="p-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                       {[
                         { label: 'Q1 - Critical', val: tasks.filter(t => t.priority === TaskPriority.Q1 && t.status !== TaskStatus.Completed).length, color: 'bg-rose-500' },
                         { label: 'Q2 - Important', val: tasks.filter(t => t.priority === TaskPriority.Q2 && t.status !== TaskStatus.Completed).length, color: 'bg-amber-500' },
                         { label: 'Q3 - Standard', val: tasks.filter(t => t.priority === TaskPriority.Q3 && t.status !== TaskStatus.Completed).length, color: 'bg-emerald-500' },
                       ].map(p => (
                         <div key={p.label} className="space-y-4">
                            <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span><span className="text-2xl font-black">{p.val}</span></div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${p.color} transition-all duration-1000`} style={{ width: `${Math.min((p.val / Math.max(1, tasks.length)) * 100, 100)}%` }}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
              
              <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl h-fit">
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Activity size={20} className="text-emerald-400" /> Live Audit Trail</h3>
                 <div className="space-y-4">
                    {auditLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="border-l-2 border-emerald-500/30 pl-4 py-1">
                        <p className="text-[9px] text-emerald-400 font-black uppercase">{log.action}</p>
                        <p className="text-xs text-white/80 font-medium truncate">{log.details}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
      {activeTab === 'calendar' && <CalendarView meetings={meetings.filter(m => m.attendees.includes(currentUser.id))} onAddMeeting={(date) => { setInitialDate(date); setSelectedMeeting(undefined); setIsModalOpen(true); }} onViewMeeting={(m) => { setSelectedMeeting(m); setIsModalOpen(true); }} />}
      {activeTab === 'exec-sync' && isExecutive && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <CalendarView meetings={meetings.filter(m => m.department === Department.Executive)} onAddMeeting={(date) => { setInitialDate(date); setSelectedMeeting(undefined); setIsModalOpen(true); }} onViewMeeting={(m) => { setSelectedMeeting(m); setIsModalOpen(true); }} />
        </div>
      )}
      {activeTab === 'dept-calendar' && (
        <div className="space-y-6">
          {isExecutive && (
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm overflow-x-auto custom-scrollbar">
               <div className="flex flex-wrap gap-2 min-w-max pb-2">
                  <button 
                    onClick={() => setDeptFilter('All')} 
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black border uppercase tracking-widest transition-all ${deptFilter === 'All' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-600'}`}
                  >
                    Global View 🌍
                  </button>
                  <div className="w-px h-8 bg-slate-100 mx-2 self-center"></div>
                  {DEPARTMENTS.map(d => (
                    <button 
                      key={d} 
                      onClick={() => setDeptFilter(d)} 
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black border uppercase tracking-widest transition-all ${deptFilter === d ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-800'}`}
                    >
                      {getDepartmentEmoji(d)} {d}
                    </button>
                  ))}
               </div>
            </div>
          )}
          <CalendarView 
            meetings={meetings.filter(m => {
              if (isExecutive) {
                return deptFilter === 'All' ? true : m.department === deptFilter;
              }
              // HODs and Juniors are strictly locked to their own department only
              return m.department === currentUser.department;
            })} 
            onAddMeeting={(date) => { setInitialDate(date); setSelectedMeeting(undefined); setIsModalOpen(true); }} 
            onViewMeeting={(m) => { setSelectedMeeting(m); setIsModalOpen(true); }} 
          />
        </div>
      )}
      {activeTab === 'tasks' && <TaskBoard tasks={tasks} meetings={meetings} currentUser={currentUser} onStatusChange={updateTaskStatus} onDeleteTask={handleDeleteTask} onAddTask={() => { setSelectedAssignee(undefined); setIsTaskModalOpen(true); }} />}
      {activeTab === 'logs' && <MeetingLogs meetings={meetings} currentUser={currentUser} />}
      {activeTab === 'activity' && canSeeAuditTrail && <AuditTrail logs={auditLogs} tasks={tasks} meetings={meetings} />}
      {activeTab === 'directory' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="bg-white p-4 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 lg:gap-8">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                 <input 
                    type="text"
                    placeholder="Search personnel..."
                    value={searchDirectory}
                    onChange={(e) => setSearchDirectory(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all"
                 />
              </div>
              <div className="flex bg-slate-100 p-2 rounded-[28px] border border-slate-200 shadow-inner overflow-x-auto custom-scrollbar max-w-full">
                 <button 
                   onClick={() => setDeptFilter('All')} 
                   className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${deptFilter === 'All' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   Everyone
                 </button>
                 {DEPARTMENTS.map(d => (
                   <button 
                     key={d} 
                     onClick={() => setDeptFilter(d)} 
                     className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${deptFilter === d ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {d}
                   </button>
                 ))}
              </div>
           </div>

           {isChairman && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Designation Portal */}
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] flex flex-col justify-between gap-6 shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                         <BadgePlus size={24} />
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-emerald-900 tracking-tight leading-none">Expand Designations</h4>
                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Sovereign Authority Protocol</p>
                      </div>
                   </div>
                   <div className="flex w-full gap-3">
                      <input 
                       type="text" 
                       value={newDesignationName}
                       onChange={e => setNewDesignationName(e.target.value)}
                       placeholder="Enter new role title..."
                       className="flex-1 px-5 py-3 rounded-xl border border-emerald-200 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none bg-white"
                      />
                      <button 
                       onClick={handleAddDesignation}
                       className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                      >
                       Add Role
                      </button>
                   </div>
                </div>

                {/* Hiring Portal */}
                <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[32px] flex flex-col justify-between gap-6 shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                         <UserPlus size={24} />
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-indigo-900 tracking-tight leading-none">Register New Staff</h4>
                         <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Corporate Expansion Portal</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => { setEditingEmployee(undefined); setIsEmployeeModalOpen(true); }}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                   >
                    <Plus size={16} /> Hire New Personnel
                   </button>
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
              {users.filter(u => {
                const matchesSearch = u.name.toLowerCase().includes(searchDirectory.toLowerCase()) || 
                                     u.department.toLowerCase().includes(searchDirectory.toLowerCase()) || 
                                     u.role.toLowerCase().includes(searchDirectory.toLowerCase());
                const matchesDept = deptFilter === 'All' ? true : u.department === deptFilter;
                return matchesSearch && matchesDept;
              }).map(u => (
                <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all relative overflow-hidden h-full">
                   {isChairman && (
                      <button 
                        onClick={() => { setEditingEmployee(u); setIsEmployeeModalOpen(true); }}
                        className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 z-10"
                        title="Edit Personnel"
                      >
                        <UserPen size={16} />
                      </button>
                   )}
                   <div className="absolute top-0 right-0 p-4 opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <SearchCheck size={16} className="text-emerald-500" />
                   </div>
                   <div className="w-20 h-20 rounded-[32px] bg-slate-50 text-slate-900 flex items-center justify-center text-3xl font-black mb-6 group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                      {u.name.charAt(0)}
                   </div>
                   <h3 className="text-lg font-black text-slate-900 leading-tight">{u.name}</h3>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2">{u.role}</p>
                   <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-emerald-50 transition-colors">
                      <span className="text-[11px] grayscale group-hover:grayscale-0 transition-all">{getDepartmentEmoji(u.department)}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-700">{u.department}</span>
                   </div>
                   
                   <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter mt-6 mb-8">{u.email}</p>
                   
                   <div className="mt-auto w-full">
                   {(isExecutive || isHOD) && u.id !== currentUser.id && (
                     <button 
                        onClick={() => { setSelectedAssignee(u); setIsTaskModalOpen(true); }} 
                        className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-emerald-500/20 active:scale-95"
                     >
                        <Plus size={16} strokeWidth={3} /> Issue Directive
                     </button>
                   )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
      {isModalOpen && <MeetingModal currentUser={currentUser} initialDate={initialDate || new Date()} meeting={selectedMeeting} onClose={() => { setIsModalOpen(false); setSelectedMeeting(undefined); }} onSave={handleSaveMeeting} tasks={tasks} />}
      {isTaskModalOpen && <TaskModal assignee={selectedAssignee} currentUser={currentUser} onClose={() => { setIsTaskModalOpen(false); setSelectedAssignee(undefined); }} onSave={handleSaveStandaloneTask} />}
      {isEmployeeModalOpen && (
        <EmployeeModal 
          employee={editingEmployee || undefined} 
          designations={designations}
          onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }}
          onSave={handleUpdateEmployee}
        />
      )}
    </Layout>
  );
};

export default App;
