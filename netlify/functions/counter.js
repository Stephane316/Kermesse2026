
// Netlify Function — counter.js
// Stores and retrieves the number of registered children
// Uses Netlify Blobs for persistent storage

const MAX = 250;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('kermesse');

    if (event.httpMethod === 'GET') {
      const raw = await store.get('count');
      const count = raw ? parseInt(raw) : 0;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count, max: MAX, remaining: MAX - count }),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const add = parseInt(body.add) || 0;
      const raw = await store.get('count');
      const current = raw ? parseInt(raw) : 0;
      const newCount = Math.min(current + add, MAX);
      await store.set('count', String(newCount));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count: newCount, max: MAX, remaining: MAX - newCount }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
