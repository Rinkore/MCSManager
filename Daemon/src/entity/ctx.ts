// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { Socket } from "socket.io";

export default class RouterContext {
  constructor(public uuid: string, public socket: Socket, public session?: any, public event?: string) {}

  public response(data: any) {
    return this;
  }
}
