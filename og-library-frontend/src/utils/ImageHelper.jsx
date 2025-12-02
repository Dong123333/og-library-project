export const getOptimizedImg = (url, width = 400) => {
    if (!url) return "https://placehold.co/400x600?text=No+Image";
    if (url.includes('res.cloudinary.com')) {
        return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
    return url;
};

export const getTinyImg = (url) => {
    if (!url) return "https://placehold.co/20x30?text=...";
    if (url.includes('res.cloudinary.com')) {
        return url.replace('/upload/', '/upload/f_auto,q_1,w_20,e_blur:1000/');
    }
    return url;
};