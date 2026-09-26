using Laced.Api.Common.Results;
using Laced.Api.Features.Products.DTOs;

namespace Laced.Api.Features.Products;

public interface IProductService
{
    Task<Result<ProductListResponse>> GetAllAsync(ProductQueryParameters parameters);
    Task<Result<ProductResponse>> GetByIdAsync(Guid id, bool includeInactive = false);
    Task<Result<ProductResponse>> CreateAsync(ProductRequest request);
    Task<Result<ProductResponse>> UpdateAsync(Guid id, ProductUpdateRequest request);
    Task<Result> DeleteAsync(Guid id);
}
