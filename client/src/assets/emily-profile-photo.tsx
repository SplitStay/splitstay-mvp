import React from 'react';
import emilyPhoto from './emily-photo.png';

export const EmilyProfilePhoto: React.FC = () => {
  return (
    <img 
      src={emilyPhoto} 
      alt="Emily" 
      className="h-full w-full object-cover"
    />
  );
};

export default EmilyProfilePhoto;