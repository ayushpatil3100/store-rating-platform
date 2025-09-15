export const validateEmail = (email) => {
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Invalid email format.";
    }
    return '';
  };

  export const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (password.length < 8 || password.length > 16) {
      return "Password must be 8-16 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must include at least one uppercase letter.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must include at least one special character.";
    }
    return '';
  };

  export const validateName = (name) => {
    if (!name) return "Name is required.";
    if (name.length < 20 || name.length > 60) {
      return "Name must be between 20 and 60 characters.";
    }
    return '';
  };

  export const validateAddress = (address) => {
    if (address && address.length > 400) {
      return "Address cannot exceed 400 characters.";
    }
    return '';
  };

  export const validateRating = (rating) => {
    if (rating === null || isNaN(rating) || rating < 1 || rating > 5) {
      return "Rating must be between 1 and 5 stars.";
    }
    return '';
  };