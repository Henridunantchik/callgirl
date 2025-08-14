import { createSlice } from '@reduxjs/toolkit'

// Get initial state from localStorage if available
const getInitialState = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const user = JSON.parse(storedUser);
      return {
        isLoggedIn: true,
        user: user
      };
    }
  } catch (error) {
    console.error('Error parsing stored user data:', error);
  }
  
  return {
    isLoggedIn: false,
    user: {},
  };
};

const initialState = getInitialState();

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const payload = action.payload
            state.isLoggedIn = true
            state.user = payload
        },
        removeUser: (state, action) => {
            state.isLoggedIn = false
            state.user = {}
        }
    },
})


export const { setUser, removeUser } = userSlice.actions
export default userSlice.reducer