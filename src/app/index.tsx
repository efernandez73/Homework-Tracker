import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework Tracker</Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>+ Add Assignment</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Current Assignments</Text>

      <View style={styles.card}>
        <Text style={styles.assignmentTitle}>CSC 341 Project</Text>
        <Text style={styles.assignmentDue}>Due: June 20</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.assignmentTitle}>CSC 453 Database Report</Text>
        <Text style={styles.assignmentDue}>Due: June 22</Text>
      </View>
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
});