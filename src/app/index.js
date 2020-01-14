"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const extract_header_1 = require("./socket/extract-header");
class DefaultSocketBuilder {
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
    constructor(hostname = '127.0.0.1', port = 4210, headerOptions, _messenger) {
        this.headerOptions = headerOptions;
        this._messenger = _messenger;
        /**
         * Used to hold the completed data from the incoming buffers.  Stored as string
         */
        this.completeData = '';
        /**
         * If, by chance, a message comes out of order, this will store it until it can be added to the completedData string. The preference is still to add
         * to completeData between messages to reduce the amount of processing that has to happen after the "end" event is sent.
         */
        this.misorderedStrings = {};
        /**
         * This value is only used when indexing is available in the messages sent through the socket. If the values are indexed, then the current index will be incremented
         * each time the proper message has been sent through and added to completeData
         */
        this.currentIndex = 0;
        /**
         * The function to be called when the socket is closed by either side
         * @param idSocket The socket on which the method is being called.
         */
        this.closeCallback = (_idSocket) => { };
        /**
         * The function to be called when the socket errors
         * @param idSocket The socket on which the method is being called.
         * @param err The error object returned from the stream
         */
        this.errorCallback = (_idSocket, err) => {
            console.log('update errorCallback with a proper error handler');
            console.log(err);
        };
        /**
         * The function to be called when the socket receives data.  By default, it will define
         * this.optionalCallback, allowing it to sort and ensure proper order when messages come through
         * (as long as they're indexed in their header)
         * @param idSocket The socket on which the method is being called.
         * @param data Data received as a buffer from the readable stream
         */
        this.dataCallback = (_idSocket, data) => {
            const stringDatum = data.toString();
            if (this.headerOptions && this.headerOptions.use) {
                if (!this.optionalCallback) {
                    this.optionalCallback = (index) => {
                        if (Object.prototype.hasOwnProperty.call(this.misorderedStrings, index)) {
                            this.completeData += this.misorderedStrings[index];
                            delete this.misorderedStrings[index];
                            ++this.currentIndex;
                            this.optionalCallback(this.currentIndex);
                        }
                    };
                }
                const [header, dataStart] = extract_header_1.extractHeader(stringDatum, this.headerOptions);
                const dataString = stringDatum.substring(dataStart);
                const index = header.index;
                if (typeof index === 'number') {
                    if (index === this.currentIndex) {
                        this.completeData += dataString;
                        ++this.currentIndex;
                    }
                    else {
                        this.misorderedStrings[index] = dataString;
                    }
                    this.optionalCallback(this.currentIndex);
                }
            }
            else {
                this.completeData += stringDatum;
            }
        };
        /**
         * The function to be called when the socket receives the end-of-data message
         * @param idSocket The socket on which the method is being called.
         */
        this.endCallback = (_idSocket) => {
            this.messenger(this.completeData);
        };
        if (!_messenger) {
            if (process.send) {
                _messenger = process.send;
            }
            else {
                throw new Error('This class should only be instanced from a child process');
            }
        }
        this.netServer = net_1.createServer().listen(hostname, port);
    }
    get messenger() {
        return this._messenger;
    }
    /**
     * This acts as a getter for the socket server.  It should be called after the
     * callbacks have been redefined.  Otherwise, it will be called with the default callbacks.
     */
    get socketServer() {
        this.netServer.on('connection', (socket) => {
            socket.on('close', () => this.closeCallback(socket));
            socket.on('end', () => this.endCallback(socket));
            socket.on('data', (data) => this.dataCallback(socket, data));
            socket.on('error', (err) => this.errorCallback(socket, err));
        });
        return this.netServer;
    }
}
exports.default = DefaultSocketBuilder;
//# sourceMappingURL=index.js.map