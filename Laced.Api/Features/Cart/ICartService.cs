using Laced.Api.Common.Results;
using Laced.Api.Features.Cart.DTOs;

namespace Laced.Api.Features.Cart;

public interface ICartService
{
    Task<Result<CartResponse>> GetAsync(Guid userId);
    Task<Result<CartResponse>> AddItemAsync(Guid userId, AddCartItemRequest request);
    Task<Result<CartResponse>> UpdateItemAsync(Guid userId, Guid itemId, UpdateCartItemRequest request);
    Task<Result> RemoveItemAsync(Guid userId, Guid itemId);
    Task<Result> ClearAsync(Guid userId);
}
