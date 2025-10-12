
import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, center = false }) => {
  return (
    <div className={center ? 'text-center' : ''}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default Header;
