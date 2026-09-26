using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Laced.Api.Features.Products.DTOs;

public class ProductUpdateRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Brand { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal? Price { get; set; }

    public bool? IsActive { get; set; }
    public string? Sizes { get; set; }
    public List<IFormFile> Images { get; set; } = [];
    public string? HeroImageFileName { get; set; }
    public string? HeroImageId { get; set; }
    public int? HeroImageIndex { get; set; }
    public string? RemoveImageIds { get; set; }
}