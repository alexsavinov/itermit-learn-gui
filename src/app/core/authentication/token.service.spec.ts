import { TestBed } from '@angular/core/testing';
import { tap } from 'rxjs/operators';

import { TokenService, currentTimestamp, TokenFactory } from '@core/authentication';
import { MemoryStorageService, LocalStorageService } from '@shared/services/storage.service';


describe('TokenService', () => {
  let tokenService: TokenService;
  let tokenFactory: TokenFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: LocalStorageService, useClass: MemoryStorageService}],
    });
    tokenService = TestBed.inject(TokenService);
    tokenFactory = TestBed.inject(TokenFactory);
  });

  it('should be created', () => {
    expect(tokenService).toBeTruthy();
  });

  it('should get authorization header value', () => {
    tokenService.set({access_token: 'token', token_type: 'bearer'});

    expect(tokenService.getBearerToken()).toEqual('Bearer token');
  });

  it('cannot get authorization header value', () => {
    tokenService.set({access_token: '', token_type: 'bearer'});

    expect(tokenService.getBearerToken()).toBe('');
  });

  it('should not has exp when token has expires_in', () => {
    tokenService.set({access_token: 'token', token_type: 'bearer'});

    tokenService
      .change()
      .pipe(tap(token => expect(token!.exp).toBeUndefined()))
      .subscribe();
  });

  it('should has exp when token has expires_in', () => {
    const expiresIn = 3600;
    tokenService.set({access_token: 'token', token_type: 'bearer', expires_in: expiresIn});

    tokenService
      .change()
      .pipe(tap(token => expect(token!.exp).toEqual(currentTimestamp() + expiresIn)))
      .subscribe();
  });

  it('should get refresh token', () => {
    tokenService.set({access_token: 'token1', token_type: 'bearer', refresh_token: 'token2'});

    expect(tokenService.getRefreshToken()).toEqual('token2');
  });

  it('should clear token', () => {
    spyOn(tokenService, 'clear').and.callThrough();
    tokenService.clear();
    expect(tokenService.clear).toHaveBeenCalled();
  });

  it('should refresh token', () => {
    spyOn(tokenService, 'refresh').and.callThrough();
    tokenService.refresh();
    expect(tokenService.refresh).toHaveBeenCalled();
  });

  it('should validate token', () => {
    spyOn(tokenService, 'valid').and.callThrough();
    tokenService.valid();
    expect(tokenService.valid).toHaveBeenCalled();
  });

  it('should destroy component', () => {
    spyOn(tokenService, 'ngOnDestroy').and.callThrough();
    tokenService.ngOnDestroy();
    expect(tokenService.ngOnDestroy).toHaveBeenCalled();
  });
});
