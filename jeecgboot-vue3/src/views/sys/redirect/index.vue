<template>
  <div></div>
</template>
<script lang="ts" setup>
import { unref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  // update-begin--author:liaozhiyang---date:20231123---for：【QQYUN-7099】动态路由匹配右键重新加载404
  const { currentRoute, replace } = useRouter();
  const { params, query } = unref(currentRoute);
  const { path } = params;
  const tabStore = useMultipleTabStore();
  const redirectPageParam = tabStore.redirectPageParam;
  const _path = Array.isArray(path) ? path.join('/') : path;
  // update-begin--author:lipen---date:20260704---for：【修复】Vue 3.5 路由切换/刷新时 synchronous redirect 导致的 null vnode 卸载报错，使用 onMounted 延迟重定向------
  onMounted(() => {
    if (redirectPageParam) {
      if (redirectPageParam.redirect_type === 'name') {
        replace({
          name: redirectPageParam.name,
          query: redirectPageParam.query,
          params: redirectPageParam.params,
        });
      } else {
        replace({
          path: _path.startsWith('/') ? _path : '/' + _path,
          query,
        });
      }
    }
  });
  // 原开发代码：
  /*
  if (redirectPageParam) {
    if (redirectPageParam.redirect_type === 'name') {
      replace({
        name: redirectPageParam.name,
        query: redirectPageParam.query,
        params: redirectPageParam.params,
      });
    } else {
      replace({
        path: _path.startsWith('/') ? _path : '/' + _path,
        query,
      });
    }
  }
  */
  // update-end--author:lipen---date:20260704---for：【修复】Vue 3.5 路由切换/刷新时 synchronous redirect 导致的 null vnode 卸载报错，使用 onMounted 延迟重定向------
  // update-end--author:liaozhiyang---date:20231123---for：【QQYUN-7099】动态路由匹配右键重新加载404
</script>
