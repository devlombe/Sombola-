
import React from 'react';

interface FeatureCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 text-center space-y-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
    >
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full">
        {icon}
      </div>
      <p className="font-semibold text-gray-700 dark:text-gray-200">{title}</p>
    </button>
  );
};

export default FeatureCard;
