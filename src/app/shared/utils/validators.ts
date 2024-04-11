import { AbstractControl } from '@angular/forms';


export function matchValidator(source: string, target: string) {
  return (control: AbstractControl) => {
    const sourceControl = control.get(source)!;
    const targetControl = control.get(target)!;
    if (targetControl.errors && !targetControl.errors.mismatch) {
      return null;
    }
    if (sourceControl.value !== targetControl.value) {
      targetControl.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      targetControl.setErrors(null);
      return null;
    }
  };
}

export function phoneNumberValidator(source: string) {
  return (control: AbstractControl) => {
    const sourceControl = control.get(source)!;
    const regex = /^((\+91-?)|0)?[0-9]{10}$/;

    if (control.value && !control.value.match(regex)) {
      control.setErrors({ phone: true });
      return { phone: true };
    }

    return null;
  };
}

export function urlValidator(source: string) {
  return (control: AbstractControl) => {
    const sourceControl = control.get(source)!;
    const regex = /^((ftp|http|https):\/\/)?(www.)?/.source
      + /(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+/.source
      + /((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?\/?$/gm.source;

    if (control.value && !control.value.match(regex)) {
      control.setErrors({ url: true });
      return { url: true };
    }

    return null;
  };
}
