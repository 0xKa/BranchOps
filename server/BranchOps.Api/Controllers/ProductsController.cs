using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,StockManager,BranchManager,Cashier")]
public class ProductsController(ProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? isActive,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var result = await productService.GetAllAsync(pagination, categoryId, isActive, search, cancellationToken);

        return Ok(new PagedResult<ProductDto>(
            result.Items.Select(ToDto).ToList(),
            result.Page,
            result.PageSize,
            result.TotalCount,
            result.TotalPages));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var product = await productService.GetByIdAsync(id, cancellationToken);
        if (product == null)
            return NotFound(new ApiError("Product not found."));

        return Ok(ToDto(product));
    }

    [Authorize(Roles = "Admin,StockManager")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(
        ProductCreateDto dto,
        CancellationToken cancellationToken)
    {
        var result = await productService.CreateAsync(dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var productDto = ToDto(result.Value!);
        return CreatedAtAction(nameof(GetById), new { id = productDto.Id }, productDto);
    }

    [Authorize(Roles = "Admin,StockManager")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductDto>> Update(
        Guid id,
        ProductUpdateDto dto,
        CancellationToken cancellationToken)
    {
        var result = await productService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        return Ok(ToDto(result.Value!));
    }

    [Authorize(Roles = "Admin,StockManager")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await productService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Product not found.")),
                ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Cannot delete product.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Delete failed."))
            };
        }

        return NoContent();
    }

    private static ProductDto ToDto(Product product)
        => new(
            product.Id,
            product.Name,
            product.CategoryId,
            product.Category?.Name ?? string.Empty,
            product.Price,
            product.Cost,
            product.IsActive,
            product.CreatedAt,
            product.UpdatedAt);

    private ActionResult MapError(ServiceResult<Product> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Product not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Product conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid product request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
        };
    }
}
