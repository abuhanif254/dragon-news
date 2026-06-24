import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDCnoGchsvSwB-NmQwFLw0OmmkbYJQLhNw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dragoon-news-d76b9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dragoon-news-d76b9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dragoon-news-d76b9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "277817488569",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:277817488569:web:b305b8f45237a487025768",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const pages = [
  {
    slug: "about",
    title: "About Us",
    content: `<h2>Our Story and Vision</h2>
<p>Welcome to The Brain. In an era saturated with misinformation and fleeting headlines, the need for deep, analytical, and uncompromising journalism has never been greater. We were founded on a singular, powerful premise: to deliver intelligence without fear or favour.</p>
<p>From our humble beginnings, The Brain has evolved into a premier digital destination for those who seek more than just the news. We are a collective of seasoned journalists, data scientists, industry experts, and critical thinkers who believe that access to the truth is a fundamental right. We do not just report on what happened; we explore why it happened, what it means for you, and how it will shape our collective future.</p>
<h2>What Sets Us Apart</h2>
<h3>Uncompromising Editorial Independence</h3>
<p>We are not beholden to corporate sponsors, political action committees, or hidden agendas. Our loyalty lies entirely with you, the reader. This independence allows us to tackle controversial topics, investigate powerful entities, and publish stories that others might shy away from. When we say "without fear or favour," we mean it.</p>
<h3>In-Depth Analytical Journalism</h3>
<p>While breaking news alerts you to the event, The Brain provides the blueprint to understand it. We specialize in long-form journalism, investigative reports, and data-driven analysis. We take the time to interview multiple sources, cross-reference data, and present a multi-faceted view of complex global issues.</p>
<h3>A Global Perspective with Local Nuance</h3>
<p>We recognize that in today's interconnected world, local events have global ramifications and vice versa. Our diverse team of correspondents and analysts is spread across the globe, bringing a wealth of local knowledge to our international coverage.</p>
<h2>Our Commitment to Our Readers</h2>
<h3>Accuracy and Transparency</h3>
<p>Trust is the currency of journalism, and we work tirelessly to earn and maintain yours. We adhere to the highest standards of journalistic integrity. If we make a mistake, we acknowledge it promptly and correct it transparently. We believe in showing our work, linking to primary sources, and explaining our methodology whenever possible.</p>
<h3>Fostering a Community of Thinkers</h3>
<p>The Brain is more than just a news outlet; it is a community of intellectually curious individuals. We encourage rigorous debate, thoughtful commentary, and active participation from our readers. We believe that the best solutions arise from a diversity of thought, and we strive to create a platform where varying perspectives can be respectfully shared and challenged.</p>
<h2>Looking to the Future</h2>
<p>As we look ahead, the challenges facing our world—from climate change to artificial intelligence—are unprecedented in their scale and complexity. Navigating these challenges will require a well-informed and engaged global citizenry. The Brain is committed to being at the forefront of this effort, providing the high-quality journalism and in-depth analysis necessary to empower our readers to make informed decisions and shape a better tomorrow.</p>
<p>Thank you for choosing The Brain as your trusted source for news and analysis. We invite you to join us on this journey of discovery, as we continue to illuminate the truth and deliver intelligence without fear or favour.</p>`
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    content: `<h2>1. Introduction</h2>
<p>At The Brain, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>

<h2>2. The Data We Collect About You</h2>
<p>Personal data, or personal information, means any information about an individual from which that person can be identified. It does not include data where the identity has been removed (anonymous data).</p>
<ul>
  <li><strong>Identity Data:</strong> includes first name, maiden name, last name, username or similar identifier, marital status, title, date of birth and gender.</li>
  <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
  <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
</ul>

<h2>3. How We Use Your Personal Data</h2>
<p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
<ul>
  <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
  <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
  <li>Where we need to comply with a legal obligation.</li>
</ul>

<h2>4. Data Security</h2>
<p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

<h2>5. Data Retention</h2>
<p>We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.</p>`
  },
  {
    slug: "terms",
    title: "Terms of Service",
    content: `<h2>1. Terms</h2>
<p>By accessing the website at The Brain, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

<h2>2. Use License</h2>
<p>Permission is granted to temporarily download one copy of the materials (information or software) on The Brain's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
<ul>
  <li>modify or copy the materials;</li>
  <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
  <li>attempt to decompile or reverse engineer any software contained on The Brain's website;</li>
  <li>remove any copyright or other proprietary notations from the materials; or</li>
  <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
</ul>

<h2>3. Disclaimer</h2>
<p>The materials on The Brain's website are provided on an 'as is' basis. The Brain makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

<h2>4. Limitations</h2>
<p>In no event shall The Brain or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on The Brain's website, even if The Brain or a The Brain authorized representative has been notified orally or in writing of the possibility of such damage.</p>

<h2>5. Revisions and Errata</h2>
<p>The materials appearing on The Brain's website could include technical, typographical, or photographic errors. The Brain does not warrant that any of the materials on its website are accurate, complete or current.</p>`
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    content: `<h2>1. What Are Cookies?</h2>
<p>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>

<h2>2. How We Use Cookies</h2>
<p>The Brain uses cookies in several ways to improve your experience on our site, including keeping you signed in, understanding how you use our site, and providing content that is relevant to you.</p>
<ul>
  <li><strong>Necessary Cookies:</strong> Essential for the operation of our site.</li>
  <li><strong>Analytical Cookies:</strong> Help us understand how visitors interact with our website.</li>
  <li><strong>Functional Cookies:</strong> Remember choices you make to improve your experience.</li>
  <li><strong>Targeting Cookies:</strong> Record your visit and the pages you have followed.</li>
</ul>

<h2>3. Types of Cookies We Use</h2>
<p>We use both first-party and third-party cookies on our website. First-party cookies are cookies set by the website you're visiting. Third-party cookies are set by other sites that provide content or services on the page you are viewing.</p>

<h2>4. Managing Cookies</h2>
<p>Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit www.aboutcookies.org or www.allaboutcookies.org.</p>

<h2>5. Policy Updates</h2>
<p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed.</p>

<h2>6. More Information</h2>
<p>If you have any questions about our use of cookies or other technologies, please email us at: contact@thebrain.com.</p>`
  },
  {
    slug: "contact",
    title: "Contact Us",
    content: `<h2>Get in Touch</h2>
<p>We'd love to hear from you. Whether you have a question about our reporting, want to pitch a story, or need assistance with your account, our team is ready to answer all your questions.</p>

<h2>Contact Information</h2>
<p><strong>Email Address:</strong><br/>
General Inquiries: info@thebrain.com<br/>
Editorial Team: editors@thebrain.com<br/>
Support: support@thebrain.com</p>

<p><strong>Physical Address:</strong><br/>
The Brain Headquarters<br/>
2300 Kishoreganj Sadar<br/>
Dhaka, Bangladesh</p>

<p><strong>Phone Number:</strong><br/>
+880 1724 010261 (Monday - Friday, 9am - 5pm BDT)</p>

<h2>Send Us a Tip</h2>
<p>If you have a confidential news tip, please use our secure tip line. We protect the identities of our sources and use encrypted channels for sensitive communications. Contact tips@thebrain.com for more information.</p>`
  }
];

async function seed() {
  console.log("Seeding pages...");
  for (const page of pages) {
    try {
      const docRef = doc(db, "pages", page.slug);
      await setDoc(docRef, {
        title: page.title,
        content: page.content,
        status: "published",
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log("Successfully seeded " + page.slug);
    } catch (err) {
      console.error("Failed to seed " + page.slug + ":", err);
    }
  }
  process.exit(0);
}

seed();
