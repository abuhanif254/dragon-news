"use client";
import React, { useState, useEffect } from "react";
import { Stack, Box, Typography, Button, Tooltip } from "@mui/material";

// Using native emojis for lightweight rendering
const REACTIONS = [
  { id: "like", emoji: "👍", label: "Like" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "insightful", emoji: "💡", label: "Insightful" },
  { id: "sad", emoji: "😢", label: "Sad" },
];

export default function ArticleReactions({ articleId, initialReactions }) {
  const [counts, setCounts] = useState({
    like: 0,
    fire: 0,
    insightful: 0,
    sad: 0,
  });
  
  // Track which reaction the current user has clicked
  const [userReaction, setUserReaction] = useState(null);

  // Load initial counts from the article document
  useEffect(() => {
    setCounts({
      like: initialReactions?.like || 0,
      fire: initialReactions?.fire || 0,
      insightful: initialReactions?.insightful || 0,
      sad: initialReactions?.sad || 0,
    });
    
    // Load local storage choice for this article
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`react_${articleId}`);
      setUserReaction(stored || null);
    }
  }, [articleId, initialReactions]);

  const handleReact = async (id) => {
    // Save to local storage and trigger update
    setCounts((prev) => {
      const newCounts = { ...prev };
      
      // If clicking the same reaction, toggle it off
      if (userReaction === id) {
        newCounts[id] = Math.max(0, newCounts[id] - 1);
        setUserReaction(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(`react_${articleId}`);
        }
        // Async background save
        fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId, reactionId: id, incrementBy: -1 })
        }).catch(console.error);
      } 
      // If clicking a different reaction, decrement old and increment new
      else {
        if (userReaction) {
          newCounts[userReaction] = Math.max(0, newCounts[userReaction] - 1);
          fetch('/api/reactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId, reactionId: userReaction, incrementBy: -1 })
          }).catch(console.error);
        }
        newCounts[id] += 1;
        setUserReaction(id);
        if (typeof window !== "undefined") {
          localStorage.setItem(`react_${articleId}`, id);
        }
        fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId, reactionId: id, incrementBy: 1 })
        }).catch(console.error);
      }
      return newCounts;
    });
  };

  return (
    <Box sx={{ mt: 4, mb: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
      <Typography variant="overline" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.1em", display: "block", mb: 2 }}>
        What do you think?
      </Typography>
      
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ gap: 1.5 }}>
        {REACTIONS.map((reaction) => (
          <Tooltip 
            key={reaction.id} 
            title={`${counts[reaction.id] || 0} readers reacted with ${reaction.label}`} 
            arrow
            placement="top"
          >
            <Button
              variant="outlined"
              onClick={() => handleReact(reaction.id)}
              sx={{
                borderRadius: 8,
                py: 0.8,
                px: 2.5,
                borderColor: userReaction === reaction.id ? "#c0392b" : "divider",
                backgroundColor: userReaction === reaction.id ? "rgba(192,57,43,0.08)" : "transparent",
                color: userReaction === reaction.id ? "#c0392b" : "text.secondary",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: userReaction === reaction.id ? "rgba(192,57,43,0.12)" : "rgba(192,57,43,0.04)",
                  borderColor: "#c0392b",
                  color: "#c0392b",
                  transform: "translateY(-1px)",
                }
              }}
            >
              <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>{reaction.emoji}</span>
              <Typography variant="body2" fontWeight={700}>
                {counts[reaction.id] || 0}
              </Typography>
            </Button>
          </Tooltip>
        ))}
      </Stack>

      {Object.values(counts).some(v => v > 0) && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2.5, fontWeight: 600, letterSpacing: "0.02em" }}>
          🔥 Community Engagement: {Object.values(counts).reduce((a, b) => a + b, 0)} readers reacted to this report.
        </Typography>
      )}
    </Box>
  );
}
