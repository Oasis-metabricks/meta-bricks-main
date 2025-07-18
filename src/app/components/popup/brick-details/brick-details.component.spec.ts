import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrickDetailsComponent } from './brick-details.component';

describe('BrickDetailsComponent', () => {
  let component: BrickDetailsComponent;
  let fixture: ComponentFixture<BrickDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrickDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrickDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
