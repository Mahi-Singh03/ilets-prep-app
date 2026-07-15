'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiLoader, 
  FiArrowLeft,
  FiArrowUp,
  FiHome
} from 'react-icons/fi';

const AdminRegister = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const formRef = useRef(null);

  useEffect(() => {
    // Handle scroll events for scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Check if user is admin
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        router.push('/auth/adminLogin');
      } else {
       setIsAdmin(true);
      }
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Show success message
      setSuccess('New admin created successfully! Redirecting to login...');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/adminLogin');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          <div className="p-6">
            <motion.header variants={itemVariants} className="flex items-center space-x-4 mb-6">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Back to dashboard"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Create New Admin</h1>
                <p className="text-gray-600 text-sm">Register a new administrator account</p>
              </div>
            </motion.header>

            <form onSubmit={handleSubmit} className="space-y-4" ref={formRef}>
              {[
                {
                  label: 'Full Name *',
                  name: 'name',
                  type: 'text',
                  icon: <FiUser className="text-gray-400" />,
                  error: formErrors.name
                },
                {
                  label: 'Email Address *',
                  name: 'email',
                  type: 'email',
                  icon: <FiMail className="text-gray-400" />,
                  error: formErrors.email
                },
                {
                  label: 'Password *',
                  name: 'password',
                  type: 'password',
                  icon: <FiLock className="text-gray-400" />,
                  error: formErrors.password
                },
                {
                  label: 'Confirm Password *',
                  name: 'confirmPassword',
                  type: 'password',
                  icon: <FiLock className="text-gray-400" />,
                  error: formErrors.confirmPassword
                }
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  variants={itemVariants}
                  className="space-y-1"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {field.icon}
                    </div>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        field.error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                  {field.error && (
                    <p className="text-sm text-red-600">{field.error}</p>
                  )}
                </motion.div>
              ))}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start gap-3">
                      <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Error:</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-start gap-3">
                      <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Success:</p>
                        <p>{success}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Creating Admin...
                    </>
                  ) : (
                    <>
                      <FiUser className="mr-2" />
                      Create Admin Account
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div 
              className="mt-6 text-center text-gray-600"
              variants={itemVariants}
            >
              <p>Return to <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700 transition-colors">Dashboard</Link></p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="mt-8 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>© {new Date().getFullYear()} Admin Portal. All rights reserved.</p>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
            aria-label="Scroll to top"
          >
            <FiArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRegister;