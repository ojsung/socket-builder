/// <reference types="node" />
import { NetServerWrapper } from './socket/models/socket-builder.abstract';
import { Server } from 'net';
import { IIdSocket } from './socket/models/id-socket.interface';
import { IHeaderOptions } from './socket/models/header-options.interface';
export default class DefaultSocketBuilder implements NetServerWrapper {
    private headerOptions?;
    private _messenger?;
    /**
     * Creates a socket generator function, and also exposes all of the callbacks
     * for "data", "end", "close", and "error".
     * This should only be instanced from a child process.  For other uses, it may make more sense to extend the class.  For
     * this reason, I've named the exported class "DefaultSocketBuilder" to be used as a default.  The abstract "NetServerWrapper"
     * contains all the skeleton for extending the class.
     * @param hostname The host to which to connect.  Default value is '127.0.0.1'
     * @param port The port on the host to which to connect.  Default value is 4210
     * @param messenger Optional. The callback to which the final data should be sent.  The callback should return a boolean,
     * as DefaultSocketBuilder is intended to be called from within a child process, and will use
     * process.send by default
     */
    constructor(hostname?: string, port?: number, headerOptions?: IHeaderOptions | undefined, _messenger?: ((message: string) => boolean) | undefined);
    get messenger(): (message: string) => boolean;
    /**
     * This acts as a getter for the socket server.  It should be called after the
     * callbacks have been redefined.  Otherwise, it will be called with the default callbacks.
     */
    get socketServer(): Server;
    /**
     * Placeholder for the net.Server instance.  Will be defined in the constructor
     */
    private netServer;
    /**
     * Used to hold the completed data from the incoming buffers.  Stored as string
     */
    private completeData;
    /**
     * If, by chance, a message comes out of order, this will store it until it can be added to the completedData string. The preference is still to add
     * to completeData between messages to reduce the amount of processing that has to happen after the "end" event is sent.
     */
    private misorderedStrings;
    /**
     * This value is only used when indexing is available in the messages sent through the socket. If the values are indexed, then the current index will be incremented
     * each time the proper message has been sent through and added to completeData
     */
    private currentIndex;
    /**
     * I didn't want to have any implementations in this class that weren't either defined in the abstract, or abstract enough that they made sense to use in
     * a default setup.  However, there were several cases where I found having an optional callback available would be helpful, and one time where I couldn't
     * do my own job without it.  So I am putting this here in case anyone finds need for it.
     */
    private optionalCallback;
    /**
     * The function to be called when the socket is closed by either side
     * @param idSocket The socket on which the method is being called.
     */
    closeCallback: (_idSocket: IIdSocket) => void;
    /**
     * The function to be called when the socket errors
     * @param idSocket The socket on which the method is being called.
     * @param err The error object returned from the stream
     */
    errorCallback: (_idSocket: IIdSocket, err: Error) => void;
    /**
     * The function to be called when the socket receives data.  By default, it will define
     * this.optionalCallback, allowing it to sort and ensure proper order when messages come through
     * (as long as they're indexed in their header)
     * @param idSocket The socket on which the method is being called.
     * @param data Data received as a buffer from the readable stream
     */
    dataCallback: (_idSocket: IIdSocket, data: Buffer) => void;
    /**
     * The function to be called when the socket receives the end-of-data message
     * @param idSocket The socket on which the method is being called.
     */
    endCallback: (_idSocket: IIdSocket) => void;
}
