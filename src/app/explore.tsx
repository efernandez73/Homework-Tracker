import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAssignments } from '@/context/assignments-context';
import MonthCalendar, { toDateKey } from '@/components/month-calendar';

export default function CalendarScreen() {
  const { assignments, toggleComplete, deleteAssignment } = useAssignments();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const markedDateKeys = useMemo(() => {
    return new Set(assignments.map((a) => toDateKey(new Date(a.dueDate))));
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <MonthCalendar
        month={month}
        selectedDate={selectedDate}
        markedDateKeys={markedDateKeys}
        onSelectDate={setSelectedDate}
        onChangeMonth={setMonth}
      />

      <Text style={styles.sectionTitle}>
        {selectedDate
          ? selectedDate.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })
          : 'Select a date'}
      </Text>

      <FlatList
        data={assignmentsForSelectedDate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No assignments due this day.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text
              style={[
                styles.assignmentTitle,
                item.completed && { textDecorationLine: 'line-through' },
              ]}
            >
              {item.className} {item.title}
            </Text>

            <Text style={styles.assignmentDue}>
              Due: {new Date(item.dueDate).toLocaleString()}
            </Text>

            <Text style={styles.assignmentDue}>Priority: {item.priority}</Text>

            <View style={styles.actionsRow}>
              <Text
                style={styles.completeButton}
                onPress={() => toggleComplete(item.id)}
              >
                {item.completed ? 'Undo' : 'Complete'}
              </Text>

              <Text
                style={styles.deleteButton}
                onPress={() => deleteAssignment(item.id)}
              >
                Delete
              </Text>
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
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  assignmentDue: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  completeButton: {
    backgroundColor: '#22c55e',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    overflow: 'hidden',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
