import { sendError } from '../utils/response.js';

const notFound = (req, res) => {
  sendError(res, 404, 'Route not found');
};

export default notFound;
