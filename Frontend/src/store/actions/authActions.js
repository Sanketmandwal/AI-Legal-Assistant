import {
  registerStart,
  registerSuccess,
  registerFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  getProfile,
  updateUserProfile,
} from '../slices/authSlice';
import { authService } from '../../services/authService';
import api from '../../apis/api';


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

export const getuser = () =>async (dispatch) => {
  try {
    const data = await authService.getProfile();
    console.log("Fetched user data from database:", data);
    dispatch(getProfile(data.user));
    return data.user;
  } catch (error) {
    console.error("Error fetching user from localStorage:", error);
    return null;
  }
}