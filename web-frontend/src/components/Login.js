import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { login } from "../redux/actions";
import { Box, Typography, TextField, Button, Link, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // State for error handling
  const [loading, setLoading] = useState(false); // State for loading button
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("http://34.66.26.140/login", {
        username: email,
        password,
      });

      const token = response.data.token; // Assuming the response contains a JWT token
      const userTopics = response.data.user.topics; // User topics from response

      localStorage.setItem("jwtToken", token); // Save token in localStorage
      dispatch(login({ email, topics: userTopics })); // Update Redux state

      // Redirect based on topics
      if (userTopics.length === 0) {
        navigate("/selection"); // No topics, go to selection page
      } else {
        navigate("/feed", { state: { from: "/login" } }); // Has topics, go to feed
      }
    } catch (error) {
      console.error("Login failed", error);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" textAlign="center" mb={2}>
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Link
          href="#"
          sx={{ display: "block", textAlign: "right", mb: 2, fontSize: "0.9rem" }}
        >
          Forgot password?
        </Link>
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "#1976d2",
            color: "#fff",
            textTransform: "none",
            mb: 2,
            "&:hover": { backgroundColor: "#1565c0" },
          }}
          onClick={handleLogin}
          disabled={loading} // Disable button while loading
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
        <Typography textAlign="center" variant="body2">
          Don't have an account?{" "}
          <Link href="/signup" sx={{ fontWeight: "bold" }}>
            Create new
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;



