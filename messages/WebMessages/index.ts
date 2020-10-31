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

export {WebRequest, WebResponse};
