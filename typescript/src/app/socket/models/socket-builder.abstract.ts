import { Server } from 'net'
import { IIdSocket } from './id-socket.interface'

export abstract class NetServerWrapper {
  /**
   * The function to be called when the socket is closed by either side
   * @param idSocket The socket on which the method is being called.
   */
  public abstract closeCallback: (idSocket: IIdSocket) => void
  public abstract errorCallback: (idSocket: IIdSocket, err: Error) => void
  public abstract dataCallback: (idSocket: IIdSocket, data: Buffer) => void
  public abstract endCallback: (idSocket: IIdSocket) => void

  public abstract get socketServer(): Server
}
