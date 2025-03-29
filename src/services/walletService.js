// import axios from '../api/api';

// export const createVNPayQR = async (amount) => {
//   try {
//     const token = localStorage.getItem('token');
//     const response = await axios.post('/api/wallets/vn-pay', amount, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }; 