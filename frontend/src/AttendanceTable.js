import React, { useEffect, useState } from 'react';
import './AttendanceTable.css';

const AttendanceTable = ({ teacherId }) => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    // Fetch attendance data from the backend for the logged-in teacher
    fetch(`http://localhost:3001/api/attendance/:teacherId`)
      .then((response) => response.json())
      .then((data) => setAttendanceData(data));
  }, [teacherId]);
 console.log(attendanceData);
  const renderTableHeader = () => {
    const days = Object.keys(attendanceData[0].attendance);
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
    return attendanceData.map((student, index) => (
      <tr key={index}>
        <td>{student.name}</td>
        {Object.values(student.attendance).map((status, idx) => (
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
        <tbody>{renderTableRows()}</tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
