const express = require('express');
const path = require('path');
const router = express.Router();

const dataDir = path.join(__dirname, '../data');
const transcodedDir = path.join(dataDir, 'transcoded');

router.get('/download/:filename', (req, res) => {
    const file = path.join(transcodedDir, req.params.filename);
    res.download(file);
});

module.exports = router;