// This file manages the connection to our MongoDB database.
const mongoose = require("mongoose");


// An asynchronous function to connect to the DB.
const connectDB = async () => {
  try {
    // We try to connect using the MONGO_URI from our .env file.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // If the connection is successful, log it to the console.
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If there's an error, log it and exit the application.
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;