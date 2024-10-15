const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const port = 3001;
const multer = require('multer');
const fs = require('fs');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
}));

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
        cb(null, Date.now() + '-' + file.originalname); // Rename the file
    }
});
const upload = multer({ storage: storage });

// Hardcoded list of students (could be fetched from a DB or another source)
const students = [
    'Saket',
    'Dhruv',
    'Ishan'
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
            const attendanceData = {
                teacherId: req.body.teacherId || 'defaultTeacherId', // Example teacher ID, can be passed from frontend
                attendance
            };
            const attendanceFilePath = path.join(__dirname, 'attendance.json');
            fs.writeFileSync(attendanceFilePath, JSON.stringify(attendanceData, null, 2));

            // Send the attendance record as a response
            res.json(attendanceData);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error in face recognition' });
    }
});

// /api/attendance/:teacherId route to retrieve attendance data from JSON
app.get('/api/attendance/:teacherId', (req, res) => {
    const teacherId = req.params.teacherId;
    const attendanceFilePath = path.join(__dirname, 'attendance.json');

    // Read the stored attendance data
    fs.readFile(attendanceFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error reading attendance data' });
        }
        const attendanceData = JSON.parse(data);
        res.json(attendanceData);
    });
});
