import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'node:path';

/**
 * Generate typings for GraphQL schema
 * ONLY FOR Schema first approach.
 * ts-node generate-typings
 */

const definitionsFactory = new GraphQLDefinitionsFactory();
void definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
});
