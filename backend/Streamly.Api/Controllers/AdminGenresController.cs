using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/admin/genres")]
    [Authorize(Roles = "Admin")]
    public class AdminGenresController : ControllerBase
    {
        private readonly IAdminGenreService _service;

        public AdminGenresController(
            IAdminGenreService service
        )
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<GenreDto>>> GetAll()
        {
            return Ok(
                await _service.GetAllAsync()
            );
        }

        [HttpPost]
        public async Task<ActionResult<GenreDto>> Create(
            AdminGenreUpsertDto dto
        )
        {
            try
            {
                var result =
                    await _service.CreateAsync(dto);

                return Created(
                    $"/api/admin/genres/{result.Id}",
                    result
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(
            long id,
            AdminGenreUpsertDto dto
        )
        {
            try
            {
                await _service.UpdateAsync(id, dto);

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                await _service.DeleteAsync(id);

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }
    }
}