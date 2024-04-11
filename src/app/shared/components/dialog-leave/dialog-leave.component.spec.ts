import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLeaveComponent } from './dialog-leave.component';

describe('DialogLeaveComponent', () => {
  let component: DialogLeaveComponent;
  let fixture: ComponentFixture<DialogLeaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogLeaveComponent]
    });
    fixture = TestBed.createComponent(DialogLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
