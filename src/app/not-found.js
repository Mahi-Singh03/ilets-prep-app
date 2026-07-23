"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPenFancy, FaHeadphones, FaMicrophone, FaBookOpen,
  FaRocket, FaBell, FaEnvelope, FaCheckCircle, FaArrowRight,
  FaTwitter, FaInstagram, FaLinkedin, FaFacebook, FaDiscord,
  FaClock, FaCalendarAlt, FaUsers
} from 'react-icons/fa';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeSection, setActiveSection] = useState(0);

  // Set launch date (30 days from now)
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-rotate sections
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % sections.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const sections = [
    { 
      icon: <FaPenFancy />, 
      title: 'Writing', 
      description: 'Task 1 & Task 2',
      color: '#3B82F6' 
    },
    { 
      icon: <FaHeadphones />, 
      title: 'Listening', 
      description: 'Audio Practice',
      color: '#10B981' 
    },
    { 
      icon: <FaMicrophone />, 
      title: 'Speaking', 
      description: 'Interview Prep',
      color: '#8B5CF6' 
    },
    { 
      icon: <FaBookOpen />, 
      title: 'Reading', 
      description: 'Comprehension',
      color: '#F59E0B' 
    },
  ];

  const features = [
    {
      icon: <FaRocket />,
      title: 'AI-Powered Feedback',
      description: 'Get instant, personalized feedback on your responses'
    },
    {
      icon: <FaClock />,
      title: 'Real-time Practice',
      description: 'Simulate actual exam conditions with timed tests'
    },
    {
      icon: <FaUsers />,
      title: 'Community Support',
      description: 'Join study groups and learn from peers'
    },
    {
      icon: <FaCalendarAlt />,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics'
    }
  ];

  const socialLinks = [
    { icon: <FaTwitter />, url: '#', label: 'Twitter' },
    { icon: <FaInstagram />, url: '#', label: 'Instagram' },
    { icon: <FaLinkedin />, url: '#', label: 'LinkedIn' },
    { icon: <FaFacebook />, url: '#', label: 'Facebook' },
    { icon: <FaDiscord />, url: '#', label: 'Discord' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
        ></motion.div>
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.15, 0.1, 0.15]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
        ></motion.div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full" style={{ 
            backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 rounded-2xl"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <FaRocket className="text-white text-2xl" />
            </motion.div>
            
          </motion.div>
        </motion.div>

        {/* Coming Soon Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-center mb-8"
        >
          <motion.span
            animate={{ 
              boxShadow: [
                '0 0 0 0 var(--primary)',
                '0 0 0 10px transparent',
                '0 0 0 0 var(--primary)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold"
            style={{ 
              color: 'var(--primary)',
              backgroundColor: 'var(--accent)',
              borderColor: 'var(--primary)',
              borderWidth: '2px'
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🚀
            </motion.span>
            Coming Soon
          </motion.span>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight" style={{ color: 'var(--text)' }}>
            Your IELTS Success{' '}
            <span style={{ color: 'var(--primary)' }}>Starts Here</span>
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
            We're building the most comprehensive IELTS preparation platform with AI-powered practice, instant feedback, and detailed analytics.
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hours', value: countdown.hours },
              { label: 'Minutes', value: countdown.minutes },
              { label: 'Seconds', value: countdown.seconds }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl p-4 md:p-6 text-center"
                style={{ 
                  backgroundColor: 'var(--cardBg)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <motion.div
                  key={item.value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-bold mb-1"
                  style={{ color: 'var(--primary)' }}
                >
                  {String(item.value).padStart(2, '0')}
                </motion.div>
                <div className="text-xs md:text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>


      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, -20, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-1 h-1 rounded-full"
            style={{ backgroundColor: 'var(--primary)' }}
          />
        ))}
      </div>
    </div>
  );
};

export default ComingSoon;