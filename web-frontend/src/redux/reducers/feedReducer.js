const initialState = {
    topics: [],
  };
  
  const feedReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'UPDATE_FEED_TOPICS':
        return {
          ...state,
          topics: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default feedReducer;
  