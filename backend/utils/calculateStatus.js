import { parse, isBefore, differenceInHours } from 'date-fns';

/**
 * Calculate attendance status based on check-in time
 * @param {string} checkInTime - Time in HH:mm format
 * @returns {string} - Status: 'present' or 'late'
 */
export const calculateCheckInStatus = (checkInTime) => {
  if (!checkInTime) return 'absent';

  const [hours, minutes] = checkInTime.split(':').map(Number);
  const checkInDate = new Date();
  checkInDate.setHours(hours, minutes, 0, 0);

  const lateThreshold = new Date();
  lateThreshold.setHours(9, 0, 0, 0); // 9:00 AM

  return isBefore(checkInDate, lateThreshold) ? 'present' : 'late';
};

/**
 * Calculate total hours and final status
 * @param {string} checkInTime - Time in HH:mm format
 * @param {string} checkOutTime - Time in HH:mm format
 * @param {string} currentStatus - Current status (present/late)
 * @returns {Object} - { totalHours, status }
 */
export const calculateHoursAndStatus = (checkInTime, checkOutTime, currentStatus) => {
  if (!checkInTime || !checkOutTime) {
    return { totalHours: 0, status: currentStatus };
  }

  const [inHours, inMinutes] = checkInTime.split(':').map(Number);
  const [outHours, outMinutes] = checkOutTime.split(':').map(Number);

  const checkIn = new Date();
  checkIn.setHours(inHours, inMinutes, 0, 0);

  const checkOut = new Date();
  checkOut.setHours(outHours, outMinutes, 0, 0);

  const totalHours = differenceInHours(checkOut, checkIn);

  // If less than 5 hours, mark as half-day
  const status = totalHours < 5 ? 'half-day' : currentStatus;

  return { totalHours, status };
};

