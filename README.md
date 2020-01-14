# socket-builder

A socket builder that is meant to be called from a child process. It will open a new server listening on the host/port given. It will only open one listener. If more are needed, you will need to call it on the server object which can be gotten from the "socketServer" getter.

## Dependencies

None... *yet*  
But if there ever are, they will just be other packages that I've written.  I'm not like... *against* other people's packages.  But I feel like if you're going to be trusting me enough to install this package, then you are already sticking your neck out there.  The least I can do is not implicitly put you in a position to also have to trust a dozen other devs who worked on packages that imported this or that other package etc..

## Typescript

Use the files contained in `typescript/src` instead of `src/`

## Usage

This package expects that all data buffers have a header. It can be configured to not use a header, or to use any specific text for a header.  
By default, the header is expected to look like
```xml
<header>"{'your header data': 'as json'}"</header>
```

The header data should be surrounded by your open and close header phrases, and the header data itself should be json.  
Maybe XML and JSON in one is a bit excessive and unwieldy... But I don't know what data you'll be throwing around, and I want to prevent collision or bad parsing as much as possible.  
You can add as many keys in the header as you would like. However, the following keys are recognized and used by the application:


```json
{
  "index": "The index of the current buffer in the list of buffers being sent.  Should be parseable into an integer",
  "totalParts": "The total number of pieces being sent. Currently unused",
  "jobName": "A friendly name for the job.  Should be a string.  Currently unused",
  "destination": "Can be used to verify that the message was actually meant for you.  Could be useful depending on the situation.  Should be a string or parseable into an integer.  Currently unused",
  "hash": "A hash for the data sent.  Can be used to double check data integrity, since the hash used for the TCP header isn't the more reliable."
}
```

An easy way to initalize and begin using this would be to create a js file that imports the package and creates an instance of the DefaultSocketBuilder class, then run it in a fork.

## Class Info

### Constructor:

#### Parameters:

#### hostname: string

The hostname to which to connect. By default, uses the string `"127.0.0.1"`

#### port: number

The port to which to connect.  By default uses the number `4210`

#### headerOptions: {"use": boolean, "open": string, "close": string}

```json
{
  "use": "A boolean to tell the constructor whether or not to expect a header.  True by default",
  "open": "A string to be used to mark the opening of the header clause.  By default, uses <header>",
  "close": "A string to be used to mark the end of the header clause.  By default, uses </header>
}
```

#### messenger: (message: string) => boolean
A callback function that takes a string as a parameter.  It is left as a public property so it can be used to send back any data you wish to collect from any of the other callbacks you provide to the socket builder.

### Properties

#### socketServer: net.Server

The instance of net.Server that was created using the values passed the constructor.

#### messenger: (message: string) => boolean
The callback function received in the constructor.

#### closeCallback: (socket: net.Socket) => void

The callback to be used when the "close" event is triggered

#### errorCallback: (socket: net.Socket, err: Error) => void

The callback to be used when the "error" event occurs

#### dataCallback: (socket: net.Socket, data: Buffer) => void

The callback to be used when the "data" event occurs and data is received

#### endCallback: (socket: net.Socket) => void

The callback to be used when the "end" event is triggered after all buffers have been sent through
