import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSessionSummaryComponent } from './user-session-summary.component';

describe('UserSessionSummaryComponent', () => {
  let component: UserSessionSummaryComponent;
  let fixture: ComponentFixture<UserSessionSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSessionSummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserSessionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
