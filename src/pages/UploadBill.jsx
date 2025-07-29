import React, { useState } from 'react';
import axios from 'axios';

const UploadBill = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert('No image selected.');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:5000/scan-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Image uploaded successfully!');
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Receipt Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {previewUrl && (
        <div style={{ marginTop: '10px' }}>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px' }} />
        </div>
      )}
      <button onClick={handleSubmit} disabled={uploading} style={{ marginTop: '10px' }}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default UploadBill;
