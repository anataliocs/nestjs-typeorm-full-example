import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Solana Block' })
export class SolanaBlock {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Field((type) => ID)
  blockNumber!: string;

  @Field()
  creationDate!: string;

  @Field()
  hash!: string;

  @Field()
  transactionCount!: number;
}
