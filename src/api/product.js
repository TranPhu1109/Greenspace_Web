// import api from './api';

// export const fetchProducts = async () => {
//   try {
//     const response = await api.get('/api/product', {
//       params: {
//         pageNumber: 0,
//         pageSize: 10
//       }
//     });
//     return response.data.map(product => ({
//       ...product,
//       image: {
//         imageUrl: product.image?.imageUrl || '',
//         image2: product.image?.image2 || '',
//         image3: product.image?.image3 || ''
//       }
//     }));
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// };

// export const fetchCategories = async () => {
//   try {
//     const response = await api.get('/api/categories', {
//       params: {
//         pageNumber: 0,
//         pageSize: 10
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     throw error;
//   }
// };

// export const getProductById = async (id) => {
//   try {
//     const response = await api.get(`/api/product/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     throw error;
//   }
// };

// export const createProduct = async (productData) => {
//   try {
//     const response = await api.post('/api/product', productData);
//     return response.data;
//   } catch (error) {
//     console.error('Error creating product:', error);
//     throw error;
//   }
// };

// export const updateProduct = async (id, productData) => {
//   try {
//     const response = await api.put(`/api/product/${id}`, productData);
//     return response.data;
//   } catch (error) {
//     console.error('Error updating product:', error);
//     throw error;
//   }
// };

// export const deleteProduct = async (id) => {
//   try {
//     await api.delete(`/api/product/${id}`);
//     return true;
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     throw error;
//   }
// };

// export const createCategory = async (categoryData) => {
//   try {
//     const formData = new FormData();
//     formData.append('Name', categoryData.name);
//     formData.append('Description', categoryData.description);

//     const response = await api.post('/api/categories', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//     return response;
//   } catch (error) {
//     console.error('Error creating category:', error);
//     throw error;
//   }
// };

// export const updateCategory = async (id, categoryData) => {
//   try {
//     const formData = new FormData();
//     formData.append('Id', id);
//     formData.append('Name', categoryData.name);
//     formData.append('Description', categoryData.description);

//     const response = await api.put(`/api/categories/${id}`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//     return response;
//   } catch (error) {
//     console.error('Error updating category:', error);
//     throw error;
//   }
// };

// export const deleteCategory = async (id) => {
//   try {
//     const response = await api.delete(`/api/categories/${id}`);
//     return response;
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     throw error;
//   }
// };