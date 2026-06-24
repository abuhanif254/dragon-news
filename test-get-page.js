const { getPage } = require('./src/lib/firestore.js');

async function test() {
  const page = await getPage("privacy-policy");
  console.log(JSON.stringify(page, null, 2));
}

test();
