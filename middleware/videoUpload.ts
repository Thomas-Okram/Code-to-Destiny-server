import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
       if(file.fieldname ==="video")
       {
      //const rootDir = path.dirname(require.main.filename || "./").slice(0, -4);
       // cb(null, path.join(rootDir, 'public/').concat('videos'));
        cb(null, path.join(__dirname, "../public/videos"));
    }},
    filename: function (req, file, cb) {
        const videoExt = file.mimetype.split("/")[1];
      const id = uuidv4();
        cb(null, "course_video_" + id + "." + videoExt);
    },
})

const fileFilter = (req: any, file: any, cb: any) => {
    if(file.mimetype === "video/mp4"){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

export const videoUpload = multer({ storage ,fileFilter})