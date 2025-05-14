import { create } from "zustand";
import api from "@/api/api";

const useRecordStore = create((set) => ({
  sketchRecords: [],
  isLoading: false,
  error: null,
  designRecords: [],

  // Get sketch records for a service order
  getRecordSketch: async (orderServiceId, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      set({ sketchRecords: [] });
      const response = await api.get(
        `/api/recordsketch/${orderServiceId}/orderservice`
      );
      set({
        sketchRecords: response.data,
        ...(silent ? {} : { isLoading: false }),
      });

      // const existing = get().sketchRecords;
      // const isSame = JSON.stringify(existing) === JSON.stringify(response.data);
      // if (!isSame) {
      //   set({
      //     sketchRecords: response.data,
      //     ...(silent ? {} : { isLoading: false }),
      //   });
      // }

      return response.data;
    } catch (error) {
      set({
        error: error.message,
        ...(silent ? {} : { isLoading: false }),
      });
      throw error;
    }
  },

  // Get design records for a service order
  getRecordDesign: async (orderServiceId, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const response = await api.get(
        `/api/recorddesign/${orderServiceId}/orderservice`
      );
      set({
        designRecords: response.data,
        ...(silent ? {} : { isLoading: false }),
      });
        // const existing = get().designRecords;
        // const isSame = JSON.stringify(existing) === JSON.stringify(response.data);
        // if (!isSame) {
        //   set({ designRecords: response.data, ...(silent ? {} : { isLoading: false }) });
        // }

      return response.data;
    } catch (error) {
      set({
        error: error.message,
        ...(silent ? {} : { isLoading: false }),
      });
      throw error;
    }
  },

  // Confirm a sketch record
  confirmRecord: async (recordId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/recordsketch/${recordId}`, {
        isSelected: true,
      });

      // Update the local state to reflect the change
      set((state) => ({
        sketchRecords: state.sketchRecords.map((record) =>
          record.id === recordId
            ? { ...record, isSelected: true }
            : { ...record, isSelected: false }
        ),
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Confirm a design record
  confirmDesignRecord: async (recordId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/recorddesign/${recordId}`, {
        isSelected: true,
      });

      // Update the local state to reflect the change
      set((state) => ({
        designRecords: state.designRecords.map((record) =>
          record.id === recordId
            ? { ...record, isSelected: true }
            : { ...record, isSelected: false }
        ),
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  // Reset state
  resetState: () => {
    set({
      sketchRecords: [],
      designRecords: [],
      isLoading: false,
      error: null,
    });
  },
}));

export default useRecordStore;
