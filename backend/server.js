// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const port = 3001;
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
}));

app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

const studentImagesFolder = '/Users/ishankanodia/Google Drive/My Drive/Students';

function getStudentNames() {
    return fs.readdirSync(studentImagesFolder)
        .filter(file => file.endsWith('.png'))
        .map(file => path.parse(file).name);
}

app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const date = new Date().toLocaleDateString();

    try {
        exec(`python Attenue.py ${filePath}`, (error, stdout, stderr) => {
            if (error) return res.status(500).json({ message: 'Error processing image' });

            const recognizedNames = stdout.trim().split('\n').map(name => name.trim());
            const students = getStudentNames();
            const attendance = students.map(student => ({
                name: student,
                date,
                present: recognizedNames.includes(student.toUpperCase())
            }));

            const attendanceData = { attendance };
            const attendanceFilePath = path.join(__dirname, 'attendance.json');
            fs.writeFileSync(attendanceFilePath, JSON.stringify(attendanceData, null, 2));

            res.json(attendanceData);
        });
    } catch (err) {
        res.status(500).json({ message: 'Error in face recognition' });
    }
});

app.post('/clickPhoto', async (req, res) => {
    try {
        exec('python rasp.py', (error, stdout, stderr) => {
            if (error) return res.status(500).json({ message: 'Error capturing photo' });

            const imagePath = stdout.trim();

            const checkImageExistence = (path, retries = 5) => {
                return new Promise((resolve, reject) => {
                    const checkInterval = setInterval(() => {
                        try {
                            const fileExists = fs.existsSync(path);
                            const fileSize = fs.statSync(path).size;

                            if (fileExists && fileSize > 0) {
                                clearInterval(checkInterval);
                                resolve(path);
                            } else if (retries === 0) {
                                clearInterval(checkInterval);
                                reject(new Error('Image file not found or is empty.'));
                            } else {
                                retries--;
                            }
                        } catch (err) {
                            reject(err);
                        }
                    }, 500);
                });
            };

            checkImageExistence(imagePath)
                .then(() => {
                    exec(`python Attenue.py ${imagePath}`, (err, recognitionOutput, recognitionError) => {
                        if (err) return res.status(500).json({ message: 'Error in face recognition' });

                        const recognizedNames = recognitionOutput.trim().split('\n').map(name => name.trim());
                        const students = getStudentNames();
                        const date = new Date().toLocaleDateString();
                        const attendance = students.map(student => ({
                            name: student,
                            date,
                            present: recognizedNames.includes(student.toUpperCase())
                        }));

                        const attendanceData = { attendance };
                        const attendanceFilePath = path.join(__dirname, 'attendance.json');
                        fs.writeFileSync(attendanceFilePath, JSON.stringify(attendanceData, null, 2));

                        res.json(attendanceData);
                    });
                })
                .catch((error) => res.status(500).json({ message: 'Error waiting for image file' }));
        });
    } catch (err) {
        res.status(500).json({ message: 'Error taking photo and recognizing faces' });
    }
});

app.get('/api/attendance', (req, res) => {
    const attendanceFilePath = path.join(__dirname, 'attendance.json');

    if (!fs.existsSync(attendanceFilePath)) {
        return res.status(404).json({ message: 'Attendance file not found' });
    }

    fs.readFile(attendanceFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error reading attendance file' });

        try {
            const attendanceData = JSON.parse(data);
            res.json(attendanceData);
        } catch (parseError) {
            res.status(500).json({ message: 'Error parsing attendance data' });
        }
    });
});
