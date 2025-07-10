const express = require('express');
const router = express.Router();

const SESSION_HEADER = 'x-session-token'

// Handles /filelist/* under the mount path
router.get('/filelist/*dir', async (req, res) => {
    const path = req.params.dir[0];
    const token = req.headers[SESSION_HEADER.toLowerCase()];

    res.setHeader('Content-Type', 'text/tab-separated-values');
    res.setHeader('Content-Disposition', `attachment; filename="${path.substring(path.lastIndexOf('/') + 1)}.tsv"`);

    res.write('Files\n');
    await getFiles(path, token, res);
    res.status(200).end();
});

  async function getFiles(dir, token, res) {
    const url = `${process.env.BACKEND_URL}/files/user/${dir}`;
    const headers = { [SESSION_HEADER]: token };
  
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const files = await response.json();
  
      for (const entry of files) {
        if (entry.type.toUpperCase() === 'FILE') {
          let sanitisedPath = `${entry.path}/${entry.name}`;
          if (sanitisedPath.startsWith('user/')) sanitisedPath = sanitisedPath.substring(5);
          res.write(sanitisedPath + '\n');
        } else if (entry.type.toUpperCase() === 'DIR') {
          await getFiles(`${entry.path}/${entry.name}`, token, res);
        }
      }
    } catch (error) {
      res.write('Error generating filelist\n');
      console.error(error);
    }
  }

module.exports = router;