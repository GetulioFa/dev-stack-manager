using DevStackManager.Application.Developers.Commands;
using FluentValidation;

namespace DevStackManager.Application.Developers.Validators;

public sealed class CreateDeveloperCommandValidator : AbstractValidator<CreateDeveloperCommand>
{
    public CreateDeveloperCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome do desenvolvedor é obrigatório.")
            .MaximumLength(150).WithMessage("O nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O e-mail é obrigatório.")
            .EmailAddress().WithMessage("O e-mail informado não é válido.")
            .MaximumLength(254).WithMessage("O e-mail deve ter no máximo 254 caracteres.");

        RuleFor(x => x.Seniority)
            .IsInEnum().WithMessage("A senioridade informada é inválida.");

        RuleFor(x => x.CityId)
            .NotEmpty().WithMessage("A cidade é obrigatória.");

        RuleFor(x => x.LanguageIds)
            .NotNull().WithMessage("A lista de linguagens não pode ser nula.")
            .Must(ids => ids != null && ids.Any())
            .WithMessage("O desenvolvedor deve ter ao menos uma linguagem de programação.");
    }

    public sealed class UpdateDeveloperCommandValidator : AbstractValidator<UpdateDeveloperCommand>
    {
        public UpdateDeveloperCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("O ID do desenvolvedor é obrigatório.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("O nome do desenvolvedor é obrigatório.")
                .MaximumLength(150).WithMessage("O nome deve ter no máximo 150 caracteres.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("O e-mail é obrigatório.")
                .EmailAddress().WithMessage("O e-mail informado não é válido.")
                .MaximumLength(254).WithMessage("O e-mail deve ter no máximo 254 caracteres.");

            RuleFor(x => x.Seniority)
                .IsInEnum().WithMessage("A senioridade informada é inválida.");

            RuleFor(x => x.CityId)
                .NotEmpty().WithMessage("A cidade é obrigatória.");

            RuleFor(x => x.LanguageIds)
                .NotNull().WithMessage("A lista de linguagens não pode ser nula.")
                .Must(ids => ids != null && ids.Any())
                .WithMessage("O desenvolvedor deve ter ao menos uma linguagem de programação.");
        }
    }
}
