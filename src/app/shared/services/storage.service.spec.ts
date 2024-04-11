import { TestBed } from '@angular/core/testing';

import { LocalStorageService, MemoryStorageService } from '@shared';


describe('StorageService', () => {
  let localStorageService: LocalStorageService;
  let memoryStorageService: MemoryStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MemoryStorageService }
      ]
    });
    localStorageService = TestBed.inject(LocalStorageService);
    memoryStorageService = TestBed.inject(MemoryStorageService);

    spyOn(localStorage.__proto__, 'setItem');
    spyOn(localStorage.__proto__, 'removeItem');
    spyOn(localStorage.__proto__, 'clear');
  });

  it('LocalStorageService should be created', () => {
    expect(localStorageService).toBeTruthy();
  });

  it('LocalStorageService should set and get value by key', () => {
    spyOn(localStorage.__proto__, 'getItem').and.returnValue(2);
    localStorageService.set('key', 2);

    expect(localStorageService.get('key')).toEqual(2);
  });

  it('LocalStorageService should check if key present', () => {
    spyOn(localStorage.__proto__, 'getItem').and.returnValue(2);

    localStorageService.set('key', 2);

    expect(localStorageService.has('key')).toBeTrue();
  });

  it('LocalStorageService should remove key', () => {
    localStorageService.set('key', 1);
    localStorageService.remove('key');

    spyOn(localStorage.__proto__, 'getItem').and.returnValue(null);

    expect(localStorageService.get('key')).toEqual({});
  });

  it('LocalStorageService should clear all keys', () => {
    localStorageService.set('key', 1);
    localStorageService.clear();

    expect(localStorageService.has('key')).toBeFalse();
  });

  it('MemoryStorageService should be created', () => {
    expect(memoryStorageService).toBeTruthy();
  });

  it('MemoryStorageService should set and get value by key', () => {
    memoryStorageService.set('key', 2);

    expect(memoryStorageService.get('key')).toEqual(2);
  });

  it('MemoryStorageService should check if key present', () => {
    memoryStorageService.set('key', 2);

    expect(memoryStorageService.has('key')).toBeTrue();
  });

  it('MemoryStorageService should remove key', () => {
    memoryStorageService.set('key', 1);
    memoryStorageService.remove('key');

    expect(memoryStorageService.get('key')).toEqual({});
  });

  it('MemoryStorageService should clear all keys', () => {
    memoryStorageService.set('key', 1);
    memoryStorageService.clear();

    expect(memoryStorageService.has('key')).toBeFalse();
  });
});
