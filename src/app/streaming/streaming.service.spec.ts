import { TestBed, inject } from '@angular/core/testing';

import { StreamingService } from './streaming.service';

describe('StreamingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StreamingService]
    });
  });

  it('should be created', inject([StreamingService], (service: StreamingService) => {
    expect(service).toBeTruthy();
  }));
});
