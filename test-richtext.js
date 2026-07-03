const DOMPurify = require("isomorphic-dompurify");
const parse = require("html-react-parser").default || require("html-react-parser");
const fs = require('fs');
const { normalizeArticle, firestoreFieldsToObject } = require('./src/lib/content-utils.js');

const rawData = JSON.parse(fs.readFileSync('article-data.json', 'utf8'));
const news = normalizeArticle('oYKVx9QCeE8eRXqH0yR4', firestoreFieldsToObject(rawData.fields));
const content = news.details;

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

const withIds = content.replace(/<(h[23])>(.*?)<\/\1>/gi, (match, tag, text) => {
  const cleanText = text.replace(/<[^>]*>?/gm, '');
  const id = generateSlug(cleanText);
  return `<${tag} id="${id}">${text}</${tag}>`;
});

const noColors = withIds
  .replace(/color:\s*[^;"]+;?/gi, '')
  .replace(/background-color:\s*[^;"]+;?/gi, '');

const sanitizedContent = DOMPurify.sanitize(noColors, { 
  ADD_ATTR: ['target', 'id'],
  ADD_TAGS: ['iframe']
});

try {
  const parsedReactNodes = parse(sanitizedContent, {
    replace: (domNode) => {}
  });
  console.log("DOM parsed successfully");
} catch(e) {
  console.error("Parse failed", e);
}
