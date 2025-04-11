// setup middleware facilitating file upload locally, on our diskstorage

// import multer from 'multer';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/uploads');       // defining destination folder where to store file
//   },
//   filename: function (req, file, cb) {      // assigning a filename, making sure it's unique
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix);
//   }
// });

// export const upload = multer({ storage: storage });



// In our route handlers define the following routes : 
 
    // app.post('/upload', upload.single('image'), (req, res) => { // in case of single file upload 
    //     res.send('File uploaded to local disk!');
    // });
  
    // // can also upload array of files by : 
    // app.post('/upload', upload.array('images', 5), (req, res) => {   // fields in case of varying field
    //     // req.files will be an array of files
    //     console.log(req.files); // Array of file objects
    //     res.send('Multiple files uploaded successfully!');
    //   });


// files will look like, and path can be accessed by req.files?.avatar?.[0]

  // {
  //   avatar: [
  //     {
  //       fieldname: 'avatar',
  //       originalname: 'profile-pic.jpg',
  //       encoding: '7bit',
  //       mimetype: 'image/jpeg',
  //       destination: './public/uploads',
  //       filename: 'avatar-1712658992710-987654321',
  //       path: 'public/uploads/avatar-1712658992710-987654321',
  //       size: 52341
  //     }
  //   ],
  //   coverImage: [
  //     {
  //       fieldname: 'coverImage',
  //       originalname: 'cover-photo.jpg',
  //       encoding: '7bit',
  //       mimetype: 'image/jpeg',
  //       destination: './public/uploads',
  //       filename: 'coverImage-1712658992711-123456789',
  //       path: 'public/uploads/coverImage-1712658992711-123456789',
  //       size: 84590
  //     }
  //   ]
  // }