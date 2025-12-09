import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      {/* Navbar at top */}
      <Navbar />
      
      {/* Main content area with padding for fixed navbar */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      
      {/* Footer at bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
