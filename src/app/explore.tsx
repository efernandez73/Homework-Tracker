import MonthCalendar from '@/components/month-calendar';
import { useAssignments } from '@/context/assignments-context';
import { toDateKey } from '@/lib/date';
import { getWorkloadByDate, getWorkloadLevel } from '@/lib/workload';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

function formatDueDate(dueDate: Date) {
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDueDate = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.round(
    (startOfDueDate.getTime() - startOfToday.getTime()) / msPerDay
  );

  const time = dueDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (daysLeft === 0) return `Due Today • ${time}`;
  if (daysLeft === 1) return `Due Tomorrow • ${time}`;
  if (daysLeft > 1 && daysLeft <= 7) return `In ${daysLeft} Days • ${time}`;
  if (daysLeft < 0) return `Overdue • ${time}`;

  return `${dueDate.toLocaleDateString()} • ${time}`;
}

export default function CalendarScreen() {
  const { assignments, toggleComplete, deleteAssignment } = useAssignments();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const markedDatePriorities = useMemo(() => {
    const priorities = new Map<string, 'Low' | 'Medium' | 'High'>();

    assignments.forEach((assignment) => {
      if (assignment.completed) {
        return;
      }

      const dateKey = toDateKey(new Date(assignment.dueDate));

      priorities.set(dateKey, assignment.priority);
    });

    return priorities;
  }, [assignments]);

  const assignmentsForSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const key = toDateKey(selectedDate);
    return assignments
      .filter((a) => toDateKey(new Date(a.dueDate)) === key)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [assignments, selectedDate]);

  const workloadByDate = useMemo(() => getWorkloadByDate(assignments), [assignments]);

  const selectedDateWorkloadLevel = useMemo(() => {
    if (!selectedDate) {
      return 'Light';
    }

    return getWorkloadLevel(workloadByDate.get(toDateKey(selectedDate)) ?? 0);
  }, [selectedDate, workloadByDate]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <MonthCalendar
        month={month}
        selectedDate={selectedDate}
        markedDatePriorities={markedDatePriorities}
        markedDateWorkload={workloadByDate}
        onSelectDate={setSelectedDate}
        onChangeMonth={setMonth}
      />

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>
          {selectedDate
            ? selectedDate.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            : 'Select a date'}
        </Text>

        {selectedDateWorkloadLevel !== 'Light' && (
          <View
            style={[
              styles.workloadBadge,
              selectedDateWorkloadLevel === 'Heavy'
                ? styles.workloadBadgeHeavy
                : styles.workloadBadgeModerate,
            ]}
          >
            <Text style={styles.workloadBadgeText}>
              {selectedDateWorkloadLevel} workload
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={assignmentsForSelectedDate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No assignments due this day.</Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              item.priority === 'High'
                ? styles.highCard
                : item.priority === 'Medium'
                ? styles.mediumCard
                : styles.lowCard,
            ]}
          >
            <View style={styles.assignmentTypeHeader}>
              <Ionicons
                name={
                  (item.type || 'Assignment') === 'Project'
                    ? 'folder'
                    : (item.type || 'Assignment') === 'Quiz'
                    ? 'help-circle'
                    : 'document-text'
                }
                size={18}
                color="#2563eb"
              />

              <Text style={styles.assignmentTypeHeaderText}>
                {(item.type || 'Assignment').toUpperCase()}
              </Text>
            </View>

            <Text
              style={[
                styles.assignmentTitle,
                item.completed && { textDecorationLine: 'line-through' },
              ]}
            >
              {item.title}
            </Text>

            <Text style={styles.classNameText}>{item.className}</Text>

            <View style={styles.dueDateRow}>
              <Ionicons name="calendar-outline" size={18} color="#2563eb" />
              <Text style={styles.assignmentDue}>
                {formatDueDate(new Date(item.dueDate))}
              </Text>
            </View>

            <View
              style={[
                styles.priorityBadge,
                item.priority === 'High'
                  ? styles.highBadge
                  : item.priority === 'Medium'
                  ? styles.mediumBadge
                  : styles.lowBadge,
              ]}
            >
              <Text style={styles.priorityBadgeText}>
                {item.priority.toUpperCase()}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.completeButton}
                onPress={() => toggleComplete(item.id)}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name={item.completed ? 'arrow-undo' : 'checkmark'}
                    size={22}
                    color="white"
                  />
                  <Text style={styles.buttonText}>
                    {item.completed ? 'Undo' : 'Complete'}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => deleteAssignment(item.id)}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color="white"
                  />
                  <Text style={styles.buttonText}>
                    Delete
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#f4f6f8',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  workloadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  workloadBadgeModerate: {
    backgroundColor: '#f59e0b',
  },

  workloadBadgeHeavy: {
    backgroundColor: '#ef4444',
  },

  workloadBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  listContent: {
    paddingBottom: 24,
  },

  emptyText: {
    color: '#666',
    fontSize: 14,
  },

  card: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 18,
    marginBottom: 16,
  },

  assignmentTitle: {
  fontSize: 26,
  fontWeight: '800',
  color: '#111827',
  },
  
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },

  completeButton: {
  backgroundColor: '#22c55e',
  paddingVertical: 12,
  paddingHorizontal: 18,
  borderRadius: 10,
  },

  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  highCard: {
  borderLeftWidth: 6,
  borderLeftColor: '#ef4444',
  },

  mediumCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#f59e0b',
  },

  lowCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#22c55e',
  },

  assignmentTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  assignmentTypeHeaderText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 1,
  },

  classNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 14,
  },

  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 14,
  },

  highBadge: {
    backgroundColor: '#ef4444',
  },

  mediumBadge: {
    backgroundColor: '#f59e0b',
  },

  lowBadge: {
    backgroundColor: '#22c55e',
  },

  priorityBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  buttonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
  },

  dueDateRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 14,
  marginBottom: 4,
  },

  assignmentDue: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
});