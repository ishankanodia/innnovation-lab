import React, { useEffect, useState } from 'react';
import './AttendanceTable.css';

const AttendanceTable = ({ teacherId }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  
  useEffect(() => {
    // Fetch attendance data from the backend using the actual teacherId prop
    fetch(`http://localhost:3001/api/attendance/${teacherId}`)
      .then((response) => response.json())
      .then((data) => setAttendanceData(data.attendance)) // Assuming attendance data is under 'attendance'
      .catch((error) => console.error('Error fetching attendance data:', error));
  }, [teacherId]);

  console.log(attendanceData);

  const renderTableHeader = () => {
    if (attendanceData.length === 0 || !attendanceData[0].date) {
      return null; // Handle the case where no data is available
    }

    const days = attendanceData.map(item => item.date); // Get the unique days
    return (
      <tr>
        <th>Student</th>
        {days.map((day, index) => (
          <th key={index}>{day}</th>
        ))}
      </tr>
    );
  };

  const renderTableRows = () => {
    if (attendanceData.length === 0) {
      return null;
    }

    // Group by student names and show their attendance status
    const groupedByStudent = {};
    attendanceData.forEach(record => {
      const { name, date, present } = record;
      if (!groupedByStudent[name]) {
        groupedByStudent[name] = {};
      }
      groupedByStudent[name][date] = present;
    });

    return Object.keys(groupedByStudent).map((studentName, index) => (
      <tr key={index}>
        <td>{studentName}</td>
        {Object.values(groupedByStudent[studentName]).map((status, idx) => (
          <td key={idx} className={status ? 'present' : 'absent'}>
            {status ? 'Present' : 'Absent'}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="attendance-container">
      <h2>Day-wise Attendance</h2>
      <table className="attendance-table">
        <thead>{attendanceData.length > 0 && renderTableHeader()}</thead>
        <tbody>{attendanceData.length > 0 ? renderTableRows() : <tr><td colSpan="100%">No attendance data available</td></tr>}</tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
