
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface Block {
    blockNumber: string;
    creationDate: DateTime;
    hash: string;
    nonce: string;
    transactionCount: number;
}

export interface SolanaBlock {
    blockNumber: string;
    creationDate: string;
    hash: string;
    transactionCount: number;
}

export interface IQuery {
    getBlockByNumber(blockNumber: number): Block | Promise<Block>;
    getSolanaBlockByNumber(blockNumber: string): SolanaBlock | Promise<SolanaBlock>;
}

export type DateTime = any;
type Nullable<T> = T | null;
