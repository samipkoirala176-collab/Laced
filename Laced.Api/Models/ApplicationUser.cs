using Microsoft.AspNetCore.Identity;

namespace Laced.Api.Models;

public class ApplicationUser : IdentityUser<Guid>
{
    public string Name { get; set; } = string.Empty;
}
