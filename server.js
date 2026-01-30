
/*
  LOCAL ENTRY POINT
  For Vercel, the entry point is api/index.js
*/
import app from './api/index.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`ℹ️  Note: On Vercel, this file is bypassed in favor of /api/index.js`);
});
