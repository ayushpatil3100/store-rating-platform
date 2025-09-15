export const setToken = (token) => {
    localStorage.setItem('jwt_token', token);
  };
  
  export const getToken = () => {
    return localStorage.getItem('jwt_token');
  };
  
  export const removeToken = () => {
    localStorage.removeItem('jwt_token');
  };
  
  export const setUser = (user) => {
    localStorage.setItem('user_data', JSON.stringify(user));
  };
  
  export const getUser = () => {
    const user = localStorage.getItem('user_data');
    return user ? JSON.parse(user) : null;
  };
  
  export const removeUser = () => {
    localStorage.removeItem('user_data');
  };