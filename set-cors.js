const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to your CORS configuration file
const corsFilePath = path.join(__dirname, 'cors.json');

// Read the CORS configuration
const corsConfig = fs.readFileSync(corsFilePath, 'utf8');

// Create a temporary file with the CORS configuration
const tempFilePath = path.join(__dirname, 'temp-cors.json');
fs.writeFileSync(tempFilePath, corsConfig);

// Command to set CORS configuration
const command = `gcloud storage buckets update gs://healthcare-17c9a.firebasestorage.app --cors-file=${tempFilePath}`;

console.log('Setting CORS configuration for Firebase Storage...');
exec(command, (error, stdout, stderr) => {
  // Clean up the temporary file
  fs.unlinkSync(tempFilePath);
  
  if (error) {
    console.error('Error setting CORS configuration:', error);
    console.error(stderr);
    return;
  }
  
  console.log('CORS configuration set successfully!');
  console.log(stdout);
});