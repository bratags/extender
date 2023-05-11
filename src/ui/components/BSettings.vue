<template>
    <v-container style="max-height: 484px">
        <v-form ref="form">
            <v-tabs color="primary" v-model="tab" class="mb-8">
                <v-tab value="ui" class="font-weight-bold">ui</v-tab>
            </v-tabs>
            <v-window v-model="tab">
                <v-window-item value="ui">
                    <v-row class="d-flex align-center">
                        <v-col class="pb-0 text-body-1">
                            a setting
                        </v-col>
                        <v-col class="pb-0" cols="2">
                            <v-switch name="newWindow" v-model="inputs.newWindow" hide-details @change="update" inset density="compact" class="small-switch" color="primary">
                                <template v-slot:label>
                                    <div class="text-no-wrap" style="width: 40px">{{ inputs.newWindow ? `${i18n.getMessage('on')}` : `${i18n.getMessage('off')}` }}</div>
                                </template>
                            </v-switch>
                        </v-col>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-form>
    </v-container>
</template>
<style scoped>
:deep() .localDevToolsSelect .v-field__input {
    padding: 0;
}
:deep() .rounded-xl .v-field--variant-solo, :deep() .rounded-xl input[name=customDevtoolsURL] {
    border-radius: 24px;
}
:deep() .localDevToolsSelect .v-select__selection:first-child {
    margin-left: auto;
}
</style>
<script setup>
import { ref, inject } from "vue";

const tab = ref({});
const settings = inject("settings");
const i18n = inject("i18n");
const updateSetting = inject("updateSetting");
const form = ref("form");

let inputs = ref({});
function update(event) {
    const { name } = event.target;

    if (!form.value.errors.find((e) => e.id === name)?.errorMessages.length) {
        switch(name) {
            default: updateSetting(name, inputs.value[name]);
        }
    }
}
</script>