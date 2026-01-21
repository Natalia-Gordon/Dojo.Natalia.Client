import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentItemComponent } from './comment-item.component';

describe('CommentItemComponent', () => {
  let component: CommentItemComponent;
  let fixture: ComponentFixture<CommentItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommentItemComponent);
    component = fixture.componentInstance;
    // Provide a mock comment to avoid undefined errors
    component.comment = {
      author: 'Test User',
      date: '2024-01-01',
      text: 'Test comment',
      avatar: 'test.jpg',
      avatarError: false,
      replies: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
