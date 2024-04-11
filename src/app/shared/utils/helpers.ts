import { MatSnackBar, MatSnackBarConfig, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import { environment } from '@env/environment';
import { IArticle } from '../../routes/news/interfaces';


export function openSnackBar(snackBar: MatSnackBar,
                             message: string,
                             duration?: number,
                             verticalPosition?: MatSnackBarVerticalPosition) {

  const config: MatSnackBarConfig = {
    duration: duration || 4000,
    verticalPosition: verticalPosition || 'top',
  };

  snackBar.open(message, '', config);
}


export function addAPIUrl(article: IArticle) {
  return {
    ...article,
    content: article.content?.replaceAll('API_URL/', environment.staticUrl + environment.newsImages),
  };
}

export function removeAPIUrl(article: IArticle) {
  return {
    ...article,
    content: article.content?.replaceAll(environment.staticUrl + environment.newsImages, 'API_URL/'),
  };
}
