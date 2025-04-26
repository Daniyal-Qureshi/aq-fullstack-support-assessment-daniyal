// src/config/redis.js
import { createClient } from 'redis';
import { REDIS_URL } from './vars';

export const client = createClient({ url: REDIS_URL });

async function connectRedis() {
  await client.connect();
  
  client.on('error', (err) => {
    console.log('Redis Client Error', err);
  });

  client.on('connect', () => {
    console.log('Connected to Redis');
  });
}

connectRedis().catch((err) => {
  console.error('Error connecting to Redis:', err);
});
