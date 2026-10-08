using Streamly.Api.Models;

namespace Streamly.Api.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}