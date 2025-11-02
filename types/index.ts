export interface JobApplication {
  id: string;
  title: string;
  location: string;
  status: string;
  createdAt: string; // ISO date string
}

export interface Company {
  id: string;
  name: string;
  applications: JobApplication[];
  createdAt: string; // ISO date string
}

export type TimeFilter = 'all' | 'today' | 'this-week' | 'this-month' | 'older';

