<script lang="ts">
  import { Lock } from "phosphor-svelte";

  import "../app.css";
  import { onMount } from "svelte";
  import { page } from "$app/state";

  let { children } = $props();

  let url = $state(null) as string | null;

  onMount(() => {
    const tmpUrl = new URL(page.url.href);

    if (tmpUrl.hostname.startsWith("www.")) {
      url = tmpUrl.hostname.replace("www.", "");
    } else {
      console.error("[remapping] Invalid head URL to remap");
    }
  });
</script>

<content
  class="h-full w-full absolute bg-[#FFFAF3] flex flex-col overflow-clip"
>
  <div
    class="px-14 mt-8 flex justify-center gap-5 flex-row lg:justify-between items-center w-full"
  >
    <a href="/" class="lg:active:opacity-65 lg:hover:opacity-80 duration-100">
      <img src="/logo.svg" alt="Dotpen Logo" class="h-8" draggable="false" />
    </a>
    <a href={"https://" + url}>
      <Lock
        class="size-5 cursor-pointer lg:opacity-65 lg:hover:opacity-100 duration-100"
      />
    </a>
  </div>
  <div class="w-full h-full px-12 mt-4 mb-48">
    {@render children()}
  </div>
</content>
