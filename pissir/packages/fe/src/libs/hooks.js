import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";

const useHandleError = () => {
  const { t } = useI18n();

  return (e) => {
    const error = e?.response?.data?.code;
    if (error) message.error(t(error));
    else {
      console.log(e);
      message.error(t("somethingWentWrong"));
    }
  }
}

export { useHandleError };