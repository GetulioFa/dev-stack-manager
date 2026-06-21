using DevStackManager.Application.Languages.Commands;
using FluentValidation;

namespace DevStackManager.Application.Languages.Validators;

public sealed class UpdateLanguageCommandValidator : AbstractValidator<UpdateLanguageCommand>
{
    public UpdateLanguageCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("O ID da linguagem é obrigatório.");
        RuleFor(x => x.Name).NotEmpty().WithMessage("O nome da linguagem é obrigatório.")
            .MaximumLength(100).WithMessage("O nome deve ter no máximo 100 caracteres.");
        RuleFor(x => x.Type).IsInEnum().WithMessage("O tipo de linguagem informado é inválido.");
    }
}