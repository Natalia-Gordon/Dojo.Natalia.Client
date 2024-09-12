import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SenseiTeamComponent } from './team.component';

describe('TeamComponent', () => {
  let component: SenseiTeamComponent;
  let fixture: ComponentFixture<SenseiTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SenseiTeamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SenseiTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
