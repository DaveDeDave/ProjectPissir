<script setup>
  import { ref, reactive, onBeforeMount } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import axios from "axios";
  import apexchart from "vue3-apexcharts";
  import { message } from "ant-design-vue";

  const route = useRoute();
  const { t } = useI18n();

  onBeforeMount(() => {
    getMeasure();
  });

  const getMeasure = () => {
    if (!date.value || !date.value[0] || !date.value[1]) return message.error(t("form.error.invalidDate"))
    axios
      .get(`/v1/mosquito/sensor/${route.params.id}/${route.params.topic}/measures?startDate=${encodeURIComponent(date.value[0])}&endDate=${encodeURIComponent(date.value[1])}`)
      .then(res => {
        series[0].data = [];
        res.data.map(data => {
          series[0].name = route.params.topic;
          series[0].data.push([data.timestamp, data.value]);
          slider.value = [0, 100];
        });
      });
  };

  const handleSlider = value => {
    let imin = refApexchart.value.chart.w.globals.initialMinX;
    let imax = refApexchart.value.chart.w.globals.initialMaxX;
    let difference = imax - imin;
    let nmin = imin + (difference * value[0] / 100);
    let nmax = imax - (difference * (100 - value[1]) / 100);
    refApexchart.value.zoomX(nmin, nmax);
  } 

  const options = reactive({
    chart: {
      type: 'line',
      toolbar: {
        show: true,
        tools: {
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
          customIcons: [
            {
              icon: '<span class="ml-1">🏠</span>',
              index: 1,
              title: "reset-zoom",
              class: "custom-icon",
              click: (chart) => {
                let imin = chart.w.globals.initialMinX;
                let imax = chart.w.globals.initialMaxX;
                refApexchart.value.zoomX(imin, imax);
                slider.value = [0, 100];
              }
            }
          ]
        },
      },
      animations: {
        enabled: false,
        dynamicAnimation: {
          enabled: false
        }
      },
    },
    stroke: {
      width: 2, 
      curve: "straight" 
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
      hover: {
        sizeOffset: 6
      }
    },
    xaxis: {
      type: 'datetime',
      tooltip: {
        enabled: false
      },
      labels: {
        datetimeUTC: false
      }
    },
    yaxis: {
      title: {
        text: route.params.topic
      }
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy HH:mm:ss'
      }
    },
    theme: {}
  });
  
  const series = reactive([
    { data: [] }
  ]);

  const slider = ref([0, 100]);
  const refApexchart = ref(null);
  const timezone = new Date().toTimeString().slice(12, 17);
  const date = ref([
    new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString().slice(0, -5) + timezone, 
    new Date(new Date().setUTCHours(23, 59, 59, 59)).toISOString().slice(0, -5) + timezone
  ]);
</script>

<template>
  <div class="d-flex flex-column justify-center align-stretch bg-primary text-white h-100 p-2 gap-1">
      <div class="d-flex gap-1">
        <router-link :to="`/dashboard/field/${route.params.id}`"><a-button>{{ t("back") }}</a-button></router-link>
        <a-range-picker v-model:value="date" valueFormat="YYYY-MM-DDTHH:mm:ssZZ" show-time />
        <a-button @click="getMeasure">{{ t("form.refresh") }}</a-button>
      </div>
      <div>
        <a-typography class="text-white">{{ t("form.fieldID") }} {{ route.params.id }}</a-typography>
        <a-typography class="text-white">{{ t("form.topic") }} {{ route.params.topic }}</a-typography>
      </div>
      <div class="d-flex flex-column flex-1 px-2 gap-1 bg-white text-black">
        <a-slider 
          class="mx-1"
          v-model:value="slider" 
          @afterChange="handleSlider"
          range 
        />
        <apexchart 
          ref="refApexchart"
          height="90%"
          :options="options"
          :series="series"
        />
      </div>
  </div>
</template>