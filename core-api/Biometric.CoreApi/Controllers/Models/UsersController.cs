using Biometric.CoreApi.Data;
using Biometric.CoreApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Biometric.CoreApi.Controllers;

/// <summary>
/// Gestión de usuarios biométricos.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly BiometricDbContext _context;

    public UsersController(BiometricDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todos los usuarios enrolados.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users.AsNoTracking().ToListAsync();
        return Ok(users);
    }

    /// <summary>
    /// Request para enrolar un usuario.
    /// </summary>
    public record EnrollRequest(string FullName, string DocumentId, string Role, float[] Descriptor);

    /// <summary>
    /// Enrola (registra) un usuario con descriptor facial (128 floats).
    /// </summary>
    /// <remarks>
    /// El descriptor debe tener longitud 128.
    /// </remarks>
    [HttpPost("enroll")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Enroll([FromBody] EnrollRequest req)
    {
        if (req is null)
            return BadRequest("Body is required.");

        if (string.IsNullOrWhiteSpace(req.FullName))
            return BadRequest("FullName is required.");

        if (string.IsNullOrWhiteSpace(req.DocumentId))
            return BadRequest("DocumentId is required.");

        if (string.IsNullOrWhiteSpace(req.Role))
            return BadRequest("Role is required.");

        if (req.Descriptor is null || req.Descriptor.Length != 128)
            return BadRequest("Descriptor must be length 128.");

        // (opcional) evitar duplicados por DocumentId
        var exists = await _context.Users.AnyAsync(u => u.DocumentId == req.DocumentId);
        if (exists)
            return BadRequest("DocumentId already exists.");

        var user = new User
        {
            FullName = req.FullName,
            DocumentId = req.DocumentId,
            Role = req.Role,
            Descriptor = req.Descriptor
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(user);
    }
}
