const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const port = 3001;
const multer = require('multer');
const fs = require('fs');

// Middleware to handle CORS and JSON parsing
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
}));

app.use(express.json()); // For parsing JSON bodies

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Rename the file to its original name
    }
});
const upload = multer({ storage: storage });

// Hardcoded list of students (could be fetched from a DB or another source)
const students = [
    'Saket',
    'Dhruv',
    'Vishal',
    'Ishan',
    'Anubhav',
    'Nishul',
    'Dev',
    'Vivek',
    'Mahin',
    'Anjali',
    'Divyanshu'

];

// /upload route to process face recognition and store attendance in a JSON file
app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const date = new Date().toLocaleDateString(); // Current date

    try {
        // Execute the Python script to process the image
        const { exec } = require('child_process');
        exec(`python Attenue.py ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ message: 'Error processing image' });
            }

            // Get recognized names from Python script's stdout
            const recognizedNames = stdout.trim().split('\n').map(name => name.trim());

            // Generate attendance record
            const attendance = students.map(student => ({
                name: student,
                date,
                present: recognizedNames.includes(student.toUpperCase()) // Match with recognized names
            }));

            // Store the attendance record in a JSON file
            const attendanceData = { attendance };
            const attendanceFilePath = path.join(__dirname, 'attendance.json');
            
            // Write attendance data to the JSON file
            fs.writeFileSync(attendanceFilePath, JSON.stringify(attendanceData, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to attendance file', err);
                    return res.status(500).json({ message: 'Error saving attendance' });
                }
            });
            // Return the attendance data to the client
            res.json(attendanceData);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error in face recognition' });
    }
});

// /api/attendance route to retrieve attendance data from JSON
app.get('/api/attendance', (req, res) => {
    const attendanceFilePath = path.join(__dirname, 'attendance.json');

    // Check if the attendance file exists and is not empty
    if (!fs.existsSync(attendanceFilePath)) {
        return res.status(404).json({ message: 'Attendance file not found' });
    }

    // Read and check if the file contains data
    fs.readFile(attendanceFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error reading attendance file' });
        }

        if (!data || data.trim() === '') {
            console.error('Attendance file is empty');
            return res.status(404).json({ message: 'No attendance data available yet' });
        }

        try {
            const attendanceData = JSON.parse(data);
            res.json(attendanceData);
        } catch (parseError) {
            console.error('Error parsing attendance data', parseError);
            return res.status(500).json({ message: 'Error parsing attendance data' });
        }
    });
});
