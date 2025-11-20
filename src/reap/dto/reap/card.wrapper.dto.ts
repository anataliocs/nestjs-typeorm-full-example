import { CardDto } from './card.dto';

/*
  "meta": {

  }
*/

export class CardWrapperDto {
  items: CardDto[];
  meta: PaginationMetaDto;
}

export class PaginationMetaDto {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
