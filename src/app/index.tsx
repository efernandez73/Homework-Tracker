import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Assignment = {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
};

export default function HomeScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Project',
      className: 'CSC 341',
      dueDate: 'June 20',
      priority: 'High',
      completed: false,
    },
    {
      id: '2',
      title: 'Database Report',
      className: 'CSC 453',
      dueDate: 'June 22',
      priority: 'Medium',
      completed: false,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
  const loadAssignments = async () => {
    const savedAssignments = await AsyncStorage.getItem('assignments');

    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    }
  };

  loadAssignments();
}, []);

useEffect(() => {
  AsyncStorage.setItem('assignments', JSON.stringify(assignments));
}, [assignments]);

  const addAssignment = () => {
    if (!title || !className || !dueDate) {
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title,
      className,
      dueDate,
      priority: priority as 'Low' | 'Medium' | 'High',
      completed: false,
    };

    setAssignments([...assignments, newAssignment]);

    setTitle('');
    setClassName('');
    setDueDate('');
    setModalVisible(false);
  };

  const toggleComplete = (id: string) => {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === id
          ? { ...assignment, completed: !assignment.completed }
          : assignment
      )
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments(
      assignments.filter((assignment) => assignment.id !== id)
    );
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
              Due: {item.dueDate}
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

          <TextInput
            style={styles.input}
            placeholder="Due date"
                        placeholderTextColor="#666"
            value={dueDate}
            onChangeText={setDueDate}
          />

          <TextInput
            style={styles.input}
            placeholder="Priority (Low, Medium, High)"
            placeholderTextColor="#666"
            value={priority}
            onChangeText={setPriority}
          />

          <Pressable style={styles.saveButton} onPress={addAssignment}>
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
});