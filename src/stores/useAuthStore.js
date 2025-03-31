import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../api/api";
import { auth, googleProvider } from "../firebase/config";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          // First, authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

          // Then authenticate with backend using Firebase token
          const userData = await useAuthStore
            .getState()
            .authenticateWithFirebase(userCredential.user);

          // Store user data and token in localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", userData.backendToken);
          localStorage.setItem("selectedRole", userData.roleName.toLowerCase());

          set({ user: userData, isAuthenticated: true, loading: false });
          return userData;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      authenticateWithFirebase: async (firebaseUser, role = "string") => {
        try {
          const idToken = await firebaseUser.getIdToken();

          const response = await axios.post("/api/auth", {
            token: idToken,
            fcmToken: "",
            role: role,
          });

          const userData = {
            ...response.data.user,
            backendToken: response.data.token,
          };

          return userData;
        } catch (err) {
          throw err;
        }
      },

      logout: async () => {
        try {
          // Sign out from Firebase
          await auth.signOut();

          // Clear localStorage
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("selectedRole");

          // Reset store state
          set({ user: null, isAuthenticated: false });
        } catch (err) {
          console.error("Logout error:", err);
          throw err;
        }
      },

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),

      // Regular registration with email/password
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          // Create user in backend database
          const response = await axios.post("/api/users/register", {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            avatarUrl: userData.avatarUrl || "",
            address: userData.address || "",
          });

          set({ loading: false });
          return response.data;
        } catch (err) {
          set({
            error: err.response?.data?.message || err.message,
            loading: false,
          });
          throw err;
        }
      },

      // Google registration/login
      loginWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          // Sign in with Google
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;

          try {
            // Try to create user in backend (in case they don't exist)
            await axios.post("/api/users", {
              name: user.displayName,
              email: user.email,
              password: "", // Empty password for Google users
              phone: user.phoneNumber || "",
              avatarUrl: user.photoURL || "",
              address: "",
              roleName: "Customer",
            });
          } catch (error) {
            // If user already exists, ignore the error
            if (!error.response?.status === 409) {
              throw error;
            }
          }

          // Authenticate with backend
          const authenticatedUser = await useAuthStore
            .getState()
            .authenticateWithFirebase(user);

          set({ user: authenticatedUser, loading: false });
          return authenticatedUser;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default useAuthStore;
