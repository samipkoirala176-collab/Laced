namespace Laced.Api.Features.Products.DTOs;

public record ProductSizeResponse(Guid Id, decimal Size, int Quantity);

public record ProductImageResponse(Guid Id, string FileName, string Url, bool IsHero);

public record ProductResponse(
    Guid Id,
    string Name,
    string Description,
    string Brand,
    decimal Price,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<ProductSizeResponse> Sizes,
    IReadOnlyList<ProductImageResponse> Images);

public record ProductListResponse(
    IReadOnlyList<ProductResponse> Items,
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages);
