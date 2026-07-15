import { Storage } from 'megajs';

// Upload file to MEGA
export const uploadToMega = async (fileBuffer, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Initialize MEGA storage for each upload
      const storage = new Storage({
        email: process.env.MEGA_EMAIL,
        password: process.env.MEGA_PASSWORD,
      });
      
      // Wait for storage to be ready
      await new Promise((storageResolve, storageReject) => {
        storage.on('ready', storageResolve);
        storage.on('error', storageReject);
      });

      // Upload the file
      const uploadStream = storage.upload(fileName, fileBuffer);
      
      uploadStream.on('complete', async (file) => {
        try {
          const url = await file.link();
          resolve({
            url,
            fileName: file.name,
            size: file.size
          });
        } catch (linkError) {
          reject(linkError);
        }
      });
      
      uploadStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Delete file from MEGA (optional)
export const deleteFromMega = async (fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Initialize MEGA storage for deletion
      const storage = new Storage({
        email: process.env.MEGA_EMAIL,
        password: process.env.MEGA_PASSWORD,
      });
      
      // Wait for storage to be ready
      await new Promise((storageResolve, storageReject) => {
        storage.on('ready', storageResolve);
        storage.on('error', storageReject);
      });

      // Find and delete the file
      const file = storage.root.find(file => file.name === fileName);
      if (file) {
        await file.delete();
        resolve();
      } else {
        resolve(); // File not found, consider it deleted
      }
    } catch (error) {
      reject(error);
    }
  });
};