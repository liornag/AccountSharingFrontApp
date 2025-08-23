import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadBill.css";
import api from "../lib/api";
import { Button, message, Steps, theme, Input, Select, Radio } from "antd";
import ReceiptCropper from "../components/Upload/ReceiptCropper";
const { TextArea } = Input;
const { Option } = Select;

const steps = [
  {
    title: "Bill Details",
    content: "First-content",
  },
  {
    title: "Upload Image",
    content: "Second-content",
  },
  {
    title: "Confirm",
    content: "Last-content",
  },
];

function UploadBill() {
  const [currentStep, setCurrentStep] = useState(0);

  const [sessionId, setSessionId] = useState("");
  const [billName, setBillName] = useState("Example bill name");
  const [billType, setBillType] = useState("food");
  const [billDescription, setBillDescription] = useState("");
  const [language, setLanguage] = useState("EN");
  const [imageFile, setImageFile] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [blob, setBlob] = useState("");
  const [points, setPoints] = useState([
    { x: 50, y: 50 },
    { x: 250, y: 50 },
    { x: 250, y: 200 },
    { x: 50, y: 200 },
  ]);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleSetLanguage = async (e) => {
    setLanguage(e.target.value);
  };

  const handleNextByStep = async () => {
    if (currentStep === 0) {
      next();
    }

    if (currentStep === 1) {
      //await handleSubmit();
      await handleCrop();
      next();
    }

    if (currentStep === 2) {
      await handleSubmit();
    }
  };

  const handleCrop = async () => {
    if (!imageFile) {
      alert("No image selected.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("points", JSON.stringify(points));

    try {
      setUploading(true);
      // const token = localStorage.getItem("token");
      const response = await api.post("/crop-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      }); //we need to get here ssesioid

      const blob = await response.data;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setBlob(blob);
      //setSessionId(sessionId);
      //navigate("/select-items", { state: { items, sessionId } });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert("No image selected.");
      return;
    }

    const formData = new FormData();

    const file = new File([blob], "cropped_receipt.jpg", {
      type: "image/jpeg",
    });

    // Append to FormData
    formData.append("image", file);

    // Add any other fields you want
    formData.append("billName", billName);
    formData.append("billType", billType);
    formData.append("billDescription", billDescription);

    try {
      setUploading(true);
      // const token = localStorage.getItem("token");
      const res = await api.post("/scan-receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }); //we need to get here ssesioid
      //console.log("scan-receipt response:", res.data);

      const { sessionId } = res.data;
      setSessionId(sessionId);
      console.log(sessionId);
      
      if (sessionId) {
        navigate(`/bill/${sessionId}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div className="upload-container">
        <Steps current={currentStep} items={items} />
        <div className="stepper-content">
          {currentStep === 0 && (
            <div
              style={{
                width: "80%",
                margin: "5px",
                gap: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "left",
                alignItems: "start",
              }}
            >
              <h2 style={{ color: "#333" }}>Bill Details</h2>
              <Input
                placeholder="Bill Name"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                style={{ marginBottom: 12, width: "200px" }}
              />
              <Select
                placeholder="Select Bill Type"
                onChange={(val) => setBillType(val)}
                style={{ width: "200px", marginBottom: 12 }}
              >
                <Option value="food">Food</Option>
                <Option value="utilities">Utilities</Option>
                <Option value="entertainment">Entertainment</Option>
              </Select>
              <Radio.Group value={language} onChange={handleSetLanguage}>
                <Radio.Button value="EN">EN</Radio.Button>
                <Radio.Button value="HE">HE</Radio.Button>
              </Radio.Group>
              <TextArea
                placeholder="Description (helps identifying the content)"
                rows={3}
                value={billDescription}
                onChange={(e) => setBillDescription(e.target.value)}
              />
            </div>
          )}
          {currentStep === 1 && !previewUrl && (
            <>
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
            </>
          )}

          {currentStep === 1 && previewUrl && (
            <>
              <div className="upload-card">
                <ReceiptCropper
                  fileUrl={previewUrl}
                  points={points}
                  setPoints={setPoints}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                gap: 24, // space between info and image
                flexWrap: "wrap", // wrap on small screens
              }}
            >
              {/* User Info */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                  alignItems: "left",
                  textAlign: "left",
                  gap: 12,
                  padding: 16,

                  borderRadius: 12,

                  minWidth: 200,
                }}
              >
                <span style={{ color: "#333", fontWeight: 600 }}>
                  {billName}
                </span>
                <span style={{ color: "#333" }}>
                  <b>Type: </b> {billType}
                </span>
                <span style={{ color: "#333" }}>
                  <b>Description: </b> {billDescription}
                </span>
                <span style={{ color: "#333" }}>
                  <b>Language: </b> {language}
                </span>
              </div>

              {/* Cropped Image */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: 200,
                }}
              >
                <img
                  src={previewUrl}
                  alt="Cropped Receipt"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 400,
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, marginBottom: 24 }}>
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => handleNextByStep()}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={() => handleNextByStep()}>
                Done
              </Button>
            )}
            {currentStep > 0 && (
              <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
                Previous
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadBill;
