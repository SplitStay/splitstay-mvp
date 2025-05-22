// Direct embedded image as a component
import React from 'react';

export const AmaraImage: React.FC = () => {
  return (
    <img 
      src="https://xsgames.co/randomusers/assets/avatars/female/43.jpg" 
      alt="Amara" 
      className="h-full w-full object-cover"
    />
  );
};