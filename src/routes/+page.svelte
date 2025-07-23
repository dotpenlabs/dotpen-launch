<script lang="ts">
  import { backOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { flyAndScale, reveal } from "$lib/utils";
  import { fly, scale } from "svelte/transition";
  import confetti from "canvas-confetti";

  let mounted = $state(false);
  let email = $state("");
  let waitlistCount = $state(0);
  let alreadySignedUp = $state(false);

  let currentLine = $state("");
  let sublines = [
    "The cursor for bookmarking",
    "The open source bookmarking manager, for the creatives and professionals",
    "Making bookmarking a joy again",
    "Turn chaos into clarity, with every bookmark.",
    "Tame your tabs. Rule your research.",
    "Crazy fast navigation, for the best of us.",
    "AI that remembers, what you can’t.",
    "Clutter-free interface by design.",
    "Vendor-lock in? No thanks!",
  ];

  let headline = $state(1);
  headline = Math.floor(Math.random() * 4) + 1;

  onMount(() => {
    mounted = true;
    waitlistCount = 2347;

    // Check localStorage for signup
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("dotpen-waitlist-signedup") === "true"
    ) {
      alreadySignedUp = true;
    }

    currentLine = sublines[Math.floor(Math.random() * sublines.length)];

    setInterval(() => {
      currentLine = "";
      setTimeout(() => {
        currentLine = sublines[Math.floor(Math.random() * sublines.length)];
      }, 1000);
    }, 4000);
  });

  async function joinWaitlist(e: Event) {
    e.preventDefault();
    if (email && !alreadySignedUp) {
      waitlistCount += 1;
      email = "";
      alreadySignedUp = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("dotpen-waitlist-signedup", "true");
      }
      confetti({
        particleCount: 250,
        spread: 75,
        colors: ["#646986", "#dcc8a6", "#0e422a"],
      });
    }
  }
</script>

{#if mounted && headline}
  <content
    class="h-full w-full flex flex-col justify-center items-center gap-6 px-4"
  >
    <p
      in:reveal={{ duration: 400 }}
      class="text-3xl sm:text-4xl md:text-5xl sm:text-nowrap lg:text-6xl italic font-medium text-black/45 text-center leading-tight"
    >
      {#if headline === 1}
        Bookmarking, <span class="text-black">rethought.</span>
      {:else if headline === 2}
        Your mind, deserves a <br /><span class="text-black">clear space.</span>
      {:else if headline === 3}
        Beyond <span class="text-black">bookmarking</span>.
      {:else if headline === 4}
        <span class="text-black">Bookmarking</span> is a
        <span class="text-black">joy</span> again.
      {/if}
    </p>

    <div
      class="h-[1.75rem] sm:h-[1.875rem] md:h-[2rem] -mt-3 flex items-center justify-center"
    >
      {#key currentLine}
        <p
          aria-label={currentLine}
          class="italic text-base sm:text-lg md:text-xl text-center font-medium text-black/65 max-w-xl"
          transition:reveal={{ duration: 650 }}
        >
          {currentLine}
        </p>
      {/key}
    </div>

    <form
      onsubmit={joinWaitlist}
      in:scale={{ delay: 400, duration: 150, start: 0.8, opacity: 0 }}
      class="flex justify-center items-center mt-2 md:mt-4 outline backdrop-brightness-95 outline-black/10 dark:outline-white/10 transition-all duration-100 h-10 sm:h-11 md:h-12 w-full max-w-xs sm:max-w-sm md:w-96 rounded-xl md:rounded-2xl px-3"
    >
      <input
        bind:value={email}
        class="outline-0 border-0 bg-transparent focus:ring-0 w-full h-full transition-all duration-300 placeholder:opacity-70 focus:placeholder:opacity-50 text-sm md:text-base"
        placeholder="Email"
        autocomplete="off"
      />
      <div class="grid">
        <button
          type="submit"
          class="bg-black hover:bg-black/80 active:bg-black/70 active:scale-98 text-white text-light font-sans px-3 rounded-xl cursor-pointer py-1 text-nowrap"
          out:fly={{ y: 10, duration: 650, easing: backOut }}
        >
          Join waitlist
        </button>
      </div>
    </form>

    <div
      class="-mt-3 opacity-65 text-xs flex items-center justify-center gap-2"
    >
      <div class="bg-green-600 rounded-full size-2 animate-pulse"></div>
      {#if alreadySignedUp}
        You're in – along with {waitlistCount - 1} other awesome folks!
      {:else}
        {waitlistCount} awesome people have already joined.
      {/if}
    </div>

    <img
      in:flyAndScale={{ y: 100, duration: 500, delay: 0 }}
      src="/assets/img1.png"
      alt="Dotpen Preview"
      class="md:block md:w-[80%] max-w-7.5xl absolute xl:-bottom-12 bottom-0 hidden"
    />
    <img
      src="/assets/img1+mobile.png"
      alt="Dotpen Preview"
      class="w-[95%] rounded-xl h-80 object-cover absolute bottom-0 md:hidden"
    />
  </content>
{/if}
