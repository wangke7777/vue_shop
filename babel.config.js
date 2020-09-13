//发布阶段需要的babel插件
const prodPlugins = [];
if (process.env.NODE_ENV === "production") {
  prodPlugins.push("transform-remove-console");
}
module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  //发布产品时的插件数组
  plugins: [...prodPlugins]
};
