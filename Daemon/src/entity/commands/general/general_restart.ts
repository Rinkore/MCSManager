// Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>
import { $t } from "../../../i18n";
import Instance from "../../instance/instance";
import InstanceCommand from "../base/command";

export default class GeneralRestartCommand extends InstanceCommand {
  constructor() {
    super("GeneralRestartCommand");
  }

  async exec(instance: Instance) {
    try {
      instance.println("INFO", $t("restart.start"));
      await instance.execPreset("stop");
      instance.setLock(true);
      const startCount = instance.startCount;
      // Check the instance status every second,
      // if the instance status is stopped, restart the server immediately
      const task = setInterval(async () => {
        try {
          if (startCount !== instance.startCount) {
            throw new Error($t("restart.error1"));
          }
          if (instance.status() !== Instance.STATUS_STOPPING && instance.status() !== Instance.STATUS_STOP) {
            throw new Error($t("restart.error2"));
          }
          if (instance.status() === Instance.STATUS_STOP) {
            instance.println("INFO", $t("restart.restarting"));
            await instance.execPreset("start");
            instance.setLock(false);
            clearInterval(task);
          }
        } catch (error) {
          clearInterval(task);
          instance.setLock(false);
          instance.failure(error);
        }
      }, 1000);
    } catch (error) {
      instance.setLock(false);
      instance.failure(error);
    }
  }
}
