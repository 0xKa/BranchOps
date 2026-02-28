using BranchOps.Api.Dtos;
using BranchOps.Api.Services;
using BranchOps.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BranchOps.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin,StockManager,BranchManager")]
public class ProductCategoriesController(ProductCategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductCategoryDto>>> GetAll(
        [FromQuery] bool? isActive,
        CancellationToken cancellationToken)
    {
        var categories = await categoryService.GetAllAsync(isActive, cancellationToken);
        return Ok(categories.Select(x => ToDto(x.Category, x.ProductCount)));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductCategoryDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var (category, productCount) = await categoryService.GetByIdAsync(id, cancellationToken);
        if (category == null)
            return NotFound(new ApiError("Category not found."));

        return Ok(ToDto(category, productCount));
    }

    [Authorize(Roles = "Admin,StockManager")]
    [HttpPost]
    public async Task<ActionResult<ProductCategoryDto>> Create(
        ProductCategoryCreateDto dto,
        CancellationToken cancellationToken)
    {
        var result = await categoryService.CreateAsync(dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var categoryDto = ToDto(result.Value!, 0);
        return CreatedAtAction(nameof(GetById), new { id = categoryDto.Id }, categoryDto);
    }

    [Authorize(Roles = "Admin,StockManager")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductCategoryDto>> Update(
        Guid id,
        ProductCategoryUpdateDto dto,
        CancellationToken cancellationToken)
    {
        var result = await categoryService.UpdateAsync(id, dto, cancellationToken);
        if (!result.Success)
            return MapError(result);

        var (_, productCount) = await categoryService.GetByIdAsync(id, cancellationToken);
        return Ok(ToDto(result.Value!, productCount));
    }

    [Authorize(Roles = "Admin,StockManager")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await categoryService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            return result.ErrorType switch
            {
                ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Category not found.")),
                ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Cannot delete category.")),
                _ => BadRequest(new ApiError(result.ErrorMessage ?? "Delete failed."))
            };
        }

        return NoContent();
    }

    private static ProductCategoryDto ToDto(ProductCategory category, int productCount)
        => new(
            category.Id,
            category.Name,
            category.IsActive,
            productCount,
            category.CreatedAt,
            category.UpdatedAt);

    private ActionResult MapError(ServiceResult<ProductCategory> result)
    {
        return result.ErrorType switch
        {
            ServiceErrorType.NotFound => NotFound(new ApiError(result.ErrorMessage ?? "Category not found.")),
            ServiceErrorType.Conflict => Conflict(new ApiError(result.ErrorMessage ?? "Category conflict.")),
            ServiceErrorType.Invalid => BadRequest(new ApiError(result.ErrorMessage ?? "Invalid category request.")),
            _ => BadRequest(new ApiError(result.ErrorMessage ?? "Request failed."))
        };
    }
}
