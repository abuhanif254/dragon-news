const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

(async () => {
  const id = 'oYKVx9QCeE8eRXqH0yR4';
  const url = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/news/${id}?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`;
  const response = await fetch(url).then(r => r.json());
  
  const fs = require('fs');
  fs.writeFileSync('article-data.json', JSON.stringify(response, null, 2));
  console.log('Saved to article-data.json');
})();
