using Laced.Api.Common.Results;
using Laced.Api.Features.Products.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Laced.Api.Features.Products;

[ApiController]
[Route("api/products")]
public class ProductController(IProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductQueryParameters parameters)
    {
        parameters.IncludeInactive = User.IsInRole("Admin");
        var result = await productService.GetAllAsync(parameters);
        return Ok(new ApiResponse<ProductListResponse>(true, "Products retrieved successfully.", result.Value));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await productService.GetByIdAsync(id, User.IsInRole("Admin"));
        return result.IsSuccess
            ? Ok(new ApiResponse<ProductResponse>(true, "Product retrieved successfully.", result.Value))
            : NotFound(new ApiResponse<object?>(false, result.Error ?? "Product not found.", null));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] ProductRequest request)
    {
        var result = await productService.CreateAsync(request);
        return result.IsSuccess
            ? Ok(new ApiResponse<ProductResponse>(true, "Product created successfully.", result.Value))
            : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Product creation failed.", null));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(Guid id, [FromForm] ProductUpdateRequest request)
    {
        var result = await productService.UpdateAsync(id, request);
        return result.IsSuccess
            ? Ok(new ApiResponse<ProductResponse>(true, "Product updated successfully.", result.Value))
            : result.Error == "Product not found."
                ? NotFound(new ApiResponse<object?>(false, result.Error, null))
                : BadRequest(new ApiResponse<object?>(false, result.Error ?? "Product update failed.", null));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await productService.DeleteAsync(id);
        return result.IsSuccess
            ? Ok(new ApiResponse<object?>(true, "Product deleted successfully.", null))
            : NotFound(new ApiResponse<object?>(false, result.Error ?? "Product not found.", null));
    }
}
