"use client";
import { useState, useRef } from "react";
import { Box, Button, CircularProgress, Typography, IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { uploadImageToStorage } from "@/lib/storage-service";
import SafeImage from "@/components/ui/SafeImage/SafeImage";

export default function ImageUpload({ value, onChange, label, folder = "general", height = 160 }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const downloadURL = await uploadImageToStorage(file, folder);
      onChange(downloadURL);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: "#475569" }}>
          {label}
        </Typography>
      )}

      <Box
        sx={{
          border: "2px dashed",
          borderColor: value ? "transparent" : "#cbd5e1",
          borderRadius: 2,
          bgcolor: value ? "#000" : "#f8fafc",
          height,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "all 0.2s",
          "&:hover": {
            borderColor: value ? "transparent" : "#ef4444",
            bgcolor: value ? "#000" : "#f1f5f9",
          }
        }}
      >
        {isUploading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CircularProgress size={32} sx={{ color: "#ef4444", mb: 1 }} />
            <Typography variant="caption" fontWeight={600} sx={{ color: "#475569" }}>Uploading...</Typography>
          </Box>
        ) : value ? (
          <>
            <SafeImage
              src={value}
              alt="Uploaded Preview"
              fill
              style={{ objectFit: "cover", opacity: 0.85 }}
              unoptimized
            />
            <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
              <IconButton 
                size="small" 
                onClick={handleRemove}
                sx={{ bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "white", color: "#ef4444" } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              Drag and drop or click to upload
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              sx={{ borderRadius: 2, textTransform: "none", color: "#475569", borderColor: "#cbd5e1" }}
            >
              Browse Files
            </Button>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Box>
    </Box>
  );
}
