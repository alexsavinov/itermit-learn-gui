import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSaveComponent } from './dialog-save.component';

describe('DialogSaveComponent', () => {
  let component: DialogSaveComponent;
  let fixture: ComponentFixture<DialogSaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogSaveComponent]
    });
    fixture = TestBed.createComponent(DialogSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
