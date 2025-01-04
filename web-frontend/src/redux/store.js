import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import themeReducer from './reducers/themeReducer';
import feedReducer from './reducers/feedReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    feed: feedReducer,
  },
});

export default store;
