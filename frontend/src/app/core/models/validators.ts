import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;
    const errors: Record<string, boolean> = {};
    if (value.length < 8) errors['minLength'] = true;
    if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
    if (!/[a-z]/.test(value)) errors['lowercase'] = true;
    if (!/[0-9]/.test(value)) errors['digit'] = true;
    return Object.keys(errors).length ? { passwordComplexity: errors } : null;
  };
}

export function getPasswordErrors(control: AbstractControl): string[] {
  const e = control.errors?.['passwordComplexity'];
  if (!e) return [];
  const msgs: string[] = [];
  if (e['minLength'])  msgs.push('Mínimo 8 caracteres');
  if (e['uppercase'])  msgs.push('Pelo menos uma maiúscula');
  if (e['lowercase'])  msgs.push('Pelo menos uma minúscula');
  if (e['digit'])      msgs.push('Pelo menos um número');
  return msgs;
}

/** Validator: requires at least one item selected in an array control */
export function minOneSelectedValidator(control: AbstractControl): ValidationErrors | null {
  const value: string[] = control.value ?? [];
  return value.length === 0 ? { minOneSelected: true } : null;
}
