const multer = require('multer');
const path = require('path');

const tempFolderPath = path.resolve(__dirname, '../../public/temp');

//max size is set to 10 mb for each image or file
const maxSize = 10 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, tempFolderPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${uniqueSuffix}-${file.originalname}`;
        return cb(null, filename);
    }
});

const upload = multer({
    limits: { fileSize: maxSize },
    storage: storage
});

module.exports = upload;
