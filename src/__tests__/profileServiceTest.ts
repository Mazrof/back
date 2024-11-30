import * as authService from '../services/authService';
import * as userRepository from '../repositories/userRepository';
import bcrypt from 'bcryptjs';
import { AppError } from '../utility';
import { HTTPERROR } from '../constants/HTTPERROR';

// Mock the repository methods
jest.mock('../repositories/userRepository');
jest.mock('bcryptjs');

describe('Auth Service', () => {
  // Test: Register a user with valid data
  it('should register a user with valid data', async () => {
    const data = {
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'securePassword123',
      phone: '+123444567890',
    };

    // Mock repository methods
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null); // No user found
    (userRepository.findUserByUsername as jest.Mock).mockResolvedValue(null); // No username found
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword'); // Mocking bcrypt hash

    // Mock user creation
    (userRepository.createUser as jest.Mock).mockResolvedValue({
      id: 1,
      ...data,
    });

    const user = await authService.registerUser(data);
    expect(user).toEqual({
      id: 1,
      email: 'jane@example.com',
      username: 'janedoe',
      phone: '+123444567890',
      public_key: '',
    });
  });

  // Test: Fail to register a user with existing email
  it('should fail to register a user with an existing email', async () => {
    const data = {
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'securePassword123',
      phone: '+123444567890',
    };

    // Mock repository methods
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'jane@example.com',
      username: 'janedoe',
      phone: '+123444567890',
    });

    await expect(authService.registerUser(data)).rejects.toEqual(
      new AppError('Email already in use', HTTPERROR.CONFLICT)
    );
  });

  // Test: Fail to register a user with existing username
  it('should fail to register a user with an existing username', async () => {
    const data = {
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'securePassword123',
      phone: '+123444567890',
    };

    // Mock repository methods
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null); // No user found
    (userRepository.findUserByUsername as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'another@example.com',
      username: 'janedoe',
      phone: '+123444567890',
    }); // Username already exists

    await expect(authService.registerUser(data)).rejects.toEqual(
      new AppError('Username already in use', HTTPERROR.CONFLICT)
    );
  });

  // Test: Authenticate a user with valid credentials
  it('should authenticate a user with valid credentials', async () => {
    const email = 'jane@example.com';
    const password = 'securePassword123';

    const user = {
      id: 1,
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'hashedPassword',
      phone: '+123444567890',
    };

    // Mock repository methods
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Password match

    const authenticatedUser = await authService.authenticateUser(
      email,
      password
    );
    expect(authenticatedUser).toEqual(user);
  });

  // Test: Fail to authenticate a user with invalid credentials
  it('should fail to authenticate a user with invalid credentials', async () => {
    const email = 'jane@example.com';
    const password = 'wrongPassword';

    const user = {
      id: 1,
      email: 'jane@example.com',
      username: 'janedoe',
      password: 'hashedPassword',
      phone: '+123444567890',
    };

    // Mock repository methods
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Password mismatch

    await expect(authService.authenticateUser(email, password)).rejects.toEqual(
      new AppError('Invalid credentials', HTTPERROR.UNAUTHORIZED)
    );
  });

  // Test: Fail to authenticate a user with non-existing email
  it('should fail to authenticate a user with a non-existing email', async () => {
    const email = 'nonexistent@example.com';
    const password = 'somePassword';

    // Mock repository methods
    (userRepository.findUserByEmail as jest.Mock).mockResolvedValue(null); // No user found

    await expect(authService.authenticateUser(email, password)).rejects.toEqual(
      new AppError('Invalid credentials', HTTPERROR.UNAUTHORIZED)
    );
  });
});
