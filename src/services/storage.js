const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageFile = async (file, folder = 'uploads') => {
  if (!file) return null;
  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration missing. Please set REACT_APP_CLOUDINARY_* values in .env',
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(
      errorPayload?.error?.message || 'Unable to upload image to Cloudinary.',
    );
  }

  const data = await response.json();
  return data.secure_url;
};

export default uploadImageFile;

