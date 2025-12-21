
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface LatestBlock {
    id: string;
    blockNumber: number;
    creationDate: DateTime;
    hash: string;
}

export interface IQuery {
    getLatestBlock(id: string): LatestBlock | Promise<LatestBlock>;
}

export type DateTime = any;
type Nullable<T> = T | null;
