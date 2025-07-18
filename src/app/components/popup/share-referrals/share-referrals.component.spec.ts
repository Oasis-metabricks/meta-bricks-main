import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareReferralsComponent } from './share-referrals.component';

describe('ShareReferralsComponent', () => {
  let component: ShareReferralsComponent;
  let fixture: ComponentFixture<ShareReferralsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareReferralsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
