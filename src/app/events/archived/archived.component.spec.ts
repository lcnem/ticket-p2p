import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedComponent } from './archived.component';

describe('ArchivedComponent', () => {
  let component: ArchivedComponent;
  let fixture: ComponentFixture<ArchivedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
