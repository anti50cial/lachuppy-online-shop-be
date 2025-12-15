import { Test, TestingModule } from '@nestjs/testing';
import { KeyCardsController } from './key-cards.controller';
import { KeyCardsService } from './key-cards.service';

describe('KeyCardsController', () => {
  let controller: KeyCardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeyCardsController],
      providers: [KeyCardsService],
    }).compile();

    controller = module.get<KeyCardsController>(KeyCardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
