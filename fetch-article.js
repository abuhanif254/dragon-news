const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const id = 'L0C5pUh2WeeO4LG0mbTJ';
const projectId = 'dragoan-news';
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/news/${id}?key=${apiKey}`;

fetch(url)
  .then(r => r.json())
  .then(d => {
    fs.writeFileSync('test-article.json', JSON.stringify(d, null, 2));
    console.log("Done");
  });
