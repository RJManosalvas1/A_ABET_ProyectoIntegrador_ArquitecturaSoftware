using Biometric.CoreApi.Data;
using Biometric.CoreApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly BiometricDbContext _context;

    public UsersController(BiometricDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    public record EnrollRequest(string FullName, string DocumentId, string Role, float[] Descriptor);

[HttpPost("enroll")]
public async Task<IActionResult> Enroll([FromBody] EnrollRequest req)
{
    if (req.Descriptor is null || req.Descriptor.Length != 128)
        return BadRequest("Descriptor must be length 128.");

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
