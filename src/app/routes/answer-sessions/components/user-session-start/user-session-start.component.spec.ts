import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSessionStartComponent } from './user-session-start.component';

describe('UserSessionStartComponent', () => {
  let component: UserSessionStartComponent;
  let fixture: ComponentFixture<UserSessionStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSessionStartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserSessionStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
