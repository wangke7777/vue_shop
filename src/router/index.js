import Vue from "vue";
import VueRouter from "vue-router";

// import Login from "@/components/Login";
// import Home from "@/components/Home";
// import Welcome from "@/components/Welcome";
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ "@/components/Login")
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ "@/components/Home")
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ "@/components/Welcome")

// import Users from "@/components/Users";
// import Rights from "@/components/Power/Rights";
// import Roles from "@/components/Power/Roles";
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ "@/components/Users")
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ "@/components/Power/Rights")
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ "@/components/Power/Roles")

// import Cate from "@/components/Goods/Cate";
// import Params from "@/components/Goods/Params";
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ "@/components/Goods/Cate")
const Params = () => import(/* webpackChunkName: "Cate_Params" */ "@/components/Goods/Params")

// import List from "@/components/Goods/List";
// import Add from "@/components/Goods/Add";
const List = () => import(/* webpackChunkName: "GoodsList_Add" */ "@/components/Goods/List")
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ "@/components/Goods/Add")

// import Orders from "@/components/Orders";
// import Reports from "@/components/Reports";
const Orders = () => import(/* webpackChunkName: "Order_Report" */ "@/components/Orders")
const Reports = () => import(/* webpackChunkName: "Order_Report" */ "@/components/Reports")
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    redirect: "/welcome",
    children: [
      { path: "/welcome", component: Welcome },
      { path: "/users", component: Users },
      { path: "/rights", component: Rights },
      { path: "/roles", component: Roles },
      { path: "/categories", component: Cate },
      { path: "/params", component: Params },
      { path: "/goods", component: List },
      { path: "/goods/add", component: Add },
      { path: "/orders", component: Orders },
      { path: "/reports", component: Reports }
    ]
  }
  // {
  //   path: "/",
  //   name: "Home",
  //   component: Home
  // },
  // {
  //   path: "/about",
  //   name: "About",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/About.vue")
  // }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});
export default router;
