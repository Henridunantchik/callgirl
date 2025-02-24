// addCategories.js
const mongoose = require('mongoose');
const Category = require('./models/category');  // Assuming you have the category model

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");

    // Insert categories
    Category.insertMany([
        { name: 'MALE', slug: 'male' },
        { name: 'FEMALE', slug: 'female' },
        { name: 'AUTRES', slug: 'autres' }
    ])
    .then(() => {
        console.log('Categories added successfully!');
        mongoose.connection.close();
    })
    .catch((err) => {
        console.log('Error inserting categories:', err);
        mongoose.connection.close();
    });
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
});
