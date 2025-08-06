import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Hardcode credentials just for testing
cloudinary.config({
  cloud_name: "your_cloud_name",
  api_key: "your_api_key",
  api_secret: "your_api_secret",
});

const testUpload = async () => {
  const path = "public/temp/selfie.jpg"; // your file path
  console.log("Uploading:", path);

  try {
    const result = await cloudinary.uploader.upload(path, {
      resource_type: "image",
    });

    console.log("✅ Upload success:", result.secure_url);
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
};

testUpload();
