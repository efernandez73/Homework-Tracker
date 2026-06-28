export type Assignment = {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  type: 'Assignment' | 'Quiz' | 'Project';
  completed: boolean;
  notificationIds?: string[];
};