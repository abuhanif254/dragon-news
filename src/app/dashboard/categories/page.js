"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid2,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CategoryIcon from "@mui/icons-material/Category";
import ArticleIcon from "@mui/icons-material/Article";
import { 
  getCategories, 
  saveCategory, 
  updateCategoryFirestore, 
  deleteCategoryFirestore,
  getAllNews 
} from "@/lib/firestore";

export default function CategoriesPage() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "", color: "#3b82f6" });
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // 1. Get all categories from dedicated collection
      const categories = await getCategories();
      
      // 2. Get all news to count articles
      const allNews = await getAllNews();
      
      // 3. Map counts to categories
      const categoriesWithCounts = categories.map(cat => {
        const articleCount = allNews.filter(news => news.category === cat.name).length;
        return { ...cat, count: articleCount };
      });

      setCategoryList(categoriesWithCounts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showAlert("error", "Failed to load categories from Firestore.");
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setCurrentCategory(category);
      setFormData({ name: category.name, slug: category.slug, color: category.color });
    } else {
      setEditMode(false);
      setCurrentCategory(null);
      setFormData({ name: "", slug: "", color: "#3b82f6" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({ name: "", slug: "", color: "#3b82f6" });
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await updateCategoryFirestore(currentCategory.id, formData);
        showAlert("success", "Category updated successfully!");
      } else {
        await saveCategory(formData);
        showAlert("success", "Category created successfully!");
      }
      fetchCategories(); // Refresh list
      handleCloseDialog();
    } catch (err) {
      console.error("Save error:", err);
      showAlert("error", "Failed to save category.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategoryFirestore(id);
      showAlert("success", "Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      console.error("Delete error:", err);
      showAlert("error", "Failed to delete category.");
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  const totalArticles = categoryList.reduce((sum, cat) => sum + cat.count, 0);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress color="error" />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b", mb: 0.5 }}>
            Categories Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize your content with categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ fontWeight: "bold", px: 3, py: 1.5, borderRadius: 2 }}
        >
          Add Category
        </Button>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {categoryList.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Categories
                  </Typography>
                </Box>
                <CategoryIcon sx={{ fontSize: 50, color: "#ef4444", opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {totalArticles}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Articles
                  </Typography>
                </Box>
                <ArticleIcon sx={{ fontSize: 50, color: "#3b82f6", opacity: 0.2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {categoryList.length > 0 ? Math.round(totalArticles / categoryList.length) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg per Category
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    bgcolor: "rgba(16, 185, 129, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="#10b981">
                    📊
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Categories Table */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "#64748b" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#64748b" }}>Slug</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#64748b" }}>Articles</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#64748b" }}>Color</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#64748b" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryList.map((category) => (
                <TableRow
                  key={category.id}
                  sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "all 0.2s" }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: category.color,
                        }}
                      />
                      <Typography fontWeight={600}>{category.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={category.slug} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${category.count} articles`}
                      size="small"
                      sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: category.color,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {category.color}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Category">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Category">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(category.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {editMode ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Category Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Technology"
            />
            <TextField
              label="Slug"
              fullWidth
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., tech"
              helperText="URL-friendly version (lowercase, no spaces)"
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Category Color
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{
                    width: 60,
                    height: 40,
                    border: "2px solid #e2e8f0",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                />
                <TextField
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  size="small"
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="error"
            disabled={!formData.name || !formData.slug}
          >
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
