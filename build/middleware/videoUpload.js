"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoUpload = exports.storage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
exports.storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "video") {
            //const rootDir = path.dirname(require.main.filename || "./").slice(0, -4);
            // cb(null, path.join(rootDir, 'public/').concat('videos'));
            cb(null, path_1.default.join(__dirname, "../public/videos"));
        }
    },
    filename: function (req, file, cb) {
        const videoExt = file.mimetype.split("/")[1];
        const id = (0, uuid_1.v4)();
        cb(null, "course_video_" + id + "." + videoExt);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "video/mp4") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
exports.videoUpload = (0, multer_1.default)({ storage: exports.storage, fileFilter });
