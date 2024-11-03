import React, { useEffect, useState } from 'react';
import './AttendanceTable.css';

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isAttendanceReady, setIsAttendanceReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle file upload
  const handleFileUpload = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    setIsLoading(true); // Show loading while uploading
    fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then(() => {
        // Set the state to fetch attendance after upload completes
        setIsAttendanceReady(true);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
        setIsAttendanceReady(false);
      })
      .finally(() => setIsLoading(false));
  };

  // Fetch attendance data from the backend only after upload is complete
  useEffect(() => {
    if (isAttendanceReady) {
      setIsLoading(true); // Show loading while fetching
      fetch(`http://localhost:3001/api/attendance`)
        .then((response) => response.json())
        .then((data) => {
          setAttendanceData(data.attendance);
        })
        .catch((error) => {
          console.error('Error fetching attendance data:', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isAttendanceReady]);

  const renderTableHeader = () => {
    if (attendanceData.length === 0) {
      return null;
    }
  
    // Extract unique dates from the attendance data
    const uniqueDates = [...new Set(attendanceData.map(item => item.date))];
  
    return (
      <tr>
        <th>Student</th>
        {uniqueDates.map((date, index) => (
          <th key={index}>{date}</th>
        ))}
      </tr>
    );
  };
  
  const renderTableRows = () => {
    if (attendanceData.length === 0) {
      return null;
    }
  
    // Group attendance data by student
    const groupedByStudent = {};
    attendanceData.forEach(record => {
      const { name, date, present } = record;
      if (!groupedByStudent[name]) {
        groupedByStudent[name] = {};
      }
      groupedByStudent[name][date] = present; // Mark attendance for specific dates
    });
  
    // Extract unique dates for each student
    const uniqueDates = [...new Set(attendanceData.map(item => item.date))];
  
    return Object.keys(groupedByStudent).map((studentName, index) => (
      <tr key={index}>
        <td>{studentName}</td>
        {uniqueDates.map((date, idx) => (
          <td key={idx} className={groupedByStudent[studentName][date] ? 'present' : 'absent'}>
            {groupedByStudent[studentName][date] ? 'Present' : 'Absent'}
          </td>
        ))}
      </tr>
    ));
  };
  
  return (
    <div className="attendance-container">
      <h2>Day-wise Attendance</h2>
      <input
        type="file"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        disabled={isLoading} // Disable file input while loading
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="attendance-table">
          <thead>{attendanceData.length > 0 && renderTableHeader()}</thead>
          <tbody>
            {attendanceData.length > 0 ? (
              renderTableRows()
            ) : (
              <tr>
                <td colSpan="100%">No attendance data available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceTable;


