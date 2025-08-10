import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-base-200 p-6 rounded-xl shadow-lg flex items-center gap-6 transition-all duration-300 hover:bg-base-300 hover:shadow-brand-primary/20">
      <div className="bg-brand-primary p-4 rounded-full">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-text-secondary">{title}</h4>
        <p className="text-3xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
};