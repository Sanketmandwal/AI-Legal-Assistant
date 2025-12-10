// Get dashboard route based on user role
export const getDashboardRoute = (role) => {
  switch(role) {
    case 'citizen':
      return '/dashboard/citizen';
    case 'lawyer':
      return '/dashboard/lawyer';
    case 'police':
      return '/dashboard/police';
    default:
      return '/dashboard';
  }
};

// Get home route after login (can customize per role)
export const getHomeRoute = (role) => {
  switch(role) {
    case 'citizen':
      return '/dashboard';
    case 'lawyer':
      return '/dashboard';
    case 'police':
      return '/fir/pending';  // Police goes straight to pending FIRs
    default:
      return '/dashboard';
  }
};
