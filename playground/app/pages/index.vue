<script setup lang="ts">
const { data: posts } = await useAsyncData("posts", () => queryCollection("posts").order("date", "DESC").all());
</script>

<template>
	<div>
		<section class="hero">
			<h1>Little things, made with care</h1>
			<p>Notes on desks, gifts and tiny workshops.</p>
		</section>

		<AvdebProducts tag="3d-prints" layout="spotlight" :limit="4" heading="Fresh off the 3D printer" />

		<h2>Latest posts</h2>
		<ul class="posts">
			<li v-for="post in posts" :key="post.path">
				<NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
				<p>{{ post.summary }}</p>
			</li>
		</ul>
	</div>
</template>
