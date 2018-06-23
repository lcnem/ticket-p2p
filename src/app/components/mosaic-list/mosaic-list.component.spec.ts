import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MosaicListComponent } from './mosaic-list.component';

describe('MosaicListComponent', () => {
  let component: MosaicListComponent;
  let fixture: ComponentFixture<MosaicListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MosaicListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MosaicListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
