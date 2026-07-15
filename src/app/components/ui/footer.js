'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  FiHome, 
  FiUser, 
  FiImage, 
  FiBriefcase, 
  FiBookOpen, 
  FiFileText, 
  FiMail, 
  FiLock,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiPhone,
  FiMapPin,
  FiMail as FiEmailIcon,
  FiHeart,
  FiStar,
  FiAward,
  FiThumbsUp
} from 'react-icons/fi';
import { useTheme } from '@/src/app/context/ThemeContext';

const Footer = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  
  if (pathname?.startsWith('/jobapp') || pathname?.startsWith('/footer')) {
    return null;
  }
  
  const isDarkMode = theme === 'dark';
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const pages = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'About', path: '/about', icon: <FiUser /> },
    { name: 'Gallery', path: '/gallery', icon: <FiImage /> },
    { name: 'Jobs', path: '/jobs', icon: <FiBriefcase /> },
    { name: 'My Profile', path: '/myProfile', icon: <FiUser /> },
    { name: 'Contact', path: '/contact', icon: <FiMail /> },
    { name: 'Resources', path: '/resources', icon: <FiBookOpen /> },
    { name: 'Success Stories', path: '/sucessStories', icon: <FiAward /> },
    { name: 'Register', path: '/register', icon: <FiLock /> },
    { name: 'Verification', path: '/varification', icon: <FiCheckCircle /> },
    { name: 'Privacy Policies', path: '/privecy-policies', icon: <FiShield /> },
    { name: 'Refund Policies', path: '/refund-policies', icon: <FiFileText /> }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: <FiFacebook />, url: '#' },
    { name: 'Twitter', icon: <FiTwitter />, url: '#' },
    { name: 'Instagram', icon: <FiInstagram />, url: '#' },
    { name: 'LinkedIn', icon: <FiLinkedin />, url: '#' }
  ];

  const contactInfo = [
    { icon: <FiPhone />, text: '+1 (555) 123-4567' },
    { icon: <FiEmailIcon />, text: 'support@yourdomain.com' },
    { icon: <FiMapPin />, text: '123 Business Street, City, Country' }
  ];

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <footer className={`relative overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-black' : 'bg-white'
    }`}>
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl ${
          isDarkMode ? 'bg-red-500' : 'bg-red-600'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl ${
          isDarkMode ? 'bg-red-500' : 'bg-red-600'
        }`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={footerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12"
        >
          {/* Brand & Description */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                isDarkMode ? 'bg-[#0B0B0B] border-[#1F1F1F]' : 'bg-gray-50 border-gray-200'
              } border`}>
                <div className="text-2xl font-bold bg-gradient-to-r from-[#C62828] to-red-600 bg-clip-text text-transparent">
                  LOGO
                </div>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Empowering careers and connecting talent with opportunities. Join thousands of successful professionals who have found their dream jobs through our platform.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex space-x-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 rounded-xl border transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-[#0B0B0B] border-[#1F1F1F] text-gray-400 hover:text-red-500 hover:border-red-500/30' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-[#C62828] hover:border-[#C62828]/30'
                    }`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className={`text-lg font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {pages.slice(0, 6).map((page) => (
                <motion.div
                  key={page.name}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href={page.path}
                    className={`group flex items-center space-x-2 py-2 px-3 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`transition-transform duration-200 group-hover:scale-110 ${
                      isDarkMode ? 'text-red-500' : 'text-[#C62828]'
                    }`}>
                      {page.icon}
                    </span>
                    <span className="text-sm font-medium">{page.name}</span>
                    <FiArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 transform -translate-x-2 group-hover:translate-x-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Resources & Policies */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className={`text-lg font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Resources & Policies
            </h3>
            <div className="space-y-3">
              {pages.slice(6).map((page) => (
                <motion.div
                  key={page.name}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href={page.path}
                    className={`group flex items-center space-x-2 py-2 px-3 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`transition-transform duration-200 group-hover:scale-110 ${
                      isDarkMode ? 'text-red-500' : 'text-[#C62828]'
                    }`}>
                      {page.icon}
                    </span>
                    <span className="text-sm font-medium">{page.name}</span>
                    <FiArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 transform -translate-x-2 group-hover:translate-x-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className={`text-lg font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Contact Us
            </h3>
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    isDarkMode 
                      ? 'bg-[#0B0B0B] border-[#1F1F1F] text-red-500' 
                      : 'bg-gray-50 border-gray-200 text-[#C62828]'
                  } border`}>
                    {info.icon}
                  </div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {info.text}
                  </p>
                </div>
              ))}
            </div>
            
           
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className={`border-t mb-8 ${
          isDarkMode ? 'border-[#1F1F1F]' : 'border-gray-200'
        }`}></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            © {currentYear} Your Company Name. All rights reserved.
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-6">
              <Link 
                href="/privecy-policies" 
                className={`text-sm hover:underline transition-all duration-200 ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/refund-policies" 
                className={`text-sm hover:underline transition-all duration-200 ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Refund Policy
              </Link>
              <Link 
                href="/terms" 
                className={`text-sm hover:underline transition-all duration-200 ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Terms of Service
              </Link>
            </div>
            
            <div className={`text-sm flex items-center space-x-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              <span>Made with</span>
              <FiHeart className={`w-4 h-4 ${
                isDarkMode ? 'text-red-500 animate-pulse' : 'text-[#C62828] animate-pulse'
              }`} />
              <span>for job seekers worldwide</span>
            </div>
          </div>
        </div>

        {/* Stats Bar (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className={`mt-8 p-4 rounded-xl border ${
            isDarkMode 
              ? 'bg-[#0B0B0B] border-[#1F1F1F]' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                10K+
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Successful Placements
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                500+
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Partner Companies
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                95%
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Satisfaction Rate
              </div>
            </div>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                24/7
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Support Available
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;