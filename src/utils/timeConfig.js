import dayjs from 'dayjs';

/**
 * Time Configuration for Production Demo
 * Allows adjusting time for testing installation buttons on Vercel without changing device time
 */

// Configuration object
let timeConfig = {
  // Enable/disable time adjustment (set to true for production demo)
  enableTimeAdjustment: import.meta.env.VITE_ENABLE_TIME_ADJUSTMENT === 'true' || false,

  // Time adjustment in hours (can be positive or negative)
  // Example: 24 means add 24 hours to current time
  adjustmentHours: parseInt(import.meta.env.VITE_TIME_ADJUSTMENT_HOURS) || 0,

  // Time adjustment in minutes (can be positive or negative)
  adjustmentMinutes: parseInt(import.meta.env.VITE_TIME_ADJUSTMENT_MINUTES) || 0,

  // Debug mode - shows adjusted time in console
  debugMode: import.meta.env.VITE_TIME_DEBUG === 'true' || false,
};

/**
 * Update time configuration at runtime
 * @param {Object} newConfig - New configuration values
 */
export const updateTimeConfig = (newConfig) => {
  timeConfig = { ...timeConfig, ...newConfig };
};

/**
 * Get real current time (never adjusted)
 * @returns {dayjs.Dayjs} Real current time
 */
export const getRealCurrentTime = () => {
  return dayjs();
};

/**
 * Get current time with optional adjustment for demo purposes
 * @returns {dayjs.Dayjs} Current time (adjusted if enabled)
 */
export const getCurrentTime = () => {
  let currentTime = dayjs();

  if (timeConfig.enableTimeAdjustment) {
    // Apply time adjustments
    if (timeConfig.adjustmentHours !== 0) {
      currentTime = currentTime.add(timeConfig.adjustmentHours, 'hour');
    }

    if (timeConfig.adjustmentMinutes !== 0) {
      currentTime = currentTime.add(timeConfig.adjustmentMinutes, 'minute');
    }

    if (timeConfig.debugMode) {
      console.log('🕐 Time Adjustment Active:', {
        originalTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        adjustedTime: currentTime.format('YYYY-MM-DD HH:mm:ss'),
        adjustmentHours: timeConfig.adjustmentHours,
        adjustmentMinutes: timeConfig.adjustmentMinutes
      });
    }
  }

  return currentTime;
};

/**
 * Check if current time matches task appointment time
 * @param {Object} task - Task object with dateAppointment and timeAppointment
 * @returns {boolean} True if current time is at or after appointment time
 */
export const isCurrentTimeMatchTaskTime = (task) => {
  if (!task?.dateAppointment || !task?.timeAppointment) return false;

  const taskDateTime = dayjs(`${task.dateAppointment} ${task.timeAppointment}`);
  const now = getRealCurrentTime(); // Use REAL time for validation (not Test Mode time)
  const taskDate = dayjs(task.dateAppointment);

  // Allow starting 15 minutes earlier than appointment time
  const allowedStartTime = taskDateTime.subtract(15, 'minute');

  // Check if it's from appointment date onwards
  // If it's appointment date: must be from 15 minutes before appointment time onwards
  // If it's after appointment date: allowed anytime
  if (now.isSame(taskDate, 'day')) {
    // Same day: must be from 15 minutes before appointment time onwards
    return now.isAfter(allowedStartTime) || now.isSame(allowedStartTime);
  } else if (now.isAfter(taskDate, 'day')) {
    // After appointment date: allowed anytime
    return true;
  } else {
    // Before appointment date: not allowed
    return false;
  }
};

/**
 * Check if Test Mode time matches task appointment time (only when Test Mode is enabled)
 * @param {Object} task - Task object with dateAppointment and timeAppointment
 * @returns {boolean} True if Test Mode time is at or after appointment time
 */
export const isTestModeTimeMatchTaskTime = (task) => {
  if (!task?.dateAppointment || !task?.timeAppointment) return false;
  if (!timeConfig.enableTimeAdjustment) return isCurrentTimeMatchTaskTime(task); // Fallback to real time

  const taskDateTime = dayjs(`${task.dateAppointment} ${task.timeAppointment}`);
  const now = getCurrentTime(); // Use Test Mode time
  const taskDate = dayjs(task.dateAppointment);

  // Allow starting 15 minutes earlier than appointment time
  const allowedStartTime = taskDateTime.subtract(15, 'minute');

  // Check if it's from appointment date onwards
  if (now.isSame(taskDate, 'day')) {
    return now.isAfter(allowedStartTime) || now.isSame(allowedStartTime);
  } else if (now.isAfter(taskDate, 'day')) {
    return true;
  } else {
    return false;
  }
};

/**
 * Get time status for display purposes
 * @param {Object} task - Task object with dateAppointment and timeAppointment
 * @returns {Object} Status object with canStart, message, and color
 */
export const getTimeStatus = (task) => {
  if (!task?.dateAppointment || !task?.timeAppointment) {
    return { canStart: false, message: "Chưa có lịch hẹn", color: "default" };
  }

  const taskDateTime = dayjs(`${task.dateAppointment} ${task.timeAppointment}`);
  const now = getRealCurrentTime(); // Use REAL time for validation (not Test Mode time)
  const taskDate = dayjs(task.dateAppointment);
  const allowedStartTime = taskDateTime.subtract(15, 'minute');

  if (now.isBefore(taskDate, 'day')) {
    return {
      canStart: false,
      message: `Chưa đến ngày hẹn (${taskDate.format("DD/MM/YYYY")})`,
      color: "orange"
    };
  } else if (now.isSame(taskDate, 'day')) {
    if (now.isBefore(allowedStartTime)) {
      return {
        canStart: false,
        message: `Chưa đến giờ hẹn (${allowedStartTime.format("HH:mm")})`,
        color: "orange"
      };
    } else {
      return {
        canStart: true,
        message: "Có thể bắt đầu lắp đặt",
        color: "green"
      };
    }
  } else {
    return {
      canStart: true,
      message: "Có thể bắt đầu lắp đặt",
      color: "green"
    };
  }
};

/**
 * Get time status for display purposes (using Test Mode time if enabled)
 * @param {Object} task - Task object with dateAppointment and timeAppointment
 * @returns {Object} Status object with canStart, message, and color
 */
export const getTestModeTimeStatus = (task) => {
  if (!task?.dateAppointment || !task?.timeAppointment) {
    return { canStart: false, message: "Chưa có lịch hẹn", color: "default" };
  }
  if (!timeConfig.enableTimeAdjustment) return getTimeStatus(task); // Fallback to real time

  const taskDateTime = dayjs(`${task.dateAppointment} ${task.timeAppointment}`);
  const now = getCurrentTime(); // Use Test Mode time
  const taskDate = dayjs(task.dateAppointment);
  const allowedStartTime = taskDateTime.subtract(15, 'minute');

  if (now.isBefore(taskDate, 'day')) {
    return {
      canStart: false,
      message: `Chưa đến ngày hẹn (${taskDate.format("DD/MM/YYYY")})`,
      color: "orange"
    };
  } else if (now.isSame(taskDate, 'day')) {
    if (now.isBefore(allowedStartTime)) {
      return {
        canStart: false,
        message: `Chưa đến giờ hẹn (${allowedStartTime.format("HH:mm")})`,
        color: "orange"
      };
    } else {
      return {
        canStart: true,
        message: "Có thể bắt đầu lắp đặt",
        color: "green"
      };
    }
  } else {
    return {
      canStart: true,
      message: "Có thể bắt đầu lắp đặt",
      color: "green"
    };
  }
};

/**
 * Get notification message for time validation
 * @param {Object} task - Task object
 * @param {boolean} isReinstall - Whether this is for reinstallation
 * @returns {Object} Notification object with message and description
 */
export const getTimeValidationMessage = (task, isReinstall = false) => {
  const taskDateTime = dayjs(`${task.dateAppointment} ${task.timeAppointment}`);
  const now = getRealCurrentTime(); // Use REAL time for validation (not Test Mode time)
  const taskDate = dayjs(task.dateAppointment);
  const allowedStartTime = taskDateTime.subtract(15, 'minute');

  let message = isReinstall ? "Chưa đến thời gian lắp đặt lại" : "Chưa đến thời gian lắp đặt";
  let description = "";

  if (now.isBefore(taskDate, 'day')) {
    // Before appointment date
    description = `Chỉ được phép bắt đầu ${isReinstall ? 'lắp đặt lại' : 'lắp đặt'} từ ngày ${taskDate.format("DD/MM/YYYY")} lúc ${allowedStartTime.format("HH:mm")} (15 phút trước giờ hẹn) trở đi`;
  } else if (now.isSame(taskDate, 'day')) {
    // Same day but before allowed start time
    description = `Chỉ được phép bắt đầu ${isReinstall ? 'lắp đặt lại' : 'lắp đặt'} từ ${allowedStartTime.format("HH:mm")} (15 phút trước giờ hẹn) hôm nay trở đi`;
  }

  return { message, description };
};

/**
 * Get notification message for time validation (using Test Mode time if enabled)
 * @param {Object} task - Task object
 * @param {boolean} isReinstall - Whether this is for reinstallation
 * @returns {Object} Notification object with message and description
 */
export const getTestModeTimeValidationMessage = (task, isReinstall = false) => {
  if (!timeConfig.enableTimeAdjustment) return getTimeValidationMessage(task, isReinstall); // Fallback to real time

  const taskDateTime = dayjs(`${task.dateAppointment} ${task.timeAppointment}`);
  const now = getCurrentTime(); // Use Test Mode time
  const taskDate = dayjs(task.dateAppointment);
  const allowedStartTime = taskDateTime.subtract(15, 'minute');

  let message = isReinstall ? "Chưa đến thời gian lắp đặt lại" : "Chưa đến thời gian lắp đặt";
  let description = "";

  if (now.isBefore(taskDate, 'day')) {
    // Before appointment date
    description = `Chỉ được phép bắt đầu ${isReinstall ? 'lắp đặt lại' : 'lắp đặt'} từ ngày ${taskDate.format("DD/MM/YYYY")} lúc ${allowedStartTime.format("HH:mm")} (15 phút trước giờ hẹn) trở đi`;
  } else if (now.isSame(taskDate, 'day')) {
    // Same day but before allowed start time
    description = `Chỉ được phép bắt đầu ${isReinstall ? 'lắp đặt lại' : 'lắp đặt'} từ ${allowedStartTime.format("HH:mm")} (15 phút trước giờ hẹn) hôm nay trở đi`;
  }

  return { message, description };
};

// Export configuration for debugging purposes
export const getTimeConfig = () => timeConfig;

export default {
  getRealCurrentTime,
  getCurrentTime,
  isCurrentTimeMatchTaskTime,
  isTestModeTimeMatchTaskTime,
  getTimeStatus,
  getTestModeTimeStatus,
  getTimeValidationMessage,
  getTestModeTimeValidationMessage,
  getTimeConfig
};
