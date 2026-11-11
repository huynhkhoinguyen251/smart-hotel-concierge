import client from './client.js';

// Cả hai trả { token, user }.

export const register = async ({ full_name, email, phone, password }) => {
  const body = await client.post('/auth/register', { full_name, email, phone, password });
  return body.data;
};

export const login = async ({ email, password }) => {
  const body = await client.post('/auth/login', { email, password });
  return body.data;
};
