import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import axios from "axios";

import TreeTable from "vue-table-with-tree-grid";
// 导入全局样式表
import "./assets/css/global.css";
import "./assets/font/iconfont.css";

Vue.use(ElementUI);
axios.defaults.baseURL = "http://timemeetyou.com:8889/api/private/v1/";
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.prototype.axios = axios;

Vue.component("tree-table", TreeTable);
Vue.config.productionTip = false;

Vue.filter("dateFormat", function(originVal) {
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0");
  const d = (dt.getDate() + "").padStart(2, "0");
  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
