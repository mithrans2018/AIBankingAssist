import { TestBed } from '@angular/core/testing';

import { BankingAssistantService } from './banking-assistant.service';

describe('BankingAssistantService', () => {
  let service: BankingAssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BankingAssistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
