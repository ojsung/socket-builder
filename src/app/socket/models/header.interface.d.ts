export interface IHeader {
    index: number;
    totalParts?: number;
    jobName?: string;
    destination?: string | number;
    hash?: string;
}
