const express = require('express');
const router = express.Router();
// If using Node.js v18+, fetch is global; otherwise, require node-fetch:
const fetch = require('node-fetch');

const SESSION_HEADER = 'x-session-token';

// Route: GET /filelist/*
// Streams a TSV file listing all files under the given directory path.
router.get('/filelist/*', async (req, res) => {
    // Extract the wildcard path after /filelist/
    const path = req.params[0];
    // Get the session token from headers (case-insensitive)
    const token = req.headers[SESSION_HEADER.toLowerCase()];

    // Set response headers for TSV file download
    res.setHeader('Content-Type', 'text/tab-separated-values');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="${path.substring(path.lastIndexOf('/') + 1)}.tsv"`
    );

    // Write TSV header
    res.write('Files\n');
    // Recursively stream file paths
    await getFiles(path, token, res);

    // End the response
    res.status(200).end();
});

/**
 * Recursively fetches directory entries from the backend and streams file paths to the response.
 * @param {string} dir - Directory path relative to 'user/'.
 * @param {string} token - Session token for authentication.
 * @param {object} res - Express response object.
 */
async function getFiles(dir, token, res) {
    const url = `${process.env.BACKEND_URL}/files/user/${dir}`;
    const headers = { [SESSION_HEADER]: token };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        const files = await response.json();

        for (const entry of files) {
            if (entry.type.toUpperCase() === 'FILE') {
                // Construct and sanitize the file path
                let sanitisedPath = `${entry.path}/${entry.name}`;
                if (sanitisedPath.startsWith('user/')) sanitisedPath = sanitisedPath.substring(5);
                res.write(sanitisedPath + '\n');
            } else if (entry.type.toUpperCase() === 'DIR') {
                // Recursively process subdirectories
                await getFiles(`${entry.path}/${entry.name}`, token, res);
            }
        }
    } catch (error) {
        // Write error to the TSV and log for debugging
        res.write('Error generating filelist\n');
        console.error(error);
    }
}

module.exports = router;
