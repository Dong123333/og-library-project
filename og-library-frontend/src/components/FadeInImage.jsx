import React, { useState } from 'react';
import {getOptimizedImg, getTinyImg} from "../utils/ImageHelper.jsx";

const FadeInImage = ({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const fullSrc = getOptimizedImg(src, 400);
    const tinySrc = getTinyImg(src);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <img
                src={tinySrc}
                alt={alt}
                className="absolute inset-0 w-full h-full object-cover filter blur-md scale-110"
            />
            <img
                src={fullSrc}
                alt={alt}
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                className={`
                    absolute inset-0 w-full h-full object-contain 
                    transition-opacity duration-500 ease-in-out
                    ${isLoaded ? 'opacity-100' : 'opacity-0'} 
                `}
            />
        </div>
    );
};

export default FadeInImage;