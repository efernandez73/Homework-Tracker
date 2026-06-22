import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === 'granted') {
    return true;
  }

  const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
  return requestedStatus === 'granted';
}

function getDueDayMorning(dueDate: Date) {
  return new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
    8,
    0,
    0
  );
}

export async function scheduleAssignmentReminders(
  title: string,
  className: string,
  dueDate: Date
): Promise<string[]> {
  const now = Date.now();
  const triggers: { date: Date; body: string }[] = [];

  const dayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
  if (dayBefore.getTime() > now) {
    triggers.push({ date: dayBefore, body: `${className} ${title} is due tomorrow` });
  }

  const dueDayMorning = getDueDayMorning(dueDate);
  const dueDayTrigger = dueDayMorning.getTime() < dueDate.getTime() ? dueDayMorning : dueDate;
  if (dueDayTrigger.getTime() > now) {
    triggers.push({ date: dueDayTrigger, body: `${className} ${title} is due today` });
  }

  const ids = await Promise.all(
    triggers.map((trigger) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Assignment due soon',
          body: trigger.body,
          sound: Platform.OS === 'android' ? undefined : true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger.date,
        },
      })
    )
  );

  return ids;
}

export async function cancelAssignmentReminders(notificationIds: string[]) {
  await Promise.all(
    notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
}
