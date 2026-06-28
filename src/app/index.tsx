import { useAssignments } from '@/context/assignments-context';
import { requestNotificationPermissions } from '@/lib/notifications';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

function getAutoPriority(type: string, dueDate: Date) {
  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;

  const daysLeft = Math.ceil(
    (dueDate.getTime() - today.getTime()) / msPerDay
  );

  let score = 0;

  // Assignment type weight
  if (type === 'Project') score += 3;
  else if (type === 'Quiz') score += 2;
  else if (type === 'Assignment') score += 1;

  // Due date weight
  if (daysLeft <= 1) score += 4;
  else if (daysLeft <= 3) score += 3;
  else if (daysLeft <= 7) score += 2;
  else score += 1;

  if (score >= 6) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
}

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

export default function HomeScreen() {
  const { assignments, addAssignment, toggleComplete, deleteAssignment } =
    useAssignments();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [type, setType] = useState('Assignment');
  const activeAssignments = assignments.filter((a) => !a.completed).length;

  const highPriority = assignments.filter(
    (a) => !a.completed && a.priority === 'High'
  ).length;

  const dueToday = assignments.filter((a) => {
    const due = new Date(a.dueDate);
    const today = new Date();

    return (
      !a.completed &&
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  }).length;

  const completedAssignments = assignments.filter((a) => a.completed).length;
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const typeSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const handleAddAssignment = async () => {
    if (!title || !className) {
      return;
    }

    const autoPriority = getAutoPriority(type, dueDate);

    await addAssignment(
      title,
      className,
      dueDate,
      autoPriority as 'Low' | 'Medium' | 'High',
      type as 'Assignment' | 'Quiz' | 'Project'
    );

    setTitle('');
    setClassName('');
    setDueDate(new Date());
    setType('Assignment'); 
    setModalVisible(false);
  };

  const openTypeModal = () => {
  setTypeModalVisible(true);

  Animated.timing(typeSlide, {
    toValue: 1,
    duration: 220,
    useNativeDriver: true,
  }).start();
  };

  const closeTypeModal = () => {
    Animated.timing(typeSlide, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setTypeModalVisible(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StayOnTop</Text>

      <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>+ Add Assignment</Text>
      </Pressable>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="book-outline" size={26} color="#2563eb" />
          <Text style={styles.statNumber}>{activeAssignments}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={26} color="#ef4444" />
          <Text style={styles.statNumber}>{highPriority}</Text>
          <Text style={styles.statLabel}>High</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={26} color="#f59e0b" />
          <Text style={styles.statNumber}>{dueToday}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={26} color="#22c55e" />
          <Text style={styles.statNumber}>{completedAssignments}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Current Assignments</Text>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
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
            <View style={styles.assignmentTypeRow}>
              <Ionicons
                name={
                  (item.type || 'Assignment') === 'Project'
                    ? 'folder'
                    : (item.type || 'Assignment') === 'Quiz'
                    ? 'help-circle'
                    : 'document-text'
                }
                size={14}
                color="#2563eb"
              />

              <Text style={styles.assignmentTypeText}>
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

            <Text style={styles.classNameText}>
              {item.className}
            </Text>

            <View style={styles.dueDateRow}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#2563eb"
              />
              <Text style={styles.assignmentDue}>
                {formatDueDate(new Date(item.dueDate))}
              </Text>
            </View>

            <View style={[
              styles.priorityBadge,
              item.priority === 'High'
                ? styles.highBadge
                : item.priority === 'Medium'
                ? styles.mediumBadge
                : styles.lowBadge
            ]}>
              <Text style={styles.priorityBadgeText}>
                {item.priority.toUpperCase()}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Pressable
                style={styles.completeButton}
                onPress={() => toggleComplete(item.id)}
              >
                <Ionicons
                  name={item.completed ? 'arrow-undo' : 'checkmark'}
                  size={22}
                  color="white"
                />

                <Text style={styles.buttonText}>
                  {item.completed ? 'Undo' : 'Complete'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => deleteAssignment(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}

        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={56} color="#22c55e" />
            <Text style={styles.emptyStateTitle}>You're all caught up!</Text>
            <Text style={styles.emptyStateText}>
              Tap + Add Assignment to stay ahead.
            </Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Assignment</Text>

          <TextInput
            style={styles.input}
            placeholder="Assignment name"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="Class name"
                        placeholderTextColor="#666"
            value={className}
            onChangeText={setClassName}
          />

          {Platform.OS === 'android' ? (
            <Pressable
              style={styles.input}
              onPress={() => {
                DateTimePickerAndroid.open({
                  value: dueDate,
                  mode: 'date',
                  onChange: (event, selectedDate) => {
                    if (event.type !== 'set' || !selectedDate) {
                      return;
                    }

                    DateTimePickerAndroid.open({
                      value: selectedDate,
                      mode: 'time',
                      onChange: (timeEvent, selectedTime) => {
                        if (timeEvent.type === 'set' && selectedTime) {
                          const finalDate = new Date(selectedDate);
                          finalDate.setHours(selectedTime.getHours());
                          finalDate.setMinutes(selectedTime.getMinutes());

                          setDueDate(finalDate);
                        }
                      },
                    });
                  },
                });
              }}
            >
              <Text>Due: {dueDate.toLocaleString()}</Text>
            </Pressable>
          ) : (
            <DateTimePicker
              value={dueDate}
              mode="datetime"
              onChange={(_event, selectedDate) => {
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}

          <Pressable
            style={[styles.input, styles.priorityInput]}
            onPress={openTypeModal}
          >
            <Text style={styles.priorityText}>Type: {type}</Text>
          </Pressable>

          <Modal
            visible={typeModalVisible}
            transparent={true}
            animationType="none"
          >
            <View style={styles.priorityModalOverlay}>
              <Animated.View
                style={[
                  styles.priorityModalBox,
                  {
                    opacity: typeSlide,
                    transform: [{ scaleY: typeSlide }],
                  },
                ]}
              >
                {['Assignment', 'Quiz', 'Project'].map((itemType) => (
                  <Pressable
                    key={itemType}
                    style={styles.priorityOption}
                    onPress={() => {
                      setType(itemType);
                      closeTypeModal();
                    }}
                  >
                    <Text style={styles.priorityOptionText}>{itemType}</Text>
                  </Pressable>
                ))}

                <Pressable onPress={closeTypeModal}>
                  <Text style={styles.priorityCancel}>Cancel</Text>
                </Pressable>
              </Animated.View>
            </View>
          </Modal>

          <Pressable style={styles.saveButton} onPress={handleAddAssignment}>
            <Text style={styles.buttonText}>Save Assignment</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
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
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
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
  modalContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#f4f6f8',
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#555',
  },
  priorityInput: {
  marginTop: 20,
  },
  priorityText: {
    fontSize: 16,
    color: '#000',
  },

  priorityModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'center',
  alignItems: 'center',
  },

  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 10,
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
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  priorityModalBox: {
    backgroundColor: '#5f5f5f',
    width: '80%',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },

  priorityOption: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.25)',
  },

  priorityOptionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },

  priorityCancel: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },

  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  statsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
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

  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 6,
  },

  statLabel: {
    fontSize: 13,
    color: '#666',
  },

  assignmentTypeRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
  },

  assignmentTypeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  classNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 12,
  },

  completeButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
  marginLeft: 6,
  },

  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },

  completeButton: {
      backgroundColor: '#22c55e',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginRight: 10,
  },

  deleteButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  emptyState: {
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 18,
  padding: 30,
  marginTop: 10,
  },

  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
  },

  emptyStateText: {
    fontSize: 15,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
});