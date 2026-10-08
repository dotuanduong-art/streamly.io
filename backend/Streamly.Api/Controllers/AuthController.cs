using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using System.Security.Claims;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(
            [FromBody] RegisterDto dto)
        {
            try
            {
                var result =
                    await _authService.RegisterAsync(dto);

                return StatusCode(201, result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(
            [FromBody] LoginDto dto)
        {
            var result =
                await _authService.LoginAsync(dto);

            if (result == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Email hoặc mật khẩu không đúng."
                });
            }

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            string? userIdValue =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            if (!long.TryParse(
                    userIdValue,
                    out long userId))
            {
                return Unauthorized(new
                {
                    message = "Token không hợp lệ."
                });
            }

            var user =
                await _authService
                    .GetCurrentUserAsync(userId);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Người dùng không còn tồn tại hoặc đã bị khóa."
                });
            }

            return Ok(user);
        }
    }
}