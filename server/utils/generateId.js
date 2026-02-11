import { nanoid } from 'nanoid';

// Generate a URL-safe unique ID
const generateUniqueId = () => {
  return nanoid(10); 
};

export default generateUniqueId;