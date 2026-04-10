import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";

dotenv.config();

async function setAdminRole(userId) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: "admin",
      },
    });
    console.log(`✅ User ${userId} has been set as admin`);
  } catch (error) {
    console.error("❌ Error setting admin role:", error.message);
  }
}

// Replace with your actual user ID
// You can find your user ID in:
// 1. Clerk Dashboard > Users
// 2. Browser DevTools > Network tab when making API calls
// 3. Or use the "Make Me Admin" button in the admin navbar
const userId = "user_3C6zTLjry9RjFhg8e23AnUVb3YB"; // Replace with your Clerk user ID

setAdminRole(userId);