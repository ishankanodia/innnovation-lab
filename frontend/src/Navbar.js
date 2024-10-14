// src/components/Navbar.js
import React, { useState } from "react";
import axios from "axios";
import './Navbar.css';

const Navbar = () => {
    const [image, setImage] = useState(null);

    // Handle file selection
    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!image) {
            alert("Please select an image first");
            return;
        }

        const formData = new FormData();
        formData.append('file', image);

        try {
            // Send image to the backend using axios
            const res = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Response:', res.data); // Show result (recognized names)
            alert(`Recognized faces: ${res.data.names.join(', ')}`);
        } catch (err) {
            console.error("Error uploading the image", err);
            alert('Error in face recognition');
        }
    };

    return (
        <>
            <nav className="navbar">
                <h1>Attendance Dashboard</h1>
            </nav>
            <div className="add-image">
                <input type="file" onChange={handleImageChange} />
                <button onClick={handleUpload}>Upload Image</button>
            </div>
        </>
    );
};

export default Navbar;
