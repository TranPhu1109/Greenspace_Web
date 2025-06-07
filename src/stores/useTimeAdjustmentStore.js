import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updateTimeConfig, getCurrentTime } from '@/utils/timeConfig';
import dayjs from 'dayjs';

const useTimeAdjustmentStore = create(
  persist(
    (set, get) => ({
      // State
      isEnabled: false,
      adjustmentHours: 0,
      adjustmentMinutes: 0,
      debugMode: false,

      // Actions
      setEnabled: (enabled) => {
        set({ isEnabled: enabled });
        updateTimeConfig({ enableTimeAdjustment: enabled });
      },

      setAdjustmentHours: (hours) => {
        set({ adjustmentHours: hours });
        updateTimeConfig({ adjustmentHours: hours });
      },

      setAdjustmentMinutes: (minutes) => {
        set({ adjustmentMinutes: minutes });
        updateTimeConfig({ adjustmentMinutes: minutes });
      },

      setDebugMode: (debug) => {
        set({ debugMode: debug });
        updateTimeConfig({ debugMode: debug });
      },

      // Convenience method to set adjustment by target date/time
      setAdjustmentToMatchDateTime: (targetDate, targetTime) => {
        // Đảm bảo format chính xác với giây = 0
        const target = dayjs(`${targetDate} ${targetTime}:00`);
        const now = dayjs().startOf('minute'); // Làm tròn xuống phút để tránh lỗi giây

        // Tính diff chính xác đến phút
        const diffInMinutes = target.diff(now, 'minute');

        // Tính toán giờ và phút một cách chính xác
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes - (hours * 60); // Sử dụng phép trừ thay vì modulo

        // Debug: uncomment for troubleshooting
        // console.log('Debug time calculation:', {
        //   targetInput: `${targetDate} ${targetTime}`,
        //   target: target.format('YYYY-MM-DD HH:mm:ss'),
        //   nowOriginal: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        //   nowRounded: now.format('YYYY-MM-DD HH:mm:ss'),
        //   diffInMinutes,
        //   hours,
        //   minutes
        // });

        set({
          adjustmentHours: hours,
          adjustmentMinutes: minutes,
          isEnabled: true
        });

        updateTimeConfig({
          enableTimeAdjustment: true,
          adjustmentHours: hours,
          adjustmentMinutes: minutes
        });
      },

      // Reset all adjustments
      reset: () => {
        set({
          isEnabled: false,
          adjustmentHours: 0,
          adjustmentMinutes: 0,
          debugMode: false
        });
        
        updateTimeConfig({
          enableTimeAdjustment: false,
          adjustmentHours: 0,
          adjustmentMinutes: 0,
          debugMode: false
        });
      },

      // Get current adjusted time
      getCurrentAdjustedTime: () => {
        return getCurrentTime();
      },

      // Get adjustment info for display
      getAdjustmentInfo: () => {
        const state = get();
        if (!state.isEnabled) {
          return { isActive: false, message: 'Không có điều chỉnh thời gian' };
        }

        const totalMinutes = state.adjustmentHours * 60 + state.adjustmentMinutes;
        if (totalMinutes === 0) {
          return { isActive: false, message: 'Không có điều chỉnh thời gian' };
        }

        const adjustedTime = getCurrentTime();
        const originalTime = dayjs();

        return {
          isActive: true,
          message: `Thời gian đã điều chỉnh: ${totalMinutes > 0 ? '+' : ''}${Math.floor(totalMinutes / 60)}h ${Math.abs(totalMinutes % 60)}m`,
          originalTime: originalTime.format('DD/MM/YYYY HH:mm:ss'),
          adjustedTime: adjustedTime.format('DD/MM/YYYY HH:mm:ss'),
          totalMinutes
        };
      },

      // Get the target date/time that was originally set (for UI restoration)
      getTargetDateTime: () => {
        const state = get();
        if (!state.isEnabled) {
          return null;
        }

        const now = dayjs().startOf('minute');
        const adjustedTime = now.add(state.adjustmentHours, 'hour').add(state.adjustmentMinutes, 'minute');

        // Thử phát hiện xem đây có phải là chế độ "early" (sớm 15 phút) không
        // Bằng cách thêm 15 phút vào thời gian đã điều chỉnh
        const possibleOriginalTime = adjustedTime.add(15, 'minute');

        return {
          date: adjustedTime.format('YYYY-MM-DD'),
          time: adjustedTime.format('HH:mm'),
          dayjs: adjustedTime,
          // Cung cấp cả 2 option để UI có thể chọn
          possibleOriginalDate: possibleOriginalTime.format('YYYY-MM-DD'),
          possibleOriginalTime: possibleOriginalTime.format('HH:mm'),
          possibleOriginalDayjs: possibleOriginalTime
        };
      },

      // Initialize timeConfig from persisted state (call this after store hydration)
      initializeTimeConfig: () => {
        const state = get();
        updateTimeConfig({
          enableTimeAdjustment: state.isEnabled,
          adjustmentHours: state.adjustmentHours,
          adjustmentMinutes: state.adjustmentMinutes,
          debugMode: state.debugMode
        });
      }
    }),
    {
      name: 'time-adjustment-storage',
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        // Khôi phục timeConfig sau khi store được hydrated từ localStorage
        if (state) {
          state.initializeTimeConfig();
        }
      },
    }
  )
);

// Initialize timeConfig immediately when store is created
// This ensures timeConfig is synced even if onRehydrateStorage doesn't fire
const store = useTimeAdjustmentStore.getState();
if (store.isEnabled) {
  updateTimeConfig({
    enableTimeAdjustment: store.isEnabled,
    adjustmentHours: store.adjustmentHours,
    adjustmentMinutes: store.adjustmentMinutes,
    debugMode: store.debugMode
  });
}

export default useTimeAdjustmentStore;
