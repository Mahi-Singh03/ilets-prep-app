"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaPenFancy, FaHeadphones, FaMicrophone, FaBookOpen,
  FaRobot, FaBolt, FaChartLine, FaClock, FaGlobe,
  FaArrowRight, FaStar, FaUsers, FaMedal
} from 'react-icons/fa';

const Home = () => {
  const [isHovering, setIsHovering] = useState(null);
  const [currentFeature, setCurrentFeature] = useState(0);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sections = [
    { 
      id: 'writing', 
      title: 'Writing', 
      icon: <FaPenFancy className="text-2xl md:text-3xl" />,
      path: '/writing',
      accentColor: '#3B82F6',
      description: 'Task 1 & Task 2 Practice',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'listening', 
      title: 'Listening', 
      icon: <FaHeadphones className="text-2xl md:text-3xl" />,
      path: '/listening',
      accentColor: '#10B981',
      description: 'Audio-based Questions',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      id: 'speaking', 
      title: 'Speaking', 
      icon: <FaMicrophone className="text-2xl md:text-3xl" />,
      path: '/speaking',
      accentColor: '#8B5CF6',
      description: 'Interview Practice',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'reading', 
      title: 'Reading', 
      icon: <FaBookOpen className="text-2xl md:text-3xl" />,
      path: '/reading',
      accentColor: '#F59E0B',
      description: 'Passage Comprehension',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  const features = [
    {
      icon: <FaRobot className="text-4xl" />,
      title: "AI-Powered Assistance",
      description: "Get instant feedback and suggestions from our advanced AI system that analyzes your responses and provides personalized improvement tips.",
      color: '#8B5CF6'
    },
    {
      icon: <FaBolt className="text-4xl" />,
      title: "Instant Results",
      description: "Receive your scores immediately after completing any section. No waiting, no delays – track your progress in real-time.",
      color: '#F59E0B'
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      title: "Detailed Analytics",
      description: "Monitor your performance with comprehensive analytics. Identify strengths, weaknesses, and track improvement over time.",
      color: '#3B82F6'
    },
    {
      icon: <FaClock className="text-4xl" />,
      title: "Timed Practice Tests",
      description: "Simulate real exam conditions with our timed practice tests. Build confidence and improve time management skills.",
      color: '#EF4444'
    },
    {
      icon: <FaGlobe className="text-4xl" />,
      title: "Global Standards",
      description: "All our content follows official IELTS guidelines and standards, ensuring you practice with authentic, exam-quality materials.",
      color: '#10B981'
    }
  ];

  const stats = [
    { icon: <FaUsers />, value: '10,000+', label: 'Active Students' },
    { icon: <FaStar />, value: '4.8/5', label: 'Average Rating' },
    { icon: <FaMedal />, value: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ 
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                #1 IELTS Preparation Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{ color: 'var(--text)' }}
            >
              Master Your{' '}
              <span style={{ color: 'var(--primary)' }}>IELTS</span>{' '}
              Journey
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: 'var(--muted)' }}
            >
              Comprehensive practice for all four IELTS sections with AI-powered feedback, instant results, and detailed analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <Link href="/ielts/practice">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-lg text-lg"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Start Practicing
                  <FaArrowRight />
                </motion.button>
              </Link>
              <Link href="/ielts/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-4 font-semibold rounded-xl text-lg"
                  style={{ 
                    color: 'var(--text)',
                    borderColor: 'var(--border)',
                    borderWidth: '2px',
                    backgroundColor: 'transparent'
                  }}
                >
                  View Demo
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-xl"
                  style={{ 
                    backgroundColor: 'var(--cardBg)',
                    borderColor: 'var(--border)',
                    borderWidth: '1px'
                  }}
                >
                  <div className="text-2xl mb-2" style={{ color: 'var(--primary)' }}>{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: 'var(--muted)' }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Sections */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: 'var(--text)' }}>
            Choose Your Section
          </h2>
          <p className="text-center mb-10 max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            Practice any of the four IELTS modules with our comprehensive question bank
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {sections.map((section, index) => (
            <Link href={section.path} key={section.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  boxShadow: `0 20px 40px -10px var(--shadow)`
                }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setIsHovering(section.id)}
                onMouseLeave={() => setIsHovering(null)}
                className="rounded-2xl p-6 flex flex-col items-center cursor-pointer transition-all duration-300 shadow-sm relative overflow-hidden group"
                style={{ 
                  backgroundColor: 'var(--cardBg)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px'
                }}
              >
                <div 
                  className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${section.gradient}`}
                ></div>
                
                <motion.div
                  animate={isHovering === section.id ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className="mb-4 p-4 rounded-full relative z-10"
                  style={{ backgroundColor: `${section.accentColor}15` }}
                >
                  <div style={{ color: section.accentColor }}>{section.icon}</div>
                </motion.div>

                <h3 className="text-lg font-bold mb-2 text-center relative z-10" style={{ color: 'var(--text)' }}>
                  {section.title}
                </h3>
                <p className="text-sm text-center relative z-10" style={{ color: 'var(--muted)' }}>
                  {section.description}
                </p>

                <motion.div
                  animate={isHovering === section.id ? { x: 5 } : { x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 relative z-10"
                  style={{ color: section.accentColor }}
                >
                  <FaArrowRight className="text-sm" />
                </motion.div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: 'var(--text)' }}>
            Why Choose Us?
          </h2>
          <p className="text-center mb-10 max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            Experience the most advanced IELTS preparation platform
          </p>
        </motion.div>

        {/* Featured Feature (Large Card) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-8 md:p-12 mb-8 relative overflow-hidden"
          style={{ 
            backgroundColor: 'var(--cardBg)',
            borderColor: 'var(--border)',
            borderWidth: '1px'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ backgroundColor: features[currentFeature].color, borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
          
          <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${features[currentFeature].color}15`, color: features[currentFeature].color }}
              >
                {features[currentFeature].icon}
              </div>
            </motion.div>

            <motion.div
              key={`content-${currentFeature}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                {features[currentFeature].title}
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
                {features[currentFeature].description}
              </p>
            </motion.div>
          </div>

          {/* Feature Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: index === currentFeature ? features[index].color : 'var(--border)',
                  transform: index === currentFeature ? 'scale(1.3)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.slice(0, 3).map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="rounded-xl p-6 transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--cardBg)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Ace Your IELTS?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students who have achieved their target band score with our platform.
            </p>
            <Link href="/ielts/practice">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white font-bold rounded-xl text-lg shadow-lg"
                style={{ color: 'var(--primary)' }}
              >
                Get Started Now
                <FaArrowRight />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            © 2024 IELTS Prep Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;