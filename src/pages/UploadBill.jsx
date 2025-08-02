import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadBill = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);

  const navigate = useNavigate();

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
      const response = await axios.post('http://localhost:5100/scan-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const gptItems = response.data.items;

      if (!Array.isArray(gptItems)) {
        alert('Invalid response from GPT. Please try again.');
        return;
      }

      setItems(gptItems);
      console.log('✅ Filtered Items:', gptItems);

      navigate('/select-items', { state: { items: gptItems } });

    } catch (error) {
      console.error('❌ Upload failed:', error);
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

      {items.length > 0 && (
        <div>
          <h2>Items:</h2>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.name} - {item.price !== null ? `₪${item.price}` : 'Price not found'} (x{item.quantity})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadBill;
