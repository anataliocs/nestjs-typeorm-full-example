import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'latest block' })
export class LatestBlock {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Field((type) => ID)
  id: string;

  @Field()
  blockNumber?: number;

  @Field()
  creationDate: Date;

  @Field()
  hash?: string;
}
