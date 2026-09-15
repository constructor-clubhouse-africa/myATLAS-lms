//creates a 375px screen with ALL components (and variants)

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

//layout and shared components
import { PageLayout } from './components/PageLayout';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Select } from './components/Select';
import { Card } from './components/Card';
import { Spinner } from './components/Spinner';
import { Skeleton } from './components/Skeleton';
import { Alert } from './components/Alert';
import { EmptyState } from './components/EmptyState';

//page imports
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';

function ComponentShowcase() {
  const [mark, setMark] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  //sample CAPS topics for select component
  const capsTopics = [
    { label: 'Algebraic Expressions', value: 'alg-expr' },
    { label: 'Functions & Graphs', value: 'func-graphs' },
    { label: 'Euclidean Geometry', value: 'euc-geom' },
    { label: 'Trigonometry', value: 'trig' },
  ];

  return (
    //***********************************Page Layout applied throughout***********************************
    <PageLayout
      title="SBA Mark Entry"
      subtitle="Grade 11 Mathematics · Term 3"
      showBackButton={true}
      onBack={() => alert('Back button tapped')} //this line can be removed to navigate to the previous page
      footer={
        <Button variant="primary" onClick={() => alert('Submitted!')}>
          Save Assessment
        </Button>
      }
    >
      {/*route navigation links (implement later)
      <nav className="p-3 bg-slate-100 rounded-lg flex flex-wrap gap-2 text-xs font-medium">
        <span className="text-slate-500 font-bold self-center">Routes:</span>
        <Link to="/login" className="text-teal hover:underline">Login</Link> |
        <Link to="/admin" className="text-teal hover:underline">Admin</Link> |
        <Link to="/teacher" className="text-teal hover:underline">Teacher</Link> |
        <Link to="/student" className="text-teal hover:underline">Student</Link>
      </nav>
      */}

      {/***********************************Button Section***********************************/}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy border-b pb-1">Buttons</h2>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button disabled>Disabled Action</Button>
        <Button isLoading>Submit Form</Button>
      </section>

      {/***********************************Input Section***********************************/}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-navy border-b pb-1">Inputs</h2>

        {/*text input*/}
        <Input
          label="Full Name"
          placeholder="e.g. John Doe"
          helperText="Enter your registered full name"
        />

        {/*password input*/}
        <Input label="Password" type="password" placeholder="••••••••" />

        {/*number input*/}
        <Input
          label="SBA Assessment Mark"
          type="number"
          placeholder="0 - 100"
          value={mark}
          onChange={(e) => setMark(e.target.value)}
          helperText="Captured for SBA Mark Sheet"
        />

        {/*input error state*/}
        <Input
          label="Email Address"
          type="email"
          value="invalid-email"
          error="Please enter a valid email address"
        />

        {/*input disabled state*/}
        <Input label="School ID (Locked)" value="SCH-2026-99" disabled />

        {/*input loading state*/}
        <Input label="Assignment ID" value="MTH-2026-70" isLoading />
      </section>

      {/***********************************Select Section***********************************/}

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-navy border-b pb-1">Select Dropdowns</h2>

        {/*standard select*/}
        <Select
          label="CAPS Topic"
          options={capsTopics}
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          placeholder="Choose CAPS Topic"
          helperText="Select topic for assessment tracking"
        />

        {/*select error state*/}
        <Select
          label="Grade Level"
          options={[{ label: 'Grade 10', value: '10' }]}
          error="Selecting a grade level is required"
        />

        {/*select disabled state*/}
        <Select
          label="Term (Locked)"
          options={[{ label: 'Term 1', value: '1' }]}
          value="1"
          disabled
        />
      </section>

      {/***********************************Card Section***********************************/}

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-navy border-b pb-1">Cards</h2>

        {/*default card*/}
        <Card
          variant="default"
          title="Mathematics Paper 1"
          subtitle="Grade 11 · Term 3 SBA"
          footer={
            <Button variant="primary" type="button">
              View Assessment
            </Button>
          }
        >
          <p className="text-xs text-slate-600">
            Covers CAPS topics: Algebraic Expressions, Functions & Graphs, and Trigonometry.
          </p>
        </Card>

        {/*outlined/interactive card */}
        <Card
          variant="outlined"
          title="Student Profile"
          subtitle="ID: STU-2026-042"
          onClick={() => alert('Card clicked!')}
        >
          <p className="text-xs text-slate-600">
            Click to view detailed academic history and attendance records.
          </p>
        </Card>

        {/*flat card*/}
        <Card variant="flat" title="CAPS Curriculum Notice" subtitle="System Announcement">
          <p className="text-xs text-slate-600">
            SBA marks have been synchronized with the latest departmental guidelines.
          </p>
        </Card>
      </section>

      {/***********************************Spinner Section***********************************/}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy border-b pb-1">Spinners</h2>
        <div className="flex items-center justify-around p-3 bg-slate-50 rounded-lg">
          <Spinner size="sm" color="teal" />
          <Spinner size="md" color="navy" />
          <Spinner size="lg" color="coral" />
        </div>
      </section>

      {/***********************************Skeleton Section***********************************/}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy border-b pb-1">Skeleton Loaders</h2>

        <div className="space-y-4">
          {/*text skeleton*/}
          <Card variant="outlined">
            <p className="text-xs font-bold text-slate-500 mb-2">Text Variant</p>
            <div className="space-y-2">
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </div>
          </Card>

          {/*circular skeleton*/}
          <Card variant="outlined">
            <p className="text-xs font-bold text-slate-500 mb-2">
              Circular Variant (Avatars / Icons)
            </p>
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" />
              <Skeleton variant="circular" style={{ width: '48px', height: '48px' }} />
              <Skeleton variant="circular" style={{ width: '64px', height: '64px' }} />
            </div>
          </Card>

          {/*rectangular skeleton*/}
          <Card variant="outlined">
            <p className="text-xs font-bold text-slate-500 mb-2">Rectangular Variant</p>
            <Skeleton variant="rectangular" height="96px" />
          </Card>
        </div>
      </section>

      {/***********************************Alert Section***********************************/}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy border-b pb-1">Alert Messages</h2>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Info Alert
        </p>
        <Alert variant="info" title="CAPS Update" onClose={() => alert('Dismissed info')}>
          Term 3 mark entry deadline is Friday at 17:00.
        </Alert>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Success Alert
        </p>
        <Alert variant="success" title="Marks Saved">
          SBA Assessment scores synced to server.
        </Alert>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Warning Alert
        </p>
        <Alert variant="warning" title="Pending Submission">
          3 student records require teacher verification.
        </Alert>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Error Alert
        </p>
        <Alert variant="error" title="Sync Failed" onClose={() => alert('Dismissed error')}>
          Network connection interrupted. Please try again.
        </Alert>
      </section>

      {/***********************************Empty State Section***********************************/}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy border-b pb-1">Empty State</h2>

        <EmptyState
          title="No assignments yet"
          description="Create your first SBA assessment to start recording student performance."
          action={
            <Button variant="primary" onClick={() => alert('Add Assignment Clicked')}>
              + Add Assignment
            </Button>
          }
        />
      </section>
    </PageLayout>
  );
}

/* main application component with routing*/
export default function App() {
  return (
    <Router>
      <Routes>
        {/*main route*/}
        <Route path="/" element={<ComponentShowcase />} />

        {/*application page routes*/}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/teacher/*" element={<TeacherDashboard />} />
        <Route path="/student/*" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}
