<script setup lang="ts">
const route = useRoute();
const { data: post } = await useAsyncData(route.path, () => queryCollection("posts").path(route.path).first());
if (!post.value) throw createError({ statusCode: 404, statusMessage: "Post not found" });
useHead({ title: post.value.title });
</script>

<template>
	<article v-if="post" class="post">
		<h1>{{ post.title }}</h1>
		<p class="meta">{{ new Date(post.date).toDateString() }}</p>
		<ContentRenderer :value="post" />
	</article>
</template>
