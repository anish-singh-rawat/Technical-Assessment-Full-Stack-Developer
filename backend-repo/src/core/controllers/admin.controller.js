import User from '../../models/user.model.js';
import ApiResponse from '../../utils/apiResponse.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('_id name email')
      .sort({ name: 1 });
    return ApiResponse.success(res, { users }, 'Users fetched');
  } catch (err) {
    next(err);
  }
};
