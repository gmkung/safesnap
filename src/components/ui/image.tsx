
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
}

const Image: React.FC<ImageProps> = ({ alt, ...props }) => {
  return <img alt={alt} {...props} />;
};

export default Image;
