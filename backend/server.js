const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const port = 3001;
const multer = require('multer');
app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']

    }
));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    }
);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Upload directory
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Rename the file
    }
  });
  
  const upload = multer({ storage: storage });
  app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    try {
        // Call the Python model here
        const { exec } = require('child_process');

        exec(`python Attenue.py ${filePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ message: 'Error processing image' });
            }
            // stdout should contain the result from the Python script
            const recognizedNames = stdout.trim().split('\n'); // assuming the script returns names line by line
            res.json({ names: recognizedNames });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error in face recognition' });
    }
});
app.get('/api/attendance/:teacherId', (req, res) => {
    const teacherId = req.params.teacherId;
    const attendance = [
      { name: 'Saket Kumar Singh', attendance: { '01-01-2024': false, '02-01-2024': false, '03-01-2024': false,'04-01-2024': false,'05-01-2024': false,'06-01-2024': false,'07-01-2024': false,'08-01-2024': false,'09-01-2024': false,'10-01-2024': false,'11-01-2024': false,'12-01-2024': false,'13-01-2024': false,'14-01-2024': false  } },
      { name: 'Dhruv Anil Rai', attendance: { '01-01-2024': false, '02-01-2024': true, '03-01-2024': true,'04-01-2024': false,'05-01-2024': false,'06-01-2024': false,'07-01-2024': false,'08-01-2024': false,'09-01-2024': false,'10-01-2024': false,'11-01-2024': false,'12-01-2024': false,'13-01-2024': false,'14-01-2024': false  } },
      { name: 'Ishan Kanodia', attendance: { '01-01-2024': true, '02-01-2024': true, '03-01-2024': true ,'04-01-2024': false,'05-01-2024': false,'06-01-2024': false,'07-01-2024': false,'08-01-2024': false,'09-01-2024': false,'10-01-2024': false,'11-01-2024': false,'12-01-2024': false,'13-01-2024': false,'14-01-2024': false } },
      { name: 'Ishan Kanodia', attendance: { '01-01-2024': true, '02-01-2024': true, '03-01-2024': true,'04-01-2024': false,'05-01-2024': false,'06-01-2024': false,'07-01-2024': false,'08-01-2024': false,'09-01-2024': false,'10-01-2024': false,'11-01-2024': false,'12-01-2024': false,'13-01-2024': false,'14-01-2024': false  } },
    ];
    res.json(attendance);
  });