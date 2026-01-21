import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsHeroComponent } from './user-details-hero.component';

describe('UserDetailsHeroComponent', () => {
  let component: UserDetailsHeroComponent;
  let fixture: ComponentFixture<UserDetailsHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsHeroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserDetailsHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
