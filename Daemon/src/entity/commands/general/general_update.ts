// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>

import { $t } from "../../../i18n";
import { killProcess } from "../../../common/process_tools";
import { ChildProcess, exec, spawn } from "child_process";
import logger from "../../../service/log";
import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";
import { commandStringToArray } from "../base/command_parser";
import iconv from "iconv-lite";
export default class GeneralUpdateCommand extends InstanceCommand {
  private pid: number = null;
  private process: ChildProcess = null;

  constructor() {
    super("GeneralUpdateCommand");
  }

  private stopped(instance: Instance) {
    instance.asynchronousTask = null;
    instance.setLock(false);
    instance.status(Instance.STATUS_STOP);
  }

  async exec(instance: Instance) {
    if (instance.status() !== Instance.STATUS_STOP) return instance.failure(new Error($t("general_update.statusErr_notStop")));
    if (instance.asynchronousTask !== null) return instance.failure(new Error($t("general_update.statusErr_otherProgress")));
    try {
      instance.setLock(true);
      let updateCommand = instance.config.updateCommand;
      updateCommand = updateCommand.replace(/\$\{mcsm_workspace\}/gm, instance.config.cwd);
      logger.info($t("general_update.readyUpdate", { instanceUuid: instance.instanceUuid }));
      logger.info($t("general_update.updateCmd", { instanceUuid: instance.instanceUuid }));
      logger.info(updateCommand);

      // command parsing
      const commandList = commandStringToArray(updateCommand);
      const commandExeFile = commandList[0];
      const commnadParameters = commandList.slice(1);
      if (commandList.length === 0) {
        return instance.failure(new Error($t("general_update.cmdFormatErr")));
      }

      // start the update command
      const process = spawn(commandExeFile, commnadParameters, {
        cwd: instance.config.cwd,
        stdio: "pipe",
        windowsHide: true
      });
      if (!process || !process.pid) {
        this.stopped(instance);
        return instance.println($t("general_update.err"), $t("general_update.updateFailed"));
      }

      // process & pid
      this.pid = process.pid;
      this.process = process;

      // Set the asynchronous task that the instance is running
      instance.asynchronousTask = this;
      instance.status(Instance.STATUS_BUSY);

      process.stdout.on("data", (text) => {
        instance.print(iconv.decode(text, instance.config.oe));
      });
      process.stderr.on("data", (text) => {
        instance.print(iconv.decode(text, instance.config.oe));
      });
      process.on("exit", (code) => {
        this.stopped(instance);
        if (code === 0) {
          instance.println($t("general_update.update"), $t("general_update.updateSuccess"));
        } else {
          instance.println($t("general_update.update"), $t("general_update.updateErr"));
        }
      });
    } catch (err) {
      this.stopped(instance);
      instance.println($t("general_update.update"), $t("general_update.error", { err: err }));
    }
  }

  async stop(instance: Instance): Promise<void> {
    logger.info($t("general_update.terminateUpdate", { instanceUuid: instance.instanceUuid }));
    instance.println($t("general_update.update"), $t("general_update.terminateUpdate", { instanceUuid: instance.instanceUuid }));
    instance.println($t("general_update.update"), $t("general_update.killProcess"));
    killProcess(this.pid, this.process);
  }
}
