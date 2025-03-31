import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../utils/firebase';

export const useFirebaseStorage = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadImages = async (files) => {
    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            (error) => {
              setError(error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { uploadImages, progress, error };
};