import { create } from 'zustand';
import axios from '../api/api';

const useManagerStore = create((set) => ({
  // Customers state and actions
  customers: [],
  customersLoading: false,
  customersError: null,

  fetchCustomers: async () => {
    set({ customersLoading: true });
    try {
      const response = await axios.get('/api/customers');
      set({ customers: response.data, customersLoading: false, customersError: null });
    } catch (error) {
      set({ customersError: error.message, customersLoading: false });
    }
  },

  // Employees state and actions
  employees: [],
  employeesLoading: false,
  employeesError: null,

  fetchEmployees: async () => {
    set({ employeesLoading: true });
    try {
      const response = await axios.get('/api/employees');
      set({ employees: response.data, employeesLoading: false, employeesError: null });
    } catch (error) {
      set({ employeesError: error.message, employeesLoading: false });
    }
  },
}));

export default useManagerStore;