
import React from 'react';

interface ActionCardProps {
  title: string;
  content: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, content }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{content}</p>
    </div>
  );
};

export default ActionCard;
