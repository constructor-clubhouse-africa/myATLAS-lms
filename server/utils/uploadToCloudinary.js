import cloudinary from './configs/cloudinary.js';

export const uploadToCloudinary = async (buffer, options = {}) => {
  const { schoolId, fileCategory, fileName, additionalMetadata } = options;

  // Validate the input parameters

  if (!Buffer.isBuffer(buffer)) {
    throw new Error('A valid file buffer is required.');
  }

  if (!schoolId) {
    throw new Error('Missing required parameter: schoolId is needed for namespacing.');
  }

  if (!fileCategory) {
    throw new Error(
      'Missing required parameter: fileCategory is needed to determine the type of file being uploaded.'
    );
  }

  // Enforce File Size Limits (calculated in bytes)
  const SIZE_LIMITS = {
    document: 25 * 1024 * 1024, // 25MB
    video: 100 * 1024 * 1024, // 100MB
  };

  //Validate file size based on category and throw an error if it exceeds the limit
  if (fileCategory && SIZE_LIMITS[fileCategory]) {
    const fileSize = buffer.length; // Assuming buffer is a Buffer object
    if (fileSize > SIZE_LIMITS[fileCategory]) {
      throw new Error(
        `File size exceeds the limit for ${fileCategory}. Maximum allowed size is ${SIZE_LIMITS[fileCategory] / (1024 * 1024)}MB.`
      );
    }
  }
  let resourceType;

  //Document and other files are uploaded as 'raw' type, while videos are uploaded as 'video' type.
  if (fileCategory === 'video') {
    resourceType = 'video';
  } else {
    resourceType = 'raw';
  }

  const targetFolder = `schools/${schoolId}/${fileCategory}s/${fileName}`;

  const uploadOptions = {
    folder: targetFolder,
    resource_type: resourceType,
    context: additionalMetadata, // Attaches metadata directly to the asset in Cloudinary
  };

  // The function returns a promise that resolves with the secure URL and public ID of the uploaded file
  //Video and Document files are optimsed for delivery by default in Cloudinary, so no additional transformations are applied here.
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);

      // ] returns secure_url and public_id
      resolve({
        secure_url: result.secure_url,
        public_id: result.public_id,
      });
    });

    uploadStream.end(buffer);
  });
};
