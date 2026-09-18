import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Demo from './pages/demo';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/*redirect root URL to /components for demo preview */}
        <Route path="/" element={<Navigate to="/components" replace />} />

        {/*component gallery route */}
        <Route path="/components" element={<Demo />} />

        {/*application routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/teacher/*" element={<TeacherDashboard />} />
        <Route path="/student/*" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}
