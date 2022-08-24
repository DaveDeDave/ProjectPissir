<script setup>
  import { ref, reactive, onBeforeMount } from "vue";
  import axios from "axios";
  import { useI18n } from "vue-i18n";
  import * as yup from "yup";
  import { useHandleError } from "../../libs/hooks";

  const emit = defineEmits(["createConfiguration"]);
  const props = defineProps({
    fieldID: String,
    sensorTopic: {
      default: ""
    },
    conditionType: {
      default: ">"
    },
    conditionValue: {
      default: ""
    },
    conditionFalse: {
      default: ""
    },
    conditionTrue: {
      default: ""
    },
    startTime: {
      default: ""
    },
    endTime: {
      default: ""
    },
  });

  const schema = yup.object().shape({
    conditionValue: yup.string().test(
      "number check",
      { key: "conditionValue", error: "form.error.number" },
      (conditionValue) => {
        if (sensorTopic.value != "" && (conditionValue == "" || isNaN(Number(conditionValue)))) {
          return false;
        } else if (isNaN(Number(conditionValue))) {
          return false;
        } else {
          return true;
        }
      }
      // (sensorTopic.value != "" && conditionValue != "")  && !isNaN(Number(conditionValue))
    ),
    conditionTrue: yup.string().test(
      "number check",
      { key: "conditionTrue", error: "form.error.number" },
      (conditionTrue) => conditionTrue != "" && !isNaN(Number(conditionTrue))
    ),
    conditionFalse: yup.string().test(
      "number check",
      { key: "conditionFalse", error: "form.error.number" },
      (conditionFalse) => conditionFalse != "" && !isNaN(Number(conditionFalse))
    ),
    startTime: yup.string().test(
      "startDate check",
      { key: "startTime", error: "form.error.invalidTime" },
      (startTime) => {
        if (startTime == "") return true;
        const time = Number(startTime);
        if (isNaN(time)) return false;
        return time >= 0 && time <=23
      }
    ),
    endTime: yup.string().when(
      ["startTime"],
      (startTime, schema) => {
        return schema.test({
          test: (endTime) => {
            if (endTime == "") return true;
            const _startTime = Number(startTime);
            const _endTime = Number(endTime);
            if (isNaN(_endTime)) return false;
            return _endTime > _startTime && _endTime <= 24 
          },
          message: { key: "endTime", error: "form.error.invalidTime" }
        })
      }
    )
  });

  const { t } = useI18n();
  const handleError = useHandleError();

  const emitCreateConfiguration = () => {
    loading.value = true;
    schema
      .validate({
        conditionValue: conditionValue.value,
        conditionFalse: conditionFalse.value,
        conditionTrue: conditionTrue.value,
        startTime: startTime.value,
        endTime: endTime.value
      }, { abortEarly: false })
      .then((body) => {
        Object.keys(errors).forEach(key => delete errors[key]);
        const emitBody = {
          conditionFalse: Number(conditionFalse.value),
          conditionTrue: Number(conditionTrue.value),
          startTime: startTime.value == "" ? 0 : Number(startTime.value),
          endTime: endTime.value == "" ? 24 : Number(endTime.value)
        };
        if (sensorTopic.value != "") {
          emitBody.sensorTopic = sensorTopic.value;
          emitBody.conditionType = conditionType.value;
          emitBody.conditionValue = Number(conditionValue.value);
        }
        emit('createConfiguration', emitBody, loading);
      })
      .catch((e) => {
        loading.value = false;
        Object.keys(errors).forEach(key => delete errors[key]);
        e.errors.forEach(({ key, error }) => errors[key] = error);
      });
  };

  onBeforeMount(() => {
    axios
      .get(`/v1/mosquito/sensor/${props.fieldID}/all?page=1&quantity=100`)
      .then(res => {
        sensors.push(...res.data.result);
      })
      .catch(e => {
        handleError(e);
      });
  });

  const sensors = reactive([]);

  const sensorTopic = ref(props.sensorTopic);
  const conditionType = ref(props.conditionType);
  const conditionValue = ref(props.conditionValue);
  const conditionFalse = ref(props.conditionFalse);
  const conditionTrue = ref(props.conditionTrue);
  const startTime = ref(props.startTime);
  const endTime = ref(props.endTime);
  const loading = ref(false);
  const errors = reactive({});
</script>

<template>
  <div class="d-flex flex-column gap-1">
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.sensor") }}</a-typography-paragraph>
    <a-select v-model:value="sensorTopic">
      <a-select-option v-for="sensor in sensors" :value="sensor.topic" >{{ sensor.topic }}</a-select-option>
    </a-select>
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.conditionType") }}</a-typography-paragraph>
    <a-select v-model:value="conditionType">
      <a-select-option value=">">{{ t("form.greaterThan") }}</a-select-option>
      <a-select-option value="<">{{ t("form.smallerThan") }}</a-select-option>
    </a-select>
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.conditionValue") }}</a-typography-paragraph>
    <a-input type="number" class="radius-1" v-model:value="conditionValue" :placeholder="t('form.conditionValue')" />
    <a-typography-paragraph v-if="errors.conditionValue" class="m-0 text-fourth" :content="t(errors.conditionValue)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.conditionFalse") }}</a-typography-paragraph>
    <a-input type="number" class="radius-1" v-model:value="conditionFalse" :placeholder="t('form.conditionFalse')" />
    <a-typography-paragraph v-if="errors.conditionFalse" class="m-0 text-fourth" :content="t(errors.conditionFalse)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.conditionTrue") }}</a-typography-paragraph>
    <a-input type="number" class="radius-1" v-model:value="conditionTrue" :placeholder="t('form.conditionTrue')" />
    <a-typography-paragraph v-if="errors.conditionTrue" class="m-0 text-fourth" :content="t(errors.conditionTrue)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.startTime") }}</a-typography-paragraph>
    <a-input type="number" class="radius-1" v-model:value="startTime" :placeholder="t('form.startTime')" />
    <a-typography-paragraph v-if="errors.startTime" class="m-0 text-fourth" :content="t(errors.startTime)" />
    <a-typography-paragraph class="m-0 font-weight-500">{{ t("form.endTime") }}</a-typography-paragraph>
    <a-input type="number" class="radius-1" v-model:value="endTime" :placeholder="t('form.endTime')" />
    <a-typography-paragraph v-if="errors.endTime" class="m-0 text-fourth" :content="t(errors.endTime)" />
    <a-button class="radius-1 mt-1" :loading="loading" @click="emitCreateConfiguration">{{ t("form.confirm") }}</a-button>
  </div>
</template>