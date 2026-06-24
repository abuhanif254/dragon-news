"use client";
import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { uploadImageToStorage } from "@/lib/storage-service";
import "react-quill-new/dist/quill.snow.css";
import { Box, CircularProgress, Typography } from "@mui/material";

// Dynamically load ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => (
    <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300, bgcolor: "#f8fafc", borderRadius: 2 }}>
      <CircularProgress size={32} sx={{ color: "#ef4444" }} />
    </Box>
  )
});

export default function CustomEditor({ value, onChange, placeholder = "Write your content here..." }) {
  const quillRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Custom image handler
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      // Ensure file size is reasonable (e.g., < 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please upload an image under 5MB.");
        return;
      }

      const quill = quillRef.current;
      if (!quill) return;
      const editor = quill.getEditor();
      const range = editor.getSelection(true);

      try {
        setIsUploading(true);
        // Temporarily insert a loading text or placeholder if desired, but here we just wait
        const downloadURL = await uploadImageToStorage(file, "articles/inline");
        
        // Insert the image into the editor at the cursor position
        editor.insertEmbed(range.index, "image", downloadURL);
        editor.setSelection(range.index + 1);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
  };

  // Memoize modules so the editor doesn't lose focus on re-renders
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );

  return (
    <Box sx={{ position: "relative" }}>
      {isUploading && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 10, bgcolor: "rgba(255,255,255,0.7)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          borderRadius: 2
        }}>
          <CircularProgress size={40} sx={{ color: "#ef4444", mb: 2 }} />
          <Typography variant="body2" fontWeight={700}>Uploading image...</Typography>
        </Box>
      )}
      
      <Box sx={{
        "& .quill": { bgcolor: "white", borderRadius: 2 },
        "& .ql-toolbar": { borderTopLeftRadius: 8, borderTopRightRadius: 8, borderColor: "#e2e8f0" },
        "& .ql-container": { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderColor: "#e2e8f0", minHeight: 300, fontSize: "1rem", fontFamily: "'Inter', sans-serif" }
      }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
        />
      </Box>
    </Box>
  );
}
