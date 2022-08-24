<script setup>
  import { ref, reactive, onBeforeMount } from "vue";
  import { useI18n } from "vue-i18n";
  import axios from "axios";

  import Table from "../components/tables/Table.vue";
  import { useHandleError } from "../libs/hooks";
  
  import { DeleteOutlined } from "@ant-design/icons-vue";

  const { t } = useI18n();
  const handleError = useHandleError();

  onBeforeMount(() => {
    axios
      .get("/v1/admin/company/all?page=1&quantity=100")
      .then(res => {
        companies.push(...res.data.result);
      })
      .catch(e => {
        handleError(e);
      });
  });

  const createEmployee = (body, loading, fetch) => {
    axios
      .post("/v1/admin/employee", body)
      .then(res => {
        fetch();
        password.value = res.data.password
        showPasswordModal();
      })
      .catch(e => {
        handleError(e);
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const deleteEmployee = async (key, userID, fetch) => {
    deleteLoading.value = key;
    axios.delete(`/v1/admin/employee/${userID}`)
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

  const showPasswordModal = () => {
    passwordModalVisible.value = true;
  };

  const hidePasswordModal = () => {
    passwordModalVisible.value = false;
    hideCreateModal();
  }

  const refreshTable = (pagination, fetch) => {
    pagination.current = 1;
    fetch(`/v1/admin/employee/all${companyID.value}`);
  };

  const password = ref("");
  const companyID = ref("");
  const companies = reactive([{ id: "", name: "all" }]);

  const createModalVisible = ref(false);
  const passwordModalVisible = ref(false);
  const deleteLoading = ref(-1);
</script>

<template>
  <div class="h-100 bg-primary text-white p-2">
    <div class="d-flex flex-column gap-1">
      <Table
        :fetchUrl="`/v1/admin/employee/all${companyID}`"
        idUrl="/dashboard/employee"
        :actions="true"
      >
        <template #buttons="{ pagination, fetch }">
          <a-button @click="showCreateModal">{{ t("form.createEmployee") }}</a-button>
          <a-select
            v-model:value="companyID"
            :options="companies.map(company => { return { value: company.id ? `/${company.id}` : '', label: company.id ? company.name : t(company.name) + company.id } })"
            @change="() => { refreshTable(pagination, fetch); }"
          />
        </template>
        <template #actions="{ fetch, record }">
          <a-button :loading="deleteLoading == record.key" @click="() => { deleteEmployee(record.key, record.id, fetch) }" class="mr-1"><delete-outlined /></a-button>
        </template>
        <template #modals="{ fetch }">
          <a-modal :destroyOnClose="true" v-model:visible="createModalVisible" :title="t('form.createEmployee')" :footer="null">
            <EmployeeForm @createEmployee="(body, loading) => { createEmployee(body, loading, fetch); }" />
          </a-modal>
        </template>
      </Table>
      <a-modal :destroyOnClose="true" v-model:visible="passwordModalVisible" :closable="false" :title="t('form.employeeCreated')" :footer="null">
        <div class="d-flex flex-column gap-1">
          <a-typography-paragraph class="text-center text-weight-500">{{ t("form.password") }}</a-typography-paragraph>
          <a-typography-paragraph class="bg-primary text-center text-white text-weight-500 p-1 radius-1" copyable :content="password" />
          <a-button @click="hidePasswordModal">{{ t("form.confirm") }}</a-button>
        </div>
      </a-modal>
    </div>
  </div>
</template>