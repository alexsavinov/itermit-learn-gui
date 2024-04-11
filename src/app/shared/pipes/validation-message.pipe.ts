import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';



@Pipe({ name: 'validationMessage', pure: false })
export class ValidationMessagePipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  transform(field: AbstractControl, compared?: string) {
    const controlErrors: ValidationErrors = field.errors || {};
    const errorMessages: string[] = [];

    Object.keys(controlErrors).forEach(keyError => {
      const controlError = controlErrors[keyError];

      if (keyError === 'required' && controlError) {
        errorMessages.push(this.translate.instant('validations.required'));
      }

      if (keyError === 'minlength') {
        const requiredLength = controlErrors.minlength['requiredLength'];
        errorMessages.push(this.translate.instant(
            'validations.minlength',
            { number: requiredLength },
          ),
        );
      }

      if (keyError === 'maxlength') {
        const requiredLength = controlErrors.maxlength['requiredLength'];
        errorMessages.push(this.translate.instant(
            'validations.maxlength',
            { number: requiredLength },
          ),
        );
      }

      if (keyError === 'phone') {
        errorMessages.push(this.translate.instant('validations.invalid_phone'));
      }

      if (keyError === 'email') {
        errorMessages.push(this.translate.instant('validations.invalid_email'));
      }

      if (keyError === 'url') {
        errorMessages.push(this.translate.instant('validations.invalid_url'));
      }

      if (keyError === 'usernameNotFound') {
        errorMessages.push(this.translate.instant('validations.username_not_found'));
      }

      if (keyError === 'passwordIncorrect') {
        errorMessages.push(this.translate.instant('validations.password_incorrect'));
      }

      if (keyError === 'mismatch' && controlError) {
        errorMessages.push(this.translate.instant(
          'validations.inconsistent',
          { value: compared }),
        );
      }

    });

    return errorMessages.join('.');
  }
}
