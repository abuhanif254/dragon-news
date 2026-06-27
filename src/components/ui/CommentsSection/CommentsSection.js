"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { subscribeToAuth } from "@/lib/auth-service";
import { getCommentsByArticle, addComment, flagComment } from "@/lib/firestore";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function CommentsSection({ articleId }) {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [flaggedCommentIds, setFlaggedCommentIds] = useState([]);
  const [replyToId, setReplyToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState("");
  const showToast = useToast();

  useEffect(() => {
    // 1. Subscribe to auth changes
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
    });

    // 2. Fetch comments for this article
    const loadComments = async () => {
      try {
        const data = await getCommentsByArticle(articleId);
        setComments(data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    loadComments();

    return () => unsubscribe();
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const savedComment = await addComment(articleId, user, newComment);
      setComments((prev) => [...prev, savedComment]);
      setNewComment("");
      showToast("Comment posted successfully!", "success");
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Failed to post comment. Please try again.");
      showToast("Failed to post comment. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReply = async (parentId) => {
    if (!user || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      const savedComment = await addComment(articleId, user, replyContent, parentId);
      setComments((prev) => [...prev, savedComment]);
      setReplyContent("");
      setReplyToId(null);
      showToast("Reply posted successfully!", "success");
    } catch (err) {
      console.error("Error submitting reply:", err);
      showToast("Failed to post reply. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlag = async (commentId) => {
    if (flaggedCommentIds.includes(commentId)) return;

    try {
      await flagComment(commentId);
      setFlaggedCommentIds((prev) => [...prev, commentId]);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, flaggedCount: (c.flaggedCount || 0) + 1 } : c
        )
      );
      showToast("Comment flagged for moderator review.", "warning");
    } catch (err) {
      console.error("Error flagging comment:", err);
      showToast("Failed to flag comment.", "error");
    }
  };

  const formatCommentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "";
    }
  };

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography
        variant="h5"
        component="h3"
        fontWeight={800}
        sx={{ fontFamily: "'Playfair Display', serif", mb: 3 }}
      >
        Comments ({comments.length})
      </Typography>

      {/* Comment Form */}
      {user ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar src={user.photoURL || user.photo} sx={{ width: 40, height: 40 }}>
              {(user.displayName || user.email || "?").charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder="Share your thoughts on this story..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "background.paper",
                  },
                }}
              />
              {error && (
                <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !newComment.trim()}
                endIcon={<SendIcon />}
                sx={{
                  mt: 2,
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: "#c0392b",
                  "&:hover": { bgcolor: "#96281b" },
                }}
              >
                Post Comment
              </Button>
            </Box>
          </Stack>
        </Box>
      ) : (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(0,0,0,0.02)",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Join the conversation. Please{" "}
            <Link href="/login" style={{ color: "#c0392b", fontWeight: 700, textDecoration: "underline" }}>
              Sign In
            </Link>{" "}
            to write comments.
          </Typography>
        </Paper>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", py: 2 }}>
          No comments yet. Be the first to start the conversation!
        </Typography>
      ) : (
        <Stack spacing={4}>
          {comments.filter(c => !c.parentId).map((comment) => {
            const isFlagged = flaggedCommentIds.includes(comment.id);
            const replies = comments.filter(c => c.parentId === comment.id);
            
            return (
              <Box key={comment.id}>
                {/* Parent Comment */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar src={comment.photo} sx={{ width: 38, height: 38 }}>
                    {(comment.authorName || "?").charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="subtitle2" fontWeight={700}>
                          {comment.authorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCommentDate(comment.timestamp)}
                        </Typography>
                      </Stack>
                      <Tooltip title={isFlagged ? "Flagged for review" : "Report inappropriate comment"}>
                        <IconButton
                          size="small"
                          onClick={() => handleFlag(comment.id)}
                          sx={{
                            color: isFlagged ? "#c0392b" : "text.secondary",
                            "&:hover": { color: "#c0392b" },
                          }}
                        >
                          {isFlagged ? (
                            <FlagIcon fontSize="small" />
                          ) : (
                            <OutlinedFlagIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: "text.primary",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {comment.content}
                    </Typography>

                    {/* Action buttons line */}
                    {user && (
                      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                          onClick={() => {
                            setReplyToId(replyToId === comment.id ? null : comment.id);
                            setReplyContent("");
                          }}
                          sx={{ textTransform: "none", color: "text.secondary", fontWeight: 700, p: 0, minWidth: 0, "&:hover": { color: "#c0392b" } }}
                        >
                          Reply
                        </Button>
                      </Stack>
                    )}
                  </Box>
                </Stack>

                {/* Reply Input Form */}
                {replyToId === comment.id && (
                  <Box sx={{ mt: 2.5, ml: { xs: 2, sm: 6 } }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar src={user.photoURL || user.photo} sx={{ width: 32, height: 32 }}>
                        {(user.displayName || user.email || "?").charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          placeholder={`Reply to ${comment.authorName}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2.5,
                              bgcolor: "background.paper",
                            },
                          }}
                        />
                        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={submitting || !replyContent.trim()}
                            onClick={() => handlePostReply(comment.id)}
                            sx={{ bgcolor: "#c0392b", fontWeight: 700, borderRadius: 1.5, textTransform: "none", "&:hover": { bgcolor: "#96281b" } }}
                          >
                            Post Reply
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setReplyToId(null)}
                            sx={{ color: "text.secondary", fontWeight: 700, textTransform: "none" }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Nested Replies list */}
                {replies.length > 0 && (
                  <Box sx={{ 
                    mt: 2.5, 
                    ml: { xs: 2, sm: 6 }, 
                    pl: 2.5, 
                    borderLeft: "2px solid", 
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3 
                  }}>
                    {replies.map((reply) => {
                      const isReplyFlagged = flaggedCommentIds.includes(reply.id);
                      return (
                        <Box key={reply.id}>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar src={reply.photo} sx={{ width: 32, height: 32 }}>
                              {(reply.authorName || "?").charAt(0)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Typography variant="subtitle2" fontWeight={700}>
                                    {reply.authorName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatCommentDate(reply.timestamp)}
                                  </Typography>
                                </Stack>
                                <Tooltip title={isReplyFlagged ? "Flagged for review" : "Report inappropriate comment"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleFlag(reply.id)}
                                    sx={{
                                      color: isReplyFlagged ? "#c0392b" : "text.secondary",
                                      "&:hover": { color: "#c0392b" },
                                    }}
                                  >
                                    {isReplyFlagged ? (
                                      <FlagIcon fontSize="small" />
                                    ) : (
                                      <OutlinedFlagIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  color: "text.primary",
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {reply.content}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                <Divider sx={{ mt: 3.5, borderColor: "divider" }} />
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
