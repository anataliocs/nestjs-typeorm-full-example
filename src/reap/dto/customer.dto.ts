/*
 * Classes are ES6 standard and remain intact as real entities in the compiled JavaScript.
 * TypeScript interfaces are removed during transpilation.
 * Nest can't reference them at runtime, and Pipes rely on
 * having access to the metatype of variables at runtime
 */

export class CustomerDto {
  name: string;
  id: string;
}
