/// <reference types="node" />
import { Socket } from 'net';
export interface IIdSocket extends Socket {
    id: string;
}
