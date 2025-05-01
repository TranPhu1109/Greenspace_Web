import { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';

/**
 * Custom hook upload ảnh, video và file lên Cloudinary sử dụng thư viện @cloudinary/url-gen
 */
export const useCloudinaryStorage = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const FOLDER_NAME = import.meta.env.VITE_CLOUDINARY_FOLDER || 'GreenSpace_SP25';

  // Khởi tạo instance Cloudinary
  const cld = new Cloudinary({
    cloud: {
      cloudName: CLOUD_NAME
    }
  });

  // Hàm xác định loại resource dựa vào loại file
  const getResourceType = (file) => {
    // Handle base64 string
    if (typeof file === 'string' && file.startsWith('data:')) {
      const mimeType = file.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1];
      
      if (mimeType?.startsWith('image/')) {
        return 'image';
      } else if (mimeType?.startsWith('video/') || 
                mimeType?.includes('mp4') || 
                mimeType?.includes('avi') || 
                mimeType?.includes('mov') ||
                mimeType?.includes('wmv')) {
        return 'video';
      } else if (mimeType?.includes('pdf')) {
        return 'raw';
      } else {
        return 'auto';
      }
    }
    
    // Handle File object
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      return 'image';
    } else if (fileType.startsWith('video/') || 
              fileType.includes('mp4') || 
              fileType.includes('avi') || 
              fileType.includes('mov') ||
              fileType.includes('wmv')) {
      return 'video';
    } else if (fileType.includes('pdf') || 
              file.name.toLowerCase().endsWith('.pdf')) {
      return 'raw';
    } else {
      // Mặc định sử dụng raw cho các loại file khác
      return 'raw';
    }
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64Data) => {
    if (!base64Data || !base64Data.startsWith('data:')) {
      throw new Error('Invalid base64 data');
    }
    
    // Split the base64 string into parts
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].replace('data:', '');
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  };

  const uploadImages = async (files) => {
    try {
      setProgress(0);
      setError(null);
      
      // Log thông tin để debug
      console.log('Cloudinary config:', { 
        cloudName: CLOUD_NAME, 
        uploadPreset: UPLOAD_PRESET, 
        folderName: FOLDER_NAME 
      });
      
      if (!files || files.length === 0) {
        return [];
      }
      
      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Thiếu thông tin cấu hình Cloudinary. Vui lòng kiểm tra biến môi trường.');
      }

      const uploadPromises = files.map((file, index) => {
        return new Promise((resolve, reject) => {
          let fileToUpload;
          let resourceType;
          
          // Convert base64 to blob if necessary
          if (typeof file === 'string' && file.startsWith('data:')) {
            try {
              fileToUpload = base64ToBlob(file);
              resourceType = getResourceType(file);
            } catch (error) {
              console.error('Error converting base64 to blob:', error);
              reject(error);
              return;
            }
          } else {
            fileToUpload = file;
            resourceType = getResourceType(file);
          }

          const formData = new FormData();
          formData.append('file', fileToUpload);
          formData.append('upload_preset', UPLOAD_PRESET);
          formData.append('folder', FOLDER_NAME);
          
          // Log thông tin file để debug
          console.log('Uploading file:', {
            fileType: typeof fileToUpload === 'string' ? 'base64' : fileToUpload.type,
            resourceType: resourceType
          });

          // Sử dụng XMLHttpRequest để upload
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
          
          // Không cần set Content-Type khi sử dụng FormData, browser sẽ tự thêm boundary

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              if (response.secure_url) {
                // Trả về URL bảo mật từ Cloudinary
                resolve(response.secure_url);
                console.log(`${resourceType} upload successful:`, response.secure_url);
                
              } else {
                reject(new Error('Không nhận được URL từ Cloudinary'));
              }
            } else {
              // Thêm thông tin chi tiết về lỗi
              let errorMessage = `Upload thất bại với mã lỗi: ${xhr.status}`;
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.error && errorResponse.error.message) {
                  errorMessage += ` - ${errorResponse.error.message}`;
                }
              } catch (e) {
                console.error('Không thể parse lỗi từ Cloudinary:', e);
              }
              console.error('Chi tiết lỗi Cloudinary:', xhr.responseText);
              reject(new Error(errorMessage));
            }
          };

          xhr.onerror = () => reject(new Error('Lỗi kết nối mạng'));

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              // Tính toán tiến trình upload cho tất cả các file
              const percent = ((index + event.loaded / event.total) / files.length) * 100;
              setProgress(Math.floor(percent));
            }
          };

          xhr.send(formData);
        });
      });

      // Đợi tất cả các file upload hoàn tất
      const urls = await Promise.all(uploadPromises);
      setProgress(100);
      return urls;
    } catch (err) {
      console.error('Upload lỗi:', err);
      setError(err);
      throw err;
    }

  };

  // Trả về các hàm và state cần thiết
  return { uploadImages, progress, error, cld };
};
