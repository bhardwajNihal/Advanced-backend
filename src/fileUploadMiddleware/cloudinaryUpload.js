
// middleware to upload files to cloudinary
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {cloudinary_api_key,cloudinary_cloud_name,cloudinary_api_secret} from "../configs.js"

// configure cloudinary
cloudinary.config({
  cloud_name: cloudinary_cloud_name,
  api_key: cloudinary_api_key,
  api_secret: cloudinary_api_secret,
});

// create a storage instance
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Cloudinary folder
    allowedFormats: ['jpg', 'png'],
  },
});

export const upload = multer({ storage: storage });     // import this middleware, provide file name, automatically catches incoming files from request and upload it on cloudinary





// // in route handler 
// app.post('/upload', upload.single('image'), (req, res) => {
//     res.send({ url: req.file.path }); // The Cloudinary URL
//   });