import {
  cancelAssignmentReminders,
  scheduleAssignmentReminders,
} from '@/lib/notifications';
import type { Assignment } from '@/types/assignment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'assignments';

const initialAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Project',
    className: 'CSC 341',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'High',
    type: 'Project',
    completed: false,
    notificationIds: [],
  },
  {
    id: '2',
    title: 'Database Report',
    className: 'CSC 453',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'Medium',
    type: 'Assignment',
    completed: false,
    notificationIds: [],
  },
];

type AssignmentsContextValue = {
  assignments: Assignment[];
  addAssignment: (
    title: string,
    className: string,
    dueDate: Date,
    priority: Assignment['priority'],
    type: Assignment['type']
  ) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
};

const AssignmentsContext = createContext<AssignmentsContextValue | null>(null);

export function AssignmentsProvider({ children }: { children: React.ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadAssignments = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        setAssignments(JSON.parse(saved));
      }

      setLoaded(true);
    };

    loadAssignments();
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments, loaded]);

  const addAssignment = async (
    title: string,
    className: string,
    dueDate: Date,
    priority: Assignment['priority'],
    type: Assignment['type']
  ) => {
    const notificationIds = await scheduleAssignmentReminders(
      title,
      className,
      dueDate
    );

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title,
      className,
      dueDate: dueDate.toISOString(),
      priority,
      type,
      completed: false,
      notificationIds,
    };

    setAssignments((prev) => [...prev, newAssignment]);
  };

  const toggleComplete = async (id: string) => {
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) {
      return;
    }

    if (!assignment.completed) {
      await cancelAssignmentReminders(assignment.notificationIds);
    }

    const notificationIds = assignment.completed
      ? await scheduleAssignmentReminders(
          assignment.title,
          assignment.className,
          new Date(assignment.dueDate)
        )
      : [];

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, completed: !a.completed, notificationIds } : a
      )
    );
  };

  const deleteAssignment = async (id: string) => {
    const assignment = assignments.find((a) => a.id === id);
    if (assignment) {
      await cancelAssignmentReminders(assignment.notificationIds);
    }

    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AssignmentsContext.Provider
      value={{ assignments, addAssignment, toggleComplete, deleteAssignment }}
    >
      {children}
    </AssignmentsContext.Provider>
  );
}

export function useAssignments() {
  const context = useContext(AssignmentsContext);

  if (!context) {
    throw new Error('useAssignments must be used within an AssignmentsProvider');
  }

  return context;
}
