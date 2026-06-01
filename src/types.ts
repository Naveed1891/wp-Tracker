export interface Website {
  id: string;
  name: string;
  url: string;
  hostingProvider?: string | null;
  serverDetails?: string | null;
  wpVersion?: string | null;
  phpVersion?: string | null;
  dbVersion?: string | null;
  notes?: string | null;
  status: string;
}

export interface ChangeLog {
  id: string;
  websiteId: string;
  date: string;
  title: string;
  description: string;
  changeType: string;
  priority: string;
  status: string;
  timeSpent?: number | null;
  tags?: string | null;
  notes?: string | null;
  website?: Website;
}

export interface Task {
  id: string;
  websiteId?: string | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate?: string | null;
  notes?: string | null;
  website?: Website;
}

export interface Issue {
  id: string;
  websiteId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  resolutionNotes?: string | null;
  dateReported: string;
  dateResolved?: string | null;
  website?: Website;
}

export interface MaintenanceLog {
  id: string;
  websiteId: string;
  date: string;
  activity: string;
  details: string;
  timeSpent?: number | null;
  outcome: string;
  notes?: string | null;
  website?: Website;
}

export interface Stats {
  websites: number;
  updates: number;
  openTasks: number;
  openIssues: number;
}
