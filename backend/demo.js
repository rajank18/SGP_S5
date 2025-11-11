import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Google Drive setup
const KEYFILEPATH = path.join(process.cwd(), 'config', 'drive-json.json'); // update if needed
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});
const drive = google.drive({ version: 'v3', auth });

// Upload endpoint
app.post('/demo/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const fileMetadata = { name: file.originalname };
    const media = { mimeType: file.mimetype, body: fs.createReadStream(file.path) };
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });
    // Clean up local file
    fs.unlink(file.path, () => {});
    res.json({ fileId: response.data.id, webViewLink: response.data.webViewLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download endpoint
app.get('/demo/download/:fileId', async (req, res) => {
  const { fileId } = req.params;
  try {
    const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    res.setHeader('Content-Disposition', `attachment; filename="${fileId}.file"`);
    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Demo server running on port ${PORT}`);
});
