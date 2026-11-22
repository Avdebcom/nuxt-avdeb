<template>
	<div>
		<header class="site-header">
			<NuxtLink class="brand" to="/">Small Things Studio</NuxtLink>
			<nav>
				<NuxtLink to="/">Home</NuxtLink>
				<NuxtLink to="/posts/small-gifts">Gift guide</NuxtLink>
			</nav>
		</header>
		<main class="wrap">
			<NuxtPage />
		</main>
		<footer class="site-footer">Built with Nuxt</footer>
	</div>
</template>
