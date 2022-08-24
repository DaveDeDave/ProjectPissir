<script setup>
  import { ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import axios from "axios";

  import Table from "../components/tables/Table.vue";
  import UpdateCompanyForm from "../components/forms/UpdateCompanyForm.vue";
  import CompanyForm from "../components/forms/CompanyForm.vue";
  import { useHandleError } from "../libs/hooks";
  
  import {
    DeleteOutlined,
    FormOutlined
  } from "@ant-design/icons-vue";

  const { t } = useI18n();
  const handleError = useHandleError();

  const createCompany = async (body, loading, fetch) => {
    axios
      .post("/v1/admin/company", body)
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

  const updateCompany = (companyID, body, loading, fetch) => {
    axios
      .put(`/v1/admin/company/${companyID}`, body)
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

  const deleteCompany = async (key, companyID, fetch) => {
    deleteLoading.value = key;
    axios
      .delete(`/v1/admin/company/${companyID}`)
      .then(() => {
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
    updateModalData.name = data.name;
    updateModalData.address = data.address;
    updateModalData.id = data.id;
    updateModalVisible.value = true;
  };

  const hideUpdateModal = () => {
    updateModalVisible.value = false;
  };

  const updateModalData = reactive({});

  const createModalVisible = ref(false);
  const updateModalVisible = ref(false);
  const deleteLoading = ref(-1);
</script>

<template>
  <div class="h-100 bg-primary text-white p-2">
    <div class="d-flex flex-column gap-1">
      <Table
        fetchUrl="/v1/admin/company/all"
        idUrl="/dashboard/company"
        :actions="true"
      >
        <template #buttons>
          <a-button @click="showCreateModal">{{ t("form.createCompany") }}</a-button>
        </template>
        <template #actions="{ fetch, record }">
          <a-button :loading="deleteLoading == record.key" @click="() => { deleteCompany(record.key, record.id, fetch) }" class="mr-1"><delete-outlined /></a-button>
          <a-button @click="() => {showUpdateModal(record)}"><form-outlined /></a-button>
        </template>
        <template #modals="{ fetch }">
          <a-modal :destroyOnClose="true" v-model:visible="createModalVisible" :title="t('form.createCompany')" :footer="null">
            <CompanyForm @createCompany="(body, loading) => { createCompany(body, loading, fetch); }" />
          </a-modal>
          <a-modal :destroyOnClose="true" v-model:visible="updateModalVisible" :title="t('form.updateCompany')" :footer="null">
            <UpdateCompanyForm @updateCompany="(companyID, body, loading) => { updateCompany(companyID, body, loading, fetch) }" :name="updateModalData.name" :address="updateModalData.address" :companyID="updateModalData.id" />
          </a-modal>
        </template>
      </Table>
    </div>
  </div>
</template>