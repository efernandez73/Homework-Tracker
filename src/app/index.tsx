import { useAssignments } from '@/context/assignments-context';
import { requestNotificationPermissions } from '@/lib/notifications';
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

export default function HomeScreen() {
  const { assignments, addAssignment, toggleComplete, deleteAssignment } =
    useAssignments();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState('Medium');
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const prioritySlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const handleAddAssignment = async () => {
    if (!title || !className) {
      return;
    }

    await addAssignment(
      title,
      className,
      dueDate,
      priority as 'Low' | 'Medium' | 'High'
    );

    setTitle('');
    setClassName('');
    setDueDate(new Date());
    setModalVisible(false);
  };

  const openPriorityModal = () => {
  setPriorityModalVisible(true);

  Animated.timing(prioritySlide, {
    toValue: 1,
    duration: 220,
    useNativeDriver: true,
  }).start();
  };

  const closePriorityModal = () => {
    Animated.timing(prioritySlide, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setPriorityModalVisible(false);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework Tracker</Text>

      <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>+ Add Assignment</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Current Assignments</Text>

      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
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

            <Text style={styles.assignmentDue}>
              Priority: {item.priority}
            </Text>

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Pressable
                style={{
                  backgroundColor: '#22c55e',
                  padding: 10,
                  borderRadius: 8,
                  marginRight: 10,
                }}
                onPress={() => toggleComplete(item.id)}
              >
                <Text style={{ color: 'white' }}>
                  {item.completed ? 'Undo' : 'Complete'}
                </Text>
              </Pressable>

              <Pressable
                style={{
                  backgroundColor: '#ef4444',
                  padding: 10,
                  borderRadius: 8,
                }}
                onPress={() => deleteAssignment(item.id)}
              >
                <Text style={{ color: 'white' }}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        )}
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
                          setDueDate(selectedTime);
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
            onPress={openPriorityModal}
          >
            <Text style={styles.priorityText}>{priority}</Text>
          </Pressable>

          <Modal
            visible={priorityModalVisible}
            transparent={true}
            animationType="none"
          >
            <View style={styles.priorityModalOverlay}>
              <Animated.View
                style={[
                  styles.priorityModalBox,
                  {
                    opacity: prioritySlide,
                    transform: [{ scaleY: prioritySlide }],
                  },
                ]}
              >
                {['High', 'Medium', 'Low'].map((level) => (
                  <Pressable
                    key={level}
                    style={styles.priorityOption}
                    onPress={() => {
                      setPriority(level);
                      closePriorityModal();
                    }}
                  >
                    <Text style={styles.priorityOptionText}>{level}</Text>
                  </Pressable>
                ))}

                <Pressable onPress={closePriorityModal}>
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
});