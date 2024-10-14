// src/pages/Dashboard.js
import React, { useState } from 'react';
import Navbar from './Navbar';
import AttendanceTable from './AttendanceTable';

const Dashboard = ({teacherID}) => {
  return (
    <div>
      <Navbar />
      <AttendanceTable teacherID={teacherID} />
    </div>
  );
};

export default Dashboard;
