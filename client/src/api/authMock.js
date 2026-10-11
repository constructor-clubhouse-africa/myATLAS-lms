// client/src/api/authMock.js

/**
 * Mock authentication API for MY-46.
 * MY-09 will swap this file out for the real endpoint.
 */

const DELAY = 800;

export const loginMock = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Force password change trigger
      if (email === 'force@test.com' && password === 'password123') {
        return resolve({
          success: true,
          requirePasswordChange: true,
          token: null,
          message: 'Password change required.',
        });
      }

      // 2. Known-bad credentials error trigger
      if (email === 'bad@test.com' || password === 'wrong') {
        return reject(new Error('Invalid email or password. Please try again.'));
      }

      // 3. Successful login with a short, clean mock token
      resolve({
        success: true,
        requirePasswordChange: false,
        token: 'mock-jwt-xyz-12345',
        user: { email, role: 'student' },
      });
    }, DELAY);
  });
};
