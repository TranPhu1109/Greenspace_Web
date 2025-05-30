import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../api/api";
import { auth, fetchFCMToken, googleProvider } from "../firebase/config";
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
          console.log('Starting login process...');
          
          // First, authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log('Firebase authentication successful');

          // Fetch FCM token
          const fcmToken = await fetchFCMToken() || "";

          // Then authenticate with backend using Firebase token
          const userData = await useAuthStore.getState().authenticateWithFirebase(userCredential.user, fcmToken);
          console.log('Backend authentication successful', { 
            userId: userData.id,
            email: userData.email,
            role: userData.roleName
          });

          // Store user data and token in localStorage
          const userToStore = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            roleName: userData.roleName,
            phone: userData.phone,
            address: userData.address,
            avatarUrl: userData.avatarUrl,
            backendToken: userData.backendToken
          };
          
          localStorage.setItem("user", JSON.stringify(userToStore));
          localStorage.setItem("token", userData.backendToken);
          localStorage.setItem("selectedRole", userData.roleName.toLowerCase());
          console.log('User data stored in localStorage');

          set({ 
            user: userToStore, 
            isAuthenticated: true, 
            loading: false 
          });

          // Đồng bộ giỏ hàng local lên server sau khi đăng nhập thành công
          try {
            const cartStore = (await import('./useCartStore')).default;
            await cartStore.getState().syncLocalCartToServer();
          } catch (syncError) {
            console.error('Error syncing local cart:', syncError);
          }

          // Fetch wallet balance after successful login
          if (userData.roleName === 'Customer') {
            const walletStore = (await import('./useWalletStore')).default;
            await walletStore.getState().fetchBalance();
            
            // Fetch cart items after successful login
            const cartStore = (await import('./useCartStore')).default;
            await cartStore.getState().fetchCartItems();
          }
          
          return userToStore;
        } catch (err) {
          console.error('Login error details:', {
            message: err.message,
            code: err.code,
            response: err.response?.data,
            status: err.response?.status
          });
          
          // Chuyển đổi thông báo lỗi
          let errorMessage = err.message;
          if (err.code === 'auth/invalid-credential') {
            errorMessage = 'Tài khoản hoặc mật khẩu không đúng';
          }
          
          set({ 
            error: errorMessage, 
            loading: false,
            user: null,
            isAuthenticated: false 
          });
          throw { ...err, message: errorMessage };
        }
      },

      authenticateWithFirebase: async (firebaseUser, fcmToken = "") => {
        try {
          const idToken = await firebaseUser.getIdToken();
          console.log('Firebase ID token obtained');

          const requestData = {
            token: idToken,
            fcmToken: fcmToken,
          };

          console.log('Sending authentication request with data:', requestData);

          const response = await axios.post("/api/auth", requestData);
          console.log('Backend authentication response:', response.data);

          const userData = {
            ...response.data.user,
            backendToken: response.data.token,
          };

          return userData;
        } catch (err) {
          console.error('Backend authentication error:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
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

          // Reset notification store state
          const notificationStore = (await import('./useNotificationStore')).default;
          notificationStore.getState().resetNotifications();

          // Reset wallet store state
          const walletStore = (await import('./useWalletStore')).default;
          walletStore.getState().reset();

          // Reset design order store state
          const designOrderStore = (await import('./useDesignOrderStore')).default;
          designOrderStore.getState().reset();
        } catch (err) {
          console.error("Logout error:", err);
          throw err;
        }
      },

      updateUser: async (userData) => {
        try {
          set({ loading: true, error: null });
          const currentUser = useAuthStore.getState().user;
          
          if (!currentUser || !currentUser.id) {
            throw new Error("Không tìm thấy thông tin người dùng");
          }
          
          // Ensure we include all fields in the request, using current values if not being updated
          const requestData = {
            name: userData.name !== undefined ? userData.name : currentUser.name,
            phone: userData.phone !== undefined ? userData.phone : currentUser.phone,
            address: userData.address !== undefined ? userData.address : currentUser.address,
            avatarUrl: userData.avatarUrl !== undefined ? userData.avatarUrl : currentUser.avatarUrl,
          };
          
          // Make API call to update user
          const response = await axios.put(`/api/users/${currentUser.id}`, requestData);
          
          // Update user information in store and localStorage
          const updatedUser = { ...currentUser, ...requestData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          set({ 
            user: updatedUser,
            loading: false 
          });
          
          return updatedUser;
        } catch (err) {
          console.error('Update user error:', err);
          set({ 
            error: err.message, 
            loading: false
          });
          throw err;
        }
      },

      // Hàm cập nhật địa chỉ người dùng
      updateUserAddress: async (address) => {
        try {
          set({ loading: true, error: null });
          const user = useAuthStore.getState().user;
          
          if (!user || !user.id) {
            throw new Error("Không tìm thấy thông tin người dùng");
          }
          
          const response = await axios.put(`/api/users/${user.id}`, { 
            name: user.name,
            address: address 
          });
          
          // Cập nhật thông tin user trong store và localStorage
          const updatedUser = { ...user, address };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          set({ 
            user: updatedUser,
            loading: false 
          });
          
          return updatedUser;
        } catch (err) {
          console.error('Update address error:', err);
          set({ 
            error: err.message, 
            loading: false
          });
          throw err;
        }
      },

      // Hàm cập nhật mật khẩu
      updatePassword: async (password) => {
        try {
          set({ loading: true, error: null });
          const user = useAuthStore.getState().user;
          
          if (!user || !user.id) {
            throw new Error("Không tìm thấy thông tin người dùng");
          }
          
          // Gọi API cập nhật mật khẩu
          const response = await axios.put(`/api/users/${user.id}`, { password });
          
          set({ loading: false });
          return response.data;
        } catch (err) {
          console.error('Update password error:', err);
          set({ 
            error: err.response?.data?.message || err.message, 
            loading: false
          });
          throw err;
        }
      },

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
      // loginWithGoogle: async () => {
      //   set({ loading: true, error: null });
      //   try {
      //     // Sign in with Google
      //     const result = await signInWithPopup(auth, googleProvider);
      //     const user = result.user;

      //     try {
      //       // Try to create user in backend (in case they don't exist)
      //       await axios.post("/api/users", {
      //         name: user.displayName,
      //         email: user.email,
      //         password: "", // Empty password for Google users
      //         phone: user.phoneNumber || "",
      //         avatarUrl: user.photoURL || "",
      //         address: "",
      //         roleName: "Customer",
      //       });
      //     } catch (error) {
      //       // If user already exists, ignore the error
      //       if (!error.response?.status === 409) {
      //         throw error;
      //       }
      //     }

      //     // Authenticate with backend
      //     const authenticatedUser = await useAuthStore
      //       .getState()
      //       .authenticateWithFirebase(user);

      //     set({ user: authenticatedUser, loading: false });
          
      //     // Đồng bộ giỏ hàng local lên server sau khi đăng nhập thành công
      //     try {
      //       const cartStore = (await import('./useCartStore')).default;
      //       await cartStore.getState().syncLocalCartToServer();
      //       await cartStore.getState().fetchCartItems();
      //     } catch (syncError) {
      //       console.error('Error syncing local cart:', syncError);
      //     }
          
      //     return authenticatedUser;
      //   } catch (err) {
      //     set({ error: err.message, loading: false });
      //     throw err;
      //   }
      // },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
    }
  )
);

export default useAuthStore;
