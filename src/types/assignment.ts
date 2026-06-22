export type Assignment = {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  notificationIds: string[];
};
