<script setup>
  import { reactive, onBeforeMount } from "vue";
  import { useI18n } from "vue-i18n";
  import axios from "axios";
  
  import { useHandleError } from "../../libs/hooks";
  import { getData } from "../../libs/jwt";

  const props = defineProps({
    fetchUrl: String,
    idUrl: String,
    topicUrl: String,
    actions: {
      type: Boolean,
      default: true
    }
  });

  const jwt = localStorage.getItem("token");
  const data = getData(jwt);

  const { t } = useI18n();
  const handleError = useHandleError();

  onBeforeMount(() => {
    fetchData();
  });

  const handleChange = (pag) => {
    pagination.current = pag.current;
    fetchData();
  };

  const fetchData = (url) => {
    axios
      .get(`${url || props.fetchUrl}?page=${pagination.current}&quantity=${pagination.pageSize}`)
      .then(res => {
        pagination.total = res.data.count;
        const results = res.data.result;
        if (results.length > 0) {
          table.columns = Object.keys(results[0]).map(column => {
            return {
              title: column,
              dataIndex: column,
              key: column
            };
          });
          if (props.actions) {
            table.columns.push({
              title: "Actions",
              dataIndex: "actions",
              key: "actions"
            });
          }  
        }
        table.data = results.map((result, key) => {
          return {
            key,
            ...result
          }
        });
      })
      .catch(e => {
        handleError(e);
      });
  };

  const table = reactive({
    columns: [],
    data: []
  });

  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 4
  });
</script>

<template>
  <div class="d-flex flex-column gap-1">
    <div class="d-flex flex-row gap-1">
      <slot name="buttons" :pagination="pagination" :fetch="fetchData"></slot>
      <a-button @click="() => { fetchData() }">{{ t("form.refresh") }}</a-button>
    </div>
    <a-table
      @change="handleChange"
      :scroll="{ x:  true }"
      :columns="table.columns"
      :data-source="table.data"
      :pagination="pagination"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key == column.key">
          {{ t(`form.${column.key}`) }}
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="props.actions && column.key == 'actions'">
          <slot name="actions" :fetch="fetchData" :record="record"></slot>
        </template>
        <template v-if="column.key == 'active'">
          {{ t(record.active ? "yes" : "no") }}
        </template>
        <template v-if="column.key == 'outdoor'">
          {{ t(record.outdoor ? "yes" : "no") }}
        </template>
        <template v-if="column.key == 'id'">
          <router-link :to="`${idUrl}/${record.id}`">{{ record.id }}</router-link>
        </template>
        <template v-if="column.key == 'topic'">
          <router-link :to="`${topicUrl}/${record.topic}`">{{ record.topic }}</router-link>
        </template>
        <template v-if="column.key == 'companyID' && data.type == 'admin'">
          <router-link :to="`/dashboard/company/${record.companyID}`">{{ record.companyID }}</router-link>
        </template>
      </template>
    </a-table>
    <slot name="modals" :fetch="fetchData"></slot>
  </div>
</template>