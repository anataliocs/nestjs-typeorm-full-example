import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'EVM Block' })
export class Block {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Field((type) => ID)
  blockNumber?: number;

  @Field()
  creationDate: Date;

  @Field()
  hash?: string;

  @Field()
  nonce?: string;

  @Field()
  transactionCount?: number;
}
