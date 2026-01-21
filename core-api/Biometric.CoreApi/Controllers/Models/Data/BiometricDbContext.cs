using Biometric.CoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace Biometric.CoreApi.Data;

public class BiometricDbContext : DbContext
{
    public BiometricDbContext(DbContextOptions<BiometricDbContext> options)
        : base(options) {}

    public DbSet<User> Users => Set<User>();
}
