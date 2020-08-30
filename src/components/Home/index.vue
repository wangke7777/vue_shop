<template>
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../../assets/logo.png" alt="电商后台管理系统" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--页面主体区-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapsed ? '64px' : '200px'">
        <!--侧边栏菜单区-->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409bff"
          unique-opened
          :collapse="isCollapsed"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!--一级菜单-->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!--一级菜单模板-->
            <template slot="title">
              <!--图标-->
              <i :class="iconObj[item.id]"></i>
              <!--文本-->
              <span>{{ item.authName }}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧主体区-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      menuList: [],
      iconObj: {
        "125": "iconfont icon-users ",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpingouwudai2",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao"
      },
      isCollapsed: false,
      //被激活的链接地址
      activePath: ""
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      const { data: res } = await this.axios.get("menus");
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      // console.log(this.menuList);
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
    }
  }
};
</script>

<style scoped lang="scss">
.home-container {
  height: 100%;
}

.el-container {
  background-color: #373d41;

  .el-header {
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;

    div {
      display: flex;
      align-items: center;

      img {
        width: 60px;
      }

      span {
        margin-left: 15px;
      }
    }
  }
}

.el-aside {
  background-color: #333744;

  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
