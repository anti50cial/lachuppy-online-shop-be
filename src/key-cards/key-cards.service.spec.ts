import { Test, TestingModule } from '@nestjs/testing';
import { KeyCardsService } from './key-cards.service';

describe('KeyCardsService', () => {
  let service: KeyCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyCardsService],
    }).compile();

    service = module.get<KeyCardsService>(KeyCardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
