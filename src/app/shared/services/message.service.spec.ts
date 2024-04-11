import { TestBed } from '@angular/core/testing';

import { MessageService } from '@shared';


describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add message', () => {
    service.add('test');

    expect(service.messages.indexOf('test')).toEqual(0);
    expect(service.messages.at(0)).toEqual('test');
    expect(service.messages.length).toEqual(1);
  });

  it('should clear messages', () => {
    service.clear();

    expect(service.messages.length).toEqual(0);
  });
});
