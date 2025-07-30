import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function filterRelevantItems(rawItems) {
  const stopWords = ['total', 'subtotal', 'amount', 'cash', 'change', 'סה"כ', 'תשלום', 'עודף', 'סכום'];
  const stopRegex = new RegExp(`\\b(${stopWords.join('|')})\\b`, 'i');
  const currencySymbolRegex = /[\$₪€£]/;
  const priceLineRegex = /.{2,}\s+\d+(\.\d{1,2})?\s*$/;
  const hebrewCharRegex = /[\u0590-\u05FF]/;

  const filteredItems = [];

  for (const line of rawItems) {
    const cleaned = line.trim().replace(/[–—]/g, '-').toLowerCase();
    console.log('Line:', cleaned);

    if (stopRegex.test(cleaned)) break;

    if (currencySymbolRegex.test(cleaned)) {
      filteredItems.push({ name: line.trim(), price: null });
      continue;
    }

    if (hebrewCharRegex.test(cleaned) && priceLineRegex.test(cleaned)) {
      const match = line.trim().match(/(.+?)\s+(\d+(\.\d{1,2})?)$/);
      if (match) {
        filteredItems.push({ name: match[1], price: parseFloat(match[2]) });
      } else {
        filteredItems.push({ name: line.trim(), price: null });
      }
    }
  }

  return filteredItems;
}

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
      const response = await axios.post('http://localhost:5000/scan-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Server response:', response.data);
      const rawItems = response.data.items;
      const filteredItems = filterRelevantItems(rawItems);

      setItems(filteredItems);
      console.log('Filtered Items:', filteredItems);

      navigate('/select-items', { state: { items: filteredItems } }); 

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

      <div>
        <h2>Items:</h2>
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item.name} - {item.price !== null ? `₪${item.price}` : 'לא זוהה מחיר'}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UploadBill;
