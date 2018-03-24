import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MosaicComponent } from './mosaic.component';

describe('MosaicComponent', () => {
  let component: MosaicComponent;
  let fixture: ComponentFixture<MosaicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MosaicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MosaicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
