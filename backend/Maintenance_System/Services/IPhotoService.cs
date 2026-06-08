namespace Maintenance_System.Services
{
    public interface IPhotoService
    {
        // Returns (success, secureUrl or errorMessage)
        Task<(bool Success, string Result)> UploadPhotoAsync(IFormFile file);
    }
}
