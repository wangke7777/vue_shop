import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "./plugins/element.js";
import "element-ui/lib/theme-chalk/index.css";

import TreeTable from "vue-table-with-tree-grid";
// 导入全局样式表
import "./assets/css/global.css";
import "./assets/font/iconfont.css";

//导入nprogress对应的js和css
import NProgress from "nprogress";
import "nprogress/nprogress.css";

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor, /* { default global options } */)
import axios from "axios";
axios.defaults.baseURL = "http://timemeetyou.com:8889/api/private/v1/";
//再request拦截器中展示进度条
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  NProgress.start();
  return config;
});
//在response拦截器中隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done();
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
