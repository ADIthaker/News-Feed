import React, { useState } from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateFeedTopics } from '../redux/actions';
import axios from 'axios';

const Selection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tiles = [
    "Sports", "USA", "Politics", "Olympics", "Music", 
    "Books", "Finance", "Technology", "Healthcare", "Education"
  ];
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [loading, setLoading] = useState(false); // State for button loading
  const [error, setError] = useState(null); // State for handling errors

  const handleTileClick = (tile) => {
    setSelectedTiles((prev) =>
      prev.includes(tile) ? prev.filter((t) => t !== tile) : [...prev, tile]
    );
  };

  const handleProceed = async () => {
    try {
      setLoading(true); // Start loading
      setError(null); // Clear previous errors

      // Dispatch selected topics to Redux store
      dispatch(updateFeedTopics(selectedTiles));

      // Get token from localStorage
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      // Make Axios POST request
      const response = await axios.post(
        'http://34.66.26.140/topics',
        { topics: selectedTiles }, // Pass selected topics
        {
          headers: {
            'Authorization': token,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log('Feed topics saved successfully:', response.data.toSend);
        navigate('/feed', { state: { from: '/selection', topics: selectedTiles } }); // Navigate to Feed page
      } else {
        throw new Error(`Error from server ${response.err}`);
      }
    } catch (err) {
      console.error('Error saving feed topics:', err);
      setError('Failed to save topics. Please try again.');
      console.log(err)
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" mb={4} textAlign="center">
        Select Your Topics
      </Typography>
      <Grid container spacing={2}>
        {tiles.map((tile, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Box
              sx={{
                border: `2px solid ${selectedTiles.includes(tile) ? '#1976d2' : '#ccc'}`,
                borderRadius: 2,
                padding: 2,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: selectedTiles.includes(tile) ? '#e3f2fd' : '#f5f5f5',
                '&:hover': { backgroundColor: '#eeeeee' },
              }}
              onClick={() => handleTileClick(tile)}
            >
              {tile}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Error Message */}
      {error && (
        <Typography
          variant="body2"
          color="error"
          sx={{ textAlign: 'center', marginTop: 2 }}
        >
          {error}
        </Typography>
      )}

      {/* Proceed Button */}
      <Button
        variant="contained"
        color="primary"
        disabled={selectedTiles.length < 2 || loading} // Disable if <2 topics or loading
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          textTransform: 'none',
        }}
        onClick={handleProceed}
      >
        {loading ? 'Loading Feed...' : 'Proceed to Feed'}
      </Button>
    </Box>
  );
};

export default Selection;



