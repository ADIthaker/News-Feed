import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Box, Typography, Card, CardContent, Avatar, CircularProgress, Alert } from "@mui/material";
import axios from "axios";

const Feed = () => {
  const location = useLocation();
  const selectedTopics = useSelector((state) => state.feed.topics); // Redux-selected topics
  const [feedData, setFeedData] = useState([]); // State for feed data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch feed data only if redirected from login
        if (location.state?.from === "/login") {
          const token = localStorage.getItem("jwtToken");
          if (!token) {
            setError("Authentication token missing. Please log in again.");
            return;
          }

          const response = await axios.get("http://34.66.26.140/feed", {
            headers: { Authorization: token },
          });
          setFeedData(response.data.toSend)
          console.log(response.data); // Update feed data with the response
        } else if (location.state?.from === "/selection") {
          // If redirected from selection, use the topics passed in state
          setFeedData(
            selectedTopics.map((topic) => (
            {
              title: topic.title,
              summary: topic.summary,
              link: topic.link,
              image: topic.img
            }))
         
          
          )}
      } catch (err) {
        console.error("Error fetching feed data:", err);
        setError("Failed to load feed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [location.state?.from, selectedTopics]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" mb={4}>
        Your Feed
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // One tile per row
          gap: 2, // Space between tiles
        }}
      >
        {feedData.map((item, index) => (
          <a
            key={index}
            href={item.link} // External link
            target="_blank" // Opens in a new tab
            rel="noopener noreferrer" // Security measure
            style={{ textDecoration: "none" }}
          >
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                padding: 2,
                height: "100%",
              }}
            >
              <Avatar
                src={item.img}
                alt={item.title}
                sx={{
                  width: 80,
                  height: 80,
                  marginRight: 2,
                  flexShrink: 0,
                }}
              />
              <CardContent>
                <Typography
                  variant="h6"
                  noWrap
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                    maxHeight: 48,
                  }}
                >
                  {item.summary}
                </Typography>
              </CardContent>
            </Card>
          </a>
        ))}
      </Box>
    </Box>
  );
};

export default Feed;








