import { NetServerWrapper } from './socket/models/socket-builder.abstract'
import { createServer, Server } from 'net'
import { IIdSocket } from './socket/models/id-socket.interface'
import { extractHeader } from './socket/extract-header'
import { IHeader } from './socket/models/header.interface'
import { IHeaderOptions } from './socket/models/header-options.interface'

export default class DefaultSocketBuilder implements NetServerWrapper {
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
  constructor(
    hostname: string = '127.0.0.1',
    port: number = 4210,
    private headerOptions?: IHeaderOptions,
    private _messenger?: (message: string) => boolean
  ) {
    if (!_messenger) {
      if (process.send) {
        _messenger = process.send
      } else {
        throw new Error('This class should only be instanced from a child process')
      }
    }
    this.netServer = createServer().listen(hostname, port)
  }

  public get messenger() {
    return this._messenger as (message: string) => boolean
  }

  /**
   * This acts as a getter for the socket server.  It should be called after the
   * callbacks have been redefined.  Otherwise, it will be called with the default callbacks.
   */
  public get socketServer(): Server {
    this.netServer.on('connection', (socket: IIdSocket) => {
      socket.on('close', () => this.closeCallback(socket))
      socket.on('end', () => this.endCallback(socket))
      socket.on('data', (data: Buffer) => this.dataCallback(socket, data))
      socket.on('error', (err: Error) => this.errorCallback(socket, err))
    })
    return this.netServer
  }

  /**
   * Placeholder for the net.Server instance.  Will be defined in the constructor
   */
  private netServer: Server
  /**
   * Used to hold the completed data from the incoming buffers.  Stored as string
   */
  private completeData: string = ''
  /**
   * If, by chance, a message comes out of order, this will store it until it can be added to the completedData string. The preference is still to add
   * to completeData between messages to reduce the amount of processing that has to happen after the "end" event is sent.
   */
  private misorderedStrings: { [key: number]: string } = {}
  /**
   * This value is only used when indexing is available in the messages sent through the socket. If the values are indexed, then the current index will be incremented
   * each time the proper message has been sent through and added to completeData
   */
  private currentIndex = 0
  /**
   * I didn't want to have any implementations in this class that weren't either defined in the abstract, or abstract enough that they made sense to use in
   * a default setup.  However, there were several cases where I found having an optional callback available would be helpful, and one time where I couldn't
   * do my own job without it.  So I am putting this here in case anyone finds need for it.
   */
  private optionalCallback: any

  /**
   * The function to be called when the socket is closed by either side
   * @param idSocket The socket on which the method is being called.
   */
  public closeCallback = (_idSocket: IIdSocket): void => {}

  /**
   * The function to be called when the socket errors
   * @param idSocket The socket on which the method is being called.
   * @param err The error object returned from the stream
   */
  public errorCallback = (_idSocket: IIdSocket, err: Error) => {
    console.log('update errorCallback with a proper error handler')
    console.log(err)
  }

  /**
   * The function to be called when the socket receives data.  By default, it will define
   * this.optionalCallback, allowing it to sort and ensure proper order when messages come through
   * (as long as they're indexed in their header)
   * @param idSocket The socket on which the method is being called.
   * @param data Data received as a buffer from the readable stream
   */
  public dataCallback = (_idSocket: IIdSocket, data: Buffer): void => {
    const stringDatum: string = data.toString()
    if (this.headerOptions && this.headerOptions.use) {
      if (!this.optionalCallback) {
        this.optionalCallback = (index: number) => {
          if (Object.prototype.hasOwnProperty.call(this.misorderedStrings, index)) {
            this.completeData += this.misorderedStrings[index]
            delete this.misorderedStrings[index]
            ++this.currentIndex
            this.optionalCallback(this.currentIndex)
          }
        }
      }
      const [header, dataStart]: [IHeader, number] = extractHeader(
        stringDatum,
        this.headerOptions
      ) as [IHeader, number]
      const dataString: string = stringDatum.substring(dataStart)
      const index = header.index
      if (typeof index === 'number') {
        if (index === this.currentIndex) {
          this.completeData += dataString
          ++this.currentIndex
        } else {
          this.misorderedStrings[index] = dataString
        }
        this.optionalCallback(this.currentIndex)
      }
    } else {
      this.completeData += stringDatum
    }
  }

  /**
   * The function to be called when the socket receives the end-of-data message
   * @param idSocket The socket on which the method is being called.
   */
  public endCallback = (_idSocket: IIdSocket): void => {
    this.messenger(this.completeData)
  }
}
