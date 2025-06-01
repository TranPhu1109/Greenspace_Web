import { create } from "zustand";
import axios from "../api/api";

const useDesignIdeaStore = create((set, get) => ({
  designIdeas: [],
  currentDesign: null,
  designIdeaById: null,
  isLoading: false,
  error: null,
  abortController: null,

  fetchDesignIdeas: async (componentId) => {
    try {
      set({ isLoading: true });

      const response = await axios.get("/api/designidea", {
        componentId,
        allowDuplicate: false,
      });
      set({
        designIdeas: Array.isArray(response.data) ? response.data : [],
        isLoading: false,
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        set({
          designIdeas: [],
          isLoading: false,
          error: error.message,
        });
      }
    }
  },

  fetchDesignIdeaById: async (id, componentId) => {
    try {
      set({
        isLoading: true,
        error: null,
        designIdeaById: null,
        currentDesign: null
      });

      const response = await axios.get(`/api/designidea/${id}`, {
        componentId,
        allowDuplicate: false,
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      set({
        designIdeaById: response.data,
        currentDesign: response.data,
        isLoading: false,
        error: null,
        abortController: null,
      });
      
      return response.data;
    } catch (error) {
      // Only update state if the error is not from cancellation
      if (!axios.isCancel(error)) {
        set({
          designIdeaById: null,
          currentDesign: null,
          isLoading: false,
          error: error.message,
        });
        throw error;
      }
      // If canceled, just reset the loading state
      set({ isLoading: false });
    }
  },

  createDesignIdea: async (designData) => {
    try {
      const response = await axios.post("/api/designidea", designData);
      set((state) => ({
        designIdeas: [...state.designIdeas, response.data],
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateDesignIdea: async (id, designData) => {
    try {
      const response = await axios.put(`/api/designidea/${id}`, designData);
      set((state) => ({
        designIdeas: state.designIdeas.map((idea) =>
          idea.id === id ? response.data : idea
        ),
      }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteDesignIdea: async (id) => {
    try {
      await axios.delete(`/api/designidea/${id}`);
      set((state) => ({
        designIdeas: state.designIdeas.filter((idea) => idea.id !== id),
      }));
      return true;
    } catch (error) {
      throw error;
    }
  },
}));

export default useDesignIdeaStore;
