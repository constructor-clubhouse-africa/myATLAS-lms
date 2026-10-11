import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginMock } from '../api/authMock';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';

export default function Login() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI & flow state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isForcePasswordChange, setIsForcePasswordChange] = useState(false);

  // New password fields for force-change screen
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Client-side validation function
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email format.';
    }

    if (!password) {
      errors.password = 'Password cannot be empty.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await loginMock(email, password);

      if (response.requirePasswordChange) {
        setIsForcePasswordChange(true);
      } else {
        // Successful login - store token and navigate
        localStorage.setItem('authToken', response.token);
        navigate('/student'); // or dashboard route
      }
    } catch (err) {
      // Friendly error handling without technical details
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Password changed successfully! Please log in.');
      setIsForcePasswordChange(false);
      setPassword('');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-6 sm:p-8 shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              {isForcePasswordChange ? 'Change Your Password' : 'Sign in to MyAtlas'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isForcePasswordChange
                ? 'Your account requires a password update before proceeding.'
                : 'Enter your credentials to access your account.'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4">
              <Alert variant="error">{errorMessage}</Alert>
            </div>
          )}

          {!isForcePasswordChange ? (
            // Standard Login Form
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                placeholder="name@example.com"
                disabled={loading}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                placeholder="••••••••"
                disabled={loading}
              />

              <div className="pt-2">
                <Button type="submit" isLoading={loading} disabled={loading} fullWidth={true}>
                  Sign In
                </Button>
              </div>
            </form>
          ) : (
            // Force Password Change Screen
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={loading}
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
              />

              <div className="pt-2">
                <Button type="submit" isLoading={loading} disabled={loading} fullWidth={true}>
                  Update Password & Sign In
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
