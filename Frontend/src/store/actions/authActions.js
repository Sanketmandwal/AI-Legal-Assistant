import { 
  registerStart, 
  registerSuccess, 
  registerFailure,
    loginStart,
    loginSuccess,
    loginFailure,
} from '../slices/authSlice';
import { authService } from '../../services/authService';

// Register Action
export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(registerStart());
    const data = await authService.register(userData);
    dispatch(registerSuccess(data));
    return { success: true, data };
  } catch (error) {
    dispatch(registerFailure(error));
    return { success: false, error };
  }
};

export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const data = await authService.login(credentials);
    dispatch(loginSuccess(data));
    return { success: true, data };
  } catch (error) {
    dispatch(loginFailure(error));
    return { success: false, error };
  }
};