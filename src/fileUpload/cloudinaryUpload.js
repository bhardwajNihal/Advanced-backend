import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: 'cloudinary_cloud_name',
  api_key: 'cloudinary_api_key',
  api_secret: 'cloudinary_api_secret',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Cloudinary folder
    allowedFormats: ['jpg', 'png'],
  },
});

export const upload = multer({ storage: storage });


// in route handler 
app.post('/upload', upload.single('image'), (req, res) => {
    res.send({ url: req.file.path }); // The Cloudinary URL
  });