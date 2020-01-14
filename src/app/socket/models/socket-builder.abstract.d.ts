/// <reference types="node" />
import { Server } from 'net';
import { IIdSocket } from './id-socket.interface';
export declare abstract class NetServerWrapper {
    /**
     * The function to be called when the socket is closed by either side
     * @param idSocket The socket on which the method is being called.
     */
    abstract closeCallback: (idSocket: IIdSocket) => void;
    abstract errorCallback: (idSocket: IIdSocket, err: Error) => void;
    abstract dataCallback: (idSocket: IIdSocket, data: Buffer) => void;
    abstract endCallback: (idSocket: IIdSocket) => void;
    abstract get socketServer(): Server;
}
