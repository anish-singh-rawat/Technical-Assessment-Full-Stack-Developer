import AuthService from '../services/auth.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return ApiResponse.badRequest(res, 'Name, email, and password are required');
    }

    const result = await AuthService.register({ name, email, password });
    return ApiResponse.created(res, result, 'Registration successful');
  } catch (error) {
    next(error);
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.badRequest(res, 'Email and password are required');
    }

    const result = await AuthService.login({ email, password });
    return ApiResponse.success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export const getMe = async (req, res) => {
  return ApiResponse.success(res, {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  }, 'User profile fetched');
}

