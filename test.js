// Simple script to test connection to the backend
// Run this with: node test.js

async function checkBackend() {
  console.log("Attempting to connect to http://localhost:3002...");

  try {
    const response = await fetch('http://localhost:3002/api/members');

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ SUCCESS! Connected to backend.");
    console.log("Data received:", data);
  } catch (error) {
    console.error("❌ FAILED:", error.message);
    console.log("Make sure your server.js is running in a SEPARATE terminal!");
  }
}

checkBackend();