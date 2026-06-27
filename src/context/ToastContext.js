"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

const ToastContext = createContext(null);
const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Confirm Action");
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState(null);

  const showConfirm = useCallback((t = "Confirm", msg = "Are you sure?") => {
    setTitle(t);
    setMessage(msg);
    setOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = (choice) => {
    setOpen(false);
    if (resolver) {
      resolver(choice);
    }
  };

  return (
    <ConfirmContext.Provider value={showConfirm}>
      {children}
      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1.5,
            minWidth: 290,
            boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", pb: 1 }}>{title}</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ color: "#475569", fontWeight: 500, fontSize: "0.95rem", lineHeight: 1.5 }}>
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ gap: 1, pr: 2.5, pb: 1.5 }}>
          <Button 
            onClick={() => handleClose(false)} 
            sx={{ fontWeight: 700, borderRadius: 2, textTransform: "none", color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleClose(true)} 
            variant="contained" 
            color="error"
            sx={{ fontWeight: 800, borderRadius: 2, textTransform: "none", px: 2.5, bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info"); // "success" | "error" | "info" | "warning"

  const showToast = useCallback((msg, sev = "info") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <ConfirmProvider>
        {children}
      </ConfirmProvider>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          zIndex: 10000,
        }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 3.5,
            fontWeight: 700,
            fontSize: "0.9rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            "&.MuiAlert-filledSuccess": {
              bgcolor: "#10b981",
            },
            "&.MuiAlert-filledError": {
              bgcolor: "#ef4444",
            },
            "&.MuiAlert-filledWarning": {
              bgcolor: "#f59e0b",
            },
            "&.MuiAlert-filledInfo": {
              bgcolor: "#3b82f6",
            },
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
