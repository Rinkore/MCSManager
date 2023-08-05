<!--
  Copyright (C) 2022 MCSManager <mcsmanager-dev@outlook.com>
-->

<template>
    <Dialog v-model="v" :cancel="close">
        <template #title>{{ $t("setupCommandManager.title") }}</template>
        <template #default>
            <el-row :gutter="20">
                <el-col :md="24" :offset="0">
                    <div>
                        <div class="sub-title">
                            <p class="sub-title-title">{{ $t("setupCommandManager.javaVersion") }}</p>
                            <p class="sub-title-info">
                                {{ $t('setupCommandManager.javaVersionInfo') }}
                                <br />
                                {{ $t("setupCommandManager.javaVersionSuggestion") }}
                            </p>
                        </div>
                        <div class="row-mt">
                            <el-select v-model="instanceInfo.javaVersion" :placeholder="$t('general.pleaseSelect')"
                                size="small" style="width: 220px">
                                <el-option :label="$t('setupCommandManager.java8')" :value="8"></el-option>
                                <el-option :label="$t('setupCommandManager.java11')" :value="11"></el-option>
                                <el-option :label="$t('setupCommandManager.java17')" :value="17"></el-option>
                            </el-select>
                        </div>
                    </div>
                    <div>
                        <div class="row-mt">
                            <div class="sub-title">
                                <p class="sub-title-title">{{ $t("setupCommandManager.memory") }}</p>
                                <p class="sub-title-info">
                                    {{ $t("setupCommandManager.memoryInfo") }}
                                    <br />
                                    {{ $t("setupCommandManager.memorySuggestion") }}
                                </p>
                            </div>
                            <div class="row-mt">
                                <span>{{ $t("setupCommandManager.maxMemory") }}</span>
                                <el-input v-model="instanceInfo.maxMemory" :disabled="true" size="small"
                                    style="width: 80px">
                                </el-input>
                                <span>G</span>
                                &nbsp;
                                <span>{{ $t("setupCommandManager.minMemory") }}</span>
                                <el-input v-model="instanceInfo.minMemory" size="small" style="width: 80px">
                                </el-input>
                                <span>G</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="row-mt">
                            <div class="sub-title">
                                <p class="sub-title-title">{{ $t("setupCommandManager.jvmEncoding") }}</p>
                                <p class="sub-title-info">{{ $t("setupCommandManager.jvmEncodingInfo") }}</p>
                            </div>
                            <div class="row-mt">
                                <el-select v-model="instanceInfo.jvmEncoding" filterable allow-create size="small"
                                    default-first-option :placeholder="$t('instancesDetail.oe')"
                                    style="width: 220px; margin-left: 12px">
                                    <el-option v-for="item in TERMINAL_CODE" :key="item.value" :label="item.label"
                                        :value="item.value">
                                    </el-option>
                                </el-select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="sub-title row-mt">
                            <p class="sub-title-title">{{ $t("setupCommandManager.serverName") }}</p>
                            <p class="sub-title-info">
                                {{ $t("setupCommandManager.serverNameInfo") }}
                            </p>
                        </div>
                        <div class="row-mt">
                            <el-input v-model="instanceInfo.serverName" size="small"></el-input>
                        </div>
                    </div>
                    <div>
                        <div class="sub-title row-mt">
                            <p class="sub-title-title">{{ $t("setupCommandManager.setupCommand") }}</p>
                            <p class="sub-title-info">
                                {{ $t("setupCommandManager.setupCommandInfo") }}
                            </p>
                        </div>
                        <div class="row-mt">
                            <el-input :readonly="true" :rows="3" type="textarea" v-model="instanceInfo.startCommand" size="small"></el-input>
                        </div>
                    </div>
                    <div>
                        <div class="sub-title row-mt">
                            <p class="sub-title-title">{{ $t("setupCommandManager.newSetupCommand") }}</p>
                            <p class="sub-title-info">
                                {{ $t("setupCommandManager.setupCommandInfo") }}
                            </p>
                        </div>
                        <div class="row-mt">
                            <el-input :readonly="true" :rows="3" type="textarea" v-model="instanceInfo.newStartCommand" size="small"></el-input>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <div class="row-mt">
                <ItemGroup>
                    <el-button type="success" size="small" @click="submit">{{
                        $t("general.save")
                    }}</el-button>
                    <el-button size="small" @click="close">{{ $t("general.cancel") }}</el-button>
                </ItemGroup>
            </div>
        </template>
    </Dialog>
</template>
  
<script>
import Dialog from "@/components/Dialog";
import { request } from "@/app//service/protocol";
import { API_INSTANCE } from "@/app/service/common";
import { TERMINAL_CODE } from "../../service/common";
export default {
    components: {
        Dialog
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        config: {
            type: Object
        },
        serviceUuid: {
            type: String
        },
        instanceUuid: {
            type: String
        },
        isDisable: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            TERMINAL_CODE,
            v: false,
            instanceInfo: {}
        };
    },
    watch: {
        visible(n) {
            this.v = n;
            this.init();
        }
    },
    methods: {
        init() {
            this.instanceInfo.startCommand = this.config.startCommand;
            if (!this.instanceInfo.javaVersion) {
                this.instanceInfo.javaVersion = 8
            }
            if (!this.instanceInfo.jvmEncoding) {
                this.instanceInfo.jvmEncoding = "UTF-8"
            }
            if (!this.instanceInfo.serverName) {
                this.instanceInfo.serverName = "server.jar"
            }
            if (!this.instanceInfo.maxMemory) {
                this.instanceInfo.maxMemory = 1
            }
            if (!this.instanceInfo.minMemory) {
                this.instanceInfo.minMemory = 1
            }
            this.instanceInfo.newStartCommand = this.config.startCommand;

        },
        show() {
            this.$emit("update:visible", true);
        },
        close() {
            this.$emit("update:visible", false);
        },
        async submit() {
            try {
                if (this.instanceInfo?.config?.startCommand.includes("\n")) {
                    return this.$message({
                        message: this.$t("instancesDetail.startError"),
                        type: "error"
                    });
                }
                this.instanceInfo.startCommand = this.instanceInfo.startCommand + " -Xmx" + this.instanceInfo.maxMemory +
                            "G -Xms" + this.instanceInfo.minMemory + "G -Dfile.encoding=" + this.instanceInfo.jvmEncoding +
                            " -Duser.language=zh -Duser.country=CN -jar " + this.instanceInfo.serverName + " nogui",
                await request({
                    method: "PUT",
                    url: API_INSTANCE,
                    params: { remote_uuid: this.serviceUuid, uuid: this.instanceUuid },
                    data: {
                        terminalOption: {
                            ...this.options
                        },
                        startCommand: this.instanceInfo.startCommand
                    }
                });
                this.instanceInfo = {};
                this.close();
                this.$message({ message: this.$t("notify.saveSuccess"), type: "success" });
            } catch (err) {
                this.$message({ message: err.message, type: "error" });
            }
        }
    }
};
</script>
  
<style scoped>
.btn-area {
    margin-top: 8px;
}

p {
    white-space: pre-wrap;
}
</style>
  