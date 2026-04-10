import AuthService from '../services/auth.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return ApiResponse.badRequest(res, 'Name, email and password are required');
    }

    if (role && !['customer', 'admin'].includes(role)) {
      return ApiResponse.badRequest(res, 'Role must be customer or admin');
    }

    const result = await AuthService.register({ name, email, password, role });
    return ApiResponse.created(res, result, 'Registered successfully');
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.badRequest(res, 'Email and password are required');
    }

    const result = await AuthService.login({ email, password });
    return ApiResponse.success(res, result, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  const { _id, name, email, role, createdAt } = req.user;
  return ApiResponse.success(res, { user: { id: _id, name, email, role, createdAt } }, 'Profile fetched');
};
