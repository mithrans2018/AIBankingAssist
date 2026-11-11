import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankingAssistantComponent } from './banking-assistant.component';

describe('BankingAssistantComponent', () => {
  let component: BankingAssistantComponent;
  let fixture: ComponentFixture<BankingAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankingAssistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankingAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
