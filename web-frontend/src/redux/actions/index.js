export const login = (user) => ({
    type: 'LOGIN',
    payload: user,
  });
  
  export const logout = () => ({
    type: 'LOGOUT',
  });
  
  export const toggleDarkMode = () => ({
    type: 'TOGGLE_DARK_MODE',
  });

  export const updateFeedTopics = (topics) => ({
    type: 'UPDATE_FEED_TOPICS',
    payload: topics,
  });
  
  