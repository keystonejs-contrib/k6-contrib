import path from 'path';
import formidable from 'formidable';
import fs from 'fs/promises';

export default async function uploadImageHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = './public/images';
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  try {
    // Ensure upload directory exists
    await fs.access(uploadDir).catch(() => fs.mkdir(uploadDir, { recursive: true }));

    const form = formidable({ uploadDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Failed to process the file' });
      }

      // Access the file using the key `image` based on the provided `files` structure
      const file = files.image && files.image[0]; // Handle as an array for compatibility with the structure

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Generate public URL for the uploaded file
      const fileUrl = `${baseUrl}/images/${path.basename(file.filepath)}`;
      return res.status(200).json({ success: true, file: { url: fileUrl } });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Important for formidable
  },
};
