import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UploadBill.css';

function UploadBill() {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
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
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/scan-receipt", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }); //we need to get here ssesioid
      console.log("scan-receipt response:", res.data);

      const { items, sessionId } = res.data;
      navigate('/select-items', { state: { items, sessionId } });

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Receipt</h2>

        <label htmlFor="upload-input" className="custom-file-label">
          Choose Image
        </label>
        <input
          type="file"
          id="upload-input"
          accept="image/*"
          onChange={handleImageChange}
        />

        {previewUrl && (
          <img src={previewUrl} alt="preview" className="preview-image" />
        )}

        <button
          className="upload-button"
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

      </div>
    </div>
  );
}

export default UploadBill;
