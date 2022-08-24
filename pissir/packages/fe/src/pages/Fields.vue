<script setup>
  import { ref, reactive, onBeforeMount } from "vue";
  import { useI18n } from "vue-i18n";
  import axios from "axios";

  import Table from "../components/tables/Table.vue";
  import UpdateFieldForm from "../components/forms/UpdateFieldForm.vue";
  import AdminFieldForm from "../components/forms/AdminFieldForm.vue";
  import { useHandleError } from "../libs/hooks";
  import { getData } from "../libs/jwt";
  
  import {
    DeleteOutlined,
    FormOutlined
  } from "@ant-design/icons-vue";

  const handleError = useHandleError();
  const { t } = useI18n();

  const jwt = localStorage.getItem("token");
  const data = getData(jwt);

  onBeforeMount(() => {
    if (data.type == "admin") {
      axios
      .get("/v1/admin/company/all?page=1&quantity=100")
      .then(res => {
        companies.push(...res.data.result);
      })
      .catch(e => {
        handleError(e);
      });
    }
  });

  const createField = (body, loading, fetch) => {
    if (data.type != "admin") body.companyID = data.companyID;
    axios
      .post("/v1/field", body)
      .then(_ => {
        fetch();
        hideCreateModal();
      })
      .catch(e => {
        handleError(e);
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const updateField = (fieldID, body, loading, fetch) => {
    axios
      .put(`/v1/field/${fieldID}`, body)
      .then(_ => {
        fetch();
        hideUpdateModal();
      })
      .catch(e => {
        handleError(e);
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const deleteField = async (key, fieldID, fetch) => {
    deleteLoading.value = key;
    axios.delete(`/v1/field/${fieldID}`)
      .then(_ => {
        fetch();
      })
      .catch(e => {
        handleError(e);
      })
      .finally(() => {
        deleteLoading.value = -1;
      });
  };

  const showCreateModal = () => {
    createModalVisible.value = true;
  };

  const hideCreateModal = () => {
    createModalVisible.value = false;
  };

  const showUpdateModal = (data) => {
    updateModalData.id = data.id;
    updateModalData.name = data.name;
    updateModalData.address = data.address;
    updateModalData.outdoor = data.outdoor;
    updateModalVisible.value = true;
  };

  const hideUpdateModal = () => {
    updateModalVisible.value = false;
  };

  const refreshTable = (pagination, fetch) => {
    pagination.current = 1;
    fetch(`/v1/field/all${companyID.value}`);
  };

  const updateModalData = reactive({});
  const companyID = ref(data.companyID ? `/${data.companyID}` : "");
  const companies = reactive([{ id: "", name: "all" }]);

  const createModalVisible = ref(false);
  const updateModalVisible = ref(false);
  const deleteLoading = ref(-1);
</script>

<template>
  <div class="h-100 bg-primary text-white p-2">
    <div class="d-flex flex-column gap-1">
      <Table
        :fetchUrl="`/v1/field/all${companyID}`"
        idUrl="/dashboard/field"
        :actions="data.type == 'admin' || data.type == 'farmer'"
      >
        <template #buttons="{ pagination, fetch }">
          <a-button v-if="data.type == 'admin' || data.type == 'farmer'" @click="showCreateModal">{{ t("form.createField") }}</a-button>
          <a-select
            v-if="data.type == 'admin'"
            v-model:value="companyID"
            :options="companies.map(company => { return { value: company.id ? `/${company.id}` : '', label: company.id ? company.name : t(company.name) } })"
            @change="() => { refreshTable(pagination, fetch); }"
          />
        </template>
        <template #actions="{ fetch, record }">
          <a-button :loading="deleteLoading == record.key" @click="() => { deleteField(record.key, record.id, fetch) }" class="mr-1"><delete-outlined /></a-button>
          <a-button @click="() => { showUpdateModal(record) }"><form-outlined /></a-button>
        </template>
        <template #modals="{ fetch }">
          <a-modal :destroyOnClose="true" v-model:visible="updateModalVisible" :title="t('form.updateField')" :footer="null">
            <UpdateFieldForm @updateField="(body, loading) => { updateField(updateModalData.id, body, loading, fetch) }" :name="updateModalData.name" :address="updateModalData.address" :outdoor="updateModalData.outdoor" />
          </a-modal>
          <a-modal :destroyOnClose="true" v-model:visible="createModalVisible" :title="t('form.createField')" :footer="null">
            <AdminFieldForm v-if="data.type == 'admin'" :companies="companies.filter((_, key) => key != 0)" @createAdminField="(body, loading) => { createField(body, loading, fetch); }" />
            <FieldForm v-if="data.type == 'farmer'" @createField="(body, loading) => { createField(body, loading, fetch); }" />
          </a-modal>
        </template>
      </Table>
    </div>
  </div>
</template>