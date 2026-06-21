using DevStackManager.Application.Cities.Command;
using FluentValidation;

namespace DevStackManager.Application.Cities.Validators;

public sealed class CreateCityCommandValidator : AbstractValidator<CreateCityCommand>
{
    public CreateCityCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("O nome da cidade é obrigatório.")
            .MaximumLength(150).WithMessage("O nome deve ter no máximo 150 caracteres.");
        RuleFor(x => x.StateId).NotEmpty().WithMessage("O estado é obrigatório.");
    }
}