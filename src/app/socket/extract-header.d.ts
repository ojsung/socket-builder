import { IHeader } from './models/header.interface';
import { IHeaderOptions } from './models/header-options.interface';
/**
 * Finds the <header></header> tags, grabs what is inside, and parses it as json.
 * @param datum
 * @returns An array where the first entry is the json object of the header
 * and the second is the index where the header ends
 */
export declare function extractHeader(datum: string, headerOptions: IHeaderOptions): [IHeader, number] | null;
