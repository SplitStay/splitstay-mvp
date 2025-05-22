import React from 'react';
import amaraPhoto from './amara-photo.png';

export const AmaraProfilePhoto: React.FC = () => {
  return (
    <img 
      src={amaraPhoto} 
      alt="Amara" 
      className="h-full w-full object-cover"
    />
  );
};

export default AmaraProfilePhoto;