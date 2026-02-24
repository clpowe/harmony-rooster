<template>
    <div>
        <main-header />
        <slot />
        <footer>Copyright © {{ new Date().getFullYear() }}</footer>
    </div>
</template>
