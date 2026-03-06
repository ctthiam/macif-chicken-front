import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EleveurProfileComponent } from './eleveur-profile.component';

describe('EleveurProfileComponent', () => {
  let component: EleveurProfileComponent;
  let fixture: ComponentFixture<EleveurProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EleveurProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EleveurProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
