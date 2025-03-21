import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const toUTC = (date: Date): Date => {
  return dayjs(date).utc().toDate();
};

export function fromUTC(
  date: Date | string,
  userTimezone: string = 'Africa/Lagos',
): string {
  return dayjs.utc(date).tz(userTimezone).format('YYYY-MM-DD HH:mm:ss');
}
