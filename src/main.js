import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import axios from "axios";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// 导入全局样式表
import "./assets/css/global.css";
import "./assets/font/iconfont.css";

Vue.use(ElementUI);
axios.defaults.baseURL = "http://timemeetyou.com:8889/api/private/v1/";
Vue.prototype.axios = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
