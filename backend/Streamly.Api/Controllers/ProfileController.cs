using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly IWebHostEnvironment _environment;

        public ProfileController(
            IProfileService profileService,
            IWebHostEnvironment environment
        )
        {
            _profileService = profileService;
            _environment = environment;
        }

        [HttpPut]
        public async Task<ActionResult<UserResponseDto>> Update(
            UpdateProfileDto dto
        )
        {
            try
            {
                var userId = GetCurrentUserId();

                var user =
                    await _profileService.UpdateAsync(
                        userId,
                        dto
                    );

                if (user == null)
                {
                    return NotFound(new
                    {
                        message = "Không tìm thấy người dùng."
                    });
                }

                return Ok(user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("avatar")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<UserResponseDto>> UploadAvatar(
        IFormFile file
        )
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Vui lòng chọn ảnh."
                });
            }

            const long maxFileSize = 5 * 1024 * 1024;

            if (file.Length > maxFileSize)
            {
                return BadRequest(new
                {
                    message = "Ảnh không được lớn hơn 5 MB."
                });
            }

            var extension = Path
                .GetExtension(file.FileName)
                .ToLowerInvariant();

            var allowedExtensions = new[]
            {
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            };

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    message =
                        "Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP."
                });
            }

            var allowedContentTypes = new[]
            {
                "image/jpeg",
                "image/png",
                "image/webp"
            };

            if (!allowedContentTypes.Contains(
                    file.ContentType.ToLowerInvariant()
                ))
            {
                return BadRequest(new
                {
                    message = "Định dạng ảnh không hợp lệ."
                });
            }

            var webRoot =
                _environment.WebRootPath ??
                Path.Combine(
                    _environment.ContentRootPath,
                    "wwwroot"
                );

            var avatarFolder = Path.Combine(
                webRoot,
                "uploads",
                "avatars"
            );

            Directory.CreateDirectory(avatarFolder);

            var fileName =
                $"{Guid.NewGuid():N}{extension}";

            var filePath = Path.Combine(
                avatarFolder,
                fileName
            );

            await using (var stream =
                new FileStream(
                    filePath,
                    FileMode.Create
                ))
            {
                await file.CopyToAsync(stream);
            }

            var avatarUrl =
                $"/uploads/avatars/{fileName}";

            try
            {
                var userId = GetCurrentUserId();

                var user =
                    await _profileService.UpdateAvatarAsync(
                        userId,
                        avatarUrl
                    );

                if (user == null)
                {
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }

                    return NotFound(new
                    {
                        message = "Không tìm thấy người dùng."
                    });
                }

                return Ok(user);
            }
            catch (ArgumentException ex)
            {
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (
                string.IsNullOrWhiteSpace(value) ||
                !long.TryParse(value, out var userId)
            )
            {
                throw new UnauthorizedAccessException(
                    "Token không hợp lệ."
                );
            }

            return userId;
        }
    }
}