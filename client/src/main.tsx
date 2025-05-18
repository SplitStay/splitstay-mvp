import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet } from "react-helmet";

createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      <title>SplitStay - Share Hotel Rooms & Save</title>
      <meta 
        name="description" 
        content="SplitStay helps solo travelers find compatible roommates, share hotel rooms, and save money on accommodations. Connect with verified travelers, split costs, and make new friends."
      />
      <meta property="og:title" content="SplitStay - Share Hotel Rooms & Save" />
      <meta property="og:description" content="Connect with verified travelers, split costs, and make new friends while traveling." />
      <meta property="og:type" content="website" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </Helmet>
    <App />
  </>
);
