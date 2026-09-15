import cloudinary from '../configs/cloudinary.js';

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

  if (!fileName) {
    throw new Error(
      'Missing required parameter: fileName is needed to set the public ID in Cloudinary.'
    );
  }

  // Enforce File Size Limits (calculated in bytes)
  const SIZE_LIMITS = {
    document: 25 * 1024 * 1024, // 25MB
    video: 100 * 1024 * 1024, // 100MB
  };

  if (!SIZE_LIMITS[fileCategory]) {
    throw new Error(`Unsupported file category: ${fileCategory}`);
  }

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

  const targetFolder = `schools/${schoolId}/${fileCategory}s`;

  const uploadOptions = {
    folder: targetFolder,
    public_id: fileName, // Use the provided fileName as the public ID
    resource_type: resourceType,
    context: additionalMetadata, // Attaches metadata directly to the asset in Cloudinary
  };

  // Raw documents are delivered as-is, while videos are optimized for delivery using Cloudinary's automatic quality and format settings.
  // Videos use q_auto and f_auto in the generated delivery URL for optimisation.
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);

      const optimizedUrl =
        resourceType === 'video'
          ? cloudinary.url(result.public_id, {
              resource_type: 'video',
              transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
            })
          : result.secure_url;
      // ] returns secure_url and public_id
      resolve({
        secure_url: result.secure_url,
        optimized_url: optimizedUrl,
        public_id: result.public_id,
      });
    });

    uploadStream.end(buffer);
  });
};
