using DevStackManager.Application.DTOs;
using DevStackManager.Application.Users.Commands;
using DevStackManager.Application.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevStackManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class UsersController(IMediator mediator) : ControllerBase
{
    // POST api/users/register
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess 
            ? CreatedAtAction(nameof(GetByEmail), new { email = result.Value.Email }, result.Value) 
            : Problem(result.Error!, statusCode: StatusCodes.Status409Conflict);
    }

    // POST api/users/login
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthTokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status401Unauthorized);
    }

    // GET api/users/{email}
    [HttpGet("{email}")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByEmail(string email, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetUserByEmailQuery(email), cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }

    // GET api/users?page=1&pageSize=10
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagedResultDto<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new ListUsersQuery(page, pageSize), cancellationToken);

        return Ok(result.Value);
    }

    // PUT api/users/{email}
    [HttpPut("{email}")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(
        string email,
        [FromBody] UpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateUserCommand(email, request.Name, request.Email);
        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : Problem(result.Error!, statusCode: StatusCodes.Status409Conflict);
    }

    // DELETE api/users/{email}
    [HttpDelete("{email}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string email, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteUserCommand(email), cancellationToken);

        return result.IsSuccess
            ? NoContent()
            : Problem(result.Error!, statusCode: StatusCodes.Status404NotFound);
    }
}

// Separa o ID da rota do corpo
public record UpdateUserRequest(string Name, string Email);
