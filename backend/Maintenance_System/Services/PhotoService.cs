using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Maintenance_System.Services;

namespace Maintenance_System.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;

        // Allowed MIME types — anything outside this set is rejected
        // before the bytes ever leave the server.
        private static readonly HashSet<string> AllowedContentTypes = new()
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        // 5 MB ceiling — keeps Cloudinary storage costs predictable
        // and prevents abuse via oversized uploads.
        private const long MaxFileSizeBytes = 5 * 1024 * 1024;

        public PhotoService(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }

        public async Task<(bool Success, string Result)> UploadPhotoAsync(IFormFile file)
        {
            // Guard: file present 
            if (file is null || file.Length == 0)
                return (false, "No file was provided.");

            // Guard: file size 
            if (file.Length > MaxFileSizeBytes)
                return (false, "File size must not exceed 5 MB.");

            // Guard: MIME type 
            // ContentType is the header value sent by the client.
            // It can be spoofed, but it filters out obvious non-images cheaply.
            // Cloudinary performs its own server-side validation on top of this.
            if (!AllowedContentTypes.Contains(file.ContentType.ToLower()))
                return (false, "Only JPEG, PNG, and WebP images are accepted.");

            // Upload 
            await using var stream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),

                // All ticket photos land in one folder — easy to manage
                // and apply Cloudinary transformations or policies later.
                Folder = "campus_maintenance",

                // Overwrite = false means re-uploading the same filename
                // produces a new asset rather than silently replacing the old one.
                Overwrite = false,

                // Eager transformation: generate a 1200px-wide web-optimised
                // version at upload time so the frontend never receives a raw
                // 8 MB camera photo.
                EagerTransforms = new List<Transformation>
                {
                    new Transformation().Width(1200).Crop("limit").Quality("auto").FetchFormat("auto")
                }
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            // Cloudinary signals failure via a populated Error property.
            if (uploadResult.Error is not null)
                return (false, $"Cloudinary upload failed: {uploadResult.Error.Message}");

            // SecureUrl is the HTTPS CDN URL — always prefer this over Url (HTTP).
            return (true, uploadResult.SecureUrl.ToString());
        }
    }
}