import { Context } from "@azure/functions"

import * as IncomingMessage from "azure-function-express/lib/IncomingMessage";
import * as OutgoingMessage from "azure-function-express/lib/OutgoingMessage";

class WebResponse extends OutgoingMessage {
  statusCode: number
  context: Context
  constructor(context:Context) {
    super(context);
    this.statusCode = 0;
    this.context = context;
  }
  status(code:number) {
    this.statusCode = code;
  }
  send(body:any) {
    if (this.context && this.context.res) this.context.res.body = body;
  }
  end (...args:any[]) {
    return super.end(...args);
  }
}

class WebRequest extends IncomingMessage {
  context: Context
  headers: Object | undefined
  constructor(context:Context) {
    super(context);
    this.context = context;
    this.headers = this.context?.req?.headers;
  }
}

// /* eslint-disable no-magic-numbers, no-underscore-dangle */
// import { OutgoingMessage as NativeOutgoingMessage } from "http";

// /**
//  * @param {Object|string|Buffer} body Express/connect body object
//  * @param {string} encoding
//  * @returns {Object|string} Azure Function body
//  */
// function convertToBody(body:Object|string|Buffer, encoding:string) {
//   // This may be removed on Azure Function native support for Buffer
//   // https://github.com/Azure/azure-webjobs-sdk-script/issues/814
//   // https://github.com/Azure/azure-webjobs-sdk-script/pull/781
//   return Buffer.isBuffer(body)
//     ? body.toString(encoding)
//     : body;
// }

// /**
//  * @param {Object} context Azure Function context
//  * @param {string|Buffer} data
//  * @param {string} encoding
//  * @this {OutgoingMessage}
//  */
// function end(context:Context, data:string|Buffer, encoding:string) {
//   // 1. Write head
//   this.writeHead(this.statusCode); // Make jshttp/on-headers able to trigger

//   // 2. Return raw body to Azure Function runtime
//   if (context && context.res) context.res.body = convertToBody(data, encoding);
//   if (context && context.res) context.res.isRaw = true;
//   context.done();
// }

// /**
//  * https://nodejs.org/api/http.html#http_response_writehead_statuscode_statusmessage_headers
//  * Original implementation: https://github.com/nodejs/node/blob/v6.x/lib/_http_server.js#L160
//  *
//  * @param {Object} context Azure Function context
//  * @param {number} statusCode
//  * @param {string} statusMessage
//  * @param {Object} headers
//  * @this {OutgoingMessage}
//  */
// function writeHead(context: Context, statusCode:number, statusMessage:string, headers:Object) {
//   // 1. Status code
//   statusCode |= 0; // eslint-disable-line no-param-reassign
//   if (statusCode < 100 || statusCode > 999) {
//     throw new RangeError(`Invalid status code: ${statusCode}`);
//   }

//   // 2. Status message
//   if (typeof statusMessage === "string") {
//     this.statusMessage = statusMessage;
//   } else {
//     this.statusMessage = statusCodes[statusCode] || "unknown";
//   }

//   // 3. Headers
//   if (typeof statusMessage === "object" && typeof headers === "undefined") {
//     headers = statusMessage; // eslint-disable-line no-param-reassign
//   }
//   if (this._headers) {
//     // Slow-case: when progressive API and header fields are passed.
//     if (headers) {
//       const keys = Object.keys(headers);
//       for (let i = 0; i < keys.length; i++) {
//         const k = keys[i];
//         if (k) {
//           this.setHeader(k, headers[k]);
//         }
//       }
//     }
//     // only progressive api is used
//     headers = this._renderHeaders(); // eslint-disable-line no-param-reassign
//   }

//   // 4. Sets everything
//   if (context && context.res) context.res.status = statusCode;
//   // In order to uniformize node 6 behaviour with node 8 and 10,
//   // we want to never have undefined headers, but instead empty object
//   if (context && context.res) context.res.headers = headers || {};
// }

// /**
//  * OutgoingMessage mock based on https://github.com/nodejs/node/blob/v6.x
//  *
//  * Note: This implementation is only meant to be working with Node.js v6.x
//  *
//  * @private
//  */
// export default class WebResponse extends NativeOutgoingMessage {

//   statusCode: number
//   context: Context
//   _headers:Object | null
//   _headerNames: Object
//   _removedHeader: Object
//   _hasBody: boolean
//   writeHead: Function
//   end: Function
//   /**
//    * Original implementation: https://github.com/nodejs/node/blob/v6.x/lib/_http_outgoing.js#L48
//    */
//   constructor(context: Context) {
//     super();
//     this.statusCode = 0;
//     this.context = context;
//     this._headers = null;
//     this._headerNames = {};
//     this._removedHeader = {};
//     this._hasBody = true;

//     // Those methods cannot be prototyped because express explicitelly overrides __proto__
//     // See https://github.com/expressjs/express/blob/master/lib/middleware/init.js#L29
//     this.writeHead = writeHead.bind(this, context);
//     this.end = end.bind(this, context);
//   }

//   status(code:number) {
//     this.statusCode = code;
//   }
//   send(body:any) {
//     if (this.context && this.context.res) this.context.res.body = body;
//   }

//   // writeHead (statusCode:number, statusMessage:string, headers:Object) {
//   //   return writeHead.bind(this, this.context, statusCode, statusMessage, headers);
//   // }

//   // public end (data:string|Buffer, encoding:string) {
//   //   return end.bind(this, this.context, data, encoding);
//   // }
// }

// /* eslint-disable no-underscore-dangle */
// import * as EventEmitter from "events";

// const NOOP = () => {};

// function removePortFromAddress(address:string) {
//   return address
//     ? address.replace(/:[0-9]*$/, "")
//     : address;
// }

// /**
//  * Create a fake connection object
//  *
//  * @param {Object} context Raw Azure context object for a single HTTP request
//  * @returns {object} Connection object
//  */
// function createConnectionObject(context:Context) {
//   const { req } = context.bindings;
//   const xForwardedFor = req.headers ? req.headers["x-forwarded-for"] : undefined;

//   return {
//     encrypted     : req.originalUrl && req.originalUrl.toLowerCase().startsWith("https"),
//     remoteAddress : removePortFromAddress(xForwardedFor)
//   };
// }

// /**
//  * Copy usefull context properties from the native context provided by the Azure Function engine
//  *
//  * See:
//  * - https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#context-object
//  * - https://github.com/christopheranderson/azure-functions-typescript/blob/master/src/context.d.ts
//  *
//  * @param {Object} context Raw Azure context object for a single HTTP request
//  * @returns {Object} Filtered context
//  */
// function sanitizeContext(context:Context) {
//   const sanitizedContext = {
//     ...context,
//     log : context.log.bind(context)
//   };

//   // We don't want the developper to mess up express flow
//   // See https://github.com/yvele/azure-function-express/pull/12#issuecomment-336733540
//   if (sanitizedContext.done) delete sanitizedContext.done;

//   return sanitizedContext;
// }

// /**
//  * Request object wrapper
//  *
//  * @private
//  */
// class WebRequest extends EventEmitter {

//   /**
//    * Note: IncomingMessage assumes that all HTTP in is binded to "req" property
//    *
//    * @param {Object} context Sanitized Azure context object for a single HTTP request
//    */
//   url?:string
//   originalUrl?:string
//   headers?:Object
//   context:Context
//   _readableState:Object
//   resume: Function
//   socket:Object
//   connection:Object
//   constructor(context:Context) {
//     super();

//     Object.assign(this, context.bindings.req); // Inherit

//     this.url = this.originalUrl;
// //    this.headers = this.headers || {}; // Should always have a headers object
//     this.context = context;
//     this.headers = this.context?.req?.headers;

//     this._readableState = { pipesCount: 0 }; // To make unpipe happy
//     this.resume = NOOP;
//     this.socket = { destroy: NOOP };
//     this.connection = createConnectionObject(context);

//     this.context = sanitizeContext(context); // Specific to Azure Function
//   }

// }

// const statusCodes = {
//   100 : "Continue",
//   101 : "Switching Protocols",
//   102 : "Processing",                 // RFC 2518, obsoleted by RFC 4918
//   200 : "OK",
//   201 : "Created",
//   202 : "Accepted",
//   203 : "Non-Authoritative Information",
//   204 : "No Content",
//   205 : "Reset Content",
//   206 : "Partial Content",
//   207 : "Multi-Status",               // RFC 4918
//   208 : "Already Reported",
//   226 : "IM Used",
//   300 : "Multiple Choices",
//   301 : "Moved Permanently",
//   302 : "Found",
//   303 : "See Other",
//   304 : "Not Modified",
//   305 : "Use Proxy",
//   307 : "Temporary Redirect",
//   308 : "Permanent Redirect",         // RFC 7238
//   400 : "Bad Request",
//   401 : "Unauthorized",
//   402 : "Payment Required",
//   403 : "Forbidden",
//   404 : "Not Found",
//   405 : "Method Not Allowed",
//   406 : "Not Acceptable",
//   407 : "Proxy Authentication Required",
//   408 : "Request Timeout",
//   409 : "Conflict",
//   410 : "Gone",
//   411 : "Length Required",
//   412 : "Precondition Failed",
//   413 : "Payload Too Large",
//   414 : "URI Too Long",
//   415 : "Unsupported Media Type",
//   416 : "Range Not Satisfiable",
//   417 : "Expectation Failed",
//   418 : "I\"m a teapot",              // RFC 2324
//   421 : "Misdirected Request",
//   422 : "Unprocessable Entity",       // RFC 4918
//   423 : "Locked",                     // RFC 4918
//   424 : "Failed Dependency",          // RFC 4918
//   425 : "Unordered Collection",       // RFC 4918
//   426 : "Upgrade Required",           // RFC 2817
//   428 : "Precondition Required",      // RFC 6585
//   429 : "Too Many Requests",          // RFC 6585
//   431 : "Request Header Fields Too Large", // RFC 6585
//   451 : "Unavailable For Legal Reasons",
//   500 : "Internal Server Error",
//   501 : "Not Implemented",
//   502 : "Bad Gateway",
//   503 : "Service Unavailable",
//   504 : "Gateway Timeout",
//   505 : "HTTP Version Not Supported",
//   506 : "Variant Also Negotiates",    // RFC 2295
//   507 : "Insufficient Storage",       // RFC 4918
//   508 : "Loop Detected",
//   509 : "Bandwidth Limit Exceeded",
//   510 : "Not Extended",               // RFC 2774
//   511 : "Network Authentication Required" // RFC 6585
// };



export {WebRequest, WebResponse};
