using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Laced.Api.Features.Products.DTOs;

public class ProductRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required]
    public string Brand { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }

    public bool IsActive { get; set; } = true;

    // JSON example: [{"size":42,"quantity":5}]
    public string Sizes { get; set; } = "[]";

    public List<IFormFile> Images { get; set; } = [];

    public string? HeroImageFileName { get; set; }

    public string? HeroImageId { get; set; }

    // Zero-based index within the uploaded Images collection.
    public int? HeroImageIndex { get; set; }

    // Comma-separated image IDs to remove during an update.
    public string? RemoveImageIds { get; set; }
}
