import { Pressable, StyleSheet, Text, View } from 'react-native';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameDay(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b);
}

function buildMonthGrid(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstOfMonth.getDay(); i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function MonthCalendar({
  month,
  selectedDate,
  markedDateKeys,
  onSelectDate,
  onChangeMonth,
}: {
  month: Date;
  selectedDate: Date | null;
  markedDateKeys: Set<string>;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (month: Date) => void;
}) {
  const cells = buildMonthGrid(month);
  const today = new Date();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.navButton}
          onPress={() =>
            onChangeMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        >
          <Text style={styles.navText}>{'<'}</Text>
        </Pressable>

        <Text style={styles.monthLabel}>
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>

        <Pressable
          style={styles.navButton}
          onPress={() =>
            onChangeMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        >
          <Text style={styles.navText}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text key={index} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={index} style={styles.cell} />;
          }

          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday = isSameDay(date, today);
          const hasAssignments = markedDateKeys.has(toDateKey(date));

          return (
            <Pressable
              key={index}
              style={styles.cell}
              onPress={() => onSelectDate(date)}
            >
              <View
                style={[
                  styles.dayCircle,
                  isSelected && styles.dayCircleSelected,
                  isToday && !isSelected && styles.dayCircleToday,
                ]}
              >
                <Text
                  style={[styles.dayText, isSelected && styles.dayTextSelected]}
                >
                  {date.getDate()}
                </Text>
              </View>
              {hasAssignments && (
                <View
                  style={[styles.dot, isSelected && styles.dotSelected]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { toDateKey };

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#2563eb',
  },
  dayCircleToday: {
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  dayText: {
    fontSize: 14,
    color: '#1f2937',
  },
  dayTextSelected: {
    color: 'white',
    fontWeight: '700',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ef4444',
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: '#2563eb',
  },
});
