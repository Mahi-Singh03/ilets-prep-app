"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaSignOutAlt, FaPenFancy, FaHeadphones, 
  FaMicrophone, FaBookOpen, FaQuestionCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [isHovering, setIsHovering] = useState(null);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalWritingQuestions: 0,
    totalListeningQuestions: 0,
    totalSpeakingQuestions: 0,
    totalReadingQuestions: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminDataStr = localStorage.getItem('adminData');
        if (adminDataStr) {
          const parsedData = JSON.parse(adminDataStr);
          setAdminName(parsedData.name || 'Admin');
        }

        // Fetch all IELTS section stats at once
        const statsRes = await fetch('/api/admin/ielts-stats', { method: 'GET' });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalWritingQuestions: statsData.data?.totalWritingQuestions || 0,
            totalListeningQuestions: statsData.data?.totalListeningQuestions || 0,
            totalSpeakingQuestions: statsData.data?.totalSpeakingQuestions || 0,
            totalReadingQuestions: statsData.data?.totalReadingQuestions || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching IELTS stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const actionCards = [
    { 
      id: 'writing', 
      title: 'Writing Section', 
      icon: <FaPenFancy className="text-2xl md:text-3xl" />,
      path: '/ilets/writing',
      description: 'Manage Task 1 & Task 2 questions',
      accentColor: '#3B82F6'
    },
    { 
      id: 'listening', 
      title: 'Listening Section', 
      icon: <FaHeadphones className="text-2xl md:text-3xl" />,
      path: '/ilets/listening',
      description: 'Manage audio-based questions',
      accentColor: '#10B981'
    },
    { 
      id: 'speaking', 
      title: 'Speaking Section', 
      icon: <FaMicrophone className="text-2xl md:text-3xl" />,
      path: '/ilets/speaking',
      description: 'Manage speaking topics & prompts',
      accentColor: '#8B5CF6'
    },
    { 
      id: 'reading', 
      title: 'Reading Section', 
      icon: <FaBookOpen className="text-2xl md:text-3xl" />,
      path: '/ilets/reading',
      description: 'Manage reading passages & questions',
      accentColor: '#F59E0B'
    },
    { 
      id: 'all-questions', 
      title: 'All Questions', 
      icon: <FaQuestionCircle className="text-2xl md:text-3xl" />,
      path: '/ilets/questions',
      description: 'View all sections overview',
      accentColor: '#EF4444'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/auth/admin-login');
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 rounded-full"
          style={{ 
            borderColor: 'var(--primary)',
            borderWidth: '4px',
            borderTopColor: 'transparent'
          }}
        ></motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Welcome Section with Logout Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl shadow-sm p-4 md:p-6 mb-6 md:mb-8"
          style={{ 
            backgroundColor: 'var(--cardBg)',
            borderColor: 'var(--primary)',
            borderLeftWidth: '4px'
          }}
        >
          <div className="flex justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                Welcome back, <span style={{ color: 'var(--primary)' }}>{adminName}</span>!
              </h2>
              <p className="text-sm md:text-base" style={{ color: 'var(--muted)' }}>
                Manage your IELTS preparation content with comprehensive tools and insights.
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 text-white px-3 md:px-4 py-2 rounded-xl font-medium text-sm md:text-base transition-all duration-300 hover:brightness-110 ml-4 flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span>Logout</span>
              <FaSignOutAlt />
            </motion.button>
          </div>
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          >
            <div 
              className="p-3 md:p-4 rounded-xl shadow-sm"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <FaPenFancy className="text-lg" style={{ color: '#3B82F6' }} />
                <p className="text-xs md:text-sm font-medium" style={{ color: 'var(--text)' }}>Writing</p>
              </div>
              <p className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.totalWritingQuestions}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>questions</p>
            </div>
            <div 
              className="p-3 md:p-4 rounded-xl shadow-sm"
              style={{ 
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <FaHeadphones className="text-lg" style={{ color: '#10B981' }} />
                <p className="text-xs md:text-sm font-medium" style={{ color: 'var(--text)' }}>Listening</p>
              </div>
              <p className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.totalListeningQuestions}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>questions</p>
            </div>
            <div 
              className="p-3 md:p-4 rounded-xl shadow-sm"
              style={{ 
                backgroundColor: 'var(--background  )',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <FaMicrophone className="text-lg" style={{ color: '#8B5CF6' }} />
                <p className="text-xs md:text-sm font-medium" style={{ color: 'var(--text)' }}>Speaking</p>
              </div>
              <p className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.totalSpeakingQuestions}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>topics</p>
            </div>
            <div 
              className="p-3 md:p-4 rounded-xl shadow-sm"
              style={{ 
                backgroundColor: 'var(--background  )',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <FaBookOpen className="text-lg" style={{ color: '#F59E0B' }} />
                <p className="text-xs md:text-sm font-medium" style={{ color: 'var(--text)' }}>Reading</p>
              </div>
              <p className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.totalReadingQuestions}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>questions</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {actionCards.map((card) => (
            <Link href={card.path} key={card.id}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ 
                  y: -4,
                  scale: 1.02,
                  boxShadow: `0 10px 25px -5px var(--shadow)`
                }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setIsHovering(card.id)}
                onMouseLeave={() => setIsHovering(null)}
                className="rounded-2xl p-4 md:p-6 flex flex-col items-center cursor-pointer h-full transition-all duration-300 shadow-sm hover:shadow-md group"
                style={{ 
                  backgroundColor: 'var(--cardBg)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px'
                }}
              >
                <motion.div
                  animate={isHovering === card.id ? { 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className="mb-3 md:mb-4 transition-colors duration-300"
                  style={{ color: card.accentColor }}
                >
                  {card.icon}
                </motion.div>
                <h3 className="text-sm md:text-lg font-bold mb-2 text-center" style={{ color: 'var(--text)' }}>
                  {card.title}
                </h3>
                <p className="text-xs md:text-sm text-center mb-3" style={{ color: 'var(--muted)' }}>
                  {card.description}
                </p>
                <motion.div 
                  animate={isHovering === card.id ? { 
                    opacity: [0.5, 1, 0.5],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mt-auto"
                >
                  <span 
                    className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full"
                    style={{ 
                      color: card.accentColor,
                      backgroundColor: `${card.accentColor}15`
                    }}
                  >
                    Manage Section →
                  </span>
                </motion.div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </main>
    </motion.div>
  );
};

export default AdminDashboard;