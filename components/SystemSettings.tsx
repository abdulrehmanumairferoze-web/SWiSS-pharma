
import React, { useRef, useState, useMemo } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  RefreshCw, 
  Server, 
  Activity, 
  ShieldCheck, 
  HardDrive,
  Cpu,
  Globe,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Cloud,
  Terminal,
  Save,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

interface SystemSettingsProps {
  onExport: () => void;
  onImport: (data: string) => void;
  onReset