import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MosaicTileComponent } from './mosaic-tile.component';

describe('MosaicTileComponent', () => {
  let component: MosaicTileComponent;
  let fixture: ComponentFixture<MosaicTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MosaicTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MosaicTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
