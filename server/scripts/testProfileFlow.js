import axios from 'axios';
import FormData from 'form-data';

const API_URL = 'http://localhost:5000/api';
const testEmail = `testuser_${Date.now()}@example.com`;

async function testProfileFlow() {
  try {
    console.log("1. Registering new user...");
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      fullName: "Test User",
      email: testEmail,
      mobile: "9876543210",
      password: "Password123",
      gender: "Male"
    });
    const token = regRes.data.token;
    console.log("Registration successful! Token received.");

    console.log("2. Checking profile status on login...");
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`isProfileSubmitted: ${meRes.data.user.isProfileSubmitted}`); // Should be false

    console.log("3. Creating profile...");
    const formData = new FormData();
    const fakeForm = {
      basic: { name: "Test User", age: "25" },
      religion: { religion: "Hindu", caste: "Brahmin" }
    };
    formData.append("updates", JSON.stringify(fakeForm));

    const profileRes = await axios.post(`${API_URL}/profile`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log("Profile created! Checking if backend returned the updated user status...");
    console.log(`Returned user object:`, profileRes.data.user);
    
    if (profileRes.data.user?.isProfileSubmitted) {
      console.log("✅ SUCCESS! The server correctly parsed 'updates' and set 'isProfileSubmitted' to true.");
    } else {
      console.log("❌ FAILED! The server did not return 'isProfileSubmitted: true'.");
    }

  } catch (error) {
    console.error("Error during test:", error.response?.data || error.message);
  }
}

testProfileFlow();
