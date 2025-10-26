import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: typeof User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findAll: jest.fn(() => []),
            findOne: jest.fn(),
            create: jest.fn(() => {}),
            remove: jest.fn(),
            destroy: jest.fn(() => {}),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<typeof User>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
