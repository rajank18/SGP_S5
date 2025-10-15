import { google } from 'googleapis';
import path from 'path';

const KEYFILEPATH = path.join(process.cwd(), 'backend//config//drive-json.json'); // update path
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

export default drive;